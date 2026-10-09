import nextEnv from "@next/env";
import pg from "pg";
import assert from "node:assert/strict";

nextEnv.loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });

const db = new pg.Client({ connectionString: process.env.DATABASE_URI });
await db.connect();

console.log("Starting live PostgreSQL notifications integration verification...");

try {
  // 1. Get founder ID
  const founderRes = await db.query("SELECT id, email, role FROM users WHERE role = 'admin' LIMIT 1");
  assert(founderRes.rows.length > 0, "Founder account must exist");
  const founderId = founderRes.rows[0].id;
  console.log(`Found founder account: ${founderRes.rows[0].email} (ID: ${founderId})`);

  // 2. Clear any previous test notifications
  await db.query("DELETE FROM notifications WHERE deduplication_key LIKE 'test:%'");

  // 3. Test insert notification
  const insertRes = await db.query(
    `INSERT INTO notifications (recipient_id, type, title, message, deduplication_key, link)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      founderId,
      "editor_registration",
      "New Editor Registration",
      "Ahmed Khan has requested to join Beyond Rasooli as an editor.",
      "test:editor_registration:99999",
      "/admin/editor-requests",
    ]
  );
  assert.equal(insertRes.rows.length, 1);
  const notifId = insertRes.rows[0].id;
  console.log(`Created test notification ID: ${notifId}`);

  // 4. Verify unread state
  const unreadRes = await db.query(
    "SELECT count(*)::int as count FROM notifications WHERE recipient_id = $1 AND read_at IS NULL",
    [founderId]
  );
  assert(unreadRes.rows[0].count >= 1, "Unread count must be at least 1");
  console.log(`Verified unread count: ${unreadRes.rows[0].count}`);

  // 5. Test idempotency (unique constraint on deduplication_key)
  await assert.rejects(
    async () => {
      await db.query(
        `INSERT INTO notifications (recipient_id, type, title, message, deduplication_key)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          founderId,
          "editor_registration",
          "Duplicate Test",
          "Duplicate message",
          "test:editor_registration:99999",
        ]
      );
    },
    /duplicate key value violates unique constraint/i,
    "Duplicate key must be rejected by PostgreSQL schema"
  );
  console.log("Verified database deduplication key uniqueness enforcement.");

  // 6. Test Mark as Read
  await db.query(
    "UPDATE notifications SET read_at = now() WHERE id = $1",
    [notifId]
  );
  const readCheck = await db.query(
    "SELECT read_at FROM notifications WHERE id = $1",
    [notifId]
  );
  assert(readCheck.rows[0].read_at !== null, "Notification must be marked as read");
  console.log("Verified Mark as Read updates read_at timestamp.");

  // 7. Test Resolve
  await db.query(
    "UPDATE notifications SET resolved_at = now() WHERE id = $1",
    [notifId]
  );
  const resolveCheck = await db.query(
    "SELECT resolved_at FROM notifications WHERE id = $1",
    [notifId]
  );
  assert(resolveCheck.rows[0].resolved_at !== null, "Notification must be marked as resolved");
  console.log("Verified Resolve updates resolved_at timestamp.");

  // 8. Clean up test notification
  await db.query("DELETE FROM notifications WHERE id = $1", [notifId]);
  console.log("Cleaned up test notification.");

  console.log("✅ All PostgreSQL live notifications tests passed successfully!");
} finally {
  await db.end();
}
