import { pageMetadata, legalAlternates } from "@/lib/seo/metadata";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/data/cms";
import { RichText } from "@/components/article/RichText";
import type { Locale } from "@/i18n/routing";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const page = await getPage("terms", locale);
  return pageMetadata(
    locale,
    "terms",
    {
      title: page?.title,
      alternates: { canonical: `/${locale}/terms` },
      robots: { index: Boolean(page), follow: Boolean(page) },
    },
    await legalAlternates("terms"),
  );
}
export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const page = await getPage("terms", locale);
  if (!page) notFound();
  const ui = await getTranslations({ locale, namespace: "ui" });
  const date = page.lastUpdated
    ? new Intl.DateTimeFormat(
        locale === "fa" ? "fa-AF-u-nu-latn" : `${locale}-u-nu-latn`,
        { dateStyle: "medium", timeZone: "UTC" },
      ).format(new Date(page.lastUpdated))
    : "";
  return (
    <article className="site-container page-start">
      <header className="page-heading article-measure">
        <h1 className="type-h1">{page.title}</h1>
        <p className="type-meta">
          <bdi>{date && ui("last_updated", { date })}</bdi>{" "}
          <bdi>{page.version}</bdi>
        </p>
      </header>
      <RichText locale={locale} data={page.body} />
    </article>
  );
}
