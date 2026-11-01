import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

/**
 * Hosted Postgres providers (Render external URLs, Neon, Supabase, …) require
 * TLS. Render's *internal* URL does not. `DATABASE_SSL=true|false` overrides
 * the heuristic.
 */
function needsSsl(connectionString: string): boolean {
  if (process.env.DATABASE_SSL === "true") return true;
  if (process.env.DATABASE_SSL === "false") return false;
  if (/sslmode=(require|verify-ca|verify-full)/i.test(connectionString)) return true;
  return /\.render\.com|\.neon\.tech|\.supabase\.(co|com)|\.rds\.amazonaws\.com/i.test(connectionString);
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url,
    ssl: needsSsl(url) ? { rejectUnauthorized: false } : undefined,
  },
  strict: false,
  verbose: true,
});
