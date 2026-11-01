import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Do not throw at import time: `next build` imports every route module while
  // collecting page data, and build environments may not expose the database.
  // The first real query will fail instead, and /api/health reports the status.
  console.warn("[db] DATABASE_URL is not set. Database queries will fail.");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function needsSsl(connectionString: string | undefined): boolean {
  if (process.env.DATABASE_SSL === "true") return true;
  if (process.env.DATABASE_SSL === "false") return false;
  if (!connectionString) return false;
  if (/sslmode=(require|verify-ca|verify-full)/i.test(connectionString)) return true;
  return /\.neon\.tech|\.supabase\.(co|com)|\.rds\.amazonaws\.com/i.test(connectionString);
}

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    max: Number(process.env.DATABASE_POOL_MAX || 10),
    ssl: needsSsl(databaseUrl) ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
