import { db } from '../db/client';
import { outboxEvents, users } from '../db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { RulesEngine, type TransactionCreatedEvent } from './rulesEngine';
import { RecurringDetector } from './recurringDetector';
import { BudgetMonitor } from './budgetMonitor';

export class OutboxWorker {
  private rulesEngine = new RulesEngine();
  private recurringDetector = new RecurringDetector();
  private budgetMonitor = new BudgetMonitor();
  private isRunning = false;
  private intervalTimer: NodeJS.Timeout | null = null;

  async start(pollIntervalMs = 2000) {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[Worker] Outbox automation worker started (poll: ${pollIntervalMs}ms)`);

    const cycle = async () => {
      try {
        await this.processPendingEvents();
        await this.cleanupExpiredDemoUsers();
      } catch (err: any) {
        console.error('[Worker] Error during outbox cycle:', err.message);
      }

      if (this.isRunning) {
        this.intervalTimer = setTimeout(cycle, pollIntervalMs);
      }
    };

    cycle();
  }

  stop() {
    this.isRunning = false;
    if (this.intervalTimer) {
      clearTimeout(this.intervalTimer);
      this.intervalTimer = null;
    }
    console.log('[Worker] Outbox automation worker stopped.');
  }

  /**
   * Processes all unprocessed events in the transactional outbox table.
   */
  async processPendingEvents() {
    const pending = await db
      .select()
      .from(outboxEvents)
      .where(eq(outboxEvents.processed, false))
      .orderBy(outboxEvents.createdAt)
      .limit(50);

    for (const event of pending) {
      try {
        if (event.topic === 'transaction.created') {
          const payload = event.payload as TransactionCreatedEvent;
          // Run rules, recurring detection, and budget alerts concurrently
          await Promise.allSettled([
            this.rulesEngine.processTransaction(payload),
            this.recurringDetector.processTransaction(payload),
            this.budgetMonitor.processTransaction(payload),
          ]);
        }

        // Mark event processed
        await db.update(outboxEvents).set({ processed: true }).where(eq(outboxEvents.id, event.id));
      } catch (err: any) {
        console.error(`[Worker] Failed processing outbox event ${event.id}:`, err);
      }
    }
  }

  /**
   * Cleans up expired demo sandbox accounts older than 24 hours.
   */
  async cleanupExpiredDemoUsers() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const deleted = await db
      .delete(users)
      .where(and(eq(users.isDemo, true), lte(users.createdAt, oneDayAgo)))
      .returning({ id: users.id, email: users.email });

    if (deleted.length > 0) {
      console.log(`[Worker] Cleaned up ${deleted.length} expired demo sandbox users.`);
    }
  }
}
