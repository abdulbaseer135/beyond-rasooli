/**
 * Beyond Rasooli URL Slug Utilities
 * Generates URL-safe slugs supporting Latin and Arabic scripts (Pashto & Dari).
 */
export function slugify(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\s/?#%\\&+=.,:;!@$^&*()~`'"[\]{}|<>_\u060C\u061B\u061F\u06D4\u00AB\u00BB]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
