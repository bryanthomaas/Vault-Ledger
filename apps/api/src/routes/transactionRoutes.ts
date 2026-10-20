import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  TransactionViewSchema,
  UpdateTransactionCategoryInputSchema,
} from '@vault-ledger/shared';
import { LedgerService } from '../services/ledgerService';
import { requireAuth } from '../plugins/auth';

const ledgerService = new LedgerService();

export const transactionRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Query user transactions with filtering and pagination',
        querystring: z.object({
          accountId: z.string().uuid().optional(),
          category: z.string().optional(),
          startDate: z.string().datetime().optional(),
          endDate: z.string().datetime().optional(),
          limit: z.coerce.number().int().min(1).max(200).default(50),
          offset: z.coerce.number().int().min(0).default(0),
        }),
        response: {
          200: z.object({
            transactions: z.array(TransactionViewSchema),
            total: z.number().int(),
          }),
        },
      },
    },
    async (request) => {
      const { accountId, category, startDate, endDate, limit, offset } = request.query;
      return await ledgerService.getTransactions(request.user.userId, {
        accountId,
        category,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit,
        offset,
      });
    },
  );

  fastify.patch(
    '/:id/category',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Re-categorize a transaction',
        params: z.object({
          id: z.string().uuid(),
        }),
        body: UpdateTransactionCategoryInputSchema,
        response: {
          200: z.object({
            success: z.boolean(),
            categoryId: z.string().optional(),
          }),
          404: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const updated = await ledgerService.updateCategory(
        request.user.userId,
        request.params.id,
        request.body.category,
      );

      if (!updated) {
        return reply.status(404).send({ error: 'Transaction not found or unauthorized' });
      }

      return reply.send({ success: true, categoryId: updated.category });
    },
  );
};
