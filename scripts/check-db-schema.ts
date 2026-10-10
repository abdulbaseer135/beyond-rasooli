import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });

const client = new pg.Client({
  connectionString: process.env.DATABASE_URI,
});

async function main() {
  await client.connect();
  console.log("Connected to PostgreSQL successfully.");

  const tables = ["users", "videos", "articles"];
  for (const table of tables) {
    const res = await client.query(
      `SELECT column_name, data_type, udt_name 
       FROM information_schema.columns 
       WHERE table_name = $1 
       ORDER BY ordinal_position;`,
      [table]
    );
    console.log(`\nColumns for table '${table}':`, res.rows.map(r => `${r.column_name} (${r.udt_name})`));
  }

  // Done

  await client.end();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
