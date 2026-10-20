import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  BudgetSchema,
  UpsertBudgetInputSchema,
} from '@vault-ledger/shared';
import { requireAuth } from '../plugins/auth';
import { db } from '../db/client';
import { budgets, journalEntries, postings, accounts } from '../db/schema';
import { eq, and, sql, gte, lte } from 'drizzle-orm';

export const budgetRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Budgets'],
        summary: 'List user budgets with current month actual spend',
        response: {
          200: z.array(BudgetSchema),
        },
      },
    },
    async (request) => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Fetch user budgets
      const userBudgets = await db
        .select()
        .from(budgets)
        .where(eq(budgets.userId, request.user.userId));

      // Calculate current month spending by category on user accounts (outflows/negative amounts)
      const spendingRows = await db
        .select({
          category: journalEntries.category,
          spentCents: sql<number>`coalesce(abs(sum(case when ${postings.amountCents} < 0 then ${postings.amountCents} else 0 end)), 0)::bigint`,
        })
        .from(journalEntries)
        .innerJoin(postings, eq(journalEntries.id, postings.entryId))
        .innerJoin(accounts, eq(postings.accountId, accounts.id))
        .where(
          and(
            eq(journalEntries.userId, request.user.userId),
            eq(accounts.userId, request.user.userId),
            gte(journalEntries.occurredAt, startOfMonth),
            lte(journalEntries.occurredAt, endOfMonth),
          ),
        )
        .groupBy(journalEntries.category);

      const spendMap = new Map<string, number>();
      for (const row of spendingRows) {
        spendMap.set(row.category, Number(row.spentCents));
      }

      return userBudgets.map((b) => ({
        id: b.id,
        userId: b.userId,
        category: b.category,
        amountCents: Number(b.amountCents),
        period: b.period as 'monthly',
        createdAt: b.createdAt.toISOString(),
        spentCents: spendMap.get(b.category) ?? 0,
      }));
    },
  );

  fastify.put(
    '/',
    {
      schema: {
        tags: ['Budgets'],
        summary: 'Create or update a category budget',
        body: UpsertBudgetInputSchema,
        response: {
          200: BudgetSchema,
        },
      },
    },
    async (request, reply) => {
      const { category, amountCents } = request.body;

      const [upserted] = await db
        .insert(budgets)
        .values({
          userId: request.user.userId,
          category,
          amountCents,
        })
        .onConflictDoUpdate({
          target: [budgets.userId, budgets.category],
          set: { amountCents },
        })
        .returning();

      if (!upserted) {
        throw new Error('Failed to save budget');
      }

      return reply.send({
        id: upserted.id,
        userId: upserted.userId,
        category: upserted.category,
        amountCents: Number(upserted.amountCents),
        period: upserted.period as 'monthly',
        createdAt: upserted.createdAt.toISOString(),
        spentCents: 0,
      });
    },
  );
};
