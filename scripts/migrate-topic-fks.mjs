import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function runMigration() {
  console.log("Applying topic FK nullability migration...");
  await pool.query(`
    ALTER TABLE "articles" ALTER COLUMN "topic_id" DROP NOT NULL;
    ALTER TABLE "videos" ALTER COLUMN "topic_id" DROP NOT NULL;
    ALTER TABLE "_articles_v" ALTER COLUMN "version_topic_id" DROP NOT NULL;
    ALTER TABLE "_videos_v" ALTER COLUMN "version_topic_id" DROP NOT NULL;
  `);
  console.log("Successfully dropped NOT NULL from articles.topic_id, videos.topic_id, _articles_v.version_topic_id, _videos_v.version_topic_id.");
  await pool.end();
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
