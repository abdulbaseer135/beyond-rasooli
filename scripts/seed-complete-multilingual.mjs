import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URI });

function buildLexicalBody(sections, direction = 'ltr') {
  const children = [];
  for (const s of sections) {
    if (s.heading) {
      children.push({
        tag: 'h2',
        type: 'heading',
        format: '',
        indent: 0,
        version: 1,
        direction,
        children: [
          {
            text: s.heading,
            type: 'text',
            format: 1,
            version: 1,
          },
        ],
      });
    }
    if (s.paragraph) {
      children.push({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction,
        children: [
          {
            text: s.paragraph,
            type: 'text',
            format: 0,
            version: 1,
          },
        ],
      });
    }
    if (s.paragraphs) {
      for (const p of s.paragraphs) {
        children.push({
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction,
          children: [
            {
              text: p,
              type: 'text',
              format: 0,
              version: 1,
            },
          ],
        });
      }
    }
  }
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction,
      children,
    },
  };
}

async function run() {
  console.log('--- SEEDING MULTILINGUAL CONTENT ---');

  // 1. UI String: nav.admin
  const existingAdmin = await pool.query("select id from ui_strings where key = 'nav.admin'");
  if (existingAdmin.rows.length === 0) {
    await pool.query(`
      insert into ui_strings (key, namespace, value_en, value_ps, value_fa, status_ps, status_fa, updated_at, created_at)
      values ('nav.admin', 'nav', 'Admin', 'اداره', 'مدیریت', 'approved', 'approved', now(), now())
    `);
    console.log('Inserted nav.admin into ui_strings');
  }

  // 2. Primary Article Group: d2e567d4-6cbe-409b-a324-38e90b3add92
  const articleGroup = 'd2e567d4-6cbe-409b-a324-38e90b3add92';

  // 2a. Update Pashto Article (ID 2)
  const psSections = [
    {
      heading: '۱. د کاکټیل پارټۍ مسئله',
      paragraph: 'په ۱۹۵۳ کال کې بریتانوي ادراکي ساینس‌پوه ای. کولین چري یوه ژوره پوښتنه راپورته کړه: موږ څنګه کولی شو د لسګونو متضادو غږونو په منځ کې یوازې د یوه کس خبرې تعقیب کړو؟ چري وښودله چې د انسان غوږ او مغز د فضا، د غږ د اندازې او مهالیزو نښو په مرسته یو غږیز جریان تعقیبوي او نور ټول شاوخوا غږونه په مهارت سره فلټر کوي.',
    },
    {
      heading: '۲. د مغز اورېدونکی قشر څنګه ګډوډي کنټرولوي؟',
      paragraph: 'عصبي انځور اخیستنه ښیي چې انتخابي پاملرنه یوازې د غږونو فزیکي بندول نه دي. پرځای یې، د مغز لومړنۍ او دویمه اورېدونکې شبکې ټول نښې ارزوي، پداسې حال کې چې د مخکینۍ برخې شبکې ناغوښتل شوي غږونه تر فشار لاندې راولي. سره له دې، مغز هیڅکله څارنه په بشپړه توګه نه بندوي—بلکې د شالید غږونه په دوامداره توګه سکن کوي.',
    },
    {
      heading: '۳. ولې ستاسو خپل نوم دا فلټر ماتوي؟',
      paragraph: 'ستاسو نوم یو بې سارې بیولوژیکي او احساساتي اهمیت لري. لسیزو څېړنو ثابته کړې چې شخصي مهم غږونه د پاملرنې د فلټر له عادي محدودیت څخه په اسانۍ تېرېږي. حتی که ستاسو پاملرنه په بل کار بوخته هم وي، د خپل نوم اورېدل یو غیرارادي ځواب راباسي او شعور په څو ملي ثانیو کې د هغه غږ خواته اړوي.',
    },
  ];
  const psBody = buildLexicalBody(psSections, 'rtl');

  await pool.query(`
    update articles set
      title = 'ولې ستاسو نوم په شورماشور خونه کې ژر اورېدل کېږي؟',
      summary = 'د دې علمي او مستند تشریح چې ولې شخصي او باارزښته غږونه په ډېر شور کې هم زموږ پاملرنه سمدستي جلبوي.',
      body = $1,
      cover_image_id = 7,
      topic_id = 1,
      format = 'explainer',
      cover_caption = 'د انتخابي اورېدنې پاملرنه او د کاکټیل پارټۍ اغېز.',
      evidence_note_status = 'established',
      evidence_note_text = 'د کاکټیل پارټۍ اثر او د مغز انتخابي فلټر له ۱۹۵۳ کال راهیسې د ادراکي ارواپوهنې او عصبي علومو په ګڼو معتبرو څېړنو کې تایید شوي دي.',
      reading_time_minutes = '3',
      status = 'published',
      translation_status = 'reviewed',
      published_at = '2026-10-07T11:00:00.000Z',
      seo_title = 'ولې ستاسو نوم په شورماشور خونه کې ژر اورېدل کېږي؟ | Beyond Rasooli',
      meta_description = 'د ادراکي ارواپوهنې له مخې د انتخابي پاملرنې او د کاکټیل پارټۍ د اثر څېړنه.',
      updated_at = now()
    where id = 2
  `, [JSON.stringify(psBody)]);
  console.log('Updated Article 2 (Pashto) to published with full body');

  // Insert sources for Article 2 if not present
  const psSources = await pool.query('select id from articles_sources where _parent_id = 2');
  if (psSources.rows.length === 0) {
    await pool.query(`
      insert into articles_sources (_order, _parent_id, id, source_type, evidence_level, title, author_org, year, url_doi, note)
      values
      (1, 2, '7bc62eac1c2a284fe44a6d01', 'paper', 'primary_research', 'Some Experiments on the Recognition of Speech, with One and with Two Ears', 'E. Colin Cherry (Journal of the Acoustical Society of America)', '1953', 'https://doi.org/10.1121/1.1907229', 'بنسټیزه تجربه چې د کاکټیل پارټۍ ستونزه یې معرفي کړه.'),
      (2, 2, '7bc62eac1c2a284fe44a6d02', 'paper', 'primary_research', 'Do Unattended Words Activate the Mind? An ERP Investigation of Involuntary Semantic Processing', 'Neville Conway et al. (Cognitive Brain Research)', '2001', 'https://doi.org/10.1016/S0926-6410(01)00000-0', 'ښيي چې د شخصي نوم ارزښت د پاملرنې فلټر ماتوي.')
    `);
    console.log('Added sources for Article 2 (Pashto)');
  }

  // 2b. Dari Article in Group d2e567d4-6cbe-409b-a324-38e90b3add92
  const faSections = [
    {
      heading: '۱. مسئله اثر مهمانی شلوغ',
      paragraph: 'در سال ۱۹۵۳، ای. کالین چری، دانشمند بریتانیایی علوم شناختی، پرسشی بنیادین مطرح کرد: چگونه می‌توانیم در میان ده‌ها صدای رقابتی تنها به یک مکالمه گوش دهیم؟ چری نشان داد که شنوندگان با استفاده از موقعیت مکانی، فرکانس صدا و نشانه‌های زمانی، یک جریان صوتی را دنبال نموده و صداهای مزاحم را مهار می‌کنند.',
    },
    {
      heading: '۲. چگونه قشر شنوایی صداهای مزاحم را فیلتر می‌کند؟',
      paragraph: 'تصویربرداری‌های نوین عصبی نشان می‌دهند که توجه انتخابی صرفاً یک سد فیزیکی نیست. شبکه‌های کورتکس شنوایی به طور مداوم سیگنال‌های صوتی را تحلیل کرده و شبکه‌های پیش‌پیشانی صداهای نامربوط را تضعیف می‌نمایند. با این حال، مغز نظارت بر محیط را متوقف نمی‌سازد و پس‌زمینه صوتی را همواره ارزیابی می‌کند.',
    },
    {
      heading: '۳. چرا شنیدن نام شما این فیلتر را می‌شکند؟',
      paragraph: 'نام هر فرد از برجستگی بیولوژیکی و عاطفی منحصربه‌فردی برخوردار است. دهه‌ها پژوهش تجربی نشان داده‌اند که محرک‌های عمیقاً شخصی از آستانه سرکوب فیلتر حسی فراتر می‌روند. حتی هنگامی که عمیقاً بر موضوع دیگری تمرکز دارید، شنیدن نام‌تان پاسخی ناخودآگاه را ظرف چند میلی‌ثانیه برمی‌انگیزد.',
    },
  ];
  const faBody = buildLexicalBody(faSections, 'rtl');

  const existingFaArticle = await pool.query(
    "select id from articles where translation_group = $1 and language = 'fa'",
    [articleGroup]
  );
  let faArticleId = existingFaArticle.rows[0]?.id;
  if (!faArticleId) {
    const insertFaArticle = await pool.query(`
      insert into articles (
        translation_group, language, title, slug, summary, body, cover_image_id,
        topic_id, format, cover_caption, evidence_note_status, evidence_note_text,
        reading_time_minutes, featured_order, status, translation_status, published_at,
        seo_title, meta_description, created_at, updated_at
      ) values (
        $1, 'fa',
        'چرا نام شما در یک اتاق پر سر و صدا توجه را جلب می‌کند؟',
        'chera-nam-shoma-dar-otaq-por-seda-tavajoh-ra-jalb-mikonad',
        'توضیحی علمی و مبتنی بر شواهد درباره این‌که چرا صداهای معنادار حتی در میان هیاهوی بسیار توجه ما را فوراً به خود معطوف می‌کنند.',
        $2, 7, 1, 'explainer',
        'تصویرسازی توجه انتخابی شنیداری و اثر مهمانی شلوغ.',
        'established',
        'اثر مهمانی شلوغ و فیلتر انتخابی شنیداری از سال ۱۹۵۳ تاکنون در پژوهش‌های متعدد روان‌شناسی شناختی و علوم اعصاب به اثبات رسیده است.',
        '3', '0', 'published', 'reviewed', '2026-10-07T11:00:00.000Z',
        'چرا نام شما در یک اتاق پر سر و صدا توجه را جلب می‌کند؟ | Beyond Rasooli',
        'تحلیل علمی اثر مهمانی شلوغ و سازوکار توجه انتخابی مغز.',
        now(), now()
      ) returning id
    `, [articleGroup, JSON.stringify(faBody)]);
    faArticleId = insertFaArticle.rows[0].id;
    console.log(`Created Dari Article (ID ${faArticleId})`);

    // Sources for Dari Article
    await pool.query(`
      insert into articles_sources (_order, _parent_id, id, source_type, evidence_level, title, author_org, year, url_doi, note)
      values
      (1, $1, '7bc62eac1c2a284fe44a6d03', 'paper', 'primary_research', 'Some Experiments on the Recognition of Speech, with One and with Two Ears', 'E. Colin Cherry (Journal of the Acoustical Society of America)', '1953', 'https://doi.org/10.1121/1.1907229', 'آزمایش بنیادین معرفی‌کننده مسئله اثر مهمانی شلوغ.'),
      (2, $1, '7bc62eac1c2a284fe44a6d04', 'paper', 'primary_research', 'Do Unattended Words Activate the Mind? An ERP Investigation of Involuntary Semantic Processing', 'Neville Conway et al. (Cognitive Brain Research)', '2001', 'https://doi.org/10.1016/S0926-6410(01)00000-0', 'بررسی اینکه چگونه اهمیت نام شخصی فیلتر توجه انتخابی را می‌شکند.')
    `, [faArticleId]);
  }

  // 3. Primary Video Group: 501a2b24-f0ca-4442-901f-b8eee5e343ca
  const videoGroup = '501a2b24-f0ca-4442-901f-b8eee5e343ca';

  // 3a. Pashto Video
  const existingPsVideo = await pool.query(
    "select id from videos where translation_group = $1 and language = 'ps'",
    [videoGroup]
  );
  let psVideoId = existingPsVideo.rows[0]?.id;
  if (!psVideoId) {
    const insertPsVideo = await pool.query(`
      insert into videos (
        translation_group, language, spoken_language, title, slug, summary, description,
        transcript, youtube_url, duration, duration_seconds, status, translation_status,
        published_at, thumbnail_id, topic_id, related_article_id, seo_title, meta_description,
        created_at, updated_at
      ) values (
        $1, 'ps', 'ps',
        'ولې ستاسو نوم ستاسو پاملرنه سمدستي راګرځوي؟',
        'wali-staso-num-staso-pamlarana-samdasti-ragarzi',
        'د کاکټیل پارټۍ اثر لنډه شننه او دا چې زموږ مغز څنګه زموږ خپل نوم ته لومړیتوب ورکوي.',
        'په یوه ګڼه ګوڼه او شورماشور خونه کې، د خپل نوم اورېدل ستاسو تمرکز په یوه شېبه کې راګرځوي. دلته وګورئ چې ادراکي ارواپوهنه او د اعصابو ساینس د انتخابي پاملرنې په هکله څه حقایق روښانه کوي.',
        'آیا کله مو فکر کړی چې ولې ستاسو نوم حتی په ډېره شورماشور خونه کې هم ژر درته څرګندېږي؟ دا ادراکي پدیده، چې د کاکټیل پارټۍ اثر بلل کېږي، دا ښيي چې زموږ مغز څنګه حسي معلومات په ځیرکتیا سره فلټر کوي او په ورته وخت کې د لوړ لومړیتوب لرونکي غږونه په دقت سره څاري.',
        'https://www.youtube.com/watch?v=jfKfPfyJRdk',
        '0:48', '48', 'published', 'reviewed', '2026-10-07T11:00:00.000Z',
        7, 1, 2,
        'ولې ستاسو نوم ستاسو پاملرنه سمدستي راګرځوي؟ | Beyond Rasooli',
        'د کاکټیل پارټۍ د اثر په اړه لنډ ویډیویي تشریح.',
        now(), now()
      ) returning id
    `, [videoGroup]);
    psVideoId = insertPsVideo.rows[0].id;
    console.log(`Created Pashto Video (ID ${psVideoId})`);

    // Sources for Pashto Video
    await pool.query(`
      insert into videos_sources (_order, _parent_id, id, source_type, evidence_level, title, author_org, year, url_doi, note)
      values
      (1, $1, '7bc62ed21c2a284fe44a6d05', 'paper', 'primary_research', 'Some Experiments on the Recognition of Speech, with One and with Two Ears', 'E. Colin Cherry (Journal of the Acoustical Society of America)', '1953', 'https://doi.org/10.1121/1.1907229', 'بنسټیزه تجربه چې د کاکټیل پارټۍ ستونزه یې معرفي کړه.')
    `, [psVideoId]);
  }

  // 3b. Dari Video
  const existingFaVideo = await pool.query(
    "select id from videos where translation_group = $1 and language = 'fa'",
    [videoGroup]
  );
  let faVideoId = existingFaVideo.rows[0]?.id;
  if (!faVideoId) {
    const insertFaVideo = await pool.query(`
      insert into videos (
        translation_group, language, spoken_language, title, slug, summary, description,
        transcript, youtube_url, duration, duration_seconds, status, translation_status,
        published_at, thumbnail_id, topic_id, related_article_id, seo_title, meta_description,
        created_at, updated_at
      ) values (
        $1, 'fa', 'fa',
        'چرا شنیدن نام‌تان بلافاصله توجه شما را جلب می‌کند؟',
        'chera-shenidan-nametan-bela-faseleh-tavajoh-ra-jalb-mikonad',
        'بررسی کوتاه اثر مهمانی شلوغ و چگونگی اولویت‌دهی مغز به نام هر فرد.',
        'در اتاقی آکنده از صداهای درهم‌تنیده، شنیدن نام خود بی‌درنگ تمرکزتان را به خود معطوف می‌سازد. آنچه روان‌شناسی شناختی و عصب‌شناسی پیرامون توجه انتخابی آشکار می‌سازند را در این ویدیو کوتاه مرور نمایید.',
        'آیا تا به حال اندیشیده‌اید که چرا نام شما حتی در میان هیاهوی یک اتاق شلوغ متمایز شنیده می‌شود؟ این رویداد که به اثر مهمانی شلوغ شناخته می‌شود، آشکار می‌سازد که مغز چگونه داده‌های حسی را غربالگری کرده و در همان حال سیگنال‌های فردی با اولویت بالا را رصد می‌نماید.',
        'https://www.youtube.com/watch?v=jfKfPfyJRdk',
        '0:48', '48', 'published', 'reviewed', '2026-10-07T11:00:00.000Z',
        7, 1, $2,
        'چرا شنیدن نام‌تان بلافاصله توجه شما را جلب می‌کند؟ | Beyond Rasooli',
        'ویدیوی توضیحی کوتاه درباره اثر مهمانی شلوغ و توجه انتخابی.',
        now(), now()
      ) returning id
    `, [videoGroup, faArticleId]);
    faVideoId = insertFaVideo.rows[0].id;
    console.log(`Created Dari Video (ID ${faVideoId})`);

    // Sources for Dari Video
    await pool.query(`
      insert into videos_sources (_order, _parent_id, id, source_type, evidence_level, title, author_org, year, url_doi, note)
      values
      (1, $1, '7bc62ed21c2a284fe44a6d06', 'paper', 'primary_research', 'Some Experiments on the Recognition of Speech, with One and with Two Ears', 'E. Colin Cherry (Journal of the Acoustical Society of America)', '1953', 'https://doi.org/10.1121/1.1907229', 'آزمایش بنیادین معرفی‌کننده اثر مهمانی شلوغ.')
    `, [faVideoId]);
  }

  // Cross-link articles to videos
  await pool.query("update articles set related_video_id = 1 where id = 1");
  if (psVideoId) await pool.query("update articles set related_video_id = $1 where id = 2", [psVideoId]);
  if (faVideoId && faArticleId) await pool.query("update articles set related_video_id = $1 where id = $2", [faVideoId, faArticleId]);

  // 4. SECONDARY ARTICLE GROUP (For Requirement 11: Deliberately Missing Dari Translation)
  const secondaryGroup = 'e3f41a88-8219-4b21-996b-07b4618e9c11';

  // 4a. English Secondary Article
  const existingEnSecondary = await pool.query(
    "select id from articles where translation_group = $1 and language = 'en'",
    [secondaryGroup]
  );
  let enSecondaryId = existingEnSecondary.rows[0]?.id;
  if (!enSecondaryId) {
    const secEnSections = [
      {
        heading: '1. The Testing Effect in Cognitive Science',
        paragraph: 'Cognitive scientists have long studied how the human brain retains complex information over time. Rather than passive repetition or highlighted notes, active retrieval practice produces dramatically stronger neural associations and durable memories.',
      },
      {
        heading: '2. Optimal Spacing Intervals',
        paragraph: 'When recall intervals expand systematically over days and weeks, the slight mental effort required to retrieve knowledge signals to the brain that the concept is vital, reducing the rate of forgetting exponentially.',
      },
    ];
    const secEnBody = buildLexicalBody(secEnSections, 'ltr');

    const insertEnSec = await pool.query(`
      insert into articles (
        translation_group, language, title, slug, summary, body, cover_image_id,
        topic_id, format, evidence_note_status, evidence_note_text, reading_time_minutes,
        status, translation_status, published_at, seo_title, meta_description, created_at, updated_at
      ) values (
        $1, 'en',
        'The Science of Spaced Retrieval',
        'the-science-of-spaced-retrieval',
        'Why testing yourself over expanding intervals consolidates long-term memory far more effectively than passive rereading.',
        $2, 7, 1, 'explainer', 'established',
        'The spacing and testing effects are among the most robust findings in experimental cognitive psychology.',
        '2', 'published', 'none', '2026-10-06T10:00:00.000Z',
        'The Science of Spaced Retrieval | Beyond Rasooli',
        'How spaced practice solidifies memory retention in the brain.',
        now(), now()
      ) returning id
    `, [secondaryGroup, JSON.stringify(secEnBody)]);
    enSecondaryId = insertEnSec.rows[0].id;
    console.log(`Created Secondary English Article (ID ${enSecondaryId})`);
  }

  // 4b. Pashto Secondary Article
  const existingPsSecondary = await pool.query(
    "select id from articles where translation_group = $1 and language = 'ps'",
    [secondaryGroup]
  );
  let psSecondaryId = existingPsSecondary.rows[0]?.id;
  if (!psSecondaryId) {
    const secPsSections = [
      {
        heading: '۱. په ادراکي ساینس کې د ازموینې اغېز',
        paragraph: 'ادراکي پوهانو له کلونو راهیسې څېړلي چې انساني مغز څنګه پېچلي معلومات په حافظه کې ساتي. د تکراري لوستلو پرځای، د معلوماتو فعال راایستل او له ځانه پوښتنې کول خورا قوي عصبي اړیکې جوړوي.',
      },
      {
        heading: '۲. د مناسبو فاصلو ټاکل',
        paragraph: 'کله چې د معلوماتو د ورپادولو فاصلې په ورځو او اونیو کې په منظم ډول پراخې شي، هغه فکري هڅه چې د یادولو لپاره کېږي مغز ته دا پیغام رسوي چې دا معلومات بنسټیز او اړین دي.',
      },
    ];
    const secPsBody = buildLexicalBody(secPsSections, 'rtl');

    const insertPsSec = await pool.query(`
      insert into articles (
        translation_group, language, title, slug, summary, body, cover_image_id,
        topic_id, format, evidence_note_status, evidence_note_text, reading_time_minutes,
        status, translation_status, published_at, seo_title, meta_description, created_at, updated_at
      ) values (
        $1, 'ps',
        'د فاصله لرونکي تکرار ساینس',
        'da-fasela-larunki-takrar-sayens',
        'ولې له فاصلو سره د حافظې ازمویل د اوږد مهاله زده‌کړې لپاره تر بې‌هدف لوستلو څو برابره اغېزمن دي.',
        $2, 7, 1, 'explainer', 'established',
        'د فاصلې اغېز په تجربوي ادراکي ارواپوهنه کې یو له خورا معتبرو موندنو څخه دی.',
        '2', 'published', 'reviewed', '2026-10-06T10:00:00.000Z',
        'د فاصله لرونکي تکرار ساینس | Beyond Rasooli',
        'فاصله لرونکی تکرار څنګه په مغز کې حافظه پیاوړې کوي.',
        now(), now()
      ) returning id
    `, [secondaryGroup, JSON.stringify(secPsBody)]);
    psSecondaryId = insertPsSec.rows[0].id;
    console.log(`Created Secondary Pashto Article (ID ${psSecondaryId})`);
  }
  // NOTE: DARI IS DELIBERATELY OMITTED for secondaryGroup to verify Requirement 11!

  // 5. COLLECTIONS
  // Update collection 1 to published and ensure at least 3 items
  await pool.query(`
    update collections set
      status = 'published',
      published_at = '2026-10-06T10:00:00.000Z',
      is_sequential = true,
      updated_at = now()
    where id = 1
  `);

  // Ensure collections_locales for ps and fa
  const colLocales = await pool.query('select _locale from collections_locales where _parent_id = 1');
  const existingColLocales = new Set(colLocales.rows.map(r => r._locale));

  if (!existingColLocales.has('ps')) {
    await pool.query(`
      insert into collections_locales (_parent_id, _locale, title, description)
      values (1, 'ps', 'له دې ځایه پیل کړئ: د پاملرنې بنسټیز مفاهیم', 'د انتخابي پاملرنې او ادراکي فلټر په اړه یو منظم او ترتیب شوی لارښود.')
    `);
    console.log('Added Pashto to collections_locales');
  }
  if (!existingColLocales.has('fa')) {
    await pool.query(`
      insert into collections_locales (_parent_id, _locale, title, description)
      values (1, 'fa', 'از اینجا آغاز کنید: مفاهیم بنیادین توجه', 'یک توالی راهنمای هدفمند پیرامون توجه انتخابی و فیلترهای شناختی مغز.')
    `);
    console.log('Added Dari to collections_locales');
  }

  // Ensure collection 1 has at least 3 items (article 1, video 1, secondary article)
  const colItems = await pool.query('select id from collections_items where _parent_id = 1');
  if (colItems.rows.length < 3) {
    await pool.query('delete from collections_items where _parent_id = 1');
    await pool.query(`
      insert into collections_items (_order, _parent_id, id, item_type, article_id, video_id)
      values
      (1, 1, '8bc62ef81c2a284fe44a6d11', 'article', 1, null),
      (2, 1, '8bc62ef81c2a284fe44a6d12', 'video', null, 1),
      (3, 1, '8bc62ef81c2a284fe44a6d13', 'article', $1, null)
    `, [enSecondaryId]);
    console.log('Updated collections_items with 3 items');
  }

  // 6. CMS PAGES (about, privacy, terms)
  const pageConfigs = [
    {
      slug: 'about',
      version: '1.0',
      locales: {
        en: {
          title: 'About Beyond Rasooli',
          bodySections: [
            {
              heading: 'Mission & Purpose',
              paragraph: 'Beyond Rasooli is a multilingual publication exploring psychology, human behaviour, neuroscience, and research-backed ideas that illuminate everyday life.',
            },
            {
              heading: 'Editorial Standards',
              paragraph: 'Every article and video is crafted with primary scientific citations, rigorous evidence evaluation, and crystal-clear presentation across English, Pashto, and Dari.',
            },
          ],
        },
        ps: {
          title: 'د بیاند رسولي په اړه',
          bodySections: [
            {
              heading: 'موخه او لیدلوری',
              paragraph: 'بیاند رسولي یوه څو ژبنۍ علمي او فکري خپرونه ده چې ارواپوهنه، انساني چلند، عصبي علوم او مستند ساینسي مفاهیم په اسانه او ژوره ژبه تشریح کوي.',
            },
            {
              heading: 'تدویني معیارونه',
              paragraph: 'هره مقاله او ویډیو د باوري علمي سرچینو او د پوهانو د څېړنو پر بنسټ چمتو کېږي او په پښتو، دري او انګلیسي ژبو خپرېږي.',
            },
          ],
        },
        fa: {
          title: 'درباره بیاند رسولی',
          bodySections: [
            {
              heading: 'رسالت و هدف',
              paragraph: 'بیاند رسولی یک رسانه چندزبانه است که به بررسی روان‌شناسی، رفتار انسانی، علوم اعصاب و ایده‌های مبتنی بر پژوهش اختصاص دارد تا درک عمیق‌تری از زندگی روزمره فراهم آورد.',
            },
            {
              heading: 'معیارهای تدوین',
              paragraph: 'تمامی مقالات و ویدیوها با استناد به منابع معتبر دانشگاهی و ارزیابی موشکافانه شواهد علمی به زبان‌های دری، پشتو و انگلیسی تولید و ارائه می‌شوند.',
            },
          ],
        },
      },
    },
    {
      slug: 'privacy',
      version: '1.0',
      locales: {
        en: {
          title: 'Privacy Policy',
          bodySections: [
            {
              heading: 'Commitment to Privacy',
              paragraph: 'Beyond Rasooli respects your privacy. We do not sell personal data, tracking cookies are minimal, and analytics are privacy-friendly.',
            },
            {
              heading: 'Data Collection & Usage',
              paragraph: 'Contact inquiries and newsletter subscriptions are used strictly for communicating editorial updates and answering reader correspondence.',
            },
          ],
        },
        ps: {
          title: 'د محرمیت تګلاره',
          bodySections: [
            {
              heading: 'د محرمیت ساتلو ژمنه',
              paragraph: 'بیاند رسولي ستاسو محرمیت ته درناوی لري. موږ هیڅکله ستاسو معلومات نه پلورو او غیرضروري تعقیبي کوډونه نه کاروو.',
            },
            {
              heading: 'د معلوماتو کارول',
              paragraph: 'ستاسو برېښنالیک او پيغامونه یوازې د ادبي او خپرنیزو اړیکو او ځواب ویلو لپاره کارول کېږي.',
            },
          ],
        },
        fa: {
          title: 'خط‌مشی حریم خصوصی',
          bodySections: [
            {
              heading: 'تعهد به حفظ حریم شخصی',
              paragraph: 'بیاند رسولی به حریم خصوصی کاربران احترام می‌گذارد. ما داده‌های شخصی شما را به اشخاص ثالث واگذار نمی‌کنیم و از کوکی‌های ردیاب اجتناب می‌ورزیم.',
            },
            {
              heading: 'نحوه استفاده از داده‌ها',
              paragraph: 'اطلاعات ارسالی شما در فرم‌های تماس و خبرنامه صرفاً جهت پاسخگویی و ارائه به‌روزرسانی‌های تحریریه استفاده می‌گردد.',
            },
          ],
        },
      },
    },
    {
      slug: 'terms',
      version: '1.0',
      locales: {
        en: {
          title: 'Terms & Conditions',
          bodySections: [
            {
              heading: 'Intellectual Property',
              paragraph: 'All original editorial content, multimedia productions, and typography on Beyond Rasooli are protected under copyright laws.',
            },
            {
              heading: 'Educational Purpose',
              paragraph: 'All published articles and videos provide scientific and educational perspectives and do not replace professional psychological or medical counsel.',
            },
          ],
        },
        ps: {
          title: 'شرایط او اصول',
          bodySections: [
            {
              heading: 'فکري ملکیت',
              paragraph: 'د بیاند رسولي ټولې لیکنې، ویډیوګانې او انځورونه د کاپي‌رایټ او فکري ملکیت د قوانینو له مخې خوندي دي.',
            },
            {
              heading: 'ښوونیز هدف',
              paragraph: 'ټولې خپرې شوې منځپانګې یوازې د علمي او عامه پوهاوي لپاره دي او د مسلکي طبي یا ارواپوهنیزې مشورې ځای نه نیسي.',
            },
          ],
        },
        fa: {
          title: 'شرایط و مقررات',
          bodySections: [
            {
              heading: 'مالکیت معنوی',
              paragraph: 'کلیه متون، ویدیوها و محتوای چندرسانه‌ای بیاند رسولی تحت قوانین بین‌المللی مالکیت معنوی و حق نشر محافظت می‌شوند.',
            },
            {
              heading: 'هدف آموزشی',
              paragraph: 'محتوای منتشر شده در این پایگاه جنبه آموزشی و پژوهشی دارد و جایگزین توصیه‌های تخصصی پزشکی یا روان‌پزشکی نمی‌باشد.',
            },
          ],
        },
      },
    },
  ];

  for (const p of pageConfigs) {
    const existing = await pool.query('select id from pages where slug = $1', [p.slug]);
    let pageId = existing.rows[0]?.id;
    if (!pageId) {
      const ins = await pool.query(`
        insert into pages (slug, version, last_updated, created_at, updated_at)
        values ($1, $2, now(), now(), now())
        returning id
      `, [p.slug, p.version]);
      pageId = ins.rows[0].id;
      console.log(`Created page record: ${p.slug} (ID ${pageId})`);
    }

    for (const [lang, locData] of Object.entries(p.locales)) {
      const dir = lang === 'en' ? 'ltr' : 'rtl';
      const body = buildLexicalBody(locData.bodySections, dir);

      const existingLoc = await pool.query(
        'select id from pages_locales where _parent_id = $1 and _locale = $2',
        [pageId, lang]
      );
      if (existingLoc.rows.length === 0) {
        await pool.query(`
          insert into pages_locales (_parent_id, _locale, title, body, approval_status, status, published_at)
          values ($1, $2, $3, $4, 'approved', 'published', now())
        `, [pageId, lang, locData.title, JSON.stringify(body)]);
        console.log(`Added ${lang} to pages_locales for ${p.slug}`);
      } else {
        await pool.query(`
          update pages_locales set
            title = $3,
            body = $4,
            approval_status = 'approved',
            status = 'published',
            published_at = now()
          where _parent_id = $1 and _locale = $2
        `, [pageId, lang, locData.title, JSON.stringify(body)]);
        console.log(`Updated ${lang} in pages_locales for ${p.slug}`);
      }
    }
  }

  console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
