import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  console.log('[Migration] Running database migrations...');
  const migrationsFolder = path.resolve(__dirname, '../../drizzle');
  await migrate(db, { migrationsFolder });
  console.log('[Migration] Migrations applied successfully.');
}

if (process.argv[1] === __filename) {
  runMigrations()
    .then(() => pool.end())
    .catch((err) => {
      console.error('[Migration] Migration failed:', err);
      process.exit(1);
    });
}
