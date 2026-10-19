import { eq, and, sql, desc, inArray, gte, lte } from 'drizzle-orm';
import { db, type AppDatabase } from '../db/client';
import {
  journalEntries,
  postings,
  accounts,
  outboxEvents,
} from '../db/schema';
import {
  verifyDoubleEntryBalance,
  type Cents,
  type JournalEntrySource,
  type TransactionView,
} from '@vault-ledger/shared';

export class UnbalancedJournalEntryError extends Error {
  constructor(message = 'Double-entry invariant violated: postings do not sum to zero') {
    super(message);
    this.name = 'UnbalancedJournalEntryError';
  }
}

export interface CreatePostingInput {
  accountId: string;
  amountCents: Cents;
}

export interface CreateJournalEntryInput {
  userId: string;
  occurredAt: Date;
  description: string;
  merchant?: string | null;
  category?: string;
  source?: JournalEntrySource;
  externalId?: string | null;
  postings: CreatePostingInput[];
}

export class LedgerService {
  constructor(private database: AppDatabase = db) {}

  /**
   * Records an atomic double-entry journal transaction.
   * Strictly enforces that the sum of all postings in the entry equals zero.
   * Writes a transaction.created event to the transactional outbox in the same DB transaction.
   */
  async recordEntry(input: CreateJournalEntryInput) {
    if (!verifyDoubleEntryBalance(input.postings)) {
      throw new UnbalancedJournalEntryError();
    }

    return await this.database.transaction(async (tx) => {
      // 1. Verify user owns the primary account or is authorized
      const accountIds = input.postings.map((p) => p.accountId);
      const userAccounts = await tx
        .select()
        .from(accounts)
        .where(and(eq(accounts.userId, input.userId), inArray(accounts.id, accountIds)));

      if (userAccounts.length === 0) {
        throw new Error('At least one posting must belong to an account owned by the user');
      }

      // 2. Insert journal entry
      const [entry] = await tx
        .insert(journalEntries)
        .values({
          userId: input.userId,
          occurredAt: input.occurredAt,
          description: input.description,
          merchant: input.merchant ?? null,
          category: input.category ?? 'General',
          source: input.source ?? 'manual',
          externalId: input.externalId ?? null,
        })
        .returning();

      if (!entry) {
        throw new Error('Failed to create journal entry');
      }

      // 3. Insert all postings
      const insertedPostings = await tx
        .insert(postings)
        .values(
          input.postings.map((p) => ({
            entryId: entry.id,
            accountId: p.accountId,
            amountCents: p.amountCents,
          })),
        )
        .returning();

      // 4. Emit outbox event for asynchronous rules engine & notification worker
      // Only emit for external or manual transactions to avoid infinite recursion on rules
      if (input.source !== 'rule') {
        // Find the primary user posting to include amount and account details
        const primaryPosting = input.postings.find((p) =>
          userAccounts.some((ua) => ua.id === p.accountId),
        );

        await tx.insert(outboxEvents).values({
          topic: 'transaction.created',
          payload: {
            entryId: entry.id,
            userId: input.userId,
            accountId: primaryPosting?.accountId,
            amountCents: primaryPosting?.amountCents ?? 0,
            merchant: entry.merchant,
            category: entry.category,
            source: entry.source,
            occurredAt: entry.occurredAt.toISOString(),
          },
        });
      }

      return {
        ...entry,
        postings: insertedPostings,
      };
    });
  }

  /**
   * Retrieves all user accounts with balances dynamically computed by summing postings.
   * Guarantees balances never drift from the underlying immutable ledger.
   */
  async getUserAccounts(userId: string) {
    const userAccounts = await this.database
      .select({
        id: accounts.id,
        userId: accounts.userId,
        name: accounts.name,
        type: accounts.type,
        currency: accounts.currency,
        isArchived: accounts.isArchived,
        createdAt: accounts.createdAt,
        updatedAt: accounts.updatedAt,
        balanceCents: sql<number>`coalesce(sum(${postings.amountCents}), 0)::bigint`,
      })
      .from(accounts)
      .leftJoin(postings, eq(accounts.id, postings.accountId))
      .where(and(eq(accounts.userId, userId), eq(accounts.isArchived, false)))
      .groupBy(accounts.id)
      .orderBy(accounts.createdAt);

    return userAccounts.map((a) => ({
      ...a,
      balanceCents: Number(a.balanceCents),
    }));
  }

  /**
   * Computes user's total net worth in integer cents across depository, credit, and vault accounts.
   */
  async getNetWorth(userId: string): Promise<Cents> {
    const userAccounts = await this.getUserAccounts(userId);
    return userAccounts
      .filter((a) => a.type !== 'counterparty')
      .reduce((sum, a) => sum + a.balanceCents, 0);
  }

  /**
   * Fetches flattened transaction views for user activity lists.
   */
  async getTransactions(
    userId: string,
    filters: {
      accountId?: string;
      category?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<{ transactions: TransactionView[]; total: number }> {
    const conditions = [eq(journalEntries.userId, userId)];

    if (filters.category) {
      conditions.push(eq(journalEntries.category, filters.category));
    }
    if (filters.startDate) {
      conditions.push(gte(journalEntries.occurredAt, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(journalEntries.occurredAt, filters.endDate));
    }

    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    // Join journal entries with user postings and account names
    const rows = await this.database
      .select({
        id: journalEntries.id,
        occurredAt: journalEntries.occurredAt,
        description: journalEntries.description,
        merchant: journalEntries.merchant,
        category: journalEntries.category,
        source: journalEntries.source,
        externalId: journalEntries.externalId,
        amountCents: postings.amountCents,
        accountId: accounts.id,
        accountName: accounts.name,
      })
      .from(journalEntries)
      .innerJoin(postings, eq(journalEntries.id, postings.entryId))
      .innerJoin(accounts, eq(postings.accountId, accounts.id))
      .where(
        and(
          ...conditions,
          eq(accounts.userId, userId),
          filters.accountId ? eq(accounts.id, filters.accountId) : undefined,
        ),
      )
      .orderBy(desc(journalEntries.occurredAt))
      .limit(limit)
      .offset(offset);

    const transactions: TransactionView[] = rows.map((r) => ({
      id: r.id,
      occurredAt: r.occurredAt.toISOString(),
      description: r.description,
      merchant: r.merchant,
      category: r.category,
      amountCents: Number(r.amountCents),
      source: r.source as any,
      accountId: r.accountId,
      accountName: r.accountName,
      isRoundUp: r.source === 'rule' && r.description.startsWith('Round-Up:'),
      externalId: r.externalId,
    }));

    return {
      transactions,
      total: transactions.length,
    };
  }

  /**
   * Allows the user to re-categorize a transaction.
   */
  async updateCategory(userId: string, entryId: string, category: string) {
    const [updated] = await this.database
      .update(journalEntries)
      .set({ category })
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
      .returning();

    return updated;
  }
}
