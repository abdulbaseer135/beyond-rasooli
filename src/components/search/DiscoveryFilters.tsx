"use client";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/routing";
import type { PublicTopic } from "@/lib/data/content-types";
import type { FilterParams } from "@/lib/discovery";
import { value } from "@/lib/discovery";
import { Search } from "lucide-react";

export function DiscoveryFilters({
  kind,
  locale,
  topics,
  params,
  topicsOnly = kind === "watch",
}: {
  kind: "watch" | "read";
  locale: Locale;
  topics: PublicTopic[];
  params: FilterParams;
  topicsOnly?: boolean;
}) {
  const t = useTranslations("ui");
  const read = useTranslations("read");
  const nav = useTranslations("nav");
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = `/${locale}/${kind}`;

  const currentTopic = value(params, "topic", "all");
  const currentLanguage = value(params, "language", "all");
  const currentFormat = value(params, "format", "all");
  const currentQuery = value(params, "q", "");

  const hrefFor = (updates: Record<string, string>) => {
    const sp = new URLSearchParams(searchParams?.toString() || "");
    if (topicsOnly) {
      sp.delete("language");
      sp.delete("sort");
      sp.delete("format");
      sp.delete("q");
    }
    for (const [k, v] of Object.entries(updates)) {
      if (!v || v === "all" || (k === "sort" && v === "latest") || (k === "q" && !v.trim())) {
        sp.delete(k);
      } else {
        sp.set(k, v);
      }
    }
    sp.delete("limit"); // reset pagination on filter change
    const qs = sp.toString();
    return qs ? `${action}?${qs}` : action;
  };
  const updateParams = (updates: Record<string, string>) => router.push(hrefFor(updates));
  const selectTopic = (event: React.MouseEvent<HTMLAnchorElement>, topic: string) => {
    if (event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      updateParams({ topic });
    }
  };

  return (
    <form method="get" action={action} className={`editorial-filters space-y-4 ${topicsOnly ? "watch-filters" : ""}`} onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      updateParams(Object.fromEntries([...data].map(([key, entry]) => [key, String(entry)])));
    }}>
      {currentTopic !== "all" && <input type="hidden" name="topic" value={currentTopic} />}
      {/* 1. Topic Chips Row (Scrollable / Wrapping) */}
      <div className="topic-chips-wrapper">
        <div className="topic-chips-scroll" tabIndex={topicsOnly ? 0 : undefined} role={topicsOnly ? "region" : undefined} aria-label={topicsOnly ? nav("topics") : undefined}>
          <a
            href={hrefFor({ topic: "all" })}
            aria-current={currentTopic === "all" ? "true" : undefined}
            onClick={(event) => selectTopic(event, "all")}
            className={`topic-chip px-3.5 py-1.5 text-xs sm:text-sm rounded-full whitespace-nowrap transition-colors min-h-[36px] ${
              currentTopic === "all"
                ? "bg-[var(--sage-700)] text-[var(--bg)] font-medium"
                : "bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)]"
            }`}
          >
            {t("all")}
          </a>
          {topics.map((topic) => {
            const isSelected = currentTopic === topic.slug;
            return (
              <a
                key={topic.id}
                href={hrefFor({ topic: topic.slug })}
                aria-current={isSelected ? "true" : undefined}
                onClick={(event) => selectTopic(event, topic.slug)}
                className={`topic-chip px-3.5 py-1.5 text-xs sm:text-sm rounded-full whitespace-nowrap transition-colors min-h-[36px] ${
                  isSelected
                    ? "bg-[var(--sage-700)] text-[var(--bg)] font-medium"
                    : "bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)]"
                }`}
              >
                {topic.name[locale]}
              </a>
            );
          })}
        </div>
      </div>

      {/* 2. Secondary Restrained Controls Row */}
      {kind === "read" && !topicsOnly && <div className="secondary-filters-row">
        {kind === "read" && <div className="filter-fields">
          {/* Language filter */}
          <div className="filter-field">
            <label htmlFor="filter-language">
              {t("language")}:
            </label>
            <select
              id="filter-language"
              name="language"
              value={currentLanguage}
              onChange={(e) => updateParams({ language: e.target.value })}
            >
              <option value="all">{t("all")}</option>
              {(["ps", "fa", "en"] as const).map((l) => (
                <option key={l} value={l}>
                  {t(`language_${l}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Read format filter */}
          {kind === "read" && (
            <div className="filter-field">
              <label htmlFor="filter-format">
                {t("format")}:
              </label>
              <select
                id="filter-format"
                name="format"
                value={currentFormat}
                onChange={(e) => updateParams({ format: e.target.value })}
              >
                <option value="all">{read("format_all")}</option>
                {["article", "explainer", "mystery"].map((f) => (
                  <option key={f} value={f}>
                    {read(`format_${f}`)}
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>}

        {/* Read text search */}
        {(
          <div className="filter-search">
            <label htmlFor="filter-query">{t("search")}</label>
            <div className="filter-search-control">
              <input
                id="filter-query"
                name="q"
                type="search"
                defaultValue={currentQuery}
                placeholder={t("search")}
              />
              <button
                type="submit"
                className="icon-button"
                aria-label={t("search")}
              >
                <Search size={20} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>}
    </form>
  );
}
