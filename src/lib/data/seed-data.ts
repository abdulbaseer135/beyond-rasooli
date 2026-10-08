export interface SeedArticle {
  id: string;
  translationGroup: string;
  language: 'ps' | 'fa' | 'en';
  title: string;
  slug: string;
  summary: string;
  body: string;
  topicSlug: string;
  topicName: string;
  format: 'article' | 'explainer' | 'mystery';
  tags: string[];
  readingTimeMinutes: number;
  publishedDate: string;
  authorName: string;
  relatedVideoSlug?: string;
  status: 'published' | 'draft';
  translationStatus: 'none' | 'machine_draft' | 'reviewed';
  evidenceNote?: {
    status: 'established' | 'emerging' | 'debated';
    text: string;
  };
  sources: Array<{
    sourceType: 'paper' | 'book' | 'report' | 'site';
    evidenceLevel: 'primary_research' | 'review_meta_analysis' | 'book' | 'secondary_explanation';
    title: string;
    authorOrg: string;
    year: string;
    urlDoi?: string;
    note?: string;
  }>;
}

export interface SeedVideo {
  id: string;
  translationGroup: string;
  language: 'ps' | 'fa' | 'en';
  spokenLanguage: 'ps' | 'fa' | 'en';
  title: string;
  slug: string;
  summary?: string;
  description: string;
  youtubeUrl: string;
  duration: string;
  durationSeconds: number;
  transcript: string;
  topicSlug: string;
  topicName: string;
  tags: string[];
  relatedArticleSlug?: string;
  status: 'published' | 'draft';
  translationStatus: 'none' | 'machine_draft' | 'reviewed';
  sources: Array<{
    sourceType: 'paper' | 'book' | 'report' | 'site';
    evidenceLevel: 'primary_research' | 'review_meta_analysis' | 'book' | 'secondary_explanation';
    title: string;
    authorOrg: string;
    year: string;
    urlDoi?: string;
    note?: string;
  }>;
}

export interface SeedTopic {
  slug: string;
  name: {
    en: string;
    ps: string;
    fa: string;
  };
  description: {
    en: string;
    ps: string;
    fa: string;
  };
  order: number;
}

export interface SeedCollection {
  slug: string;
  title: {
    en: string;
    ps: string;
    fa: string;
  };
  description: {
    en: string;
    ps: string;
    fa: string;
  };
  isSequential: boolean;
  itemSlugs: {
    type: 'video' | 'article';
    slug: string;
  }[];
}

export const SEED_TOPICS: SeedTopic[] = [
  {
    slug: 'psychology',
    name: {
      en: 'Psychology & Human Behaviour',
      ps: 'ارواپوهنه او انساني چلند',
      fa: 'روان‌شناسی و رفتار انسانی',
    },
    description: {
      en: 'Habits, selective attention, memory, perception, emotions, and everyday mental shortcuts.',
      ps: 'عادتونه، انتخابي پاملرنه، حافظه، ادراک او د ورځني فکر لارې چارې.',
      fa: 'عادت‌ها، توجه انتخابی، حافظه، ادراک و میانبرهای فکری روزمره.',
    },
    order: 1,
  },
  {
    slug: 'neuroscience',
    name: {
      en: 'Neuroscience & Cognition',
      ps: 'عصبي ساینس او ادراک',
      fa: 'علوم اعصاب و شناخت',
    },
    description: {
      en: 'How the brain processes sensory inputs, builds memories, and governs cognitive capacity.',
      ps: 'مغز څنګه معلومات پروسس کوي، حافظه جوړوي او د پوهې ظرفیت ټاکي.',
      fa: 'چگونگی پردازش داده‌های حسی در مغز و شکل‌گیری ظرفیت‌های شناختی.',
    },
    order: 2,
  },
  {
    slug: 'behavioural-economics',
    name: {
      en: 'Behavioural Economics & Decisions',
      ps: 'چلندي اقتصاد او پرېکړې',
      fa: 'اقتصاد رفتاری و تصمیم‌گیری',
    },
    description: {
      en: 'Cognitive biases, incentives, framing effects, and why people act contrary to stated intentions.',
      ps: 'ادراکي تعصبات، انګېزې، د چوکاټ اغېز او ولې انسانان له خپلو ارادو خلاف عمل کوي.',
      fa: 'سوگیری‌های شناختی، محرک‌ها و تأثیرات چارچوب‌بندی بر انتخاب‌های واقعی.',
    },
    order: 3,
  },
  {
    slug: 'learning',
    name: {
      en: 'Learning & Thinking',
      ps: 'زده کړه او فکر کول',
      fa: 'یادگیری و اندیشیدن',
    },
    description: {
      en: 'Evidence-based study methods, retrieval practice, spaced repetition, and intellectual hygiene.',
      ps: 'د زده کړې مستندې لارې، تکراري ازموینې او د تفکر د اصولو سمون.',
      fa: 'روش‌های علمی یادگیری، تمرین بازیابی حافظه و انضباط فکری.',
    },
    order: 4,
  },
  {
    slug: 'everyday-science',
    name: {
      en: 'Everyday Science',
      ps: 'ورځنی ساینس',
      fa: 'علم روزمره',
    },
    description: {
      en: 'Familiar, relatable experiences explained through rigorous natural and social sciences.',
      ps: 'عادي او ورځنۍ تجربې چې د علمي څېړنو له لارې تشریح کیږي.',
      fa: 'پدیده‌های آشنا و ملموس روزمره با تبیین دقیق علمی.',
    },
    order: 5,
  },
  {
    slug: 'ideas-society',
    name: {
      en: 'Ideas & Society',
      ps: 'فکرونه او ټولنه',
      fa: 'اندیشه‌ها و جامعه',
    },
    description: {
      en: 'Thought experiments, social coordination dynamics, and research-led educational perspectives.',
      ps: 'فکري ازموینې، ټولنیز نظم او د شواهدو پر بنسټ لیدلوري.',
      fa: 'آزمایش‌های فکری، پویایی اجتماعی و تحلیل‌های آموزشی مبتنی بر شواهد.',
    },
    order: 6,
  },
];

export const SEED_ARTICLES: SeedArticle[] = [
  // 1. The Sound of Your Name (EN, PS, FA)
  {
    id: 'art-name-en',
    translationGroup: 'tg-sound-of-your-name',
    language: 'en',
    title: 'The Sound of Your Name: Why Selective Attention Isn’t Just Multitasking',
    slug: 'the-sound-of-your-name',
    summary:
      'In a crowded room filled with competing conversations, your auditory cortex filters reality until someone speaks your name. Cognitive neuroscience reveals how subcortical gating prioritizes high-salience acoustic patterns.',
    body: `In 1953, British cognitive scientist Colin Cherry posed a deceptive question: How do we recognize what one person is saying when everyone else in the room is talking simultaneously?

The phenomenon—christened the "Cocktail Party Effect"—was initially framed as a triumph of mental concentration. Yet modern neuroimaging reveals a startling counter-truth: your brain is not merely focusing on what you choose to hear. It is actively and aggressively suppressing the vast majority of sensory inputs before they reach conscious awareness.

### Subcortical Gating and Acoustic Salience

When acoustic waves strike the eardrum, the mechanical signals travel through the cochlea and auditory nerve into the medial geniculate nucleus of the thalamus. The thalamus acts as a sensory gatekeeper, regulating what bandwidth of acoustic information receives access to the primary auditory cortex.

However, certain acoustic stimuli possess such high biological or autobiographical salience that they breach this inhibitory gate. Your own name is perhaps the supreme example. Because the neural circuits encoding the acoustic envelope of your name have been repeatedly reinforced across decades, the threshold required to evoke a response in the temporoparietal junction is drastically lower than for arbitrary speech tokens.

### The Limits of Selective Processing

Popular culture often misinterprets selective attention as evidence that the subconscious is secretly recording and understanding every word spoken around us. This is scientifically untrue. The auditory system performs coarse acoustic pattern recognition—not semantic deep-parsing—on background speech. The brain does not monitor everything equally; rather, it sets sensitive tripwires for evolutionary and personal anchors.`,
    topicSlug: 'psychology',
    topicName: 'Psychology & Human Behaviour',
    format: 'article',
    tags: ['Attention', 'Auditory Cortex', 'Neuroscience', 'Everyday Mysteries'],
    readingTimeMinutes: 6,
    publishedDate: 'October 2026',
    authorName: 'Abdul Majeed Rasooli',
    relatedVideoSlug: 'sound-of-your-name',
    status: 'published',
    translationStatus: 'none',
    evidenceNote: {
      status: 'established',
      text: 'First demonstrated empirically by Colin Cherry (1953) and subsequently replicated using fMRI and magnetoencephalography, demonstrating attenuated cortical responses to non-attended acoustic streams.',
    },
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'Some Experiments on the Recognition of Speech, with One and with Two Ears',
        authorOrg: 'Cherry, E. C. (Journal of the Acoustical Society of America)',
        year: '1953',
        urlDoi: 'https://doi.org/10.1121/1.1907229',
        note: 'Classic study isolating selective auditory attention.',
      },
      {
        sourceType: 'book',
        evidenceLevel: 'book',
        title: 'Attention and Effort',
        authorOrg: 'Kahneman, D. (Prentice-Hall)',
        year: '1973',
        note: 'Comprehensive theoretical framework on cognitive effort and attentional bottlenecks.',
      },
    ],
  },
  {
    id: 'art-name-ps',
    translationGroup: 'tg-sound-of-your-name',
    language: 'ps',
    title: 'ستاسو د نوم غږ: ولې انتخابي پاملرنه یوازې ذهني تمرکز نه دی',
    slug: 'the-sound-of-your-name',
    summary:
      'په یوه بیروبار کوټه کې چې هر څوک خبرې کوي، ستاسو مغز زیاتره غږونه پټوي تر هغه چې څوک ستاسو نوم واخلي. ادراکي ساینس څرګندوي چې د مغز حسي دروازې څنګه مهم پېژندل شوي غږونه مخکې کوي.',
    body: `په ۱۹۵۳ کال کې برتانوي څېړونکي کولن چیري یوه مهمه پوښتنه راپورته کړه: کله چې په یوه خونه کې لسګونه کسان یوځای غږېږي، زموږ غوږ څنګه د یوه ځانګړي کس خبرې بېلې پېژني؟

دغه راز چې په ارواپوهنه کې د "کاکټیل پارټي اغېز" بلل کېږي، لومړی د لوړ تمرکز نښه ګڼل کېده. خو عصبي څېړنې ښيي چې مغز یوازې پر یوه غږ تمرکز نه کوي، بلکې په شعوري توګه سلګونه نور غږونه فلټر کوي او له منځه یې باسي مخکې تر دې چې تاسو پرې خبر شئ.

ستاسو خپل نوم تر ټولو لوړ عصبي اهمیت لري. دا ځکه چې ستاسو مغز کلونه کلونه د دغه نوم صوتي جوړښت اورېدلی او د هغه لپاره یې د ادراک حساسیت څو برابره لوړ کړی دی. خو په یاد ولرئ: مغز ټول محیطي غږونه نه ثبتوي، بلکې یوازې ځانګړو نښو ته ویښ پاتې کېږي.`,
    topicSlug: 'psychology',
    topicName: 'ارواپوهنه او انساني چلند',
    format: 'article',
    tags: ['پاملرنه', 'عصبي ساینس', 'ارواپوهنه'],
    readingTimeMinutes: 6,
    publishedDate: 'اکتوبر ۲۰۲۶',
    authorName: 'عبدالمجید رسولي',
    relatedVideoSlug: 'sound-of-your-name',
    status: 'published',
    translationStatus: 'reviewed',
    evidenceNote: {
      status: 'established',
      text: 'د کولن چیري په تجربو کې تثبیت شوې موندنه، چې وروسته د معاصرو ام‌ار‌ای انځور اخیستنو له لارې ثابته شوه.',
    },
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'Some Experiments on the Recognition of Speech',
        authorOrg: 'Cherry, E. C.',
        year: '1953',
        urlDoi: 'https://doi.org/10.1121/1.1907229',
        note: 'اصلي څېړنیزه مقاله',
      },
    ],
  },
  {
    id: 'art-name-fa',
    translationGroup: 'tg-sound-of-your-name',
    language: 'fa',
    title: 'شنیدن نام خود: چرا توجه انتخابی فراتر از تمرکز ساده است',
    slug: 'the-sound-of-your-name',
    summary:
      'در میان همهمه یک سالن شلوغ، قشر شنوایی شما اکثر صداها را خاموش می‌سازد مگر آنکه نام‌تان بر زبان آید. علوم شناختی نشان می‌دهد که چگونه ساختار مغز محرک‌های صوتی آشنا را اولویت می‌دهد.',
    body: `در سال ۱۹۵۳، کالین چری دانشمند بریتانیایی پرسشی هوشمندانه مطرح کرد: در محیطی پرهیاهو، ما چگونه می‌توانیم مکالمه یک فرد را دنبال نماییم در حالی که ده‌ها نفر دیگر همزمان گفتگو می‌کنند؟

این وضعیت که به «اثر مهمانی» شهرت دارد، نشان‌دهنده آن است که مغز صرفاً صداها را تقویت نمی‌کند، بلکه به گونه‌ای فعالانه درصد عمده ورودی‌های صوتی نامربوط را حذف می‌نماید.

نام خود شما از بالاترین برجستگی حسی برخوردار است. مدارهای عصبی مربوط به ارتعاش نام شما طی سال‌ها چنان تقویت شده‌اند که آستانه تحریک آن‌ها بسیار پایین‌تر از واژه‌های معمولی است.`,
    topicSlug: 'psychology',
    topicName: 'روان‌شناسی و رفتار انسانی',
    format: 'article',
    tags: ['توجه', 'علوم اعصاب', 'روان‌شناسی'],
    readingTimeMinutes: 6,
    publishedDate: 'اکتبر ۲۰۲۶',
    authorName: 'عبدالمجید رسولی',
    relatedVideoSlug: 'sound-of-your-name',
    status: 'published',
    translationStatus: 'reviewed',
    evidenceNote: {
      status: 'established',
      text: 'پژوهش کلاسیک چری که با روش‌های تصویربرداری امروزی نیز تأیید شده است.',
    },
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'Some Experiments on the Recognition of Speech',
        authorOrg: 'Cherry, E. C.',
        year: '1953',
        urlDoi: 'https://doi.org/10.1121/1.1907229',
        note: 'منبع پژوهشی پایه',
      },
    ],
  },

  // 2. Three Study Mistakes (EN, PS, FA)
  {
    id: 'art-study-en',
    translationGroup: 'tg-three-study-mistakes',
    language: 'en',
    title: 'Three Study Mistakes: Why Highlighting Feels Like Mastery',
    slug: 'three-study-mistakes',
    summary:
      'Passive rereading and fluorescent highlighters generate an illusion of competence. Cognitive science reveals why retrieval practice, spacing, and desirable difficulties build enduring neural architecture.',
    body: `When students open a textbook, intuition suggests a direct correlation between hours spent reading and knowledge acquired. Fluorescent markers streak across pages, margins fill with brackets, and texts are reviewed three or four times before an exam.

Yet meta-analytic reviews in educational psychology reveal that passive rereading and uncontrolled highlighting rank among the least effective learning techniques available.

### Mistake 1: Conflating Fluency with Understanding
As text becomes familiar, processing fluency increases. The brain processes the syntax with less effort and misinterprets this ease as conceptual mastery.

### Mistake 2: Massed Repetition
Cramming compresses exposure into a single temporal block. While it produces short-term familiarity, memory consolidation fails. Spacing sessions across days forces the brain to partially reconstruct the memory pathway.

### Mistake 3: Avoiding Retrieval Strain
The most robust learning occurs when the learner attempts to recall information from memory without looking at notes—a phenomenon known as the Testing Effect.`,
    topicSlug: 'learning',
    topicName: 'Learning & Thinking',
    format: 'explainer',
    tags: ['Learning', 'Cognitive Psychology', 'Memory', 'Habits'],
    readingTimeMinutes: 5,
    publishedDate: 'October 2026',
    authorName: 'Abdul Majeed Rasooli',
    relatedVideoSlug: 'three-study-mistakes',
    status: 'published',
    translationStatus: 'none',
    evidenceNote: {
      status: 'established',
      text: 'Supported by massive empirical meta-analyses, notably Dunlosky et al. (2013) evaluating ten learning techniques across thousands of participants.',
    },
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'review_meta_analysis',
        title: 'Improving Students’ Learning With Effective Learning Techniques',
        authorOrg: 'Dunlosky, J., Rawson, K. A., et al. (Psychological Science in the Public Interest)',
        year: '2013',
        urlDoi: 'https://doi.org/10.1177/1529100612453266',
        note: 'Major review evaluating study strategies.',
      },
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'The Critical Importance of Retrieval for Learning',
        authorOrg: 'Karpicke, J. D., & Roediger, H. L. (Science)',
        year: '2008',
        urlDoi: 'https://doi.org/10.1126/science.1152408',
        note: 'Groundbreaking experiment on active retrieval versus passive review.',
      },
    ],
  },
  {
    id: 'art-study-ps',
    translationGroup: 'tg-three-study-mistakes',
    language: 'ps',
    title: 'د مطالعې درې غټې تېروتنې: ولې نښه کول د پوهې غلط احساس ورکوي',
    slug: 'three-study-mistakes',
    summary:
      'بیا بیا سري لوستل او د مارکر په رنګ کرښې کښل انسان ته داسې احساس ورکوي چې ګواکې زده یې کړل. خو ادراکي ساینس ښيي چې د یادولو هڅه او د وخت وقفه اصلي زده کړه رامنځته کوي.',
    body: `ډېری محصلین فکر کوي چې هر څومره کتاب په دقت بیا بیا ولولي او رنګین مارکر وکاروي، همغومره به ښه زده کړه وکړي. خو علمي څېړنې برعکس ثابته کړې ده.

لومړۍ تېروتنه: د متن رواني د پوهاوي نښه ګڼل. کله چې یوه جمله څو وارې لولئ، سترګې ورسره روږدې کېږي خو دا مانا نه لري چې په ژوره توګه مو یاد شوی.

دویمه تېروتنه: په یوه ناسته کې پرله پسې مطالعه (کرمینګ). که تاسو په مطالعه کې منظمې وقفې رانه ولئ، حافظه ثبات نه مومي.

دریمه تېروتنه: د یادولو له هڅې تېښته. اصلي زده کړه هغه وخت رامنځته کېږي چې کتاب وتړئ او هڅه وکړئ چې مطالب له حافظې راوباسئ.`,
    topicSlug: 'learning',
    topicName: 'زده کړه او فکر کول',
    format: 'explainer',
    tags: ['زده کړه', 'حافظه', 'مطالعه'],
    readingTimeMinutes: 5,
    publishedDate: 'اکتوبر ۲۰۲۶',
    authorName: 'عبدالمجید رسولي',
    relatedVideoSlug: 'three-study-mistakes',
    status: 'published',
    translationStatus: 'reviewed',
    evidenceNote: {
      status: 'established',
      text: 'د ډنلوسکي او همکارانو (۲۰۱۳) په پراخه علمي څېړنه کې مستنده شوې.',
    },
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'review_meta_analysis',
        title: 'Improving Students’ Learning',
        authorOrg: 'Dunlosky et al.',
        year: '2013',
        urlDoi: 'https://doi.org/10.1177/1529100612453266',
      },
    ],
  },
  {
    id: 'art-study-fa',
    translationGroup: 'tg-three-study-mistakes',
    language: 'fa',
    title: 'سه اشتباه رایج در مطالعه: چرا خط کشیدن زیر متن فریبنده است',
    slug: 'three-study-mistakes',
    summary:
      'روخوانی مکرر و هایلایت کردن کتاب‌ها توهم یادگیری ایجاد می‌کند. علوم شناختی نشان می‌دهد تمرین بازیابی و فاصله‌گذاری منظم، پایه‌های ماندگار حافظه هستند.',
    body: `شهود ما معمولاً می‌گوید هر چه بیشتر کتاب را ورق بزنیم و سطور را رنگی کنیم، بهتر یاد می‌گیریم. با این وجود، پژوهش‌های علوم یادگیری نشان داده‌اند که روخوانی غیرفعال کم‌بازده‌ترین شیوه است.

خطای نخست: اشتباه گرفتن آشنایی ظاهری با تسلط مفهومی.
خطای دوم: مطالعه فشرده و بدون فاصله در یک نوبت.
خطای سوم: پرهیز از تلاش برای یادآوری بدون نگاه کردن به کتاب.

یادگیری واقعی نیازمند «دشواری مطلوب» است؛ یعنی مغز باید برای استخراج اطلاعات از لایه‌های حافظه زحمت بکشد.`,
    topicSlug: 'learning',
    topicName: 'یادگیری و اندیشیدن',
    format: 'explainer',
    tags: ['یادگیری', 'حافظه', 'روش مطالعه'],
    readingTimeMinutes: 5,
    publishedDate: 'اکتبر ۲۰۲۶',
    authorName: 'عبدالمجید رسولی',
    relatedVideoSlug: 'three-study-mistakes',
    status: 'published',
    translationStatus: 'reviewed',
    evidenceNote: {
      status: 'established',
      text: 'مبتنی بر مرور جامع دانلوسکی و همکاران (۲۰۱۳).',
    },
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'review_meta_analysis',
        title: 'Improving Students’ Learning',
        authorOrg: 'Dunlosky et al.',
        year: '2013',
        urlDoi: 'https://doi.org/10.1177/1529100612453266',
      },
    ],
  },

  // 3. Why We Misremember (EN, PS)
  {
    id: 'art-memory-en',
    translationGroup: 'tg-why-we-misremember',
    language: 'en',
    title: 'Why We Misremember: Memory as an Active Reconstruction',
    slug: 'why-we-misremember',
    summary:
      'Human memory is not a digital recording preserved in cold storage. Each time an event is recalled, the brain reconstructs the narrative, weaving in current emotional cues and post-event information.',
    body: `We speak of memories as though they were artifacts locked inside a mental vault. We say: "I remember it like it was yesterday."

Yet cognitive psychologist Elizabeth Loftus demonstrated that memory is fundamentally reconstructive. When you recall an afternoon from childhood, your brain does not pull up an untouched video file. Instead, it reassembles fragments of sensory traces, emotional tones, and narrative expectations.

During this retrieval process, the memory trace becomes labile—pliable and vulnerable to modification—before reconsolidating. If someone introduces subtle post-event suggestions, those details become seamlessly woven into your sincere recollection.`,
    topicSlug: 'neuroscience',
    topicName: 'Neuroscience & Cognition',
    format: 'article',
    tags: ['Memory', 'Cognition', 'Reconstruction', 'Psychology'],
    readingTimeMinutes: 6,
    publishedDate: 'October 2026',
    authorName: 'Abdul Majeed Rasooli',
    relatedVideoSlug: 'why-we-misremember',
    status: 'published',
    translationStatus: 'none',
    evidenceNote: {
      status: 'established',
      text: 'Reconstructive memory and the misinformation effect have been demonstrated in hundreds of empirical trials since Loftus & Palmer (1974).',
    },
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'Reconstruction of Automobile Destruction: An Example of the Interaction Between Language and Memory',
        authorOrg: 'Loftus, E. F., & Palmer, J. C. (Journal of Verbal Learning and Verbal Behavior)',
        year: '1974',
        urlDoi: 'https://doi.org/10.1016/S0022-5371(74)80011-3',
        note: 'Classic misinformation experiment.',
      },
    ],
  },
  {
    id: 'art-memory-ps',
    translationGroup: 'tg-why-we-misremember',
    language: 'ps',
    title: 'ولې موږ پېښې ناسمې یادوو: حافظه د پخوانیو نښو بیا جوړول دي',
    slug: 'why-we-misremember',
    summary:
      'انساني حافظه د ویډیو ثبت نه دی چې تل روغ پاتې وي. هر کله چې پخوانۍ خاطره رایادوئ، مغز هغه له سره بیا لیکي او نوي احساسات پکې ګډوي.',
    body: `ډېر کله موږ وایو: "زه دا صحنه بالکل لکه پرون داسې په یاد لرم." خو ساینس ثابته کړې چې زموږ ډاډ او باور د حافظې د دقیق والي ضامن نه دی.

ارواپوه الیزابیت لوفټس وښودله چې کله انسان یوه خاطره له مغزه راوباسي، هغه خاطره نرمه او بدلېدونکې شي. په دې وخت کې که نوي معلومات یا پوښتنې مطرح شي، مغز یې په ناخبره توګه له اصلي پېښې سره نښلوي.`,
    topicSlug: 'neuroscience',
    topicName: 'عصبي ساینس او ادراک',
    format: 'article',
    tags: ['حافظه', 'عصبي ساینس', 'ادراک'],
    readingTimeMinutes: 6,
    publishedDate: 'اکتوبر ۲۰۲۶',
    authorName: 'عبدالمجید رسولي',
    relatedVideoSlug: 'why-we-misremember',
    status: 'published',
    translationStatus: 'reviewed',
    evidenceNote: {
      status: 'established',
      text: 'د الیزابیت لوفټس او ګڼو نورو څېړونکو په علمي ازموینو کې ثابته شوې موندنه.',
    },
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'Reconstruction of Automobile Destruction',
        authorOrg: 'Loftus & Palmer',
        year: '1974',
      },
    ],
  },

  // 4. Why We Follow the Crowd (EN, PS)
  {
    id: 'art-crowd-en',
    translationGroup: 'tg-why-we-follow-crowd',
    language: 'en',
    title: 'Why We Follow the Crowd: Informational Cues and Social Proof',
    slug: 'why-we-follow-the-crowd',
    summary:
      'Conformity is often caricatured as intellectual weakness. Yet evolutionarily, copying group behavior served as an indispensable cognitive heuristic for survival in uncertain conditions.',
    body: `When people see a long queue outside a restaurant, they infer quality. When pedestrians wait at an empty crosswalk, others hesitate before stepping forward.

Psychologist Solomon Asch’s landmark 1951 line experiments revealed that people will frequently contradict their own visual perception to conform to an unambiguous group consensus.

Crucially, modern research separates conformity into two drivers: normative social influence (the desire to be liked and avoid exclusion) and informational social influence (using others' behavior as genuine evidence of reality in ambiguous scenarios).`,
    topicSlug: 'behavioural-economics',
    topicName: 'Behavioural Economics & Decisions',
    format: 'article',
    tags: ['Conformity', 'Social Influence', 'Decisions', 'Behaviour'],
    readingTimeMinutes: 5,
    publishedDate: 'October 2026',
    authorName: 'Abdul Majeed Rasooli',
    relatedVideoSlug: 'why-we-follow-the-crowd',
    status: 'published',
    translationStatus: 'none',
    evidenceNote: {
      status: 'established',
      text: 'Pioneered by Asch (1951) and expanded by Cialdini (2001) in decision-making and social heuristics.',
    },
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'Effects of Group Pressure Upon the Modification and Distortion of Judgments',
        authorOrg: 'Asch, S. E. (Groups, Leadership and Men)',
        year: '1951',
        note: 'The foundational line experiment on social conformity.',
      },
    ],
  },
  {
    id: 'art-crowd-ps',
    translationGroup: 'tg-why-we-follow-crowd',
    language: 'ps',
    title: 'ولې موږ د نورو پر پله درومو: ټولنیز شواهد او ډله ییز چلند',
    slug: 'why-we-follow-the-crowd',
    summary:
      'د نورو پسې تګ ډېر کله د کمزورتیا په توګه تعبیرېږي، خو په اصل کې د انسان په ارتقایي ژوند کې د ډلې د چلند کاپي کول یو اغېزمن لنډلار و.',
    body: `کله چې خلک د یوه نابلده هوټل مخې ته ګڼه ګوڼه وویني، ناخوداګاه فکر کوي چې دلته ښه خواړه شته. دا یوازې ساده تقلید نه دی، بلکې ټولنیز شواهد دي.

ارواپوه سولومن اش په خپلو تاریخي تجربو کې ثابته کړه چې انسانان کله کله د خپلو سترګو پر لیدلي حقیقت هم شک کوي کله چې ګوري شاوخوا ټوله ډله بل ډول پرېکړه کوي.`,
    topicSlug: 'behavioural-economics',
    topicName: 'چلندي اقتصاد او پرېکړې',
    format: 'article',
    tags: ['ټولنیز چلند', 'پرېکړې', 'اقتصاد'],
    readingTimeMinutes: 5,
    publishedDate: 'اکتوبر ۲۰۲۶',
    authorName: 'عبدالمجید رسولي',
    relatedVideoSlug: 'why-we-follow-the-crowd',
    status: 'published',
    translationStatus: 'reviewed',
    evidenceNote: {
      status: 'established',
      text: 'د سولومن اش په классиکو او معاصرو ادراکي څېړنو کې ثابته شوې.',
    },
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'Effects of Group Pressure',
        authorOrg: 'Asch, S. E.',
        year: '1951',
      },
    ],
  },

  // 5. Why a Price Changes What We Feel (EN, PS)
  {
    id: 'art-price-en',
    translationGroup: 'tg-price-framing',
    language: 'en',
    title: 'Why a Price Changes What We Feel: Placebo Pricing and Sensory Expectations',
    slug: 'why-a-price-changes-what-we-feel',
    summary:
      'When identical wine or painkillers are labeled with premium price tags, participants report superior taste and greater pain relief. How top-down cognitive expectations alter raw sensory perception.',
    body: `Price is commonly understood as a simple economic clearing mechanism—the amount of currency required to exchange for a good.

Yet behavioral economics and sensory neuroscience uncover a far more profound truth: price changes the subjective experience itself. In famous blind wine tasting studies, subjects given identical sips of Cabernet Sauvignon reported significantly higher subjective enjoyment—and displayed greater activation in the medial orbitofrontal cortex—when told the bottle cost $90 versus $10.

This is not simple social pretension. Expectation physically modulates sensory processing through top-down neural pathways.`,
    topicSlug: 'behavioural-economics',
    topicName: 'Behavioural Economics & Decisions',
    format: 'mystery',
    tags: ['Pricing', 'Behavioural Economics', 'Framing', 'Placebo'],
    readingTimeMinutes: 5,
    publishedDate: 'October 2026',
    authorName: 'Abdul Majeed Rasooli',
    relatedVideoSlug: 'why-a-price-changes-what-we-feel',
    status: 'published',
    translationStatus: 'none',
    evidenceNote: {
      status: 'established',
      text: 'Demonstrated in fMRI studies by Plassmann et al. (2008) and behavioral pain trials by Waber et al. (2008).',
    },
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'Marketing Actions Can Modulate Neural Representations of Experienced Pleasantness',
        authorOrg: 'Plassmann, H., O’Doherty, J., Shiv, B., & Rangel, A. (PNAS)',
        year: '2008',
        urlDoi: 'https://doi.org/10.1073/pnas.0706929105',
        note: 'fMRI demonstration of pricing altering neural enjoyment.',
      },
    ],
  },
  {
    id: 'art-price-ps',
    translationGroup: 'tg-price-framing',
    language: 'ps',
    title: 'ولې قیمت زموږ احساس بدلوي: لوړ قېمت او حسي تمې',
    slug: 'why-a-price-changes-what-we-feel',
    summary:
      'کله چې پر یوه درمل یا څښاک د لوړ قېمت ټیګ ولګول شي، خلک یې خوند او اغېز څو چنده ښه احساسوي. ادراکي تمې څنګه زموږ اصلي حسونه بدلوي.',
    body: `موږ فکر کوو قېمت یوازې اقتصادي تله ده. خو عصبي څېړنې ښيي چې د قېمت لیبل زموږ د مغز هغه برخې راویښوي چې خوند او ارامتیا ارزوي.

په یوه تجربه کې ګډونوالو ته دوه بالکل یو شان جوس ورکړل شول، یوازې یوه ته وویل شول چې دا لوړ قېمته دی. د ګډونوالو په مغز کې د خوند برخه د قېمت په اورېدو زیاته فعاله شوه.`,
    topicSlug: 'behavioural-economics',
    topicName: 'چلندي اقتصاد او پرېکړې',
    format: 'mystery',
    tags: ['قېمت', 'اقتصاد', 'چلند'],
    readingTimeMinutes: 5,
    publishedDate: 'اکتوبر ۲۰۲۶',
    authorName: 'عبدالمجید رسولي',
    relatedVideoSlug: 'why-a-price-changes-what-we-feel',
    status: 'published',
    translationStatus: 'reviewed',
    evidenceNote: {
      status: 'established',
      text: 'د پلاسمن او همکارانو (۲۰۰۸) په علمي تجربه کې په اثبات رسېدلې.',
    },
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'Marketing Actions Can Modulate Neural Representations',
        authorOrg: 'Plassmann et al. (PNAS)',
        year: '2008',
      },
    ],
  },
];

export const SEED_VIDEOS: SeedVideo[] = [
  // 1. The Sound of Your Name
  {
    id: 'vid-name-en',
    translationGroup: 'tg-sound-of-your-name',
    language: 'en',
    spokenLanguage: 'ps', // Spoken voiceover is Pashto, page is English (PRD architecture!)
    title: 'Why Your Name Stands Out in a Crowded Room',
    slug: 'sound-of-your-name',
    description:
      'In a room full of noise, why does your name instantly pierce through? A short visual exploration of auditory filtering and the Cocktail Party Effect.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '0:45',
    durationSeconds: 45,
    transcript:
      '[Scene: Crowded South Asian marketplace with overlapping murmur]\nNarrator: You are standing in a crowded room with thirty different people talking at once. To your ears, it sounds like static noise. Until someone twenty feet away quietly says your name.\n\nYour head immediately turns. But how did your brain catch it if you were not listening to them?\n\nThis is the Cocktail Party Effect. In 1953, Colin Cherry discovered that our brain does not monitor everything equally. Instead, your auditory system suppresses 99% of sound, but sets special neural alarms for familiar signals—especially your own name.',
    topicSlug: 'psychology',
    topicName: 'Psychology & Human Behaviour',
    tags: ['Attention', 'Auditory Cortex', 'Neuroscience'],
    relatedArticleSlug: 'the-sound-of-your-name',
    status: 'published',
    translationStatus: 'none',
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'Some Experiments on the Recognition of Speech',
        authorOrg: 'Cherry, E. C.',
        year: '1953',
        urlDoi: 'https://doi.org/10.1121/1.1907229',
      },
    ],
  },
  {
    id: 'vid-name-ps',
    translationGroup: 'tg-sound-of-your-name',
    language: 'ps',
    spokenLanguage: 'ps',
    title: 'ولې په بیروبار کې ستاسو نوم سمدستي اورېدل کېږي؟',
    slug: 'sound-of-your-name',
    description:
      'په ګڼه ګوڼه کې ولې ستاسو غوږ ستاسو خپل نوم سمدستي جلا کوي؟ د انتخابي پاملرنې او کاکټیل پارټي اغېز لنډ بصري تشریح.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '0:45',
    durationSeconds: 45,
    transcript:
      'تاسو په یوه داسې ځای کې ولاړ یاست چې لسګونه کسان غږېږي. ټول غږونه درته یو شور ښکاري. ناڅاپه یو څوک په ارامه ستاسو نوم اخلي. ستاسو پام سمدستي اوړي.\n\nدا څنګه وشول کله چې تاسو هغوی ته غوږ هم نه و نیولی؟\n\nدا د کاکټیل پارټي اغېز دی. مغز ټول غږونه نه اوري، بلکې زیاتره بندوي خو ستاسو د نوم غوندې مهمو نښو ته ویښ پاتې کېږي.',
    topicSlug: 'psychology',
    topicName: 'ارواپوهنه او انساني چلند',
    tags: ['پاملرنه', 'عصبي ساینس'],
    relatedArticleSlug: 'the-sound-of-your-name',
    status: 'published',
    translationStatus: 'reviewed',
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'Some Experiments on the Recognition of Speech',
        authorOrg: 'Cherry, E. C.',
        year: '1953',
      },
    ],
  },
  {
    id: 'vid-name-fa',
    translationGroup: 'tg-sound-of-your-name',
    language: 'fa',
    spokenLanguage: 'ps',
    title: 'چرا در میان همهمه نام خود را فوراً تشخیص می‌دهیم؟',
    slug: 'sound-of-your-name',
    description:
      'در محیطی پر از صدا، چگونه مغز نام شما را از میان مکالمات بیرون می‌کشد؟ تشریح ویدیویی اثر مهمانی و توجه انتخابی.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '0:45',
    durationSeconds: 45,
    transcript:
      'تصور کنید در بازاری پرجمعیت هستید و ده‌ها نفر همزمان صحبت می‌کنند. برای گوش شما همه‌چیز مانند یک نویز مداوم است تا اینکه فردی آرام نام شما را صدا می‌زند.\n\nسر شما بی‌درنگ برمی‌گردد. سیستم شنوایی ما بخش عمده صداها را مهار می‌کند، اما برای نشانه‌های بسیار آشنا مانند نام‌مان، زنگ خطری دائمی در مغز روشن نگاه می‌دارد.',
    topicSlug: 'psychology',
    topicName: 'روان‌شناسی و رفتار انسانی',
    tags: ['توجه', 'علوم اعصاب'],
    relatedArticleSlug: 'the-sound-of-your-name',
    status: 'published',
    translationStatus: 'reviewed',
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'Some Experiments on the Recognition of Speech',
        authorOrg: 'Cherry, E. C.',
        year: '1953',
      },
    ],
  },

  // 2. Three Study Mistakes
  {
    id: 'vid-study-en',
    translationGroup: 'tg-three-study-mistakes',
    language: 'en',
    spokenLanguage: 'ps',
    title: 'Three Study Habits That Secretly Waste Time',
    slug: 'three-study-mistakes',
    summary: 'Why rereading notes feels productive but tricks your memory.',
    description:
      'Passive rereading and highlighting trick your brain into feeling mastery. What cognitive science proves about retrieval practice.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '0:52',
    durationSeconds: 52,
    transcript:
      'You open your notebook and highlight line after line in yellow marker. It feels deeply satisfying. But cognitive research shows highlighting is one of the weakest ways to retain information.\n\nWhy? Because familiarity is not recall. When you close the book and force your brain to pull out the answer, that is when the memory trace truly hardens.',
    topicSlug: 'learning',
    topicName: 'Learning & Thinking',
    tags: ['Study', 'Learning', 'Memory'],
    relatedArticleSlug: 'three-study-mistakes',
    status: 'published',
    translationStatus: 'none',
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'review_meta_analysis',
        title: 'Improving Students’ Learning',
        authorOrg: 'Dunlosky et al.',
        year: '2013',
      },
    ],
  },
  {
    id: 'vid-study-ps',
    translationGroup: 'tg-three-study-mistakes',
    language: 'ps',
    spokenLanguage: 'ps',
    title: 'د مطالعې درې عادتونه چې وخت ضایع کوي',
    slug: 'three-study-mistakes',
    summary: 'ولې د کتاب نښه کول او بیا بیا لوستل ښه نتیجه نه ورکوي.',
    description:
      'د کتاب نښه کول او بیا بیا لوستل انسان ته داسې ښکاري چې ډېر څه یې زده کړل، خو ادراکي ساینس برعکس ښيي.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '0:52',
    durationSeconds: 52,
    transcript:
      'تاسو کتاب خلاصوئ او تر هره کرښه لاندې رنګین مارکر راکاږئ. دا ښه حس درکوي، خو څېړنې ښيي چې دا کمزورې تګلاره ده.\n\nاصلي زده کړه هغه وخت کېږي چې کتاب وتړئ او له خپله ذهنه د ځواب راایستلو هڅه وکړئ.',
    topicSlug: 'learning',
    topicName: 'زده کړه او فکر کول',
    tags: ['زده کړه', 'حافظه'],
    relatedArticleSlug: 'three-study-mistakes',
    status: 'published',
    translationStatus: 'reviewed',
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'review_meta_analysis',
        title: 'Improving Students’ Learning',
        authorOrg: 'Dunlosky et al.',
        year: '2013',
      },
    ],
  },

  // 3. Why We Misremember
  {
    id: 'vid-memory-en',
    translationGroup: 'tg-why-we-misremember',
    language: 'en',
    spokenLanguage: 'ps',
    title: 'Why Confidence Does Not Mean Your Memory Is Right',
    slug: 'why-we-misremember',
    summary: 'Memory is not a video recording—it is rewritten each time you recall it.',
    description:
      'Human memory is not a secure vault. Every time you recall an event, the brain rewrites the file, subtly altering details.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '0:48',
    durationSeconds: 48,
    transcript:
      'When you are 100% sure an event happened exactly as you remember, science has a surprising message: you might still be wrong. Memory is not a camera file; it is an active reconstruction.',
    topicSlug: 'neuroscience',
    topicName: 'Neuroscience & Cognition',
    tags: ['Memory', 'Neuroscience'],
    relatedArticleSlug: 'why-we-misremember',
    status: 'published',
    translationStatus: 'none',
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'Reconstruction of Automobile Destruction',
        authorOrg: 'Loftus & Palmer',
        year: '1974',
      },
    ],
  },
  {
    id: 'vid-memory-ps',
    translationGroup: 'tg-why-we-misremember',
    language: 'ps',
    spokenLanguage: 'ps',
    title: 'ولې ستاسو باور دا مانا نه لري چې حافظه مو سمه ده؟',
    slug: 'why-we-misremember',
    summary: 'حافظه د کامرې ثبت نه دی، بلکې هر ځل بیا جوړېږي.',
    description:
      'انساني حافظه یوه پټه توره بکس نه ده. هر ځل چې یوه کیسه یادوئ، مغز یې له سره نوي کوي.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '0:48',
    durationSeconds: 48,
    transcript:
      'کله چې تاسو پوره باوري یاست چې یوه پېښه کټ مټ همغسې شوې چې تاسو یې یادوئ، ساینس وایي چې کېدای شي اشتباه کوئ. حافظه بیا رغونه ده، نه ثبت.',
    topicSlug: 'neuroscience',
    topicName: 'عصبي ساینس او ادراک',
    tags: ['حافظه', 'عصبي ساینس'],
    relatedArticleSlug: 'why-we-misremember',
    status: 'published',
    translationStatus: 'reviewed',
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'Reconstruction of Automobile Destruction',
        authorOrg: 'Loftus & Palmer',
        year: '1974',
      },
    ],
  },

  // 4. Why We Follow the Crowd
  {
    id: 'vid-crowd-en',
    translationGroup: 'tg-why-we-follow-crowd',
    language: 'en',
    spokenLanguage: 'ps',
    title: 'Why We Copy What Other People Are Doing',
    slug: 'why-we-follow-the-crowd',
    summary: 'Conformity is not just peer pressure—it is an ancient survival shortcut.',
    description:
      'Solomon Asch proved that people often deny their own eyes to agree with a group. But why did evolution build this instinct into our brains?',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '0:50',
    durationSeconds: 50,
    transcript:
      'In a classic experiment, people were shown two cards with lines. The answer was obvious. But when four confederates picked the wrong line on purpose, 75% of participants agreed with them at least once.',
    topicSlug: 'behavioural-economics',
    topicName: 'Behavioural Economics & Decisions',
    tags: ['Decisions', 'Social Psychology'],
    relatedArticleSlug: 'why-we-follow-the-crowd',
    status: 'published',
    translationStatus: 'none',
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'Effects of Group Pressure',
        authorOrg: 'Asch, S. E.',
        year: '1951',
      },
    ],
  },

  // 5. Why a Price Changes What We Feel
  {
    id: 'vid-price-en',
    translationGroup: 'tg-price-framing',
    language: 'en',
    spokenLanguage: 'ps',
    title: 'How a Price Tag Changes What Your Senses Feel',
    slug: 'why-a-price-changes-what-we-feel',
    summary: 'When identical goods carry higher prices, your brain registers more pleasure.',
    description:
      'Neuroscientists gave people identical drinks with different price tags. Brain scans showed that high prices literally heightened sensory pleasure.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '0:46',
    durationSeconds: 46,
    transcript:
      'If you drink the exact same juice, but someone tells you one costs ten times more, brain scans show your pleasure centers fire much harder. Price is not just math; it is an active sensory filter.',
    topicSlug: 'behavioural-economics',
    topicName: 'Behavioural Economics & Decisions',
    tags: ['Pricing', 'Framing', 'Behaviour'],
    relatedArticleSlug: 'why-a-price-changes-what-we-feel',
    status: 'published',
    translationStatus: 'none',
    sources: [
      {
        sourceType: 'paper',
        evidenceLevel: 'primary_research',
        title: 'Marketing Actions Can Modulate Neural Representations',
        authorOrg: 'Plassmann et al.',
        year: '2008',
      },
    ],
  },
];

export const SEED_COLLECTIONS: SeedCollection[] = [
  {
    slug: 'everyday-mysteries',
    title: {
      en: 'Everyday Mysteries',
      ps: 'ورځني رازونه',
      fa: 'رازهای روزمره',
    },
    description: {
      en: 'The psychological quirks, strange perceptual blinks, and unnoticed biases hiding in ordinary daily moments.',
      ps: 'هغه ارواپوهنیز او فکري رازونه چې زموږ په عادي ورځني ژوند کې پټ دي.',
      fa: 'شگفتی‌های روان‌شناختی و خطاهای شناختی نهفته در لحظات ساده روزمره.',
    },
    isSequential: false,
    itemSlugs: [
      { type: 'video', slug: 'sound-of-your-name' },
      { type: 'article', slug: 'the-sound-of-your-name' },
      { type: 'video', slug: 'why-we-misremember' },
      { type: 'article', slug: 'why-we-misremember' },
      { type: 'video', slug: 'why-a-price-changes-what-we-feel' },
    ],
  },
  {
    slug: 'start-here',
    title: {
      en: 'Start Here: Core Cognitive Foundations',
      ps: 'له دې ځایه پیل کړئ: د ادراک اساسي ماډلونه',
      fa: 'از اینجا آغاز کنید: مبانی بنیادین شناخت',
    },
    description: {
      en: 'A sequential curriculum introducing how attention, memory, and social incentives shape human decision-making.',
      ps: 'یو پرله پسې لارښود چې تشریح کوي مغز، حافظه او ټولنیز چاپېریال څنګه زموږ پرېکړې جوړوي.',
      fa: 'راهنمای گام‌به‌گام درباره چگونگی شکل‌گیری تصمیم‌ها از رهگذر توجه و حافظه.',
    },
    isSequential: true,
    itemSlugs: [
      { type: 'article', slug: 'the-sound-of-your-name' },
      { type: 'video', slug: 'three-study-mistakes' },
      { type: 'article', slug: 'three-study-mistakes' },
      { type: 'article', slug: 'why-we-follow-the-crowd' },
    ],
  },
];

// Helper queries for data retrieval
export function getArticlesByLocale(locale: 'ps' | 'fa' | 'en'): SeedArticle[] {
  return SEED_ARTICLES.filter((a) => a.language === locale && a.status === 'published');
}

export function getArticleBySlug(slug: string, locale: 'ps' | 'fa' | 'en'): SeedArticle | undefined {
  // First look for exact slug and locale
  const exact = SEED_ARTICLES.find((a) => a.slug === slug && a.language === locale);
  if (exact) return exact;
  // Fallback to English version of same slug if available
  return SEED_ARTICLES.find((a) => a.slug === slug && a.language === 'en');
}

export function getVideosByLocale(locale: 'ps' | 'fa' | 'en'): SeedVideo[] {
  const matching = SEED_VIDEOS.filter((v) => v.language === locale && v.status === 'published');
  if (matching.length > 0) return matching;
  // If locale has fewer videos, return all available videos mapped for visibility
  return SEED_VIDEOS.filter((v) => v.language === 'en');
}

export function getVideoBySlug(slug: string, locale: 'ps' | 'fa' | 'en'): SeedVideo | undefined {
  const exact = SEED_VIDEOS.find((v) => v.slug === slug && v.language === locale);
  if (exact) return exact;
  return SEED_VIDEOS.find((v) => v.slug === slug);
}
