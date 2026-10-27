import { db } from '../db/client';
import { budgets, journalEntries, postings, accounts, notifications } from '../db/schema';
import { eq, and, sql, gte, lte } from 'drizzle-orm';
import { formatCurrency } from '@vault-ledger/shared';
import type { TransactionCreatedEvent } from './rulesEngine';

export class BudgetMonitor {
  async processTransaction(event: TransactionCreatedEvent) {
    // Only monitor expense outflows
    if (event.amountCents >= 0) return;

    // Check if user has a budget for this category
    const [budget] = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userId, event.userId), eq(budgets.category, event.category)));

    if (!budget) return;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Sum outflows for this category in the current month
    const [spentRow] = await db
      .select({
        totalSpent: sql<number>`coalesce(abs(sum(case when ${postings.amountCents} < 0 then ${postings.amountCents} else 0 end)), 0)::bigint`,
      })
      .from(journalEntries)
      .innerJoin(postings, eq(journalEntries.id, postings.entryId))
      .innerJoin(accounts, eq(postings.accountId, accounts.id))
      .where(
        and(
          eq(journalEntries.userId, event.userId),
          eq(accounts.userId, event.userId),
          eq(journalEntries.category, event.category),
          gte(journalEntries.occurredAt, startOfMonth),
          lte(journalEntries.occurredAt, endOfMonth),
        ),
      );

    const totalSpentCents = Number(spentRow?.totalSpent ?? 0);
    const budgetAmountCents = Number(budget.amountCents);

    if (totalSpentCents >= budgetAmountCents) {
      // Check if alert already sent this month to avoid spamming
      const [recentAlert] = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, event.userId),
            eq(notifications.type, 'budget_alert'),
            gte(notifications.createdAt, startOfMonth),
          ),
        );

      if (!recentAlert) {
        await db.insert(notifications).values({
          userId: event.userId,
          type: 'budget_alert',
          title: `Budget Limit Exceeded: ${event.category}`,
          message: `You have spent ${formatCurrency(totalSpentCents)} on ${
            event.category
          } this month, exceeding your budget limit of ${formatCurrency(budgetAmountCents)}.`,
          metadata: {
            category: event.category,
            spentCents: totalSpentCents,
            budgetAmountCents,
          },
        });
      }
    }
  }
}
