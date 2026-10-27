import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { SpendingInsightsSchema, ForecastResponseSchema } from '@vault-ledger/shared';
import { requireAuth } from '../plugins/auth';
import { InsightsService } from '../services/insightsService';
import { ForecastingService } from '../services/forecastingService';

const insightsService = new InsightsService();
const forecastingService = new ForecastingService();

export const insightsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);

  fastify.get(
    '/spending',
    {
      schema: {
        tags: ['Insights & Forecasting'],
        summary: 'Get monthly spending breakdown by category and month-over-month trend',
        querystring: z.object({
          offset: z.coerce.number().int().min(0).max(24).default(0),
        }),
        response: {
          200: SpendingInsightsSchema,
        },
      },
    },
    async (request) => {
      return await insightsService.getSpendingInsights(request.user.userId, request.query.offset);
    },
  );

  fastify.get(
    '/history',
    {
      schema: {
        tags: ['Insights & Forecasting'],
        summary: 'Get 12-month net worth, income, and expense history for dashboard charts',
        response: {
          200: z.array(
            z.object({
              month: z.string(),
              netWorthCents: z.number().int(),
              incomeCents: z.number().int(),
              expenseCents: z.number().int(),
            }),
          ),
        },
      },
    },
    async (request) => {
      return await insightsService.getMonthlyHistory(request.user.userId, 12);
    },
  );

  fastify.get(
    '/forecast',
    {
      schema: {
        tags: ['Insights & Forecasting'],
        summary:
          'Generate 6-month Monte Carlo predictive net worth forecast with p10/p50/p90 confidence bands',
        response: {
          200: ForecastResponseSchema,
        },
      },
    },
    async (request) => {
      return await forecastingService.generateForecast(request.user.userId, 1000);
    },
  );
};
