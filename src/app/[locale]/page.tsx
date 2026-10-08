import { pageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link, type Locale } from "@/i18n/routing";
import { Hero } from "@/components/layout/Hero";
import { HomeFeed } from "@/components/home/HomeFeed";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { CollectionCard } from "@/components/cards/CollectionCard";
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
            <ArticleCard {...articles[0]} isFeature />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.slice(1, 4).map((a) => (
                <ArticleCard key={a.id} {...a} />
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
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.slug}`}
                  className="topic-destination"
                >
                  <h3 className="type-h3">{topic.name[locale]}</h3>
                  <p className="type-ui">{topic.description[locale]}</p>
                </Link>
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
