import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  RegisterInputSchema,
  LoginInputSchema,
  RefreshTokenInputSchema,
  AuthResponseSchema,
  UserSchema,
} from '@vault-ledger/shared';
import { AuthService } from '../services/authService';
import { requireAuth } from '../plugins/auth';
import { db } from '../db/client';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const authService = new AuthService();

export const authRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    '/register',
    {
      schema: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        body: RegisterInputSchema,
        response: {
          201: AuthResponseSchema,
          400: z.object({ error: z.string(), message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await authService.register(request.body);
        return reply.status(201).send(result);
      } catch (err: any) {
        return reply.status(400).send({ error: 'RegistrationError', message: err.message });
      }
    },
  );

  fastify.post(
    '/login',
    {
      schema: {
        tags: ['Authentication'],
        summary: 'Log in with email and password',
        body: LoginInputSchema,
        response: {
          200: AuthResponseSchema,
          401: z.object({ error: z.string(), message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await authService.login(request.body);
        return reply.status(200).send(result);
      } catch (err: any) {
        return reply.status(401).send({ error: 'InvalidCredentials', message: err.message });
      }
    },
  );

  fastify.post(
    '/refresh',
    {
      schema: {
        tags: ['Authentication'],
        summary: 'Rotate refresh token and get a new access token',
        body: RefreshTokenInputSchema,
        response: {
          200: AuthResponseSchema,
          401: z.object({ error: z.string(), message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await authService.rotateRefreshToken(request.body.refreshToken);
        return reply.status(200).send(result);
      } catch (err: any) {
        return reply.status(401).send({ error: 'InvalidToken', message: err.message });
      }
    },
  );

  fastify.post(
    '/demo',
    {
      schema: {
        tags: ['Authentication'],
        summary: 'One-click recruiter demo sandbox session',
        response: {
          200: AuthResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const result = await authService.getOrCreateDemoUser();
      return reply.status(200).send(result);
    },
  );

  fastify.get(
    '/me',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Authentication'],
        summary: 'Get current authenticated user profile',
        response: {
          200: UserSchema,
          404: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const [user] = await db.select().from(users).where(eq(users.id, request.user.userId));
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return reply.send({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isDemo: user.isDemo,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });
    },
  );
};
