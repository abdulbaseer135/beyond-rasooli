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
  await db.query("SELECT pg_advisory_xact_lock(610082026)");
  const sql = await fs.readFile("docs/migrations/20261008_editor_workflow.sql", "utf8");
  await db.query(sql);
  await db.query("COMMIT");
  console.log("✅ Editor workflow schema upgrade completed successfully; content, authors, and role assignments preserved.");
} catch (err) {
  await db.query("ROLLBACK");
  console.error("Migration failed and was rolled back:", err);
  throw err;
} finally {
  await db.end();
}
