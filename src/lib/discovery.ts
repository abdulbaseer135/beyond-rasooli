import { matchesQuery } from "./search-normalize";
export type FilterParams = Record<string, string | string[] | undefined>;
export function value(params: FilterParams, key: string, fallback = "all") {
  const v = params[key];
  return typeof v === "string" ? v : fallback;
}
export function pageLimit(params: FilterParams) {
  const n = Number(value(params, "limit", "12"));
  return Number.isFinite(n) ? Math.max(12, Math.min(120, Math.floor(n))) : 12;
}
export function filterItems<
  T extends {
    topicSlug: string;
    language: string;
    displayLanguage?: string;
    spokenLanguage?: string;
    format?: string | null | undefined;
    title: string;
    summary?: string | null | undefined;
    description?: string | null | undefined;
    tags: string[];
    featuredOrder: number;
    publishedAt?: string | null | undefined;
  },
>(items: T[], params: FilterParams, kind: "watch" | "read"): T[] {
  return items
    .filter(
      (d) =>
        (value(params, "topic") === "all" ||
          d.topicSlug === value(params, "topic")) &&
        (value(params, "language") === "all" ||
          (kind === "watch" ? d.spokenLanguage : d.displayLanguage || d.language) ===
            value(params, "language")) &&
        (kind === "watch" ||
          value(params, "format") === "all" ||
          d.format === value(params, "format")) &&
        matchesQuery(
          value(params, "q", ""),
          [d.title, d.summary || d.description || "", ...d.tags].join(" "),
        ),
    )
    .sort((a, b) =>
      value(params, "sort", "latest") === "featured"
        ? Number(b.featuredOrder > 0) - Number(a.featuredOrder > 0) ||
          (a.featuredOrder || Infinity) - (b.featuredOrder || Infinity)
        : Date.parse(b.publishedAt || "1970-01-01") -
          Date.parse(a.publishedAt || "1970-01-01"),
    );
}
export function moreHref(path: string, params: FilterParams, limit: number) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (typeof v === "string") q.set(k, v);
  q.set("limit", String(limit + 12));
  return `${path}?${q}`;
}
