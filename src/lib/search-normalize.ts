export function normalizeArabicScript(text: string): string {
 return text.normalize('NFKC').replace(/[\u064a\u0649]/g, '\u06cc').replace(/\u0643/g, '\u06a9')
  .replace(/[\u064B-\u065F\u0670\u0640]/g, '').toLocaleLowerCase().trim();
}
export function matchesQuery(query: string, text: string) {
 const terms = normalizeArabicScript(query).split(/\s+/).filter(Boolean);
 const haystack = normalizeArabicScript(text);
 return terms.every(term => haystack.includes(term));
}
