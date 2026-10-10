import { pageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { searchLibrary } from "@/lib/search";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { VideoCard } from "@/components/cards/VideoCard";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });
  return pageMetadata(locale, "search", {
    title: t("title"),
    alternates: { canonical: `/${locale}/search` },
    robots: { index: false, follow: true },
  });
}
export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { q = "" } = await searchParams;
  const t = await getTranslations({ locale, namespace: "search" });
  const ui = await getTranslations({ locale, namespace: "ui" });
  const results = q ? await searchLibrary(q.slice(0, 200), locale) : null;
  return (
    <div className="site-container page-start space-y-12">
      <header className="page-heading">
        <h1 className="type-h1">{t("title")}</h1>
      </header>
      <form method="get" className="discovery-filters">
        <label>
          {t("title")}
          <input
            type="search"
            name="q"
            defaultValue={q}
            maxLength={200}
            placeholder={t("placeholder")}
          />
        </label>
        <button className="button button-primary" type="submit">
          {t("search_button")}
        </button>
      </form>
      {results && (
        <>
          <p className="type-ui" role="status">
            {ui("search_results", { count: results.total })}
          </p>
          {!!results.videos.length && (
            <section>
              <h2 className="type-h2 mb-6">
                {t("videos_group", { count: results.videos.length })}
              </h2>
              <div className="video-grid">
                {results.videos.slice(0, 40).map((v) => (
                  <VideoCard key={v.id} {...v} />
                ))}
              </div>
            </section>
          )}
          {!!results.articles.length && (
            <section>
              <h2 className="type-h2 mb-6">
                {t("articles_group", { count: results.articles.length })}
              </h2>
              <div className="article-grid">
                {results.articles.slice(0, 40).map((a) => (
                  <ArticleCard key={a.id} {...a} />
                ))}
              </div>
            </section>
          )}
          {!results.total && <p>{t("no_results", { query: q })}</p>}
        </>
      )}
    </div>
  );
}
