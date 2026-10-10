import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { getSettings, getPage, getTopics, getCollections } from "@/lib/data/cms";
import { getTranslations as documentTranslations } from "@/lib/data/cms";

export async function contentMetadata(
  collection: "articles" | "videos",
  doc: {
    sourceLanguage?: Locale;
    title: string;
    slug: string;
    translationGroup: string;
    language: Locale;
    translationStatus?: string | null;
    seoTitle?: string | null;
    metaDescription?: string | null;
    ogImage?: unknown;
    summary?: string | null;
    description?: string;
  },
  locale: Locale,
): Promise<Metadata> {
  const translations = await documentTranslations(
    collection,
    doc.translationGroup,
  );
  const languages = Object.fromEntries(
    Object.entries(translations).map(([key, url]) => [
      key === "fa" ? "fa-AF" : key,
      url,
    ]),
  );
  const path = `/${locale}/${collection === "articles" ? "read" : "watch"}/${doc.slug}`;
  const title = doc.seoTitle || doc.title;
  const description = doc.metaDescription || doc.summary || doc.description;
  const settings = await getSettings(locale);
  const selectedImage = doc.ogImage || settings.defaultOGImage;
  const customImage = selectedImage && typeof selectedImage === "object" ? (selectedImage as {url?:string}).url : undefined;
  const image = customImage || `/api/og?title=${encodeURIComponent(title)}&locale=${locale}`;
  return {
    title,
    description,
    alternates: { canonical: doc.sourceLanguage ? `/${doc.sourceLanguage}/${collection === "articles" ? "read" : "watch"}/${doc.slug}` : path, languages },
    robots: { index: !doc.sourceLanguage && doc.translationStatus !== "machine_draft", follow: true },
    openGraph: {
      title,
      description,
      url: path,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function pageMetadata(
  locale: Locale,
  section: string,
  metadata: Metadata,
  languages?: Record<string, string>,
): Metadata {
  const path = `/${locale}${section ? "/" + section : ""}`;
  const title = typeof metadata.title === "string" ? metadata.title : "";
  const image = `/api/og?title=${encodeURIComponent(title)}&locale=${locale}`;
  const alternates =
    languages ??
    Object.fromEntries(
      ["en", "ps", "fa"].map((language) => [
        language === "fa" ? "fa-AF" : language,
        `/${language}${section ? "/" + section : ""}`,
      ]),
    );
  return {
    ...metadata,
    alternates: { canonical: path, languages: alternates },
    openGraph: {
      title,
      description: metadata.description || undefined,
      url: path,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metadata.description || undefined,
      images: [image],
    },
  };
}

export async function taxonomyAlternates(
  kind: "topics" | "collections",
  id: string,
) {
  const languages: Record<string, string> = {};
  for (const locale of ["en", "ps", "fa"] as const) {
    const list = kind === "topics" ? await getTopics(locale) : await getCollections(locale);
    const doc = list.find((item) => item.id === id);
    if (doc)
      languages[locale === "fa" ? "fa-AF" : locale] =
        `/${locale}/${kind}/${doc.slug}`;
  }
  return languages;
}

export async function legalAlternates(slug: string) {
  const languages: Record<string, string> = {};
  for (const locale of ["en", "ps", "fa"] as const)
    if (await getPage(slug, locale))
      languages[locale === "fa" ? "fa-AF" : locale] = `/${locale}/${slug}`;
  return languages;
}
