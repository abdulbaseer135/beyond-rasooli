import { pageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type Locale } from "@/i18n/routing";
import { TopicCard } from "@/components/cards/TopicCard";
import { getTopics } from "@/lib/data/cms";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "topics" });
  return pageMetadata(locale, "topics", {
    title: t("title"),
    description: t("intro"),
    alternates: { canonical: `/${locale}/topics` },
  });
}
export default async function TopicsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "topics" });
  const topics = await getTopics(locale);
  return (
    <div className="site-container page-start space-y-10">
      <header className="page-heading">
        <h1 className="type-h1">{t("title")}</h1>
        <p className="type-ui">{t("intro")}</p>
      </header>
      {topics.length === 0 && (
        <p className="type-body" role="status">
          {t("empty")}
        </p>
      )}
      <div className="topic-grid home-topic-preview">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} locale={locale} headingLevel={2} compact />
        ))}
      </div>
    </div>
  );
}
