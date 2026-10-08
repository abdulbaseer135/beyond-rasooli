"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { matchesQuery } from "@/lib/search-normalize";
type Status = "ai_draft" | "needs_review" | "approved" | "missing";
type RecordItem = {
  id: number;
  key: string;
  namespace: string;
  en: string;
  ps: string;
  fa: string;
  statusPs: Status;
  statusFa: Status;
};
export default function ReviewReport() {
  const t = useTranslations("ui");
  const read = useTranslations("read");
  const [items, setItems] = useState<RecordItem[]>([]);
  const [state, setState] = useState("loading");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [canApprove, setCanApprove] = useState(false);
  const [busy, setBusy] = useState("");
  useEffect(() => {
    fetch("/api/ui-string-review")
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const data = await r.json();
        setItems(data.items);
        setCanApprove(Boolean(data.canApprove));
        setState("");
      })
      .catch(() => setState("error"));
  }, []);
  async function review(
    item: RecordItem,
    locale: "ps" | "fa",
    status: "approved" | "needs_review",
  ) {
    setBusy(`${item.key}-${locale}`);
    try {
      const response = await fetch("/api/ui-string-review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: item.key, locale, status }),
      });
      if (!response.ok) throw new Error();
      setItems((list) =>
        list.map((d) =>
          d.id === item.id
            ? { ...d, [locale === "ps" ? "statusPs" : "statusFa"]: status }
            : d,
        ),
      );
      setState("saved");
    } catch {
      setState("save_error");
    } finally {
      setBusy("");
    }
  }
  const statuses: Status[] = [
    "ai_draft",
    "needs_review",
    "approved",
    "missing",
  ];
  const filtered = items.filter(
    (d) =>
      (filter === "all" || d.statusPs === filter || d.statusFa === filter) &&
      matchesQuery(query, `${d.key} ${d.en} ${d.ps} ${d.fa}`),
  );
  return (
    <div className="site-container page-start space-y-8">
      <header className="page-heading">
        <h1 className="type-h1">{t("review_title")}</h1>
      </header>
      <div className="grid md:grid-cols-2 gap-8">
        {(["ps", "fa"] as const).map((locale) => (
          <section key={locale}>
            <h2 className="type-h2">{t(`language_${locale}`)}</h2>
            <dl className="review-counts">
              {statuses.map((status) => (
                <div key={status}>
                  <dt>{t(status)}</dt>
                  <dd>
                    {
                      items.filter(
                        (d) =>
                          d[locale === "ps" ? "statusPs" : "statusFa"] ===
                          status,
                      ).length
                    }
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <div className="discovery-filters">
        <label>
          {t("review_status")}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">{read("format_all")}</option>
            {statuses.map((s) => (
              <option value={s} key={s}>
                {t(s)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("search")}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <p role="status">{state && t(state)}</p>
      <div className="review-records">
        {filtered.map((item) => (
          <article key={item.key} className="review-record">
            <h2 className="type-h3">
              <bdi>{item.key}</bdi>
            </h2>
            <p>{item.en}</p>
            <div className="grid md:grid-cols-2 gap-6">
              {(["ps", "fa"] as const).map((locale) => (
                <div
                  key={locale}
                  lang={locale === "fa" ? "fa-AF" : "ps"}
                  dir="rtl"
                >
                  <p>{item[locale] || t("missing")}</p>
                  <p className="type-meta">
                    {t(item[locale === "ps" ? "statusPs" : "statusFa"])}
                  </p>
                  <div className="share-row">
                    {canApprove && <button
                      className="button button-secondary"
                      disabled={
                        !item[locale] || busy === `${item.key}-${locale}`
                      }
                      type="button"
                      onClick={() => review(item, locale, "approved")}
                    >
                      {t("approve")}
                    </button>}
                    <button
                      className="button button-secondary"
                      type="button"
                      disabled={
                        !item[locale] || busy === `${item.key}-${locale}`
                      }
                      onClick={() => review(item, locale, "needs_review")}
                    >
                      {t("needs_review")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <a
              href={
                item.id
                  ? `/admin/collections/ui-strings/${item.id}`
                  : "/admin/collections/ui-strings/create"
              }
              className="text-link"
            >
              {t("edit_cms")}
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
