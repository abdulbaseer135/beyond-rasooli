import { eligible } from "./publication";
type Language = "en" | "ps" | "fa";
type Document = { id: number | string; language: Language; translationGroup?: string | null; status?: string; publishedAt?: string | null; translationStatus?: string | null; translatedFromLocale?: string | null };

/** Public fallback never changes the source language or editorial approval state. */
export function resolveLanguages<T extends Document>(documents: T[], target: Language, requireReview: boolean): Array<T & { displayLanguage: Language; sourceLanguage?: Language; translationUnavailable?: boolean }> {
  const groups = new Map<string, T>();
  const priority = (document: T) => document.translationStatus === "machine_draft" ? 0 : document.language === target ? 3 : document.translatedFromLocale ? 1 : 2;
  for (const document of documents) {
    if (!eligible(document, requireReview)) continue;
    const key = document.translationGroup || String(document.id);
    const current = groups.get(key);
    if (!current || priority(document) > priority(current)) groups.set(key, document);
  }
  return [...groups.values()].map(document => document.language === target ? { ...document, displayLanguage: target } : { ...document, displayLanguage: target, sourceLanguage: document.language, translationUnavailable: true });
}
