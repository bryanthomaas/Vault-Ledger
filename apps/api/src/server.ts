import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { authRoutes } from './routes/authRoutes';
import { accountRoutes } from './routes/accountRoutes';
import { transactionRoutes } from './routes/transactionRoutes';
import { ruleRoutes } from './routes/ruleRoutes';
import { budgetRoutes } from './routes/budgetRoutes';
import { goalRoutes } from './routes/goalRoutes';
import { notificationRoutes } from './routes/notificationRoutes';
import { syncRoutes } from './routes/syncRoutes';
import { pool } from './db/client';

export async function createServer() {
  const server = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  }).withTypeProvider<ZodTypeProvider>();

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  // CORS
  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:8081,http://127.0.0.1:8081')
    .split(',')
    .map((s) => s.trim());

  await server.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return cb(null, true);
      if (corsOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        return cb(null, true);
      }
      cb(null, true); // Dev-permissive
    },
    credentials: true,
  });

  // Rate limiting (generous for demo / dev)
  await server.register(rateLimit, {
    max: 1000,
    timeWindow: '1 minute',
  });

  // OpenAPI Swagger documentation
  await server.register(swagger, {
    openapi: {
      info: {
        title: 'Vault Ledger API',
        description:
          'High-integrity personal finance API with double-entry accounting, automated savings rules, and Monte Carlo forecasting.',
        version: '2.0.0',
      },
      servers: [
        {
          url: 'http://localhost:4000',
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await server.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Health check endpoint
  server.get('/health', async (_req, reply) => {
    try {
      await pool.query('SELECT 1');
      return reply.send({ status: 'ok', service: 'Vault Ledger API', database: 'connected' });
    } catch (_err) {
      return reply.status(503).send({ status: 'degraded', service: 'Vault Ledger API', database: 'disconnected' });
    }
  });

  // Register domain route plugins
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(accountRoutes, { prefix: '/api/accounts' });
  await server.register(transactionRoutes, { prefix: '/api/transactions' });
  await server.register(ruleRoutes, { prefix: '/api/rules' });
  await server.register(budgetRoutes, { prefix: '/api/budgets' });
  await server.register(goalRoutes, { prefix: '/api/goals' });
  await server.register(notificationRoutes, { prefix: '/api/notifications' });
  await server.register(syncRoutes, { prefix: '/api/sync' });

  return server;
}
