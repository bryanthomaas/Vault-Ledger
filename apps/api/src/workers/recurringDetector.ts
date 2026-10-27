import { db } from '../db/client';
import { journalEntries, postings, recurringSeries, notifications } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { formatCurrency, type RecurringFrequency } from '@vault-ledger/shared';
import type { TransactionCreatedEvent } from './rulesEngine';

export class RecurringDetector {
  async processTransaction(event: TransactionCreatedEvent) {
    if (!event.merchant) return;

    // Fetch the last 8 transactions for this user and merchant
    const history = await db
      .select({
        id: journalEntries.id,
        occurredAt: journalEntries.occurredAt,
        amountCents: postings.amountCents,
        category: journalEntries.category,
      })
      .from(journalEntries)
      .innerJoin(postings, eq(journalEntries.id, postings.entryId))
      .where(
        and(eq(journalEntries.userId, event.userId), eq(journalEntries.merchant, event.merchant)),
      )
      .orderBy(desc(journalEntries.occurredAt))
      .limit(8);

    if (history.length < 3) return; // need at least 3 occurrences to confirm recurring pattern

    // Calculate intervals between consecutive occurrences
    const intervalsInDays: number[] = [];
    let amountSum = 0;

    for (let i = 0; i < history.length - 1; i++) {
      const current = history[i]!;
      const prev = history[i + 1]!;
      const diffMs = current.occurredAt.getTime() - prev.occurredAt.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      intervalsInDays.push(diffDays);
      amountSum += Math.abs(current.amountCents);
    }
    amountSum += Math.abs(history[history.length - 1]!.amountCents);
    const avgAmountCents = Math.round(amountSum / history.length);

    // Determine frequency
    const avgInterval = intervalsInDays.reduce((a, b) => a + b, 0) / intervalsInDays.length;

    let frequency: RecurringFrequency | null = null;
    if (avgInterval >= 6 && avgInterval <= 8) {
      frequency = 'weekly';
    } else if (avgInterval >= 12 && avgInterval <= 16) {
      frequency = 'biweekly';
    } else if (avgInterval >= 26 && avgInterval <= 33) {
      frequency = 'monthly';
    } else if (avgInterval >= 350 && avgInterval <= 375) {
      frequency = 'annual';
    }

    if (!frequency) return;

    // Calculate next expected date
    const latestDate = history[0]!.occurredAt;
    const nextDate = new Date(latestDate);
    if (frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (frequency === 'biweekly') nextDate.setDate(nextDate.getDate() + 14);
    else if (frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (frequency === 'annual') nextDate.setFullYear(nextDate.getFullYear() + 1);

    const isIncome = history[0]!.amountCents > 0;
    const nextDateStr = nextDate.toISOString().split('T')[0]!;

    // Check if series already exists
    const [existing] = await db
      .select()
      .from(recurringSeries)
      .where(
        and(eq(recurringSeries.userId, event.userId), eq(recurringSeries.merchant, event.merchant)),
      );

    if (!existing) {
      // First time detected: insert series and notify user
      await db.insert(recurringSeries).values({
        userId: event.userId,
        merchant: event.merchant,
        category: event.category,
        frequency,
        averageAmountCents: avgAmountCents,
        isIncome,
        nextExpectedDate: nextDateStr,
        lastOccurredAt: latestDate,
        active: true,
      });

      await db.insert(notifications).values({
        userId: event.userId,
        type: 'recurring_detected',
        title: isIncome ? 'Recurring Income Detected' : 'Subscription Detected',
        message: `Identified recurring ${frequency} ${
          isIncome ? 'income' : 'subscription'
        } for ${event.merchant} averaging ${formatCurrency(avgAmountCents)}.`,
        metadata: {
          merchant: event.merchant,
          frequency,
          amountCents: avgAmountCents,
        },
      });
    } else {
      // Update existing series with latest occurrence and next date
      await db
        .update(recurringSeries)
        .set({
          averageAmountCents: avgAmountCents,
          nextExpectedDate: nextDateStr,
          lastOccurredAt: latestDate,
        })
        .where(eq(recurringSeries.id, existing.id));
    }
  }
}
