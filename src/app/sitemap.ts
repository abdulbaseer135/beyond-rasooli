import type { MetadataRoute } from 'next';
import { getLibrary, getPage, getTranslations } from '@/lib/data/cms';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'; const routes: MetadataRoute.Sitemap = [];
 for (const locale of ['ps','fa','en'] as const) {
  const library = await getLibrary(locale);
  const paths = ['', '/about', '/contact', ...(library.videos.length ? ['/watch'] : []), ...(library.articles.length ? ['/read','/sources'] : []), ...(library.topics.length ? ['/topics'] : []), ...(library.collections.length ? ['/collections'] : [])];
  for (const path of paths) routes.push({ url: `${base}/${locale}${path}` });
  for (const collection of ['articles','videos'] as const) for (const doc of library[collection]) {
   if (doc.translationStatus === 'machine_draft') continue;
   const translations = await getTranslations(collection, doc.translationGroup);
   routes.push({ url: `${base}/${locale}/${collection === 'articles' ? 'read' : 'watch'}/${doc.slug}`, lastModified: doc.updatedAt,
    alternates: { languages: Object.fromEntries(Object.entries(translations).map(([l,url]) => [l === 'fa' ? 'fa-AF' : l, base + url])) } });
  }
  for (const topic of library.topics) routes.push({ url: `${base}/${locale}/topics/${topic.slug}` });
  for (const collection of library.collections) routes.push({ url: `${base}/${locale}/collections/${collection.slug}` });
  for (const slug of ['privacy','terms']) if (await getPage(slug,locale)) routes.push({ url: `${base}/${locale}/${slug}` });
 }
 return routes;
}
