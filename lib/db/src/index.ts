import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Serverless Postgres (Neon) suspends after a few idle minutes and silently drops
// sockets. Without limits a request waits for the OS TCP timeout (~80 s on Windows)
// and then fails, so fail fast, never reuse long-idle sockets, and keep sockets alive.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30_000, // a suspended Neon compute can take ~25 s to wake on the free plan
  idleTimeoutMillis: 30_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
});
// An idle client dropped by the server must not crash the process.
pool.on("error", (error) => {
  console.error("[db] idle client error:", error.message);
});
export const db = drizzle(pool, { schema });

export * from "./schema";
// Keep SQL operators on the same Drizzle package instance as the DB client.
export { and, desc, eq, sql } from 'drizzle-orm';
