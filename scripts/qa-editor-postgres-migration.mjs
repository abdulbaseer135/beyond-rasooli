import nextEnv from '@next/env';
import pg from 'pg';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

nextEnv.loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });

if (!process.env.DATABASE_URI?.startsWith('postgres')) {
  throw new Error('This test requires an active PostgreSQL connection.');
}

const db = new pg.Client({ connectionString: process.env.DATABASE_URI });
await db.connect();

const schema = 'beyond_editor_audit_20261008';

try {
  console.log(`Starting isolated migration audit in schema "${schema}"...`);
  
  assert.equal(
    (await db.query('SELECT count(*)::int as n FROM information_schema.schemata WHERE schema_name = $1', [schema])).rows[0].n,
    0,
    'Audit schema must not already exist'
  );

  await db.query('BEGIN');
  await db.query(`CREATE SCHEMA "${schema}"`);
  await db.query(`SET LOCAL search_path TO "${schema}", public`);

  // Copy relevant existing table structures
  const baseTables = ['media', 'authors', 'users', 'articles', '_articles_v', 'videos', '_videos_v', 'topics'];
  for (const name of baseTables) {
    await db.query(`CREATE TABLE "${schema}"."${name}" (LIKE public."${name}" INCLUDING ALL)`);
  }

  // Insert a test user mimicking the founder
  await db.query(`
    INSERT INTO "${schema}".users (id, name, email, role)
    VALUES (999, 'Test Founder', 'founder@test.com', 'admin')
  `);

  // Insert a test topic
  await db.query(`
    INSERT INTO "${schema}".topics (id, slug)
    VALUES (999, 'test-topic')
  `);

  // Read SQL migration
  const sql = await fs.readFile('docs/migrations/20261008_editor_workflow.sql', 'utf8');

  // Execute migration first time
  await db.query(sql);

  // Execute migration second time to verify IDEMPOTENCY
  await db.query(sql);

  // Verify added columns in users
  const userCols = {
    photo_id: 'int4',
    status: 'enum_users_status',
    reason_for_joining: 'varchar',
    rejection_reason: 'varchar',
    applied_at: 'timestamptz',
    author_profile_id: 'int4',
    social_links_tiktok: 'varchar',
  };

  for (const [col, expectedUdt] of Object.entries(userCols)) {
    const res = await db.query(
      'SELECT udt_name, is_nullable, column_default FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 AND column_name = $3',
      [schema, 'users', col]
    );
    assert.equal(res.rowCount, 1, `Column users.${col} must exist`);
    assert.equal(res.rows[0].udt_name, expectedUdt, `Column users.${col} must have udt_name ${expectedUdt}`);
  }

  // Verify founder was backfilled to approved
  const founderStatus = await db.query(`SELECT status FROM "${schema}".users WHERE id = 999`);
  assert.equal(founderStatus.rows[0].status, 'approved', 'Existing founder must be backfilled to approved');

  // Verify topics.status was backfilled to published
  const topicStatus = await db.query(`SELECT status FROM "${schema}".topics WHERE id = 999`);
  assert.equal(topicStatus.rows[0].status, 'published', 'Existing topic must be backfilled to published');

  // Verify articles and videos columns
  for (const table of ['articles', 'videos']) {
    for (const col of ['review_decision', 'review_notes', 'submitted_by_id']) {
      const res = await db.query(
        'SELECT udt_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 AND column_name = $3',
        [schema, table, col]
      );
      assert.equal(res.rowCount, 1, `Column ${table}.${col} must exist`);
    }
  }

  // Verify _articles_v and _videos_v columns
  for (const table of ['_articles_v', '_videos_v']) {
    for (const col of ['version_review_decision', 'version_review_notes', 'version_submitted_by_id']) {
      const res = await db.query(
        'SELECT udt_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 AND column_name = $3',
        [schema, table, col]
      );
      assert.equal(res.rowCount, 1, `Column ${table}.${col} must exist`);
    }
  }

  // Clean rollback
  await db.query('ROLLBACK');

  // Verify audit schema was completely rolled back
  assert.equal(
    (await db.query('SELECT count(*)::int as n FROM information_schema.schemata WHERE schema_name = $1', [schema])).rows[0].n,
    0,
    'Audit schema must be cleanly removed on rollback'
  );

  console.log('✅ PASS: PostgreSQL additive upgrade and idempotency test passed with 100% success. Zero database rows altered.');
} catch (e) {
  await db.query('ROLLBACK');
  console.error('❌ FAIL: Migration audit failed:', e);
  process.exit(1);
} finally {
  await db.end();
}
