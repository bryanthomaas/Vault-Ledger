import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from './server';
import type { FastifyInstance } from 'fastify';

describe('Fastify Server Core Routes', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await createServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it('responds with 200 on /health', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/health',
    });

    // Health returns 200 or 503 depending on whether postgres is running locally
    expect([200, 503]).toContain(res.statusCode);
    const body = res.json();
    expect(body.service).toBe('Vault Ledger API');
  });

  it('rejects unauthenticated requests to protected route /api/accounts with 401', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/accounts',
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('serves OpenAPI swagger documentation at /docs/json', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/docs/json',
    });

    expect(res.statusCode).toBe(200);
    const schema = res.json();
    expect(schema.openapi).toBeDefined();
    expect(schema.info.title).toBe('Vault Ledger API');
    expect(schema.paths['/api/auth/register']).toBeDefined();
    expect(schema.paths['/api/accounts/']).toBeDefined();
    expect(schema.paths['/api/transactions/']).toBeDefined();
    expect(schema.paths['/api/rules/']).toBeDefined();
  });
});
