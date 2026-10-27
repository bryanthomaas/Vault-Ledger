import { db, type AppDatabase } from '../db/client';
import { recurringSeries, journalEntries, postings, accounts } from '../db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { LedgerService } from './ledgerService';
import type { ForecastResponse, ForecastPoint } from '@vault-ledger/shared';

export class ForecastingService {
  private ledgerService: LedgerService;

  constructor(
    private database: AppDatabase = db,
    ledger?: LedgerService,
  ) {
    this.ledgerService = ledger ?? new LedgerService(this.database);
  }

  /**
   * Generates a 6-month predictive trajectory using a recurring-aware Monte Carlo simulation.
   * Models scheduled cashflows (payroll, rent, subscriptions) deterministically and
   * samples daily discretionary spending across 1,000 iterations to yield p10/p50/p90 confidence bands.
   */
  async generateForecast(userId: string, runs = 1000): Promise<ForecastResponse> {
    const currentNetWorthCents = await this.ledgerService.getNetWorth(userId);

    // 1. Fetch user's recurring series
    const activeSeries = await this.database
      .select()
      .from(recurringSeries)
      .where(and(eq(recurringSeries.userId, userId), eq(recurringSeries.active, true)));

    let monthlyFixedIncomeCents = 0;
    let monthlyFixedExpensesCents = 0;

    for (const item of activeSeries) {
      const multiplier =
        item.frequency === 'weekly' ? 4.33 : item.frequency === 'biweekly' ? 2.16 : 1;
      const monthlyAmount = Math.round(Number(item.averageAmountCents) * multiplier);

      if (item.isIncome) {
        monthlyFixedIncomeCents += monthlyAmount;
      } else {
        monthlyFixedExpensesCents += monthlyAmount;
      }
    }

    // Default fallbacks if no recurring series detected yet
    if (monthlyFixedIncomeCents === 0) monthlyFixedIncomeCents = 690000; // ~$6,900/mo ($3,450 bi-weekly)
    if (monthlyFixedExpensesCents === 0) monthlyFixedExpensesCents = 175000; // ~$1,750/mo ($1,650 rent + subs)

    // 2. Compute empirical variable daily spending from the last 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const variableRows = await this.database
      .select({
        amountCents: postings.amountCents,
      })
      .from(journalEntries)
      .innerJoin(postings, eq(journalEntries.id, postings.entryId))
      .innerJoin(accounts, eq(postings.accountId, accounts.id))
      .where(
        and(
          eq(journalEntries.userId, userId),
          eq(accounts.userId, userId),
          gte(journalEntries.occurredAt, ninetyDaysAgo),
          sql`${postings.amountCents} < 0`,
          // Exclude large fixed housing/rent
          sql`${journalEntries.category} NOT IN ('Housing', 'Salary')`,
        ),
      );

    let meanDailySpendCents = 5500; // default ~$55/day discretionary
    let stdDevSpendCents = 2500;

    if (variableRows.length > 10) {
      const totalVariable = variableRows.reduce(
        (sum: number, r: { amountCents: any }) => sum + Math.abs(Number(r.amountCents)),
        0,
      );
      meanDailySpendCents = Math.round(totalVariable / 90);
      // Standard deviation of daily spending
      stdDevSpendCents = Math.round(meanDailySpendCents * 0.45);
    }

    const variableMonthlyVelocityCents = meanDailySpendCents * 30;

    // 3. Monte Carlo Simulation: 1,000 runs x 6 months (180 days)
    const months = 6;
    const monthlySimulations: number[][] = Array.from({ length: months }, () => []);

    // Box-Muller transform for pseudo-random Gaussian sampling
    const sampleGaussian = (mean: number, stdDev: number) => {
      const u1 = Math.max(0.0001, Math.random());
      const u2 = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      return Math.max(0, Math.round(mean + z0 * stdDev));
    };

    const dailyNetFixed = Math.round((monthlyFixedIncomeCents - monthlyFixedExpensesCents) / 30);

    for (let run = 0; run < runs; run++) {
      let runNetWorth = currentNetWorthCents;

      for (let m = 0; m < months; m++) {
        // Step day by day for 30 days
        for (let d = 0; d < 30; d++) {
          const dailyVariableSpend = sampleGaussian(meanDailySpendCents, stdDevSpendCents);
          runNetWorth += dailyNetFixed - dailyVariableSpend;
        }
        monthlySimulations[m]!.push(runNetWorth);
      }
    }

    // 4. Derive percentiles for each month
    const points: ForecastPoint[] = [];
    const now = new Date();
    let baselineAccumulator = currentNetWorthCents;
    const expectedMonthlyDelta =
      monthlyFixedIncomeCents - monthlyFixedExpensesCents - variableMonthlyVelocityCents;

    for (let m = 0; m < months; m++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + m + 1, 1);
      const values = monthlySimulations[m]!.sort((a, b) => a - b);

      const p10Idx = Math.floor(runs * 0.1);
      const p50Idx = Math.floor(runs * 0.5);
      const p90Idx = Math.floor(runs * 0.9);

      baselineAccumulator += expectedMonthlyDelta;

      points.push({
        date: monthDate.toISOString().split('T')[0]!,
        baselineNetWorth: Number((baselineAccumulator / 100).toFixed(2)),
        p10NetWorth: Number(((values[p10Idx] ?? baselineAccumulator) / 100).toFixed(2)),
        p50NetWorth: Number(((values[p50Idx] ?? baselineAccumulator) / 100).toFixed(2)),
        p90NetWorth: Number(((values[p90Idx] ?? baselineAccumulator) / 100).toFixed(2)),
      });
    }

    return {
      currentNetWorthCents,
      points,
      simulatedRuns: runs,
      recurringSummary: {
        monthlyFixedExpensesCents,
        monthlyFixedIncomeCents,
        variableMonthlyVelocityCents,
      },
    };
  }
}
