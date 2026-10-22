import { db } from '../db/client';
import {
  rules,
  ruleExecutions,
  accounts,
  notifications,
} from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { LedgerService } from '../services/ledgerService';
import {
  calculateRoundUp,
  formatCurrency,
  type RoundUpRuleConfig,
  type PercentOfIncomeRuleConfig,
  type SweepRuleConfig,
} from '@vault-ledger/shared';

export interface TransactionCreatedEvent {
  entryId: string;
  userId: string;
  accountId?: string;
  amountCents: number;
  merchant?: string | null;
  category: string;
  source: string;
  occurredAt: string;
}

export class RulesEngine {
  private ledgerService = new LedgerService(db);

  async processTransaction(event: TransactionCreatedEvent) {
    // Prevent recursion on rules
    if (event.source === 'rule') return;

    // Fetch active rules for this user
    const userRules = await db
      .select()
      .from(rules)
      .where(and(eq(rules.userId, event.userId), eq(rules.enabled, true)));

    for (const rule of userRules) {
      try {
        if (rule.type === 'round_up') {
          await this.evaluateRoundUpRule(rule, event);
        } else if (rule.type === 'percent_of_income') {
          await this.evaluatePercentOfIncomeRule(rule, event);
        } else if (rule.type === 'sweep') {
          await this.evaluateSweepRule(rule, event);
        }
      } catch (err: any) {
        console.error(`[Rules Engine] Error evaluating rule "${rule.name}" (${rule.id}):`, err);
      }
    }
  }

  private async evaluateRoundUpRule(rule: any, event: TransactionCreatedEvent) {
    // Only process expense outflows (negative amounts)
    if (event.amountCents >= 0) return;

    const config = rule.config as RoundUpRuleConfig;
    // If source account specified, ensure matches
    if (config.sourceAccountId && event.accountId && config.sourceAccountId !== event.accountId) {
      return;
    }

    const baseRoundUp = calculateRoundUp(event.amountCents);
    const roundUpAmount = baseRoundUp * (config.multiplier || 1);
    if (roundUpAmount <= 0) return;

    const sourceAccountId = event.accountId || config.sourceAccountId;
    if (!sourceAccountId) return;

    // Execute atomically inside DB transaction with idempotency constraint
    await db.transaction(async (tx) => {
      // 1. Check idempotency: have we already executed this rule on this source entry?
      const existing = await tx
        .select()
        .from(ruleExecutions)
        .where(
          and(
            eq(ruleExecutions.ruleId, rule.id),
            eq(ruleExecutions.sourceEntryId, event.entryId),
          ),
        );

      if (existing.length > 0) return;

      // 2. Execute balanced double-entry transfer
      // Checking debited (money leaving checking): -roundUpAmount
      // Vault credited (money entering vault): +roundUpAmount
      // Sum = 0!
      const transferEntry = await this.ledgerService.recordEntry({
        userId: event.userId,
        occurredAt: new Date(),
        description: `Round-Up: ${event.merchant || event.category}`,
        category: 'Savings Transfer',
        source: 'rule',
        postings: [
          {
            accountId: sourceAccountId,
            amountCents: -roundUpAmount,
          },
          {
            accountId: config.destinationAccountId,
            amountCents: roundUpAmount,
          },
        ],
      });

      // 3. Record execution for idempotency guarantee
      await tx.insert(ruleExecutions).values({
        ruleId: rule.id,
        sourceEntryId: event.entryId,
        generatedEntryId: transferEntry.id,
        amountCents: roundUpAmount,
        status: 'executed',
      });

      // 4. Notify user
      await tx.insert(notifications).values({
        userId: event.userId,
        type: 'rule_fired',
        title: 'Round-Up Saved',
        message: `Saved ${formatCurrency(roundUpAmount)} from your purchase at ${
          event.merchant || event.category
        } into your vault.`,
        metadata: {
          ruleId: rule.id,
          amountCents: roundUpAmount,
          sourceEntryId: event.entryId,
        },
      });
    });
  }

  private async evaluatePercentOfIncomeRule(rule: any, event: TransactionCreatedEvent) {
    // Only process income inflows (positive amounts)
    if (event.amountCents <= 0) return;

    const config = rule.config as PercentOfIncomeRuleConfig;
    const saveAmount = Math.round(event.amountCents * (config.percentage / 100));
    if (saveAmount <= 0) return;

    const sourceAccountId = event.accountId || config.sourceAccountId;
    if (!sourceAccountId) return;

    await db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(ruleExecutions)
        .where(
          and(
            eq(ruleExecutions.ruleId, rule.id),
            eq(ruleExecutions.sourceEntryId, event.entryId),
          ),
        );

      if (existing.length > 0) return;

      const transferEntry = await this.ledgerService.recordEntry({
        userId: event.userId,
        occurredAt: new Date(),
        description: `${config.percentage}% Paycheck Savings: ${event.merchant || 'Income'}`,
        category: 'Savings Transfer',
        source: 'rule',
        postings: [
          {
            accountId: sourceAccountId,
            amountCents: -saveAmount,
          },
          {
            accountId: config.destinationAccountId,
            amountCents: saveAmount,
          },
        ],
      });

      await tx.insert(ruleExecutions).values({
        ruleId: rule.id,
        sourceEntryId: event.entryId,
        generatedEntryId: transferEntry.id,
        amountCents: saveAmount,
        status: 'executed',
      });

      await tx.insert(notifications).values({
        userId: event.userId,
        type: 'rule_fired',
        title: 'Income Automated Savings',
        message: `Transferred ${formatCurrency(saveAmount)} (${config.percentage}%) from your ${
          event.merchant || 'payroll'
        } into your vault.`,
      });
    });
  }

  private async evaluateSweepRule(rule: any, event: TransactionCreatedEvent) {
    const config = rule.config as SweepRuleConfig;
    if (!config.sourceAccountId || !config.destinationAccountId) return;

    // Check checking account balance
    const userAccounts = await this.ledgerService.getUserAccounts(event.userId);
    const sourceAcc = userAccounts.find((a) => a.id === config.sourceAccountId);
    if (!sourceAcc || sourceAcc.balanceCents <= config.thresholdCents) return;

    const excessCents = sourceAcc.balanceCents - config.thresholdCents;
    if (excessCents <= 0) return;

    await db.transaction(async (tx) => {
      const transferEntry = await this.ledgerService.recordEntry({
        userId: event.userId,
        occurredAt: new Date(),
        description: `Cash Sweep: Excess over ${formatCurrency(config.thresholdCents)}`,
        category: 'Savings Transfer',
        source: 'rule',
        postings: [
          {
            accountId: config.sourceAccountId,
            amountCents: -excessCents,
          },
          {
            accountId: config.destinationAccountId,
            amountCents: excessCents,
          },
        ],
      });

      await tx.insert(ruleExecutions).values({
        ruleId: rule.id,
        sourceEntryId: event.entryId,
        generatedEntryId: transferEntry.id,
        amountCents: excessCents,
        status: 'executed',
      });

      await tx.insert(notifications).values({
        userId: event.userId,
        type: 'rule_fired',
        title: 'Cash Sweep Executed',
        message: `Swept excess balance of ${formatCurrency(excessCents)} into your vault.`,
      });
    });
  }
}
