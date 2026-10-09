import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URI,
});

async function migrate() {
  await client.connect();
  console.log("Connected to PostgreSQL.");

  console.log("Adding notifications_id to payload_locked_documents_rels if missing...");
  await client.query(`
    ALTER TABLE payload_locked_documents_rels 
    ADD COLUMN IF NOT EXISTS notifications_id integer REFERENCES notifications(id) ON DELETE CASCADE;
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_notifications_id_idx 
    ON payload_locked_documents_rels(notifications_id);
  `);

  console.log("Migration successful: notifications_id column added to payload_locked_documents_rels.");
  await client.end();
}

migrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
