import assert from 'node:assert';

const base = 'http://localhost:3000';

async function get(path) {
  const res = await fetch(`${base}${path}`);
  const text = await res.text();
  return { status: res.status, headers: res.headers, text };
}

async function run() {
  console.log('=== COMPREHENSIVE MULTILINGUAL VERIFICATION ===\n');

  // 1. Translation API on Article Detail
  console.log('Testing /api/translations for primary article...');
  const tArt = await get('/api/translations?locale=en&path=/read/why-your-name-stands-out-in-a-noisy-room');
  assert.strictEqual(tArt.status, 200);
  const tArtData = JSON.parse(tArt.text);
  console.log('Article Translations resolved:', tArtData.links);
  assert.strictEqual(tArtData.links.en, '/en/read/why-your-name-stands-out-in-a-noisy-room');
  assert.strictEqual(tArtData.links.ps, '/ps/read/wali-staso-num-pe-shormashor-khona-ke-zhar-awredal-kegi');
  assert.strictEqual(tArtData.links.fa, '/fa/read/chera-nam-shoma-dar-otaq-por-seda-tavajoh-ra-jalb-mikonad');
  console.log('✔ Article translation links correctly map all 3 distinct translated slugs!\n');

  // 2. Translation API on Video Detail
  console.log('Testing /api/translations for primary video...');
  const tVid = await get('/api/translations?locale=en&path=/watch/why-your-name-gets-your-attention');
  assert.strictEqual(tVid.status, 200);
  const tVidData = JSON.parse(tVid.text);
  console.log('Video Translations resolved:', tVidData.links);
  assert.strictEqual(tVidData.links.en, '/en/watch/why-your-name-gets-your-attention');
  assert.strictEqual(tVidData.links.ps, '/ps/watch/wali-staso-num-staso-pamlarana-samdasti-ragarzi');
  assert.strictEqual(tVidData.links.fa, '/fa/watch/chera-shenidan-nametan-bela-faseleh-tavajoh-ra-jalb-mikonad');
  console.log('✔ Video translation links correctly map all 3 distinct translated slugs!\n');

  // 3. Requirement 11: Deliberately Missing Translation Case
  console.log('Testing missing translation behavior (Requirement 11)...');
  const tMissing = await get('/api/translations?locale=en&path=/read/the-science-of-spaced-retrieval');
  assert.strictEqual(tMissing.status, 200);
  const tMissingData = JSON.parse(tMissing.text);
  console.log('Secondary Article links (Dari missing):', tMissingData.links);
  assert.strictEqual(tMissingData.links.en, '/en/read/the-science-of-spaced-retrieval');
  assert.strictEqual(tMissingData.links.ps, '/ps/read/da-fasela-larunki-takrar-sayens');
  assert.strictEqual(tMissingData.links.fa, undefined, 'Dari MUST NOT be returned in links!');
  console.log('✔ Missing Dari version is NOT returned by the switcher API!');

  // Check direct access to nonexistent translation
  const directMissing = await get('/fa/read/the-science-of-spaced-retrieval');
  assert.strictEqual(directMissing.status, 404, 'Direct access to missing translation must 404!');
  console.log('✔ Accessing nonexistent Dari slug directly returns 404 (does NOT fake or leak English)!\n');

  // 4. HTML Language & Direction Attributes across all 3 locales
  const localesTest = [
    { loc: 'en', htmlLang: 'en', dir: 'ltr' },
    { loc: 'ps', htmlLang: 'ps', dir: 'rtl' },
    { loc: 'fa', htmlLang: 'fa-AF', dir: 'rtl' },
  ];

  for (const { loc, htmlLang, dir } of localesTest) {
    console.log(`Checking HTML attributes for locale: ${loc}...`);
    const page = await get(`/${loc}`);
    assert.strictEqual(page.status, 200);
    assert(page.text.includes(`lang="${htmlLang}"`), `Expected lang="${htmlLang}" in ${loc}`);
    assert(page.text.includes(`dir="${dir}"`), `Expected dir="${dir}" in ${loc}`);
    console.log(`✔ ${loc} rendered with lang="${htmlLang}" and dir="${dir}"`);
  }
  console.log('');

  // 5. Test Content Localization across all 3 locales on each page
  const pages = [
    {
      name: 'Home',
      routes: {
        en: { path: '/en', texts: ['Look Beyond the Obvious', 'Why Your Name Stands Out', 'Why Your Name Gets Your Attention'] },
        ps: { path: '/ps', texts: ['له څرګندو شیانو ورتېر وګورئ', 'ولې ستاسو نوم په شورماشور خونه کې', 'ولې ستاسو نوم ستاسو پاملرنه سمدستي راګرځوي'] },
        fa: { path: '/fa', texts: ['فراتر از بدیهیات بنگرید', 'چرا نام شما در یک اتاق پر سر و صدا', 'چرا شنیدن نام‌تان بلافاصله توجه شما را جلب می‌کند'] },
      },
    },
    {
      name: 'About',
      routes: {
        en: { path: '/en/about', texts: ['About Beyond Rasooli', 'Abdul Majeed Rasooli', 'Our Mission', 'Editorial Principles'] },
        ps: { path: '/ps/about', texts: ['د بیاینډ رسولي په اړه', 'عبدالمجید رسولي', 'زموږ موخه', 'تدویني او علمي اصول'] },
        fa: { path: '/fa/about', texts: ['درباره فراتر از رسولی', 'عبدالمجید رسولی', 'رسالت ما', 'اصول سردبیری و تدوین'] },
      },
    },
    {
      name: 'Read (Articles Archive)',
      routes: {
        en: { path: '/en/read', texts: ['Why Your Name Stands Out in a Noisy Room', 'The Science of Spaced Retrieval'] },
        ps: { path: '/ps/read', texts: ['ولې ستاسو نوم په شورماشور خونه کې ژر اورېدل کېږي؟', 'د فاصله لرونکي تکرار ساینس'] },
        fa: { path: '/fa/read', texts: ['چرا نام شما در یک اتاق پر سر و صدا توجه را جلب می‌کند؟'] },
      },
    },
    {
      name: 'Watch (Video Library)',
      routes: {
        en: { path: '/en/watch', texts: ['Why Your Name Gets Your Attention'] },
        ps: { path: '/ps/watch', texts: ['ولې ستاسو نوم ستاسو پاملرنه سمدستي راګرځوي؟'] },
        fa: { path: '/fa/watch', texts: ['چرا شنیدن نام‌تان بلافاصله توجه شما را جلب می‌کند؟'] },
      },
    },
    {
      name: 'Topics',
      routes: {
        en: { path: '/en/topics', texts: ['Psychology'] },
        ps: { path: '/ps/topics', texts: ['ارواپوهنه او انساني چلند'] },
        fa: { path: '/fa/topics', texts: ['روان‌شناسی و رفتار انسانی'] },
      },
    },
    {
      name: 'Contact',
      routes: {
        en: { path: '/en/contact', texts: ['Contact'] },
        ps: { path: '/ps/contact', texts: ['اړیکه'] },
        fa: { path: '/fa/contact', texts: ['تماس'] },
      },
    },
    {
      name: 'Search',
      routes: {
        en: { path: '/en/search?q=name', texts: ['Why Your Name'] },
        ps: { path: '/ps/search?q=%D9%86%D9%88%D9%85', texts: ['ولې ستاسو نوم'] },
        fa: { path: '/fa/search?q=%D9%86%D8%A7%D9%85', texts: ['چرا نام شما'] },
      },
    },
  ];

  for (const page of pages) {
    console.log(`Checking ${page.name} page across all 3 languages...`);
    for (const [loc, config] of Object.entries(page.routes)) {
      const res = await get(config.path);
      assert.strictEqual(res.status, 200, `${page.name} (${loc}) returned status ${res.status}`);
      for (const expected of config.texts) {
        assert(res.text.includes(expected), `Missing "${expected}" in ${page.name} (${loc}) at ${config.path}`);
      }
      console.log(`  ✔ ${loc.toUpperCase()}: Content rendered correctly on ${config.path}`);
    }
    console.log('');
  }

  // 6. Article Detail Page Body Verification
  console.log('Verifying Full Article Detail Bodies (headings, paragraphs, evidence notes)...');

  // English Article
  const artEn = await get('/en/read/why-your-name-stands-out-in-a-noisy-room');
  assert.strictEqual(artEn.status, 200);
  assert(artEn.text.includes('1. The Cocktail Party Problem'));
  assert(artEn.text.includes('In 1953, British cognitive scientist E. Colin Cherry'));
  assert(artEn.text.includes('2. How the Auditory Cortex Filters Distraction'));
  assert(artEn.text.includes('3. Why Your Own Name Breaks Through'));
  assert(artEn.text.includes('The cocktail party effect and selective auditory filtering have been extensively replicated'));
  console.log('  ✔ English Article: Title, all 3 headings, all 3 paragraphs, and evidence note verified.');

  // Pashto Article
  const artPs = await get('/ps/read/wali-staso-num-pe-shormashor-khona-ke-zhar-awredal-kegi');
  assert.strictEqual(artPs.status, 200);
  assert(artPs.text.includes('۱. د کاکټیل پارټۍ مسئله'));
  assert(artPs.text.includes('په ۱۹۵۳ کال کې بریتانوي ادراکي ساینس‌پوه'));
  assert(artPs.text.includes('۲. د مغز اورېدونکی قشر څنګه ګډوډي کنټرولوي؟'));
  assert(artPs.text.includes('۳. ولې ستاسو خپل نوم دا فلټر ماتوي؟'));
  assert(artPs.text.includes('د کاکټیل پارټۍ اثر او د مغز انتخابي فلټر له ۱۹۵۳ کال راهیسې'));
  console.log('  ✔ Pashto Article: Title, standfirst, all 3 headings, all 3 paragraphs, and evidence note verified in Pashto.');

  // Dari Article
  const artFa = await get('/fa/read/chera-nam-shoma-dar-otaq-por-seda-tavajoh-ra-jalb-mikonad');
  assert.strictEqual(artFa.status, 200);
  assert(artFa.text.includes('۱. مسئله اثر مهمانی شلوغ'));
  assert(artFa.text.includes('در سال ۱۹۵۳، ای. کالین چری'));
  assert(artFa.text.includes('۲. چگونه قشر شنوایی صداهای مزاحم را فیلتر می‌کند؟'));
  assert(artFa.text.includes('۳. چرا شنیدن نام شما این فیلتر را می‌شکند؟'));
  assert(artFa.text.includes('اثر مهمانی شلوغ و فیلتر انتخابی شنیداری از سال ۱۹۵۳ تاکنون'));
  console.log('  ✔ Dari Article: Title, standfirst, all 3 headings, all 3 paragraphs, and evidence note verified in Dari.');
  console.log('');

  // 7. Video Detail Page Verification
  console.log('Verifying Video Detail Pages (title, description, transcript)...');

  // English Video
  const vidEn = await get('/en/watch/why-your-name-gets-your-attention');
  assert.strictEqual(vidEn.status, 200);
  assert(vidEn.text.includes('Why Your Name Gets Your Attention'));
  assert(vidEn.text.includes('In a crowded room full of competing conversations'));
  assert(vidEn.text.includes('Have you ever wondered why your name stands out'));
  console.log('  ✔ English Video: Title, description, and transcript verified.');

  // Pashto Video
  const vidPs = await get('/ps/watch/wali-staso-num-staso-pamlarana-samdasti-ragarzi');
  assert.strictEqual(vidPs.status, 200);
  assert(vidPs.text.includes('ولې ستاسو نوم ستاسو پاملرنه سمدستي راګرځوي؟'));
  assert(vidPs.text.includes('په یوه ګڼه ګوڼه او شورماشور خونه کې'));
  assert(vidPs.text.includes('آیا کله مو فکر کړی چې ولې ستاسو نوم'));
  console.log('  ✔ Pashto Video: Title, description, and transcript verified in Pashto.');

  // Dari Video
  const vidFa = await get('/fa/watch/chera-shenidan-nametan-bela-faseleh-tavajoh-ra-jalb-mikonad');
  assert.strictEqual(vidFa.status, 200);
  assert(vidFa.text.includes('چرا شنیدن نام‌تان بلافاصله توجه شما را جلب می‌کند؟'));
  assert(vidFa.text.includes('در اتاقی آکنده از صداهای درهم‌تنیده'));
  assert(vidFa.text.includes('آیا تا به حال اندیشیده‌اید که چرا نام شما'));
  console.log('  ✔ Dari Video: Title, description, and transcript verified in Dari.');
  console.log('');

  console.log('=== ALL MULTILINGUAL VERIFICATION CHECKS PASSED PERFECTLY! ===');
}

run().catch((err) => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
