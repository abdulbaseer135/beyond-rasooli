"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDocumentInfo, useFormFields } from "@payloadcms/ui";

export function EditorialToolsClient({
  messages: t,
  locale,
}: {
  messages: Record<string, string>;
  locale: string;
  timezone: string;
}) {
  const router = useRouter();
  const { id, collectionSlug } = useDocumentInfo();
  const language = useFormFields(
    ([fields]) => fields.language?.value as string | undefined,
  );
  const [target, setTarget] = useState(language === "ps" ? "fa" : "ps");
  const [state, setState] = useState("");
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (!id) return;
    const confirmed = window.confirm(t.retranslate_warning);
    if (!confirmed) return;
    setBusy(true);
    setState("");
    try {
      const r = await fetch("/api/generate-translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection: collectionSlug,
          id,
          targetLocale: target,
          confirmReviewedOverwrite: true,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error();
      router.push(`/admin/collections/${collectionSlug}/${d.id}`);
    } catch {
      setState("save_error");
      setBusy(false);
    }
  }

  return (
    <div className="br-translation-tools-card" dir={locale === "en" ? "ltr" : "rtl"}>
      <div className="br-translation-tools-header">
        <h4>{t.translation_title || "Translation Workflow"}</h4>
        <p className="br-translation-tools-desc">
          {t.create_help_articles ? "Generate synchronized language editions linked by translation group." : "Translate content into Pashto, Dari or English."}
        </p>
      </div>

      <div className="br-translation-actions">
        <label className="br-translation-target-label">
          <span>{t.target || "Target Language"}:</span>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            disabled={busy || !id}
            className="br-translation-select"
          >
            {["ps", "fa", "en"].map((code) => (
              <option key={code} value={code} disabled={code === language}>
                {t[`language_${code}`] || code.toUpperCase()}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="br-translation-btn"
          disabled={busy || !id || language === target}
          onClick={generate}
        >
          {busy ? (t.loading || "Generating...") : (t.generate || "Generate translation")}
        </button>

        {id && (
          <a
            className="br-translation-review-link"
            href={`/${locale}/translation-review?collection=${collectionSlug}&id=${id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.translation_title || "Open Side-by-Side Review"} &rarr;
          </a>
        )}
      </div>

      {!id && (
        <p className="br-translation-hint">{t.save_first || "Save a draft before generating translations."}</p>
      )}
      {state && (
        <p role="status" className="br-translation-status">{t[state] || state}</p>
      )}
    </div>
  );
}
