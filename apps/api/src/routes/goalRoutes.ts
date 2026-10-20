import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  GoalSchema,
  CreateGoalInputSchema,
} from '@vault-ledger/shared';
import { requireAuth } from '../plugins/auth';
import { db } from '../db/client';
import { goals, accounts, postings } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

export const goalRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Savings Goals'],
        summary: 'List user savings goals with current vault balance',
        response: {
          200: z.array(GoalSchema),
        },
      },
    },
    async (request) => {
      // Query goals and join with vault account balance
      const userGoals = await db
        .select({
          id: goals.id,
          userId: goals.userId,
          name: goals.name,
          vaultAccountId: goals.vaultAccountId,
          targetAmountCents: goals.targetAmountCents,
          targetDate: goals.targetDate,
          createdAt: goals.createdAt,
          currentAmountCents: sql<number>`coalesce(sum(${postings.amountCents}), 0)::bigint`,
        })
        .from(goals)
        .leftJoin(accounts, eq(goals.vaultAccountId, accounts.id))
        .leftJoin(postings, eq(accounts.id, postings.accountId))
        .where(eq(goals.userId, request.user.userId))
        .groupBy(goals.id);

      return userGoals.map((g) => ({
        id: g.id,
        userId: g.userId,
        name: g.name,
        vaultAccountId: g.vaultAccountId,
        targetAmountCents: Number(g.targetAmountCents),
        targetDate: g.targetDate ?? null,
        createdAt: g.createdAt.toISOString(),
        currentAmountCents: Math.max(0, Number(g.currentAmountCents)),
      }));
    },
  );

  fastify.post(
    '/',
    {
      schema: {
        tags: ['Savings Goals'],
        summary: 'Create a new savings goal attached to a vault account',
        body: CreateGoalInputSchema,
        response: {
          201: GoalSchema,
        },
      },
    },
    async (request, reply) => {
      const [newGoal] = await db
        .insert(goals)
        .values({
          userId: request.user.userId,
          name: request.body.name,
          vaultAccountId: request.body.vaultAccountId,
          targetAmountCents: request.body.targetAmountCents,
          targetDate: request.body.targetDate ?? null,
        })
        .returning();

      if (!newGoal) {
        throw new Error('Failed to create goal');
      }

      return reply.status(201).send({
        id: newGoal.id,
        userId: newGoal.userId,
        name: newGoal.name,
        vaultAccountId: newGoal.vaultAccountId,
        targetAmountCents: Number(newGoal.targetAmountCents),
        targetDate: newGoal.targetDate ?? null,
        createdAt: newGoal.createdAt.toISOString(),
        currentAmountCents: 0,
      });
    },
  );
};
