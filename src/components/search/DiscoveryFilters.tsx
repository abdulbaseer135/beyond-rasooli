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
}: {
  kind: "watch" | "read";
  locale: Locale;
  topics: PublicTopic[];
  params: FilterParams;
}) {
  const t = useTranslations("ui");
  const read = useTranslations("read");
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = `/${locale}/${kind}`;

  const currentTopic = value(params, "topic", "all");
  const currentLanguage = value(params, "language", "all");
  const currentFormat = value(params, "format", "all");
  const currentSort = value(params, "sort", "latest");
  const currentQuery = value(params, "q", "");

  const updateParams = (updates: Record<string, string>) => {
    const sp = new URLSearchParams(searchParams?.toString() || "");
    for (const [k, v] of Object.entries(updates)) {
      if (!v || v === "all" || (k === "sort" && v === "latest") || (k === "q" && !v.trim())) {
        sp.delete(k);
      } else {
        sp.set(k, v);
      }
    }
    sp.delete("limit"); // reset pagination on filter change
    const qs = sp.toString();
    router.push(qs ? `${action}?${qs}` : action);
  };

  return (
    <div className="editorial-filters space-y-4 py-2 border-b border-[var(--divider)]">
      {/* 1. Topic Chips Row (Scrollable / Wrapping) */}
      <div className="topic-chips-wrapper">
        <div className="topic-chips-scroll flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => updateParams({ topic: "all" })}
            className={`topic-chip px-3.5 py-1.5 text-xs sm:text-sm rounded-full whitespace-nowrap transition-colors min-h-[36px] ${
              currentTopic === "all"
                ? "bg-[var(--sage-700)] text-[var(--bg)] font-medium"
                : "bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)]"
            }`}
          >
            {read("format_all")}
          </button>
          {topics.map((topic) => {
            const isSelected = currentTopic === topic.slug;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => updateParams({ topic: topic.slug })}
                className={`topic-chip px-3.5 py-1.5 text-xs sm:text-sm rounded-full whitespace-nowrap transition-colors min-h-[36px] ${
                  isSelected
                    ? "bg-[var(--sage-700)] text-[var(--bg)] font-medium"
                    : "bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)]"
                }`}
              >
                {topic.name[locale]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Secondary Restrained Controls Row */}
      <div className="secondary-filters-row flex flex-wrap items-center justify-between gap-3 pt-1 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Language filter */}
          <div className="inline-flex items-center gap-1.5 text-[var(--ink-muted)]">
            <label htmlFor="filter-language" className="text-xs uppercase tracking-wide">
              {t(kind === "watch" ? "video_language" : "language")}:
            </label>
            <select
              id="filter-language"
              value={currentLanguage}
              onChange={(e) => updateParams({ language: e.target.value })}
              className="bg-transparent text-[var(--ink)] border-b border-[var(--divider)] py-1 pe-6 text-sm focus:border-[var(--sage-700)] focus:outline-none cursor-pointer"
            >
              <option value="all">{read("format_all")}</option>
              {(["ps", "fa", "en"] as const).map((l) => (
                <option key={l} value={l}>
                  {t(`language_${l}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Read format filter */}
          {kind === "read" && (
            <div className="inline-flex items-center gap-1.5 text-[var(--ink-muted)]">
              <label htmlFor="filter-format" className="text-xs uppercase tracking-wide">
                {t("format")}:
              </label>
              <select
                id="filter-format"
                value={currentFormat}
                onChange={(e) => updateParams({ format: e.target.value })}
                className="bg-transparent text-[var(--ink)] border-b border-[var(--divider)] py-1 pe-6 text-sm focus:border-[var(--sage-700)] focus:outline-none cursor-pointer"
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

          {/* Watch sort filter */}
          {kind === "watch" && (
            <div className="inline-flex items-center gap-1.5 text-[var(--ink-muted)]">
              <label htmlFor="filter-sort" className="text-xs uppercase tracking-wide">
                {t("sort")}:
              </label>
              <select
                id="filter-sort"
                value={currentSort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="bg-transparent text-[var(--ink)] border-b border-[var(--divider)] py-1 pe-6 text-sm focus:border-[var(--sage-700)] focus:outline-none cursor-pointer"
              >
                <option value="latest">{t("latest")}</option>
                <option value="featured">{t("featured")}</option>
              </select>
            </div>
          )}
        </div>

        {/* Read text search */}
        {kind === "read" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem("q") as HTMLInputElement;
              updateParams({ q: input.value });
            }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <input
                name="q"
                type="search"
                defaultValue={currentQuery}
                placeholder={t("search")}
                className="py-1 ps-2 pe-7 text-xs sm:text-sm bg-[var(--surface)] border border-[var(--divider)] rounded focus:outline-none focus:border-[var(--sage-700)] w-36 sm:w-44"
              />
              <button
                type="submit"
                className="absolute end-1.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                aria-label={t("search")}
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
