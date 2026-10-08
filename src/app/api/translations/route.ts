import { NextResponse } from "next/server";
import {
  getArticleBySlug,
  getVideoBySlug,
  getTranslations,
  getTopics,
  getCollections,
  getPage,
} from "@/lib/data/cms";
import { locales, type Locale } from "@/i18n/routing";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = url.searchParams.get("locale") as Locale;
  const path = url.searchParams.get("path") || "/";

  if (
    !locales.includes(locale) ||
    !path.startsWith("/") ||
    path.startsWith("//")
  ) {
    return NextResponse.json({ links: {} }, { status: 400 });
  }

  const parts = path.split("/").filter(Boolean);
  let links: Partial<Record<Locale, string>> = {};

  if (
    parts.length <= 1 &&
    [
      "",
      "watch",
      "read",
      "topics",
      "about",
      "contact",
      "search",
      "collections",
    ].includes(parts[0] || "")
  ) {
    return NextResponse.json(
      {
        links: Object.fromEntries(
          locales.map((target) => [
            target,
            `/${target}${path === "/" ? "" : path}`,
          ]),
        ),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
        },
      },
    );
  }

  if (parts.length === 2 && ["read", "watch"].includes(parts[0])) {
    const doc =
      parts[0] === "read"
        ? await getArticleBySlug(parts[1], locale)
        : await getVideoBySlug(parts[1], locale);
    if (doc) {
      links = await getTranslations(
        parts[0] === "read" ? "articles" : "videos",
        doc.translationGroup,
        true,
      );
    }
  } else {
    for (const target of locales) {
      let valid =
        parts.length <= 1 &&
        [
          "",
          "about",
          "contact",
          "search",
          "read",
          "watch",
          "topics",
          "collections",
          "privacy",
          "terms",
        ].includes(parts[0] || "");

      if (parts[0] === "topics" && parts[1]) {
        const topics = await getTopics(target);
        valid = topics.some((t) => t.slug === parts[1]);
      } else if (parts[0] === "collections" && parts[1]) {
        const collections = await getCollections(target);
        valid = collections.some((c) => c.slug === parts[1]);
      } else if (["privacy", "terms"].includes(parts[0])) {
        valid = Boolean(await getPage(parts[0], target));
      }

      if (valid) {
        links[target] = `/${target}${path === "/" ? "" : path}`;
      }
    }
  }

  return NextResponse.json(
    { links },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
