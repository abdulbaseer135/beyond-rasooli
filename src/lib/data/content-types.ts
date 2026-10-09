import type { Article, Video, Media } from "@/payload-types";
import type { Locale } from "@/i18n/routing";
export interface PublicArticle extends Omit<Article, "id" | "tags" | "slug" | "summary"> {
  id: string;
  slug: string;
  summary: string;
  description?: string;
  translationGroup: string;
  topicSlug: string;
  topicName: string;
  tags: string[];
  readingTimeMinutes: number;
  publishedDate: string;
  authorName: string;
  authorBio: string;
  authorSocials: Record<string, string>;
  coverImageUrl?: string;
  coverAlt: string;
  relatedVideoSlug?: string;
  featuredOrder: number;
  sources: NonNullable<Article["sources"]>;
}
export interface PublicVideo extends Omit<Video, "id" | "tags" | "slug" | "description"> {
  id: string;
  slug: string;
  description: string;
  translationGroup: string;
  topicSlug: string;
  topicName: string;
  tags: string[];
  posterUrl?: string;
  posterAlt: string;
  duration: string;
  durationSeconds: number;
  relatedArticleSlug?: string;
  featuredOrder: number;
  sources: NonNullable<Video["sources"]>;
  videoFormat?: "auto" | "vertical" | "landscape";
  isVertical: boolean;
}
export interface PublicTopic {
  id: string;
  slug: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  order: number;
  coverImageUrl?: string;
}
export interface PublicCollection {
  id: string;
  slug: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  isSequential: boolean;
  coverImageUrl?: string;
  itemSlugs: { type: "article" | "video"; slug: string }[];
}
export type PublicMedia = Pick<
  Media,
  "url" | "alt" | "width" | "height" | "caption" | "credit"
>;
