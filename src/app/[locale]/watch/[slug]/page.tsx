import { serializeJSONLD } from "@/lib/seo/json-ld";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, type Locale } from "@/i18n/routing";
import { getVideoBySlug, getArticleBySlug, getLibrary } from "@/lib/data/cms";
import { contentMetadata } from "@/lib/seo/metadata";
import { getVideoObjectSchema } from "@/lib/seo/structured-data";
import { VideoPlayerFacade } from "@/components/video/VideoPlayerFacade";
import { GoDeeperCard } from "@/components/cards/GoDeeperCard";
import { SourcesList } from "@/components/article/EditorialBlocks";
import { ShareRow } from "@/components/article/ShareRow";
import { VideoCard } from "@/components/cards/VideoCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = await getVideoBySlug(slug, locale);
  return doc ? contentMetadata("videos", doc, locale) : {};
}

export default async function VideoDetail({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const v = await getVideoBySlug(slug, locale);
  if (!v) notFound();
  if (v.slug !== slug) permanentRedirect(`/${locale}/watch/${v.slug}`);

  const t = await getTranslations({ locale, namespace: "ui" });
  const watch = await getTranslations({ locale, namespace: "watch" });
  const article = v.relatedArticleSlug
    ? await getArticleBySlug(v.relatedArticleSlug, locale)
    : undefined;
  const library = await getLibrary(locale);
  const others = library.videos.filter((d) => d.id !== v.id);
  const related = [
    ...others.filter((d) => d.topicSlug === v.topicSlug),
    ...others.filter((d) => d.topicSlug !== v.topicSlug),
  ].slice(0, 3);

  const formattedDate =
    v.publishedAt && Number.isFinite(Date.parse(v.publishedAt))
      ? new Intl.DateTimeFormat(locale === "fa" ? "fa-AF" : locale, {
          dateStyle: "medium",
        }).format(new Date(v.publishedAt))
      : undefined;

  const isVertical = Boolean(v.isVertical);

  return (
    <div className="site-container page-start space-y-12 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJSONLD(getVideoObjectSchema(v, locale)),
        }}
      />

      <nav className="type-meta pt-2" aria-label={t("breadcrumb")}>
        <Link href="/watch" className="text-link">
          {watch("title")}
        </Link>
      </nav>

      {isVertical ? (
        /* ================= VERTICAL / SHORTS COMPOSITION ================= */
        <div className="video-detail-vertical-layout">
          <div className="video-vertical-editorial space-y-6">
            <div className="card-meta type-meta flex flex-wrap items-center gap-3">
              <Link href={`/topics/${v.topicSlug}`} className="text-link">
                {v.topicName}
              </Link>
              <span>•</span>
              <bdi className="font-mono">{v.duration}</bdi>
              {formattedDate && (
                <>
                  <span>•</span>
                  <span>{formattedDate}</span>
                </>
              )}
            </div>

            <h1 className="type-h1">{v.title}</h1>

            <div className="video-language-badge py-2 px-3 bg-[var(--surface)] border border-[var(--divider)] rounded inline-flex flex-wrap items-center gap-2 type-ui text-sm">
              <span className="font-medium text-[var(--ink)]">
                {watch("video_language_label", {
                  language: t(`language_${v.spokenLanguage}`),
                })}
              </span>
              {v.spokenLanguage !== v.language && (
                <span className="type-meta text-xs">
                  ({watch("translated_note", {
                    language: t(`language_${v.spokenLanguage}`),
                    currentLocale: t(`language_${locale}`),
                  })})
                </span>
              )}
            </div>

            {v.translationStatus === "machine_draft" && (
              <p className="type-meta italic">{t("translation_notice")}</p>
            )}

            {/* Mobile-only player position */}
            <div className="video-mobile-player-slot lg:hidden">
              <VideoPlayerFacade
                youtubeUrl={v.youtubeUrl}
                title={v.title}
                posterUrl={v.posterUrl}
                isVertical={true}
              />
            </div>

            {v.description && (
              <p className="type-body whitespace-pre-line text-[var(--ink-muted)]">
                {v.description}
              </p>
            )}

            {article && (
              <div className="pt-2">
                <GoDeeperCard
                  articleSlug={article.slug}
                  articleTitle={article.title}
                  readingTimeMinutes={article.readingTimeMinutes}
                  thumbnailUrl={article.coverImageUrl}
                />
              </div>
            )}

            <div className="pt-2">
              <ShareRow title={v.title} />
            </div>
          </div>

          {/* Desktop-only player position (side-by-side balanced) */}
          <div className="video-vertical-player-col hidden lg:block">
            <VideoPlayerFacade
              youtubeUrl={v.youtubeUrl}
              title={v.title}
              posterUrl={v.posterUrl}
              isVertical={true}
            />
          </div>
        </div>
      ) : (
        /* ================= LANDSCAPE (16:9) COMPOSITION ================= */
        <div className="video-detail-landscape-layout space-y-8 max-w-[960px] mx-auto">
          <header className="space-y-4 text-start">
            <div className="card-meta type-meta flex flex-wrap items-center gap-3">
              <Link href={`/topics/${v.topicSlug}`} className="text-link">
                {v.topicName}
              </Link>
              <span>•</span>
              <bdi className="font-mono">{v.duration}</bdi>
              {formattedDate && (
                <>
                  <span>•</span>
                  <span>{formattedDate}</span>
                </>
              )}
            </div>

            <h1 className="type-h1">{v.title}</h1>

            <div className="video-language-badge py-2 px-3 bg-[var(--surface)] border border-[var(--divider)] rounded inline-flex flex-wrap items-center gap-2 type-ui text-sm">
              <span className="font-medium text-[var(--ink)]">
                {watch("video_language_label", {
                  language: t(`language_${v.spokenLanguage}`),
                })}
              </span>
              {v.spokenLanguage !== v.language && (
                <span className="type-meta text-xs">
                  ({watch("translated_note", {
                    language: t(`language_${v.spokenLanguage}`),
                    currentLocale: t(`language_${locale}`),
                  })})
                </span>
              )}
            </div>

            {v.translationStatus === "machine_draft" && (
              <p className="type-meta italic">{t("translation_notice")}</p>
            )}
          </header>

          <div className="video-landscape-player-wrapper">
            <VideoPlayerFacade
              youtubeUrl={v.youtubeUrl}
              title={v.title}
              posterUrl={v.posterUrl}
              isVertical={false}
            />
          </div>

          <div className="video-landscape-content max-w-[760px] mx-auto space-y-8">
            {article && (
              <GoDeeperCard
                articleSlug={article.slug}
                articleTitle={article.title}
                readingTimeMinutes={article.readingTimeMinutes}
                thumbnailUrl={article.coverImageUrl}
              />
            )}

            {v.description && (
              <p className="type-body whitespace-pre-line text-[var(--ink-muted)]">
                {v.description}
              </p>
            )}

            <ShareRow title={v.title} />
          </div>
        </div>
      )}

      {/* Shared Deep Content: Transcript, Sources, Related */}
      <div className="max-w-[760px] mx-auto space-y-8 pt-4">
        {v.transcript && (
          <details className="transcript">
            <summary>{t("transcript")}</summary>
            <p className="type-body whitespace-pre-line">{v.transcript}</p>
          </details>
        )}
        <SourcesList sources={v.sources} />
      </div>

      {!!related.length && (
        <section className="pt-12 border-t border-[var(--divider)]">
          <h2 className="type-h2 mb-6">{t("keep_exploring")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {related.map((d) => (
              <VideoCard key={d.id} {...d} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
