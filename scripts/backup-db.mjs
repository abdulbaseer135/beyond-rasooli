import nextEnv from '@next/env';
import pg from 'pg';
import fs from 'node:fs/promises';
import path from 'node:path';

nextEnv.loadEnvConfig(process.cwd());

const client = new pg.Client({ connectionString: process.env.DATABASE_URI });

async function backup() {
  await client.connect();
  console.log('Connecting to database for backup...');

  const tablesRes = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name"
  );

  const backupData = {
    timestamp: new Date().toISOString(),
    tables: {},
  };

  for (const row of tablesRes.rows) {
    const tableName = row.table_name;
    const dataRes = await client.query(`SELECT * FROM "${tableName}"`);
    backupData.tables[tableName] = dataRes.rows;
    console.log(`Backed up ${tableName}: ${dataRes.rowCount} rows`);
  }

  await fs.mkdir(path.join(process.cwd(), '.backups'), { recursive: true });
  const backupFile = path.join(process.cwd(), '.backups', 'pre_migration_backup.json');
  await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
  console.log(`✅ Backup successfully saved to ${backupFile}`);

  await client.end();
}

backup().catch(err => {
  console.error('Backup failed:', err);
  process.exit(1);
});
