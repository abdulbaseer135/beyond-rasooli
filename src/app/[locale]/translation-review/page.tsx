"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { collectProse, replaceProse } from "@/lib/translation/structure";
import { RichText } from "@/components/article/RichText";
type Document = {
  id: number;
  title: string;
  summary?: string;
  description?: string;
  body?: unknown;
  transcript?: string;
  language: "en" | "ps" | "fa";
  translationStatus: string;
  sourceChanged?: boolean;
  seoTitle?: string;
  metaDescription?: string;
};
export default function TranslationReview() {
  const t = useTranslations("ui");
  const [collection, setCollection] = useState("articles");
  const [items, setItems] = useState<Document[]>([]);
  const [id, setId] = useState("");
  const [target, setTarget] = useState<Document | null>(null);
  const [source, setSource] = useState<Document | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [bodyTexts, setBodyTexts] = useState<string[]>([]);
  const [transcript, setTranscript] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [state, setState] = useState("");
  const [busy, setBusy] = useState(false);
  const [targetLocale, setTargetLocale] = useState("ps");
  useEffect(() => { queueMicrotask(() => { const q = new URLSearchParams(window.location.search); if(q.get("collection") === "videos")setCollection("videos");if(q.get("id"))setId(q.get("id")!); }); }, []);
  useEffect(() => {
    fetch(`/api/translation-review?collection=${collection}`)
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const d = await r.json();
        setItems(d.items);
      })
      .catch(() => setState("error"));
  }, [collection]);
  useEffect(() => {
    if (!id) return;
    const abort = new AbortController();
    fetch(`/api/translation-review?collection=${collection}&id=${id}`, {
      signal: abort.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const d = await r.json();
        setTarget(d.target);
        setSource(d.source || null);
        setTitle(d.target.title);
        setText(collection === "articles" ? d.target.summary || "" : d.target.description || "");
        setBodyTexts(collectProse(d.target.body));
        setTranscript(d.target.transcript || "");
        setSeoTitle(d.target.seoTitle || "");
        setMetaDescription(d.target.metaDescription || "");
        setState("");
      })
      .catch(() => { if (!abort.signal.aborted) setState("error"); });
    return () => abort.abort();
  }, [id, collection]);
  async function generate() {
    if (!id) return;
    const confirmed = window.confirm(t("retranslate_warning"));
    if (!confirmed) return;
    setBusy(true);
    try {
      const r = await fetch("/api/generate-translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection,
          id,
          targetLocale,
          confirmReviewedOverwrite: confirmed,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error();
      setId(String(d.id));
      setState("saved");
    } catch {
      setState("save_error");
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    try {
      const r = await fetch("/api/translation-review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection, id, title, text, ...(target?.body ? { body: replaceProse(target.body, bodyTexts) } : {}), transcript, seoTitle, metaDescription }),
      });
      if (!r.ok) throw new Error();
      setState("saved");
      setTarget((d) =>
        d ? { ...d, title, translationStatus: "reviewed" } : d,
      );
    } catch {
      setState("save_error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="site-container page-start space-y-8">
      <header className="page-heading">
        <h1 className="type-h1">{t("translation_title")}</h1>
      </header>
      <div className="discovery-filters">
        <label>
          {t("format")}
          <select
            value={collection}
            onChange={(e) => {
              setCollection(e.target.value);
              setId("");
              setTarget(null);
              setSource(null);
            }}
          >
            <option value="articles">{t("article")}</option>
            <option value="videos">{t("video")}</option>
          </select>
        </label>
        <label>
          {t("select_document")}
          <select value={id} onChange={(e) => setId(e.target.value)}>
            <option value="">{t("select_document")}</option>
            {items.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({t(`language_${d.language}`)})
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("target")}
          <select
            value={targetLocale}
            onChange={(e) => setTargetLocale(e.target.value)}
          >
            {["ps", "fa", "en"].map((l) => (
              <option key={l} value={l}>
                {t(`language_${l}`)}
              </option>
            ))}
          </select>
        </label>
        <button
          className="button button-secondary"
          type="button"
          disabled={!id || busy || target?.language === targetLocale}
          onClick={generate}
        >
          {t("generate")}
        </button>
      </div>
      {target && (
        <div className="grid md:grid-cols-2 gap-8">
          <section
            dir={source?.language === "en" ? "ltr" : "rtl"}
            lang={source?.language === "fa" ? "fa-AF" : source?.language}
          >
            <h2 className="type-h2">
              {t("source")} · {t("read_only")}
            </h2>
            {source ? (
              <>
                <h3 className="type-h3">{source.title}</h3>
                <p className="type-body">
                  {collection === "articles" ? source.summary : source.description}
                </p>
                <RichText locale={source.language} data={source.body} />
                {source.transcript && (
                  <p className="type-body whitespace-pre-line">
                    {source.transcript}
                  </p>
                )}
              </>
            ) : (
              <p>{t("missing")}</p>
            )}
          </section>
          <section
            className="translation-form"
            dir={target.language === "en" ? "ltr" : "rtl"}
            lang={target.language === "fa" ? "fa-AF" : target.language}
          >
            <h2 className="type-h2">{t("target")}</h2>
            {target.sourceChanged && <p role="status">{t("source_changed")}</p>}
            <label>
              {t(collection === "articles" ? "article" : "video")}
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label>
              {t("translation_title")}
              <textarea
                rows={7}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </label>
            {bodyTexts.map((value,index)=><label key={index}>{t("body_text")} · {index+1}<textarea rows={5} value={value} onChange={e=>setBodyTexts(values=>values.map((text,i)=>i===index?e.target.value:text))} /></label>)}
            {collection === "videos" && <label>{t("transcript_label")}<textarea rows={5} value={transcript} onChange={e=>setTranscript(e.target.value)} /></label>}
            <label>{t("seo_title_label")}<input value={seoTitle} onChange={e=>setSeoTitle(e.target.value)} /></label>
            <label>{t("meta_description_label")}<textarea value={metaDescription} onChange={e=>setMetaDescription(e.target.value)} /></label>
            {target.transcript && (
              <p className="type-body whitespace-pre-line">
                {target.transcript}
              </p>
            )}
            <a
              className="text-link"
              href={`/admin/collections/${collection}/${id}`}
            >
              {t("edit_cms")}
            </a>
            <button
              type="button"
              className="button button-primary"
              disabled={busy}
              onClick={save}
            >
              {t(busy ? "saving" : "reviewed")}
            </button>
          </section>
        </div>
      )}
      <p role="status">{state && t(state)}</p>
    </div>
  );
}

