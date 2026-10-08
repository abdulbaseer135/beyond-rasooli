import type { PublicArticle, PublicVideo } from '../data/content-types';
const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
export function getArticleSchema(a: PublicArticle, locale: string) {
 return { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.summary,
  url: `${baseUrl}/${locale}/read/${a.slug}`, inLanguage: locale === 'fa' ? 'fa-AF' : locale,
  image: a.coverImageUrl, author: { '@type': 'Person', name: a.authorName },
  datePublished: a.publishedAt, dateModified: a.updatedAt,
  citation: a.sources.map(s => ({ '@type': 'CreativeWork', name: s.title, author: s.authorOrg, datePublished: s.year, url: s.urlDoi })) };
}
export function getVideoObjectSchema(v: PublicVideo, locale: string) {
 return { '@context': 'https://schema.org', '@type': 'VideoObject', name: v.title, description: v.description,
  thumbnailUrl: v.posterUrl ? [v.posterUrl] : undefined, uploadDate: v.publishedAt,
  duration: v.durationSeconds ? `PT${v.durationSeconds}S` : undefined,
  inLanguage: v.spokenLanguage, url: `${baseUrl}/${locale}/watch/${v.slug}` };
}
