import { serializeJSONLD } from "@/lib/seo/json-ld";
import { contentMetadata } from "@/lib/seo/metadata";
import Image from "next/image";
import type { Locale } from "@/i18n/routing";
import { RichText } from "@/components/article/RichText";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { VideoPlayerFacade } from "@/components/video/VideoPlayerFacade";
import { VideoCard } from "@/components/cards/VideoCard";
import { ArticleCard } from "@/components/cards/ArticleCard";
import {
  EvidenceNote,
  SourcesList,
  AuthorBox,
} from "@/components/article/EditorialBlocks";
import { ArticleAnalytics } from "@/components/article/ArticleAnalytics";
import { getArticleSchema } from "@/lib/seo/structured-data";
import {
  getArticleBySlug,
  getVideoBySlug,
  getArticlesByLocale,
  getVideosByLocale,
} from "@/lib/data/cms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug, locale);
  if (!article) return {};

  return contentMetadata("articles", article, locale);
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "read" });
  const ui = await getTranslations({ locale, namespace: "ui" });
  const article = await getArticleBySlug(slug, locale);

  if (!article) {
    notFound();
  }

  if (article.slug !== slug)
    permanentRedirect(`/${locale}/read/${article.slug}`);
  // Linked source/companion video embed
  const relatedVideo = article.relatedVideoSlug
    ? await getVideoBySlug(article.relatedVideoSlug, locale)
    : undefined;

  // 3 Related Articles
  const allArticles = await getArticlesByLocale(locale);
  const relatedArticles = allArticles
    .filter((a) => a.slug !== article.slug)
    .sort(
      (a, b) =>
        Number(b.topicSlug === article.topicSlug) -
        Number(a.topicSlug === article.topicSlug),
    )
    .slice(0, 2);
  const relatedVideos = (await getVideosByLocale(locale))
    .filter((v) => v.slug !== relatedVideo?.slug)
    .sort(
      (a, b) =>
        Number(b.topicSlug === article.topicSlug) -
        Number(a.topicSlug === article.topicSlug),
    )
    .slice(0, 3 - relatedArticles.length);

  return (
    <article className="site-container py-10 space-y-12 text-start" lang={article.language === "fa" ? "fa-AF" : article.language} dir={article.language === "en" ? "ltr" : "rtl"}>
      {/* JSON-LD Article Structured Data (PRD Section 14) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJSONLD(getArticleSchema(article, locale)),
        }}
      />

      {/* Engagement & Scroll Milestone Analytics (PRD Section 10.6) */}
      <ArticleAnalytics
        slug={article.slug}
        topic={article.topicSlug}
        locale={locale}
      />

      {/* 1. Article Header (Behavioral Scientist Pattern) */}
      <ArticleHeader
        title={article.title}
        standfirst={article.summary}
        topicName={article.topicName}
        topicSlug={article.topicSlug}
        authorName={article.authorName}
        publishedDate={article.publishedDate}
        readingTimeMinutes={article.readingTimeMinutes}
        formatName={t(`format_${article.format || "article"}`)}
        updatedDate={
          article.showUpdatedDate
            ? new Intl.DateTimeFormat(
                locale === "fa" ? "fa-AF-u-nu-latn" : `${locale}-u-nu-latn`,
                { dateStyle: "medium", timeZone: "UTC" },
              ).format(new Date(article.updatedAt))
            : undefined
        }
      />

      {article.translationUnavailable && <p className="article-measure mx-auto type-meta">{ui("translation_unavailable")}</p>}
      {article.translationStatus === "machine_draft" && (
        <p className="article-measure mx-auto type-meta">
          {ui("translation_notice")}
        </p>
      )}
      {article.correctionNote && (
        <aside className="article-measure mx-auto evidence-note">
          <h2 className="type-h3">{ui("correction")}</h2>
          <p className="type-body">{article.correctionNote}</p>
        </aside>
      )}
      {/* 2. Source Video Embed (if companion video exists) */}
      {relatedVideo && (
        <section
          aria-label={t("source_video_title")}
          className="article-measure mx-auto space-y-3"
        >
          <div className="p-3 rounded bg-[var(--surface)] border border-[var(--divider)] flex items-center justify-between type-meta text-[var(--sage-700)] font-semibold">
            <span>{t("source_video_title")}</span>
            <span>{relatedVideo.duration}</span>
          </div>
          <VideoPlayerFacade
            posterUrl={relatedVideo.posterUrl}
            youtubeUrl={relatedVideo.youtubeUrl}
            title={relatedVideo.title}
            isVertical={relatedVideo.isVertical}
          />
        </section>
      )}

      {/* 3. Main Reading Body (680px column measure) */}
      {article.coverImageUrl && (
        <figure className="article-cover mx-auto">
          <Image
            src={article.coverImageUrl}
            alt={article.coverAlt}
            width={1200}
            height={800}
            sizes="(max-width:1024px) calc(100vw - 40px), 960px"
            className="w-full h-auto"
          />
          <figcaption className="type-meta">{article.coverCaption}</figcaption>
        </figure>
      )}
      <div lang={article.sourceLanguage === "fa" ? "fa-AF" : article.sourceLanguage || locale} dir={(article.sourceLanguage || locale) === "en" ? "ltr" : "rtl"}><RichText locale={article.sourceLanguage || locale} data={article.body} /></div>

      {/* 4. Evidence Note */}
      {article.evidenceNote?.status && article.evidenceNote?.text && (
        <EvidenceNote
          status={article.evidenceNote.status}
          text={article.evidenceNote.text}
        />
      )}

      {/* 5. Sources & Further Reading (Shared Source Component) */}
      {article.sources && article.sources.length > 0 && (
        <SourcesList sources={article.sources} />
      )}

      {/* 6. Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="article-measure mx-auto flex flex-wrap gap-2 pt-4">
          {article.tags.map((tg) => (
            <span
              key={tg}
              className="type-meta px-3 py-1 rounded-full bg-[var(--surface)] text-[var(--sage-700)] border border-[var(--divider)] font-medium"
            >
              #{tg}
            </span>
          ))}
        </div>
      )}

      {/* 7. Author Box */}
      <AuthorBox
        name={article.authorName}
        bio={article.authorBio}
        socials={article.authorSocials}
      />

      {/* 8. Keep Exploring: 3 Related Cards */}
      {(relatedArticles.length > 0 || relatedVideos.length > 0) && (
        <section
          aria-labelledby="related-articles-heading"
          className="pt-12 border-t border-[var(--divider)] space-y-6"
        >
          <h2 id="related-articles-heading" className="type-h2">
            {t("keep_exploring")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((ra) => (
              <ArticleCard
                key={ra.id}
                slug={ra.slug}
                title={ra.title}
                summary={ra.summary}
                topicName={ra.topicName}
                readingTimeMinutes={ra.readingTimeMinutes}
                publishedDate={ra.publishedDate}
                coverImageUrl={ra.coverImageUrl}
                coverAlt={ra.coverAlt}
              />
            ))}
            {relatedVideos.map((video) => (
              <VideoCard key={video.id} {...video} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
