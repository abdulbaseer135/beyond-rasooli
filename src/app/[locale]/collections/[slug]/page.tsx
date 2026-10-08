import { pageMetadata, taxonomyAlternates } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, type Locale } from "@/i18n/routing";
import { getLibrary, getCollections } from "@/lib/data/cms";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const c = (await getCollections(locale)).find((c) => c.slug === slug);
  return c
    ? pageMetadata(
        locale,
        `collections/${slug}`,
        {
          title: c.title[locale],
          description: c.description[locale],
          alternates: { canonical: `/${locale}/collections/${slug}` },
        },
        await taxonomyAlternates("collections", c.id),
      )
    : {};
}
export default async function CollectionPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const library = await getLibrary(locale);
  const c = library.collections.find((c) => c.slug === slug);
  if (!c) notFound();
  const t = await getTranslations({ locale, namespace: "ui" });
  const List = c.isSequential ? "ol" : "ul";
  return (
    <div className="site-container page-start content-narrow space-y-10">
      <header className="page-heading">
        <h1 className="type-h1">{c.title[locale]}</h1>
        <p className="type-ui">{c.description[locale]}</p>
        <p className="type-meta">
          {t("stories", { count: c.itemSlugs.length })}
          {c.isSequential && ` · ${t("sequential")}`}
        </p>
      </header>
      {c.coverImageUrl && (
        <Image
          src={c.coverImageUrl}
          alt=""
          width={1200}
          height={800}
          sizes="(max-width:768px) 100vw, 760px"
          className="w-full h-auto"
        />
      )}
      <List
        className={`collection-items ${c.isSequential ? "list-decimal" : ""}`}
      >
        {c.itemSlugs.map((ref, i) => {
          const doc =
            ref.type === "article"
              ? library.articles.find((a) => a.slug === ref.slug)
              : library.videos.find((v) => v.slug === ref.slug);
          return (
            doc && (
              <li key={`${ref.type}-${doc.id}-${i}`}>
                <Link
                  href={`/${ref.type === "article" ? "read" : "watch"}/${ref.slug}`}
                  className="editorial-card-link"
                >
                  <p className="type-meta">{t(ref.type)}</p>
                  <h2 className="type-h3">{doc.title}</h2>
                  <p className="type-ui">
                    {"summary" in doc ? doc.summary : doc.description}
                  </p>
                </Link>
              </li>
            )
          );
        })}
      </List>
    </div>
  );
}
