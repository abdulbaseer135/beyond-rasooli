import { pageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link, type Locale } from "@/i18n/routing";
import { Hero } from "@/components/layout/Hero";
import { HomeFeed } from "@/components/home/HomeFeed";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { CollectionCard } from "@/components/cards/CollectionCard";
import { TopicCard } from "@/components/cards/TopicCard";
import { getLibrary, getSettings } from "@/lib/data/cms";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getSettings(locale);
  return pageMetadata(locale, "", {
    title: settings.siteName,
    description: settings.tagline || undefined,
    alternates: { canonical: `/${locale}` },
  });
}
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const ui = await getTranslations({ locale, namespace: "ui" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const library = await getLibrary(locale);
  const { articles, videos, topics, collections, settings } = library;
  const pinned = videos
    .filter((v) => v.featuredOrder > 0)
    .sort((a, b) => a.featuredOrder - b.featuredOrder);
  const selection = settings.featuredVideo;
  const selectedID = typeof selection === "object" ? selection?.id : selection;
  const featured =
    videos.find((v) => v.id === String(selectedID)) || pinned[0] || videos[0];
  return (
    <div className="home-sections">
      <Hero
        featuredVideoSlug={featured?.slug}
        featuredVideoTitle={featured?.title}
        featuredPosterUrl={featured?.posterUrl}
        featuredPosterAlt={featured?.posterAlt}
      />
      <div className="site-container home-sections">
        {!!videos.length && (
          <section>
            <div className="section-heading">
              <h2 className="type-h2">{t("latest_videos_title")}</h2>
              <Link href="/watch" className="text-link">
                {t("see_all_videos")}
              </Link>
            </div>
            <HomeFeed initialVideos={videos} locale={locale} />
          </section>
        )}
        {!!articles.length && (
          <section>
            <div className="section-heading">
              <h2 className="type-h2">{t("latest_articles_title")}</h2>
              <Link href="/read" className="text-link">
                {t("see_all_articles")}
              </Link>
            </div>
            <div className="article-grid home-article-preview">
              {articles.slice(0, 3).map((a) => (
                <ArticleCard key={a.id} {...a} compact />
              ))}
            </div>
          </section>
        )}
        {!!collections.length && (
          <section>
            <div className="section-heading">
              <h2 className="type-h2">{t("collections_title")}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {collections.map((c) => (
                <CollectionCard
                  key={c.id}
                  slug={c.slug}
                  title={c.title[locale]}
                  description={c.description[locale]}
                  itemCount={c.itemSlugs.length}
                  coverImageUrl={c.coverImageUrl}
                  isSequential={c.isSequential}
                />
              ))}
            </div>
          </section>
        )}
        {!!topics.length && (
          <section>
            <div className="section-heading">
              <h2 className="type-h2">{t("topic_pillars_title")}</h2>
              <Link href="/topics" className="text-link">
                {ui("all")} {nav("topics")}
              </Link>
            </div>
            <div className="topic-grid home-topic-preview">
              {topics.slice(0, 6).map((topic) => (
                <TopicCard key={topic.id} topic={topic} locale={locale} compact />
              ))}
            </div>
          </section>
        )}
        <section className="about-snippet">
          <h2 className="type-h2">{t("about_snippet_title")}</h2>
          <p className="type-body">{t("about_snippet_text")}</p>
          <Link href="/about" className="text-link">
            {t("read_more_about")}
          </Link>
        </section>
      </div>
    </div>
  );
}
