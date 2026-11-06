import dotenv from 'dotenv';
import { createServer } from './server';
import { pool } from './db/client';
import { runMigrations } from './db/migrate';
import { OutboxWorker } from './workers/outboxWorker';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const RUN_WORKER = process.env.RUN_WORKER !== 'false';

async function main() {
  // Attempt to run migrations on startup
  try {
    await runMigrations();
  } catch (err: any) {
    console.warn(`[Startup] Note: Auto-migration deferred: ${err.message}`);
  }

  const server = await createServer();
  const worker = new OutboxWorker();

  if (RUN_WORKER) {
    worker.start(2500);
  }

  try {
    const address = await server.listen({ port: PORT, host: HOST });
    console.log(`\n======================================================`);
    console.log(`[API]    Vault Ledger API active at: ${address}`);
    console.log(`[Docs]   Interactive OpenAPI Docs at: ${address}/docs`);
    console.log(`[Health] Health check available at: ${address}/health`);
    console.log(`======================================================\n`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const sig of signals) {
    process.on(sig, async () => {
      console.log(`[Server] Received ${sig}, closing gracefully...`);
      worker.stop();
      await server.close();
      await pool.end();
      process.exit(0);
    });
  }
}

main();
