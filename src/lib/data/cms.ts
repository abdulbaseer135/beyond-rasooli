import { extractYouTubeId, isVerticalVideo } from "@/lib/youtube";
import "server-only";
import { eligible } from "./publication";
export { eligible } from "./publication";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getMergedMessages } from "@/lib/ui-strings";
import { getPayload, type CollectionSlug, type Where } from "payload";
import config from "@payload-config";
import type { Locale } from "@/i18n/routing";
import type {
  Article,
  Video,
  Topic,
  Collection,
  Page,
  Media,
} from "@/payload-types";
import type {
  PublicArticle,
  PublicVideo,
  PublicTopic,
  PublicCollection,
} from "./content-types";
import { recordPayloadCall } from "@/lib/perf-profiler";

export const getCMS = cache(() => getPayload({ config }));

function object<T>(value: unknown): T | undefined {
  return value && typeof value === "object" ? (value as T) : undefined;
}

export function media(value: unknown) {
  return object<Media>(value);
}

const names = (text: string, locale: Locale): Record<Locale, string> => ({
  en: "",
  ps: "",
  fa: "",
  [locale]: text,
});

const relationID = (v: unknown): string =>
  typeof v === "object" && v ? String((v as { id: unknown }).id) : String(v);

// ============================================================================
// 1. SITE SETTINGS (Cached globally with tags)
// ============================================================================

const getRawSettings = unstable_cache(
  async (locale: Locale) => {
    const payload = await getCMS();
    const t0 = performance.now();
    const settings = await payload.findGlobal({
      slug: "site-settings",
      locale,
      fallbackLocale: false,
      overrideAccess: false,
      depth: 1,
    });
    recordPayloadCall("findGlobal", "site-settings", performance.now() - t0);
    return settings;
  },
  ["cms-site-settings"],
  {
    tags: ["cms:site-settings"],
    revalidate: 3600,
  },
);

export const getSettings = cache(async (locale: Locale) => {
  const settings = await getRawSettings(locale);
  const messages = await getMergedMessages(locale);
  return {
    ...settings,
    tagline: settings.tagline?.trim()
      ? settings.tagline
      : messages.footer?.tagline || "",
  };
});

export const getNavigationData = cache(async (locale: Locale) => {
  const settings = await getSettings(locale);
  return {
    brand: settings.siteName,
  };
});

// ============================================================================
// 2. RAW COLLECTION QUERY HELPERS
// ============================================================================

async function fetchAll<T>(
  collection: CollectionSlug,
  locale: Locale,
  where?: Where,
  depth = 1,
): Promise<T[]> {
  const payload = await getCMS();
  const docs: T[] = [];
  let page = 1;
  for (;;) {
    const t0 = performance.now();
    const result = await payload.find({
      collection,
      locale,
      fallbackLocale: false,
      overrideAccess: false,
      depth,
      limit: 100,
      page,
      where,
    });
    recordPayloadCall("find", collection, performance.now() - t0, `page ${page}`);
    docs.push(...(result.docs as unknown as T[]));
    if (!result.hasNextPage) return docs;
    page++;
  }
}

// ============================================================================
// 3. FULL PUBLICATION LIBRARY (Cached with unstable_cache and per-request memo)
// ============================================================================

const getCachedLibrary = unstable_cache(
  async (locale: Locale) => {
    const settings = await getRawSettings(locale);
    const [articleDocs, videoDocs, topicDocs, collectionDocs] =
      await Promise.all([
        fetchAll<Article>(
          "articles",
          locale,
          {
            language: { equals: locale },
            status: { equals: "published" },
          },
          1,
        ),
        fetchAll<Video>(
          "videos",
          locale,
          {
            language: { equals: locale },
            status: { equals: "published" },
          },
          1,
        ),
        fetchAll<Topic>("topics", locale, undefined, 1),
        fetchAll<Collection>("collections", locale, undefined, 1),
      ]);

    const aDocs = articleDocs.filter((d) =>
      eligible(d, Boolean(settings.requireReviewBeforePublic)),
    );
    const vDocs = videoDocs.filter((d) =>
      eligible(d, Boolean(settings.requireReviewBeforePublic)),
    );

    const byNewest = (
      a: { publishedAt?: string | null },
      b: { publishedAt?: string | null },
    ) =>
      Date.parse(b.publishedAt || "1970-01-01") -
      Date.parse(a.publishedAt || "1970-01-01");

    aDocs.sort(byNewest);
    vDocs.sort(byNewest);

    // BATCH AUTHOR QUERY: Replace N+1 findByID calls with a single batch query
    const authors = new Map<
      string,
      { name: string; bio: string; socials: Record<string, string> }
    >();
    const authorIds = [
      ...new Set(
        aDocs.filter((d) => d.author).map((d) => relationID(d.author)),
      ),
    ];

    if (authorIds.length > 0) {
      const payload = await getCMS();
      const t0 = performance.now();
      const users = await payload.find({
        collection: "users",
        overrideAccess: true,
        depth: 0,
        limit: 100,
        where: {
          id: { in: authorIds },
        },
        select: { name: true, bio: true, socialLinks: true } as never,
      });
      recordPayloadCall(
        "find",
        "users",
        performance.now() - t0,
        `batch authors (${authorIds.length})`,
      );
      for (const u of users.docs) {
        const publicUser = u as unknown as {
          id: string | number;
          name: string;
          bio?: string;
          socialLinks?: Record<string, string>;
        };
        authors.set(String(publicUser.id), {
          name: publicUser.name,
          bio: publicUser.bio || "",
          socials: publicUser.socialLinks || {},
        });
      }
    }

    const articles: PublicArticle[] = aDocs.map((d) => {
      const topic = object<Topic>(d.topic);
      const cover = media(d.coverImage);
      const profile = object<{
        name: string;
        bio?: string;
        socialLinks?: Record<string, string>;
      }>(d.authorProfile);
      const author = profile
        ? {
            name: profile.name,
            bio: profile.bio || "",
            socials: profile.socialLinks || {},
          }
        : authors.get(relationID(d.author));
      const related = vDocs.find(
        (v) =>
          String(v.id) === relationID(d.relatedVideo) ||
          v.translationGroup ===
            object<Video>(d.relatedVideo)?.translationGroup,
      );
      return {
        ...d,
        id: String(d.id),
        slug: d.slug || "",
        summary: d.summary || "",
        description: d.summary || "",
        topicSlug: topic?.slug || "",
        topicName: topic?.name || "",
        tags: (d.tags || []).map((t) => t.tag),
        sources: d.sources || [],
        readingTimeMinutes: d.readingTimeMinutes || 1,
        publishedDate: d.publishedAt
          ? new Intl.DateTimeFormat(
              locale === "fa"
                ? `fa-AF-u-nu-${settings.numberingSystem || "latn"}`
                : `${locale}-u-nu-${settings.numberingSystem || "latn"}`,
              {
                dateStyle: settings.dateStyle || "medium",
                timeZone: settings.publishingTimezone || "Asia/Kabul",
              },
            ).format(new Date(d.publishedAt))
          : "",
        authorName: author?.name || settings.siteName,
        authorBio: author?.bio || "",
        authorSocials: author?.socials || {},
        coverImageUrl: cover?.url || undefined,
        coverAlt: d.coverAlt || cover?.alt || "",
        relatedVideoSlug: related?.slug || undefined,
        featuredOrder: d.featuredOrder || 0,
      };
    });

    const videos: PublicVideo[] = vDocs.map((d) => {
      const topic = object<Topic>(d.topic);
      const poster = media(d.thumbnail);
      return {
        ...d,
        id: String(d.id),
        slug: d.slug || "",
        description: d.description || "",
        topicSlug: topic?.slug || "",
        topicName: topic?.name || "",
        tags: (d.tags || []).map((t) => t.tag),
        sources: d.sources || [],
        posterUrl:
          poster?.url ||
          d.remotePosterUrl ||
          (extractYouTubeId(d.youtubeUrl)
            ? `https://i.ytimg.com/vi/${extractYouTubeId(d.youtubeUrl)}/hqdefault.jpg`
            : undefined),
        posterAlt: poster?.alt || "",
        duration: d.duration || "",
        durationSeconds: d.durationSeconds || 0,
        relatedArticleSlug:
          aDocs.find(
            (a) =>
              String(a.id) === relationID(d.relatedArticle) ||
              a.translationGroup ===
                object<Article>(d.relatedArticle)?.translationGroup,
          )?.slug || undefined,
        featuredOrder: d.featuredOrder || 0,
        isVertical: isVerticalVideo(d.youtubeUrl),
      };
    });

    const topics: PublicTopic[] = topicDocs
      .filter(
        (d) =>
          d.name &&
          (articles.some((a) => a.topicSlug === d.slug) ||
            videos.some((v) => v.topicSlug === d.slug)),
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((d) => ({
        id: String(d.id),
        slug: d.slug || "",
        name: names(d.name, locale),
        description: names(d.description || "", locale),
        order: d.order || 0,
        coverImageUrl: media(d.coverImage)?.url || undefined,
      }));

    const collections: PublicCollection[] = collectionDocs
      .filter(
        (d) =>
          eligible(
            d as unknown as { status?: string; publishedAt?: string },
          ) && d.title,
      )
      .map((d) => ({
        id: String(d.id),
        slug: d.slug || "",
        title: names(d.title, locale),
        description: names(d.description || "", locale),
        isSequential: Boolean(d.isSequential),
        coverImageUrl: media(d.coverImage)?.url || undefined,
        itemSlugs: (d.items || [])
          .flatMap((item) => {
            const doc =
              item.itemType === "article"
                ? articles.find(
                    (a) =>
                      a.id === relationID(item.article) ||
                      a.translationGroup ===
                        object<Article>(item.article)?.translationGroup,
                  )
                : videos.find(
                    (v) =>
                      v.id === relationID(item.video) ||
                      v.translationGroup ===
                        object<Video>(item.video)?.translationGroup,
                  );
            return doc ? [{ type: item.itemType, slug: doc.slug }] : [];
          })
          .filter(
            (item, index, items) =>
              items.findIndex(
                (other) =>
                  other.type === item.type && other.slug === item.slug,
              ) === index,
          ),
      }))
      .filter((c) => c.itemSlugs.length >= 3);

    return { articles, videos, topics, collections, settings };
  },
  ["cms-library-data"],
  {
    tags: [
      "cms:articles",
      "cms:videos",
      "cms:topics",
      "cms:collections",
      "cms:site-settings",
    ],
    revalidate: 3600,
  },
);

export const getLibrary = cache(async (locale: Locale) => {
  const cached = await getCachedLibrary(locale);
  const messages = await getMergedMessages(locale);
  return {
    ...cached,
    settings: {
      ...cached.settings,
      tagline: cached.settings.tagline?.trim()
        ? cached.settings.tagline
        : messages.footer?.tagline || "",
    },
  };
});

export const getArticlesByLocale = cache(async (locale: Locale) => {
  return (await getLibrary(locale)).articles;
});

export const getVideosByLocale = cache(async (locale: Locale) => {
  return (await getLibrary(locale)).videos;
});

export const getTopics = cache(async (locale: Locale) => {
  return (await getLibrary(locale)).topics;
});

export const getCollections = cache(async (locale: Locale) => {
  return (await getLibrary(locale)).collections;
});

// ============================================================================
// 4. DETAIL PAGE QUERIES BY SLUG (Targeted, minimal depth)
// ============================================================================

async function findLegacySlug(
  kind: "articles" | "videos",
  slug: string,
  locale: Locale,
) {
  const payload = await getCMS();
  for (let hop = 0; hop < 10; hop++) {
    const t0 = performance.now();
    const result = await payload.find({
      collection: "slug-redirects",
      overrideAccess: false,
      depth: 0,
      limit: 1,
      where: { sourceKey: { equals: `${kind}:${locale}:${slug}` } },
    });
    recordPayloadCall("find", "slug-redirects", performance.now() - t0);
    if (!result.docs[0]) return slug;
    slug = result.docs[0].destinationSlug;
  }
  return slug;
}

export const getArticleBySlug = cache(
  async (slug: string, locale: Locale): Promise<PublicArticle | undefined> => {
    // 1. Try finding in cached library for instant 0ms hit
    const library = await getLibrary(locale);
    const inLib = library.articles.find((d) => d.slug === slug);
    if (inLib) return inLib;

    // 2. Direct slug query in case of fresh content
    const payload = await getCMS();
    const t0 = performance.now();
    const result = await payload.find({
      collection: "articles",
      locale,
      overrideAccess: false,
      depth: 1,
      limit: 1,
      where: {
        slug: { equals: slug },
        language: { equals: locale },
        status: { equals: "published" },
      },
    });
    recordPayloadCall("find", "articles", performance.now() - t0, `slug ${slug}`);

    if (!result.docs[0]) {
      const redirectedSlug = await findLegacySlug("articles", slug, locale);
      if (redirectedSlug !== slug) {
        return getArticleBySlug(redirectedSlug, locale);
      }
      return undefined;
    }

    const d = result.docs[0];
    const settings = await getSettings(locale);
    if (!eligible(d, Boolean(settings.requireReviewBeforePublic))) {
      return undefined;
    }

    const topic = object<Topic>(d.topic);
    const cover = media(d.coverImage);
    const profile = object<{
      name: string;
      bio?: string;
      socialLinks?: Record<string, string>;
    }>(d.authorProfile);

    let authorName = settings.siteName;
    let authorBio = "";
    let authorSocials: Record<string, string> = {};

    if (profile) {
      authorName = profile.name;
      authorBio = profile.bio || "";
      authorSocials = profile.socialLinks || {};
    } else if (d.author) {
      const authorId = relationID(d.author);
      const user = await payload.findByID({
        collection: "users",
        id: authorId,
        overrideAccess: true,
        depth: 0,
        select: { name: true, bio: true, socialLinks: true } as never,
      });
      const publicUser = user as unknown as {
        name: string;
        bio?: string;
        socialLinks?: Record<string, string>;
      };
      if (publicUser) {
        authorName = publicUser.name;
        authorBio = publicUser.bio || "";
        authorSocials = publicUser.socialLinks || {};
      }
    }

    return {
      ...d,
      id: String(d.id),
      slug: d.slug || "",
      summary: d.summary || "",
      description: d.summary || "",
      topicSlug: topic?.slug || "",
      topicName: topic?.name || "",
      tags: (d.tags || []).map((t) => t.tag),
      sources: d.sources || [],
      readingTimeMinutes: d.readingTimeMinutes || 1,
      publishedDate: d.publishedAt
        ? new Intl.DateTimeFormat(
            locale === "fa"
              ? `fa-AF-u-nu-${settings.numberingSystem || "latn"}`
              : `${locale}-u-nu-${settings.numberingSystem || "latn"}`,
            {
              dateStyle: settings.dateStyle || "medium",
              timeZone: settings.publishingTimezone || "Asia/Kabul",
            },
          ).format(new Date(d.publishedAt))
        : "",
      authorName,
      authorBio,
      authorSocials,
      coverImageUrl: cover?.url || undefined,
      coverAlt: d.coverAlt || cover?.alt || "",
      relatedVideoSlug: object<Video>(d.relatedVideo)?.slug || undefined,
      featuredOrder: d.featuredOrder || 0,
    };
  },
);

export const getVideoBySlug = cache(
  async (slug: string, locale: Locale): Promise<PublicVideo | undefined> => {
    // 1. Try finding in cached library for instant hit
    const library = await getLibrary(locale);
    const inLib = library.videos.find((d) => d.slug === slug);
    if (inLib) return inLib;

    // 2. Direct slug query
    const payload = await getCMS();
    const t0 = performance.now();
    const result = await payload.find({
      collection: "videos",
      locale,
      overrideAccess: false,
      depth: 1,
      limit: 1,
      where: {
        slug: { equals: slug },
        language: { equals: locale },
        status: { equals: "published" },
      },
    });
    recordPayloadCall("find", "videos", performance.now() - t0, `slug ${slug}`);

    if (!result.docs[0]) {
      const redirectedSlug = await findLegacySlug("videos", slug, locale);
      if (redirectedSlug !== slug) {
        return getVideoBySlug(redirectedSlug, locale);
      }
      return undefined;
    }

    const d = result.docs[0];
    const settings = await getSettings(locale);
    if (!eligible(d, Boolean(settings.requireReviewBeforePublic))) {
      return undefined;
    }

    const topic = object<Topic>(d.topic);
    const poster = media(d.thumbnail);
    return {
      ...d,
      id: String(d.id),
      slug: d.slug || "",
      description: d.description || "",
      topicSlug: topic?.slug || "",
      topicName: topic?.name || "",
      tags: (d.tags || []).map((t) => t.tag),
      sources: d.sources || [],
      posterUrl:
        poster?.url ||
        d.remotePosterUrl ||
        (extractYouTubeId(d.youtubeUrl)
          ? `https://i.ytimg.com/vi/${extractYouTubeId(d.youtubeUrl)}/hqdefault.jpg`
          : undefined),
      posterAlt: poster?.alt || "",
      duration: d.duration || "",
      durationSeconds: d.durationSeconds || 0,
      relatedArticleSlug: object<Article>(d.relatedArticle)?.slug || undefined,
      featuredOrder: d.featuredOrder || 0,
      isVertical: isVerticalVideo(d.youtubeUrl),
    };
  },
);

// ============================================================================
// 5. CACHED STATIC PAGES (About, Privacy, Terms)
// ============================================================================

const getCachedPage = unstable_cache(
  async (slug: string, locale: Locale) => {
    const payload = await getCMS();
    const t0 = performance.now();
    const result = await payload.find({
      collection: "pages",
      locale,
      overrideAccess: false,
      depth: 1,
      limit: 1,
      where: {
        slug: { equals: slug },
        status: { equals: "published" },
      },
    });
    recordPayloadCall("find", "pages", performance.now() - t0, `slug ${slug}`);
    const d = result.docs[0] as Page | undefined;
    if (d && d.title && d.body && (slug === "about" || d.approvalStatus === "approved")) {
      return d;
    }
    return null;
  },
  ["cms-page-detail"],
  {
    tags: ["cms:pages"],
    revalidate: 3600,
  },
);

export const getPage = cache(async (slug: string, locale: Locale) => {
  const page = await getCachedPage(slug, locale);
  return page || undefined;
});

// ============================================================================
// 6. OPTIMIZED TRANSLATION GROUP LOOKUP (Single depth:0 query instead of 3 library scans)
// ============================================================================

const getCachedTranslations = unstable_cache(
  async (
    collection: "articles" | "videos",
    group: string,
    includeMachine: boolean,
  ) => {
    const payload = await getCMS();
    const t0 = performance.now();
    const result = await payload.find({
      collection,
      overrideAccess: false,
      depth: 0,
      limit: 10,
      where: {
        translationGroup: { equals: group },
        status: { equals: "published" },
      },
      select: {
        slug: true,
        language: true,
        translationStatus: true,
      } as never,
    });
    recordPayloadCall(
      "find",
      collection,
      performance.now() - t0,
      `group ${group}`,
    );

    const translations: Partial<Record<Locale, string>> = {};
    for (const doc of result.docs) {
      const d = doc as unknown as {
        slug: string;
        language: Locale;
        translationStatus?: string;
      };
      if (includeMachine || d.translationStatus !== "machine_draft") {
        translations[d.language] =
          `/${d.language}/${collection === "articles" ? "read" : "watch"}/${d.slug}`;
      }
    }
    return translations;
  },
  ["cms-translations-group"],
  {
    tags: ["cms:articles", "cms:videos"],
    revalidate: 3600,
  },
);

export const getTranslations = cache(
  async (
    collection: "articles" | "videos",
    group: string,
    includeMachine = false,
  ) => {
    return getCachedTranslations(collection, group, includeMachine);
  },
);

// ============================================================================
// 7. FOOTER DATA (Cached, lightweight navigation state)
// ============================================================================

export interface FooterData {
  settings: Awaited<ReturnType<typeof getSettings>>;
  hasArticles: boolean;
  hasVideos: boolean;
  hasTopics: boolean;
  hasCollections: boolean;
  hasSources: boolean;
  privacy: boolean;
  terms: boolean;
}

export const getFooterData = cache(async (locale: Locale): Promise<FooterData> => {
  const [settings, library, privacyPage, termsPage] = await Promise.all([
    getSettings(locale),
    getLibrary(locale),
    getPage("privacy", locale),
    getPage("terms", locale),
  ]);

  return {
    settings,
    hasArticles: library.articles.length > 0,
    hasVideos: library.videos.length > 0,
    hasTopics: library.topics.length > 0,
    hasCollections: library.collections.length > 0,
    hasSources: [...library.articles, ...library.videos].some(
      (d) => d.sources && d.sources.length > 0,
    ),
    privacy: Boolean(privacyPage),
    terms: Boolean(termsPage),
  };
});
