import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { RuleSchema, CreateRuleInputSchema } from '@vault-ledger/shared';
import { requireAuth } from '../plugins/auth';
import { db } from '../db/client';
import { rules } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const ruleRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Automation Rules'],
        summary: 'List user automation rules (round-ups, income %, sweeps)',
        response: {
          200: z.array(RuleSchema),
        },
      },
    },
    async (request) => {
      const userRules = await db
        .select()
        .from(rules)
        .where(eq(rules.userId, request.user.userId))
        .orderBy(rules.createdAt);

      return userRules.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })) as any;
    },
  );

  fastify.post(
    '/',
    {
      schema: {
        tags: ['Automation Rules'],
        summary: 'Create a new automated savings rule',
        body: CreateRuleInputSchema,
        response: {
          201: RuleSchema,
        },
      },
    },
    async (request, reply) => {
      const [newRule] = await db
        .insert(rules)
        .values({
          userId: request.user.userId,
          name: request.body.name,
          type: request.body.type,
          enabled: request.body.enabled,
          config: request.body.config,
        })
        .returning();

      if (!newRule) {
        throw new Error('Failed to create rule');
      }

      return reply.status(201).send({
        ...newRule,
        createdAt: newRule.createdAt.toISOString(),
        updatedAt: newRule.updatedAt.toISOString(),
      } as any);
    },
  );

  fastify.patch(
    '/:id/toggle',
    {
      schema: {
        tags: ['Automation Rules'],
        summary: 'Toggle rule enabled/disabled state',
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
          enabled: z.boolean(),
        }),
        response: {
          200: RuleSchema,
          404: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const [updated] = await db
        .update(rules)
        .set({ enabled: request.body.enabled, updatedAt: new Date() })
        .where(and(eq(rules.id, request.params.id), eq(rules.userId, request.user.userId)))
        .returning();

      if (!updated) {
        return reply.status(404).send({ error: 'Rule not found' });
      }

      return reply.send({
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      } as any);
    },
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        tags: ['Automation Rules'],
        summary: 'Delete an automation rule',
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: z.object({ success: z.boolean() }),
          404: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const deleted = await db
        .delete(rules)
        .where(and(eq(rules.id, request.params.id), eq(rules.userId, request.user.userId)))
        .returning();

      if (deleted.length === 0) {
        return reply.status(404).send({ error: 'Rule not found' });
      }

      return reply.send({ success: true });
    },
  );
};
