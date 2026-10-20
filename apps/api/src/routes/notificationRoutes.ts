import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  NotificationSchema,
} from '@vault-ledger/shared';
import { requireAuth } from '../plugins/auth';
import { db } from '../db/client';
import { notifications } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const notificationRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Activity & Notifications'],
        summary: 'List user activity feed events and alerts',
        response: {
          200: z.array(NotificationSchema),
        },
      },
    },
    async (request) => {
      const items = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, request.user.userId))
        .orderBy(desc(notifications.createdAt))
        .limit(100);

      return items.map((n) => ({
        id: n.id,
        userId: n.userId,
        type: n.type as any,
        title: n.title,
        message: n.message,
        read: n.read,
        metadata: (n.metadata as Record<string, any>) ?? undefined,
        createdAt: n.createdAt.toISOString(),
      }));
    },
  );

  fastify.patch(
    '/:id/read',
    {
      schema: {
        tags: ['Activity & Notifications'],
        summary: 'Mark an activity notification as read',
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
      const [updated] = await db
        .update(notifications)
        .set({ read: true })
        .where(and(eq(notifications.id, request.params.id), eq(notifications.userId, request.user.userId)))
        .returning();

      if (!updated) {
        return reply.status(404).send({ error: 'Notification not found' });
      }

      return reply.send({ success: true });
    },
  );

  fastify.post(
    '/read-all',
    {
      schema: {
        tags: ['Activity & Notifications'],
        summary: 'Mark all activity notifications as read',
        response: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.userId, request.user.userId));

      return reply.send({ success: true });
    },
  );
};
