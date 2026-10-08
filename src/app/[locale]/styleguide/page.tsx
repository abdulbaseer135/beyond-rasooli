import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { TopicChip, TopicChipBar } from "@/components/ui/TopicChip";
import { VideoCard } from "@/components/cards/VideoCard";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { GoDeeperCard } from "@/components/cards/GoDeeperCard";
import { CollectionCard } from "@/components/cards/CollectionCard";
import { VideoPlayerFacade } from "@/components/video/VideoPlayerFacade";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import {
  PartDivider,
  EvidenceNote,
  PullQuote,
  SourcesList,
  AuthorBox,
} from "@/components/article/EditorialBlocks";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Design System & Component Library Styleguide",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StyleguidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sampleSources = [
    {
      sourceType: "paper" as const,
      evidenceLevel: "primary_research" as const,
      title: "Selective Attention and the Cocktail Party Phenomenon",
      authorOrg: "Cherry, E. C. (Journal of the Acoustical Society of America)",
      year: "1953",
      urlDoi: "https://doi.org/10.1121/1.1907229",
      note: "The foundational empirical paper establishing that high-salience auditory cues (such as one’s own name) break through inattentional filters.",
    },
    {
      sourceType: "book" as const,
      evidenceLevel: "book" as const,
      title: "Attention and Effort",
      authorOrg: "Kahneman, D. (Prentice-Hall)",
      year: "1973",
      note: "Foundational framework for mental capacity allocation and cognitive resource limits.",
    },
  ];

  return (
    <div className="site-container py-12 space-y-20">
      {/* Intro Header */}
      <section className="space-y-4 border-b border-[var(--divider)] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-1 rounded bg-[var(--sage-100)] text-[var(--sage-700)]">
            PRD Section 6 & 8 Styleguide
          </span>
          <span className="text-xs text-[var(--ink-muted)]">
            Active Locale: <code className="font-mono font-bold">{locale}</code>
          </span>
        </div>
        <h1 className="font-editorial-serif text-4xl sm:text-5xl font-bold text-[var(--ink)]">
          Beyond Rasooli Design System & Component Library
        </h1>
        <p className="text-base sm:text-lg text-[var(--ink-muted)] max-w-3xl leading-relaxed">
          Comprehensive catalog of all tokens, typography scales, states,
          interactive components, and editorial modules across LTR and RTL.
        </p>
      </section>

      {/* 1. Colour Tokens & Contrast Showcase */}
      <section className="space-y-6">
        <h2 className="font-editorial-serif text-2xl font-bold border-b border-[var(--divider)] pb-3">
          1. Color Palette Tokens (Section 6.1)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { token: "--bg", hex: "#FAF7F0", label: "Page Background" },
            { token: "--surface", hex: "#F3EEE2", label: "Cards / Quotes" },
            { token: "--surface-2", hex: "#EAE4D5", label: "Hover States" },
            { token: "--ink", hex: "#1B1B18", label: "Text / Headlines" },
            {
              token: "--ink-muted",
              hex: "#5A5A52",
              label: "Metadata / Captions",
            },
            {
              token: "--divider",
              hex: "#E3DED2",
              label: "Dividers / Hairlines",
            },
            {
              token: "--sage-700",
              hex: "#34502F",
              label: "Hover / Focus Ring",
            },
            { token: "--sage-600", hex: "#4F6B4D", label: "Accent / Links" },
            { token: "--sage-400", hex: "#6B8068", label: "Decorative Only" },
            { token: "--sage-100", hex: "#DCE5D6", label: "Chips / Tags" },
            {
              token: "--inverse-bg",
              hex: "#1B1B18",
              label: "Footer Background",
            },
            { token: "--inverse-ink", hex: "#FAF7F0", label: "Footer Text" },
            { token: "--error", hex: "#9B2C2C", label: "Form Errors" },
            { token: "--success", hex: "#34502F", label: "Success Messages" },
          ].map((c) => (
            <div
              key={c.token}
              className="p-3 rounded border border-[var(--divider)] bg-[var(--surface)] space-y-2 text-xs"
            >
              <div
                className="w-full h-12 rounded border border-[var(--divider)] shadow-xs"
                style={{ backgroundColor: c.hex }}
              />
              <div className="font-mono font-bold text-[var(--ink)]">
                {c.token}
              </div>
              <div className="font-mono text-[var(--ink-muted)]">{c.hex}</div>
              <div className="text-[var(--ink-muted)] text-[11px]">
                {c.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Typography & Pashto Glyphs Verification */}
      <section className="space-y-6">
        <h2 className="font-editorial-serif text-2xl font-bold border-b border-[var(--divider)] pb-3">
          2. Typography & Arabic Script Glyph Coverage (Section 6.2)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded bg-[var(--surface)] border border-[var(--divider)] space-y-4">
            <h3 className="font-bold text-sm tracking-wider uppercase text-[var(--sage-700)]">
              Latin Typography (English)
            </h3>
            <p className="font-editorial-serif text-3xl font-bold">
              Newsreader Serif Headline
            </p>
            <p className="font-editorial-serif text-lg italic text-[var(--ink-muted)]">
              &ldquo;Standfirst and pull quote in Newsreader italic.&rdquo;
            </p>
            <p className="font-editorial-sans text-sm text-[var(--ink)] leading-relaxed">
              Inter UI body text: Clean, accessible, legibly proportioned for
              metadata, navigation, and input controls.
            </p>
          </div>

          <div
            className="p-6 rounded bg-[var(--surface)] border border-[var(--divider)] space-y-4"
            dir="rtl"
          >
            <h3 className="font-bold text-sm tracking-wider uppercase text-[var(--sage-700)]">
              Arabic Script (Pashto & Dari)
            </h3>
            <p className="font-editorial-serif text-3xl font-bold">
              د نوټو نسخ عربي سرلیک — له څرګندو شیانو ورتېر وګورئ
            </p>
            <p className="font-editorial-sans text-sm text-[var(--ink)] leading-relaxed">
              د پښتو ځانګړي توري (Pashto-specific glyph verification):
            </p>
            <div className="flex flex-wrap gap-2 text-xl font-bold text-[var(--sage-700)] bg-[var(--bg)] p-3 rounded border border-[var(--divider)]">
              {["ټ", "ډ", "ړ", "ږ", "ښ", "ڼ", "ګ", "ې", "ۍ", "ئ", "څ", "ځ"].map(
                (glyph) => (
                  <span
                    key={glyph}
                    className="px-2 py-1 bg-[var(--surface-2)] rounded"
                  >
                    {glyph}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Buttons (Every State) */}
      <section className="space-y-6">
        <h2 className="font-editorial-serif text-2xl font-bold border-b border-[var(--divider)] pb-3">
          3. Button States (Default, Hover, Focus, Disabled, Loading)
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" size="md">
            Primary Button
          </Button>
          <Button variant="secondary" size="md">
            Secondary Button
          </Button>
          <Button variant="subtle" size="md">
            Subtle Button
          </Button>
          <Button variant="danger" size="md">
            Danger Button
          </Button>
          <Button variant="primary" size="md" isLoading>
            Loading State
          </Button>
          <Button variant="primary" size="md" disabled>
            Disabled State
          </Button>
        </div>
      </section>

      {/* 4. Topic Chips */}
      <section className="space-y-6">
        <h2 className="font-editorial-serif text-2xl font-bold border-b border-[var(--divider)] pb-3">
          4. Topic Chips & Scrollable Chip Bar
        </h2>
        <TopicChipBar>
          <TopicChip label="All Topics" isSelected count={18} />
          <TopicChip label="Psychology & Human Behaviour" count={6} />
          <TopicChip label="Neuroscience & Cognition" count={4} />
          <TopicChip label="Behavioural Economics" count={3} />
          <TopicChip label="Learning & Thinking" count={3} />
          <TopicChip label="Everyday Science" count={2} />
        </TopicChipBar>
      </section>

      {/* 5. Video Card (9:16) & Player Facade */}
      <section className="space-y-6">
        <h2 className="font-editorial-serif text-2xl font-bold border-b border-[var(--divider)] pb-3">
          5. Vertical Video Card (9:16) & YouTube Privacy Facade
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          <VideoCard
            slug="sound-of-your-name"
            title="Why Your Name Stands Out in a Crowded Room"
            topicName="Psychology"
            duration="0:45"
            language="ps"
          />
          <VideoCard
            slug="three-study-mistakes"
            title="Three Study Habits That Secretly Waste Time"
            topicName="Learning"
            duration="0:52"
            language="ps"
          />
          <div className="sm:col-span-2">
            <h3 className="text-sm font-semibold uppercase text-[var(--ink-muted)] mb-3">
              Facade Player (Click-to-Load YouTube Nocookie)
            </h3>
            <VideoPlayerFacade
              youtubeUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              title="The Sound of Your Name"
            />
          </div>
        </div>
      </section>

      {/* 6. Video-to-Article Bridge (Go-Deeper Card) */}
      <section className="space-y-6">
        <h2 className="font-editorial-serif text-2xl font-bold border-b border-[var(--divider)] pb-3">
          6. The Core Bridge: Go-Deeper Card (Primary KPI)
        </h2>
        <GoDeeperCard
          articleSlug="the-sound-of-your-name"
          articleTitle="The Cocktail Party Effect: How the Brain Filters Sound and Why Your Name Pierces the Noise"
          readingTimeMinutes={6}
        />
      </section>

      {/* 7. Articles & Editorial Blocks */}
      <section className="space-y-6">
        <h2 className="font-editorial-serif text-2xl font-bold border-b border-[var(--divider)] pb-3">
          7. Article Cards & Behavioral Scientist-Style Long-Form Reading
        </h2>

        {/* Feature Article Card */}
        <ArticleCard
          slug="the-sound-of-your-name"
          title="The Sound of Your Name: Why Selective Attention Isn't Just Multitasking"
          summary="In a noisy room of clattering cups and overlapping conversations, your ears register a murmur—until someone whispers your name across the room. How does the auditory cortex prioritize this personal acoustic signature?"
          topicName="Psychology & Human Behaviour"
          readingTimeMinutes={7}
          publishedDate="October 2026"
          authorName="Abdul Majeed Rasooli"
          isFeature
        />

        {/* Standard Article Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          <ArticleCard
            slug="three-study-mistakes"
            title="Three Study Mistakes: Why Highlighting Feels Like Mastery"
            summary="Passive rereading and fluorescent highlighters generate an illusion of competence. Cognitive science reveals why retrieval practice and spacing create genuine retention."
            topicName="Learning & Thinking"
            readingTimeMinutes={5}
            publishedDate="October 2026"
          />
          <ArticleCard
            slug="why-we-misremember"
            title="Why We Misremember: Memory as an Active Reconstruction"
            summary="Human recall is not a video recording. Each time a memory is retrieved, the brain rewrites the file, subtly altering details based on emotional state."
            topicName="Neuroscience & Cognition"
            readingTimeMinutes={6}
            publishedDate="October 2026"
          />
          <ArticleCard
            slug="why-we-follow-the-crowd"
            title="Why We Follow the Crowd: Informational Cues and Social Proof"
            summary="Conformity is often caricatured as weakness, but evolutionarily, copying group behavior provided an indispensable informational shortcut in uncertain environments."
            topicName="Behavioural Economics"
            readingTimeMinutes={5}
            publishedDate="October 2026"
          />
        </div>

        {/* Long-Form Editorial Elements */}
        <div className="p-8 rounded bg-[var(--bg)] border border-[var(--divider)] space-y-6 mt-8">
          <h3 className="font-editorial-serif text-xl font-bold text-[var(--ink)]">
            Article Components Showcase
          </h3>

          <ArticleHeader
            title="The Sound of Your Name: The Neuroscience of Auditory Filtering"
            standfirst="When human beings listen to a wall of chaotic noise, the brain does not process every stream equally. Instead, an intricate cocktail of subcortical gating and cortical weighting filters reality."
            topicName="Psychology"
            topicSlug="psychology"
            authorName="Abdul Majeed Rasooli"
            publishedDate="October 6, 2026"
            readingTimeMinutes={6}
          />

          <PartDivider partNumber={1} title="The Acoustic Filter in Action" />

          <PullQuote
            quote="Attention is not merely a spotlight that illuminates; it is a shield that aggressively blinds us to irrelevant stimuli."
            attribution="Daniel Kahneman, Attention and Effort"
          />

          <EvidenceNote
            status="established"
            text="The cocktail party effect was first isolated by Colin Cherry in 1953 using dichotic listening tasks, demonstrating robust pre-attentive recognition of personal names."
          />

          <SourcesList sources={sampleSources} />

          <AuthorBox
            name="Abdul Majeed Rasooli"
            bio="Creator and editorial lead of Beyond Rasooli. Exploring psychology, human behaviour, decision-making, and the hidden science of everyday life."
          />
        </div>
      </section>

      {/* 8. Collections */}
      <section className="space-y-6">
        <h2 className="font-editorial-serif text-2xl font-bold border-b border-[var(--divider)] pb-3">
          8. Curated Collections (3-Item Threshold Rule Enforced)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <CollectionCard
            slug="everyday-mysteries"
            title="Everyday Mysteries"
            description="The psychological quirks, strange perceptual blinks, and unnoticed biases hiding in ordinary daily moments."
            itemCount={5}
          />
          <CollectionCard
            slug="start-here"
            title="Start Here: Essential Cognitive Models"
            description="A sequential primer on how memory, attention, and cognitive shortcuts shape how we understand the world."
            itemCount={4}
            isSequential
          />
        </div>
      </section>

      {/* 9. Contact Form */}
      <section className="space-y-6">
        <h2 className="font-editorial-serif text-2xl font-bold border-b border-[var(--divider)] pb-3">
          9. Contact Form (Turnstile, Honeypot, Validation)
        </h2>
        <div className="p-8 rounded bg-[var(--surface)] border border-[var(--divider)]">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
