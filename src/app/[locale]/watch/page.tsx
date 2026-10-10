import { pageMetadata } from "@/lib/seo/metadata";
import { CollectionCard } from "@/components/cards/CollectionCard";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getLibrary } from "@/lib/data/cms";
import { VideoCard } from "@/components/cards/VideoCard";
import { Link } from "@/i18n/routing";
import { DiscoveryFilters } from "@/components/search/DiscoveryFilters";
import watchIntro from "@/messages/public-watch.json";
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
    <div className="site-container page-start watch-page">
      <header className="watch-intro">
        <h1>{t.has("library_intro") ? t("library_intro") : watchIntro[locale]}</h1>
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
        <div className="video-grid">
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
              headingLevel={2}
              showMetadata={false}
              showDuration={false}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="type-body">{ui("no_results")}</p>
          <Link href="/read" className="text-link">{t("explore_read")}</Link>
        </div>
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
