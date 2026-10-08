import { pageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getLibrary } from "@/lib/data/cms";
import { SourcesList } from "@/components/article/EditorialBlocks";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ui" });
  return pageMetadata(locale, "sources", {
    title: t("sources"),
    alternates: { canonical: `/${locale}/sources` },
  });
}
export default async function SourcesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ui" });
  const { articles, videos } = await getLibrary(locale);
  const sources = [
    ...new Map(
      [...articles, ...videos]
        .flatMap((d) => d.sources)
        .map((s) => [s.urlDoi || `${s.title}|${s.authorOrg}|${s.year}`, s]),
    ).values(),
  ];
  return (
    <div className="site-container page-start content-narrow space-y-10">
      <header className="page-heading">
        <h1 className="type-h1">{t("sources")}</h1>
      </header>
      {sources.length ? (
        <SourcesList sources={sources} />
      ) : (
        <p className="type-ui">{t("no_content")}</p>
      )}
    </div>
  );
}
