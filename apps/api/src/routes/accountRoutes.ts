import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { AccountSchema, CreateAccountInputSchema } from '@vault-ledger/shared';
import { LedgerService } from '../services/ledgerService';
import { requireAuth } from '../plugins/auth';
import { db } from '../db/client';
import { accounts } from '../db/schema';

const ledgerService = new LedgerService();

export const accountRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Accounts'],
        summary: 'List user accounts with real-time calculated balances',
        response: {
          200: z.array(AccountSchema),
        },
      },
    },
    async (request) => {
      const userAccounts = await ledgerService.getUserAccounts(request.user.userId);
      return userAccounts.map((a) => ({
        ...a,
        type: a.type as any,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      }));
    },
  );

  fastify.get(
    '/net-worth',
    {
      schema: {
        tags: ['Accounts'],
        summary: 'Get total user net worth in cents',
        response: {
          200: z.object({
            netWorthCents: z.number().int(),
            currency: z.string(),
          }),
        },
      },
    },
    async (request) => {
      const netWorthCents = await ledgerService.getNetWorth(request.user.userId);
      return {
        netWorthCents,
        currency: 'USD',
      };
    },
  );

  fastify.post(
    '/',
    {
      schema: {
        tags: ['Accounts'],
        summary: 'Create a new savings vault or depository account',
        body: CreateAccountInputSchema,
        response: {
          201: AccountSchema,
        },
      },
    },
    async (request, reply) => {
      const [newAccount] = await db
        .insert(accounts)
        .values({
          userId: request.user.userId,
          name: request.body.name,
          type: request.body.type,
          currency: request.body.currency,
        })
        .returning();

      if (!newAccount) {
        throw new Error('Failed to create account');
      }

      return reply.status(201).send({
        ...newAccount,
        type: newAccount.type as any,
        balanceCents: 0,
        createdAt: newAccount.createdAt.toISOString(),
        updatedAt: newAccount.updatedAt.toISOString(),
      });
    },
  );
};
