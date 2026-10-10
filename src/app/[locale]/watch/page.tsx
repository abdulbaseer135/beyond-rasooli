import { pageMetadata } from "@/lib/seo/metadata";
import { CollectionCard } from "@/components/cards/CollectionCard";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getLibrary } from "@/lib/data/cms";
import { VideoCard } from "@/components/cards/VideoCard";
import { DiscoveryFilters } from "@/components/search/DiscoveryFilters";
import {
  filterItems,
  pageLimit,
  moreHref,
  type FilterParams,
} from "@/lib/discovery";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "watch" });
  return pageMetadata(locale, "watch", {
    title: t("title"),
    description: t("intro"),
    alternates: { canonical: `/${locale}/watch` },
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
  const t = await getTranslations({ locale, namespace: "watch" });
  const ui = await getTranslations({ locale, namespace: "ui" });

  const filtered = filterItems(library.videos, query, "watch");
  const limit = pageLimit(query);
  const visible = filtered.slice(0, limit);
  return (
    <div className="site-container page-start space-y-10">
      <header className="page-heading">
        <h1 className="type-h1">{t("title")}</h1>
        <p className="type-ui">{t("intro")}</p>
      </header>
      {!!library.collections.length && (
        <section aria-label={ui("collections")}>
          <div className="grid md:grid-cols-2 gap-8">
            {library.collections.map((c) => (
              <CollectionCard
                key={c.id}
                slug={c.slug}
                title={c.title[locale]}
                description={c.description[locale]}
                itemCount={c.itemSlugs.length}
                isSequential={c.isSequential}
                coverImageUrl={c.coverImageUrl}
              />
            ))}
          </div>
        </section>
      )}
      <DiscoveryFilters
        key={JSON.stringify(query)}
        kind="watch"
        locale={locale}
        topics={library.topics}
        params={query}
      />
      <p className="type-meta" role="status">
        {ui("stories", { count: filtered.length })}
      </p>
      {visible.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {visible.map((v) => (
            <VideoCard
              key={v.id}
              slug={v.slug}
              title={v.title}
              topicName={v.topicName}
              duration={v.duration}
              language={v.language}
              spokenLanguage={v.spokenLanguage}
              posterUrl={v.posterUrl}
              posterAlt={v.posterAlt}
            />
          ))}
        </div>
      ) : (
        <p className="type-body">{ui("no_results")}</p>
      )}
      {filtered.length > limit && limit < 120 && (
        <a
          href={moreHref(`/${locale}/watch`, query, limit)}
          className="button button-secondary"
        >
          {ui("load_more")}
        </a>
      )}
    </div>
  );
}
