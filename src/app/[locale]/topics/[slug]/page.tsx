import { pageMetadata, taxonomyAlternates } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getLibrary, getTopics } from "@/lib/data/cms";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { VideoCard } from "@/components/cards/VideoCard";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const topic = (await getTopics(locale)).find((t) => t.slug === slug);
  return topic
    ? pageMetadata(
        locale,
        `topics/${slug}`,
        {
          title: topic.name[locale],
          description: topic.description[locale],
          alternates: { canonical: `/${locale}/topics/${slug}` },
        },
        await taxonomyAlternates("topics", topic.id),
      )
    : {};
}
export default async function TopicPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const library = await getLibrary(locale);
  const topic = library.topics.find((t) => t.slug === slug);
  if (!topic) notFound();
  const t = await getTranslations({ locale, namespace: "topics" });
  const articles = library.articles
    .filter((a) => a.topicSlug === slug)
    .sort((a, b) => Number(b.featuredOrder > 0) - Number(a.featuredOrder > 0));
  const videos = library.videos.filter((v) => v.topicSlug === slug);
  return (
    <div className="site-container page-start space-y-12">
      <header className="page-heading">
        <h1 className="type-h1">{topic.name[locale]}</h1>
        <p className="type-ui">{topic.description[locale]}</p>
      </header>
      {articles[0] && <ArticleCard {...articles[0]} isFeature />}
      {!!videos.length && (
        <section>
          <h2 className="type-h2 mb-6">
            {t("videos_heading", { topic: topic.name[locale] })}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((v) => (
              <VideoCard key={v.id} {...v} />
            ))}
          </div>
        </section>
      )}
      {articles.length > 1 && (
        <section>
          <h2 className="type-h2 mb-6">
            {t("articles_heading", { topic: topic.name[locale] })}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(1).map((a) => (
              <ArticleCard key={a.id} {...a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
