import { db } from '../db/client';
import { journalEntries, postings, accounts } from '../db/schema';
import { eq, and, sql, gte, lte } from 'drizzle-orm';
import type { SpendingInsights } from '@vault-ledger/shared';

export class InsightsService {
  /**
   * Computes category spending breakdown and month-over-month changes.
   */
  async getSpendingInsights(userId: string, targetMonthOffset = 0): Promise<SpendingInsights> {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() - targetMonthOffset, 1);
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

    const prevStartOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, 1);
    const prevEndOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0, 23, 59, 59);

    // Current month category spending & totals
    const currentRows = await db
      .select({
        category: journalEntries.category,
        totalSpent: sql<number>`coalesce(abs(sum(case when ${postings.amountCents} < 0 then ${postings.amountCents} else 0 end)), 0)::bigint`,
        totalEarned: sql<number>`coalesce(sum(case when ${postings.amountCents} > 0 then ${postings.amountCents} else 0 end)), 0)::bigint`,
      })
      .from(journalEntries)
      .innerJoin(postings, eq(journalEntries.id, postings.entryId))
      .innerJoin(accounts, eq(postings.accountId, accounts.id))
      .where(
        and(
          eq(journalEntries.userId, userId),
          eq(accounts.userId, userId),
          gte(journalEntries.occurredAt, startOfMonth),
          lte(journalEntries.occurredAt, endOfMonth),
        ),
      )
      .groupBy(journalEntries.category);

    // Previous month total spend for comparison
    const [prevRow] = await db
      .select({
        totalSpent: sql<number>`coalesce(abs(sum(case when ${postings.amountCents} < 0 then ${postings.amountCents} else 0 end)), 0)::bigint`,
      })
      .from(journalEntries)
      .innerJoin(postings, eq(journalEntries.id, postings.entryId))
      .innerJoin(accounts, eq(postings.accountId, accounts.id))
      .where(
        and(
          eq(journalEntries.userId, userId),
          eq(accounts.userId, userId),
          gte(journalEntries.occurredAt, prevStartOfMonth),
          lte(journalEntries.occurredAt, prevEndOfMonth),
        ),
      );

    let totalSpentCents = 0;
    let totalEarnedCents = 0;
    const byCategory: Array<{ category: string; amountCents: number; percentage: number }> = [];

    for (const row of currentRows) {
      const spent = Number(row.totalSpent);
      const earned = Number(row.totalEarned);
      totalSpentCents += spent;
      totalEarnedCents += earned;

      if (spent > 0) {
        byCategory.push({
          category: row.category,
          amountCents: spent,
          percentage: 0,
        });
      }
    }

    // Compute percentages
    for (const item of byCategory) {
      item.percentage =
        totalSpentCents > 0 ? Number(((item.amountCents / totalSpentCents) * 100).toFixed(1)) : 0;
    }
    byCategory.sort((a, b) => b.amountCents - a.amountCents);

    // Month-over-month calculation
    const prevSpent = Number(prevRow?.totalSpent ?? 0);
    let monthOverMonthChangePercent: number | null = null;
    if (prevSpent > 0) {
      monthOverMonthChangePercent = Number(
        (((totalSpentCents - prevSpent) / prevSpent) * 100).toFixed(1),
      );
    }

    const periodStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

    return {
      period: periodStr,
      totalSpentCents,
      totalEarnedCents,
      netSavingsCents: totalEarnedCents - totalSpentCents,
      byCategory,
      monthOverMonthChangePercent,
    };
  }

  /**
   * Computes monthly history for net worth trends and historical charts.
   */
  async getMonthlyHistory(userId: string, months = 12) {
    const now = new Date();
    const history: Array<{
      month: string;
      netWorthCents: number;
      incomeCents: number;
      expenseCents: number;
    }> = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      // Cumulative balance up to end of this month
      const [cumRow] = await db
        .select({
          balance: sql<number>`coalesce(sum(${postings.amountCents}), 0)::bigint`,
        })
        .from(postings)
        .innerJoin(journalEntries, eq(postings.entryId, journalEntries.id))
        .innerJoin(accounts, eq(postings.accountId, accounts.id))
        .where(
          and(
            eq(journalEntries.userId, userId),
            eq(accounts.userId, userId),
            lte(journalEntries.occurredAt, end),
          ),
        );

      // Flow within this month
      const [flowRow] = await db
        .select({
          income: sql<number>`coalesce(sum(case when ${postings.amountCents} > 0 then ${postings.amountCents} else 0 end)), 0)::bigint`,
          expense: sql<number>`coalesce(abs(sum(case when ${postings.amountCents} < 0 then ${postings.amountCents} else 0 end)), 0)::bigint`,
        })
        .from(postings)
        .innerJoin(journalEntries, eq(postings.entryId, journalEntries.id))
        .innerJoin(accounts, eq(postings.accountId, accounts.id))
        .where(
          and(
            eq(journalEntries.userId, userId),
            eq(accounts.userId, userId),
            gte(journalEntries.occurredAt, start),
            lte(journalEntries.occurredAt, end),
          ),
        );

      const monthLabel = date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      history.push({
        month: monthLabel,
        netWorthCents: Number(cumRow?.balance ?? 0),
        incomeCents: Number(flowRow?.income ?? 0),
        expenseCents: Number(flowRow?.expense ?? 0),
      });
    }

    return history;
  }
}
