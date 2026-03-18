import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Why: single shared connection instance prevents connection pool exhaustion
// in serverless environments where each request creates a new module scope
const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  // Why: prepare false is required for serverless (Vercel) where connections
  // are short-lived and prepared statements can't be reused across invocations
  prepare: false,
});

export const db = drizzle(client, { schema });
