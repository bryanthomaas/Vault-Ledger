import type { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService, type TokenPayload } from '../services/authService';

const authService = new AuthService();

declare module 'fastify' {
  interface FastifyRequest {
    user: TokenPayload;
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Bearer token is required' });
  }

  const token = authHeader.substring(7);
  try {
    const payload = await authService.verifyAccessToken(token);
    request.user = payload;
  } catch (_err) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Token is invalid or expired' });
  }
}
