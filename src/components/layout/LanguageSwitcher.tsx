"use client";
import { useEffect, useState, useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, locales } from "@/i18n/routing";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const id = useId();
  const locale = useLocale();
  const path = usePathname();
  const t = useTranslations("ui");

  const isDetailPage = /^\/(read|watch)\/[^/]+$/.test(path);

  const [detailLinks, setDetailLinks] = useState<{
    path: string;
    locale: string;
    links: Record<string, string>;
  }>({ path: "", locale: "", links: {} });

  useEffect(() => {
    if (!isDetailPage) return;
    const abort = new AbortController();
    fetch(
      `/api/translations?locale=${locale}&path=${encodeURIComponent(path)}`,
      { signal: abort.signal },
    )
      .then(async (r) => {
        if (r.ok) {
          const data = (await r.json()) as { links?: Record<string, string> };
          setDetailLinks({ path, locale, links: data.links || {} });
        }
      })
      .catch(() => {});
    return () => abort.abort();
  }, [path, locale, isDetailPage]);

  const links: Record<string, string> = isDetailPage
    ? detailLinks.path === path && detailLinks.locale === locale
      ? detailLinks.links
      : {}
    : Object.fromEntries(
        locales.map((target) => [
          target,
          `/${target}${path === "/" ? "" : path}`,
        ]),
      );

  return (
    <div className="language-switcher">
      <Globe strokeWidth={1.5} aria-hidden="true" />
      <label className="sr-only" htmlFor={id}>
        {t("language")}
      </label>
      <select
        id={id}
        value={locale}
        disabled={!Object.keys(links).length}
        onChange={(e) => {
          const href = links[e.target.value];
          if (href) {
            const destination = new URL(href, window.location.origin);
            if (!/^\/(read|watch)\/[^/]+$/.test(path)) {
              destination.search = window.location.search;
              if (
                path === "/read" &&
                destination.searchParams.get("language") === locale
              )
                destination.searchParams.set("language", e.target.value);
            }
            window.location.assign(destination.href);
          }
        }}
      >
        <option value={locale}>{t(`language_${locale}`)}</option>
        {Object.entries(links)
          .filter(([key]) => key !== locale)
          .map(([key, url]) => (
            <option key={url} value={key}>
              {t(`language_${key}`)}
            </option>
          ))}
      </select>
    </div>
  );
}
