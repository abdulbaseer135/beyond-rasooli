import nextEnv from "@next/env";
import pg from "pg";
import fs from "node:fs/promises";

nextEnv.loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });
if (!process.env.DATABASE_URI?.startsWith("postgres")) {
  throw new Error("This upgrade requires an existing PostgreSQL Payload schema.");
}

const db = new pg.Client({ connectionString: process.env.DATABASE_URI });
await db.connect();

try {
  await db.query("BEGIN");
  await db.query("SELECT pg_advisory_xact_lock(610092026)");
  const sql = await fs.readFile("docs/migrations/20261009_founder_notifications.sql", "utf8");
  await db.query(sql);
  await db.query("COMMIT");
  console.log("✅ Founder notification system schema migration completed successfully.");
} catch (err) {
  await db.query("ROLLBACK");
  console.error("Migration failed and was rolled back:", err);
  process.exit(1);
} finally {
  await db.end();
}
