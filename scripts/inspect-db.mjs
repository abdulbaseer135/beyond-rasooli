import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URI });

async function run() {
  const tables = await pool.query("select table_name from information_schema.tables where table_schema = 'public' and table_name like '%locale%'");
  console.log('LOCALE TABLES:', tables.rows.map(r => r.table_name));

  const topicsLocales = await pool.query('select * from topics_locales');
  console.log('TOPICS_LOCALES:', topicsLocales.rows);

  const pagesLocales = await pool.query('select * from pages_locales');
  console.log('PAGES_LOCALES:', pagesLocales.rows);

  const collectionsLocales = await pool.query('select * from collections_locales');
  console.log('COLLECTIONS_LOCALES:', collectionsLocales.rows);

  const articles = await pool.query('select id, language, slug, title, translation_group, status, translation_status from articles');
  console.log('ARTICLES:', articles.rows);

  const videos = await pool.query('select id, language, spoken_language, slug, title, translation_group, status, translation_status from videos');
  console.log('VIDEOS:', videos.rows);

  const settingsLocales = await pool.query("select * from site_settings_locales");
  console.log('SETTINGS_LOCALES:', settingsLocales.rows);

  const uiCount = await pool.query('select count(*) from ui_strings');
  console.log('UI STRINGS COUNT:', uiCount.rows[0].count);

  const sample = await pool.query('select key, value_en, value_ps, value_fa from ui_strings limit 5');
  console.log('SAMPLE:', sample.rows);

  const emptyPs = await pool.query("select count(*) from ui_strings where value_ps is null or value_ps = ''");
  console.log('EMPTY PS:', emptyPs.rows[0].count);

  const emptyFa = await pool.query("select count(*) from ui_strings where value_fa is null or value_fa = ''");
  console.log('EMPTY FA:', emptyFa.rows[0].count);

  await pool.end();
}

run().catch(console.error);
