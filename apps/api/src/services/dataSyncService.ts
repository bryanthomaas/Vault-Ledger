import { db } from '../db/client';
import { accounts, journalEntries } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { LedgerService } from './ledgerService';
import { SyntheticDataProvider } from '../providers/syntheticProvider';
import { PlaidSandboxProvider } from '../providers/plaidProvider';
import type { DataProvider } from '../providers/dataProvider';

export class DataSyncService {
  private ledgerService: LedgerService;
  private syntheticProvider = new SyntheticDataProvider();
  private plaidProvider = new PlaidSandboxProvider();

  constructor() {
    this.ledgerService = new LedgerService(db);
  }

  getActiveProvider(): DataProvider {
    return this.plaidProvider.isConfigured() ? this.plaidProvider : this.syntheticProvider;
  }

  /**
   * Syncs bank transactions into the ledger with strict double-entry and idempotency guarantees.
   */
  async syncUserData(userId: string) {
    const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));

    const checkingAccount = userAccounts.find((a) => a.type === 'depository');
    const counterpartyAccount = userAccounts.find((a) => a.type === 'counterparty');

    if (!checkingAccount || !counterpartyAccount) {
      throw new Error(
        'User is missing required Checking or Counterparty account for ledger double-entry',
      );
    }

    const provider = this.getActiveProvider();
    const transactions = await provider.fetchTransactions(userId);

    if (transactions.length === 0) {
      return {
        syncedCount: 0,
        skippedCount: 0,
        message: 'No new transactions found from provider.',
      };
    }

    // Find already ingested external IDs to guarantee idempotency
    const externalIds = transactions.map((t) => t.externalId);
    const existingEntries = await db
      .select({ externalId: journalEntries.externalId })
      .from(journalEntries)
      .where(
        and(eq(journalEntries.userId, userId), inArray(journalEntries.externalId, externalIds)),
      );

    const existingIdSet = new Set(existingEntries.map((e) => e.externalId));

    let syncedCount = 0;
    let skippedCount = 0;

    for (const tx of transactions) {
      if (existingIdSet.has(tx.externalId)) {
        skippedCount++;
        continue;
      }

      // Record balanced double-entry
      // Checking account gets the transaction amount
      // Counterparty account gets the exact opposite amount so sum = 0
      await this.ledgerService.recordEntry({
        userId,
        occurredAt: tx.occurredAt,
        description: tx.description,
        merchant: tx.merchant,
        category: tx.category,
        source: 'provider',
        externalId: tx.externalId,
        postings: [
          {
            accountId: checkingAccount.id,
            amountCents: tx.amountCents,
          },
          {
            accountId: counterpartyAccount.id,
            amountCents: -tx.amountCents,
          },
        ],
      });

      syncedCount++;
    }

    return {
      syncedCount,
      skippedCount,
      provider: provider.name,
      message: `Successfully synchronized ${syncedCount} transactions (${skippedCount} already synced).`,
    };
  }
}
