import nextEnv from "@next/env";
import pg from "pg";
import fs from "node:fs/promises";
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
if (!process.env.DATABASE_URI?.startsWith("postgres")) throw new Error("This migration requires PostgreSQL. SQLite uses the Payload schema setup.");
const db = new pg.Client({ connectionString: process.env.DATABASE_URI });
await db.connect();
try {
  await db.query("BEGIN");
  await db.query("SELECT pg_advisory_xact_lock(610092026)");
  await db.query(await fs.readFile("docs/migrations/20261009_editorial_reliability.sql", "utf8"));
  await db.query("COMMIT");
  console.log("Topic governance migration complete. Existing content preserved.");
} catch (error) { await db.query("ROLLBACK"); throw error; }
finally { await db.end(); }
