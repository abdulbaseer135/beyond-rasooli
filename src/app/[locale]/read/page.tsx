import { pageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getLibrary } from "@/lib/data/cms";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { DiscoveryFilters } from "@/components/search/DiscoveryFilters";
import {
  filterItems,
  pageLimit,
  moreHref,
  type FilterParams,
  value,
} from "@/lib/discovery";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "read" });
  return pageMetadata(locale, "read", {
    title: t("title"),
    description: t("intro"),
    alternates: { canonical: `/${locale}/read` },
  });
}
export default async function LibraryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<FilterParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const library = await getLibrary(locale);
  const t = await getTranslations({ locale, namespace: "read" });
  const ui = await getTranslations({ locale, namespace: "ui" });
  const requested = value(query, "language", locale);
  const articles =
    requested === "all"
      ? (
          await Promise.all(
            (["en", "ps", "fa"] as const).map(
              async (l) => (await getLibrary(l)).articles,
            ),
          )
        ).flat().filter((article, index, all) => all.findIndex(other => other.id === article.id) === index)
      : ["en", "ps", "fa"].includes(requested)
        ? (await getLibrary(requested as Locale)).articles
        : [];
  const filtered = filterItems(articles, query, "read");
  const limit = pageLimit(query);
  const visible = filtered.slice(0, limit);
  return (
    <div className="site-container page-start space-y-10">
      <header className="page-heading">
        <h1 className="type-h1">{t("title")}</h1>
        <p className="type-ui">{t("intro")}</p>
      </header>
      <DiscoveryFilters
        key={JSON.stringify(query)}
        kind="read"
        locale={locale}
        topics={library.topics}
        params={{ language: locale, ...query }}
      />
      <p className="type-meta" role="status">
        {ui("stories", { count: filtered.length })}
      </p>
      {visible.length ? (
        <div className="space-y-10">
          {visible[0] && <ArticleCard {...visible[0]} isFeature />}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {visible.slice(1).map((a) => (
              <ArticleCard key={a.id} {...a} />
            ))}
          </div>
        </div>
      ) : (
        <p className="type-body">{ui("no_results")}</p>
      )}
      {filtered.length > limit && limit < 120 && (
        <a
          href={moreHref(`/${locale}/read`, query, limit)}
          className="button button-secondary"
        >
          {ui("load_more")}
        </a>
      )}
    </div>
  );
}
