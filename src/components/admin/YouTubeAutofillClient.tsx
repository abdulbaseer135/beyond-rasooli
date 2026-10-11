"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, useFormFields } from "@payloadcms/ui";

export function YouTubeAutofillClient({
  messages: t,
  locale,
}: {
  messages: Record<string, string>;
  locale: string;
}) {
  const { dispatchFields, setModified } = useForm();
  const url = useFormFields(([fields]) => fields.youtubeUrl?.value as string | undefined);
  const currentTitle = useFormFields(([fields]) => fields.title?.value as string | undefined);
  const [state, setState] = useState("");
  const [suggestedTitle, setSuggestedTitle] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [duration, setDuration] = useState("");
  const fetchedUrl = useRef("");

  const fill = useCallback(
    async (incomingURL?: string) => {
      const targetUrl = incomingURL || url;
      if (!targetUrl) return;
      setBusy(true);
      setState("");
      setSuggestedTitle(null);
      try {
        const r = await fetch("/api/youtube-autofill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: targetUrl }),
        });
        if (!r.ok) throw new Error();
        const d = await r.json();

        // 1. Safe title population: never silently overwrite existing founder title
        const existingTitle = (currentTitle || "").trim();
        if (!existingTitle && d.title) {
          dispatchFields({ type: "UPDATE", path: "title", value: d.title });
        } else if (d.title && d.title !== existingTitle) {
          setSuggestedTitle(d.title);
        }

        // Metadata is derived from the video link and never manually entered.
        if (d.thumbnailUrl) {
          dispatchFields({ type: "UPDATE", path: "remotePosterUrl", value: d.thumbnailUrl });
          setThumbnailUrl(d.thumbnailUrl);
        }
        if (typeof d.durationSeconds === "number") {
          dispatchFields({ type: "UPDATE", path: "durationSeconds", value: d.durationSeconds });
          dispatchFields({ type: "UPDATE", path: "duration", value: d.duration });
          setDuration(d.duration);
        } else {
          dispatchFields({ type: "UPDATE", path: "duration", value: "" });
          dispatchFields({ type: "UPDATE", path: "durationSeconds", value: null });
          setDuration("");
        }

        setModified(true);
        setState("autofill_ready");
      } catch {
        setState("autofill_failed");
      } finally {
        setBusy(false);
      }
    },
    [url, currentTitle, dispatchFields, setModified],
  );

  useEffect(() => {
    const targetUrl = url?.trim();
    if (!targetUrl || targetUrl === fetchedUrl.current) return;
    const timer = window.setTimeout(() => {
      fetchedUrl.current = targetUrl;
      void fill(targetUrl);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [url, fill]);

  const applySuggestedTitle = () => {
    if (suggestedTitle) {
      dispatchFields({ type: "UPDATE", path: "title", value: suggestedTitle });
      setModified(true);
      setSuggestedTitle(null);
    }
  };

  return (
    <div className="br-youtube-autofill" dir={locale === "en" ? "ltr" : "rtl"} style={{ display: "grid", gap: "8px" }}>
      {busy && <p className="br-autofill-status" role="status">{t.loading}</p>}
      {thumbnailUrl && (
        <div className="br-youtube-metadata-preview">
          <img src={thumbnailUrl} alt="" />
          <p className="br-autofill-status">{duration || t.youtube_duration_unavailable}</p>
        </div>
      )}
      {suggestedTitle && (
        <div style={{ padding: "8px 12px", background: "var(--theme-elevation-100)", border: "1px solid var(--theme-elevation-250)", borderRadius: "4px", fontSize: "13px" }}>
          <p style={{ margin: "0 0 6px 0", color: "var(--theme-text)" }}>
            {t.youtube_title_label ? t.youtube_title_label.replace("{title}", suggestedTitle) : `${suggestedTitle}`}
          </p>
          <button
            type="button"
            className="btn btn--style-secondary btn--size-small"
            onClick={applySuggestedTitle}
            style={{ cursor: "pointer", padding: "4px 8px", fontSize: "12px" }}
          >
            {t.use_youtube_title || (locale === "ps" ? "د یوټیوب سرلیک وکاروئ" : locale === "fa" ? "استفاده از عنوان یوتیوب" : "Use YouTube Title")}
          </button>
        </div>
      )}
      {state === "autofill_failed" && <p className="br-autofill-status" role="status">{t.autofill_failed}</p>}
    </div>
  );
}

