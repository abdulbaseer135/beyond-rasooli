import { pageMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { CollectionCard } from "@/components/cards/CollectionCard";
import { getCollections } from "@/lib/data/cms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "collections" });

  return pageMetadata(locale, "collections", {
    title: t("title"),
    description: t("intro"),
    alternates: { canonical: `/${locale}/collections` },
  });
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "collections" });

  return (
    <div className="site-container page-start space-y-10 text-start">
      <header className="page-heading">
        <h1 className="type-h1">{t("title")}</h1>
        <p className="text-base text-[var(--ink-muted)] max-w-2xl leading-relaxed">
          {t("intro")}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {(await getCollections(locale)).map((col) => (
          <CollectionCard
            key={col.slug}
            slug={col.slug}
            title={col.title[locale]}
            description={col.description[locale]}
            itemCount={col.itemSlugs.length}
            coverImageUrl={col.coverImageUrl}
            isSequential={col.isSequential}
          />
        ))}
      </div>
    </div>
  );
}
