import { getLibrary } from './data/cms';
import type { Locale } from '@/i18n/routing';
import { matchesQuery } from './search-normalize';
export { normalizeArabicScript } from './search-normalize';
export async function searchLibrary(query: string, locale: Locale) {
 const { articles, videos } = await getLibrary(locale);
 const a = articles.filter(d => matchesQuery(query, `${d.title} ${d.summary} ${d.tags.join(' ')}`));
 const v = videos.filter(d => matchesQuery(query, `${d.title} ${d.description} ${d.tags.join(' ')}`));
 return { query, articles: a, videos: v, total: a.length + v.length };
}
