import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { requireAuth } from '../plugins/auth';
import { DataSyncService } from '../services/dataSyncService';
import { PlaidSandboxProvider } from '../providers/plaidProvider';

const syncService = new DataSyncService();
const plaidProvider = new PlaidSandboxProvider();

export const syncRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);

  fastify.post(
    '/',
    {
      schema: {
        tags: ['Data Providers & Sync'],
        summary: 'Synchronize financial transactions into the ledger (synthetic or Plaid)',
        response: {
          200: z.object({
            syncedCount: z.number().int(),
            skippedCount: z.number().int(),
            provider: z.string().optional(),
            message: z.string(),
          }),
        },
      },
    },
    async (request) => {
      return await syncService.syncUserData(request.user.userId);
    },
  );

  fastify.post(
    '/plaid/link-token',
    {
      schema: {
        tags: ['Data Providers & Sync'],
        summary: 'Generate a Plaid Link token for bank connection',
        response: {
          200: z.object({
            linkToken: z.string(),
            isMock: z.boolean(),
          }),
        },
      },
    },
    async (request) => {
      const linkToken = await plaidProvider.createLinkToken(request.user.userId);
      return {
        linkToken,
        isMock: !plaidProvider.isConfigured(),
      };
    },
  );
};
