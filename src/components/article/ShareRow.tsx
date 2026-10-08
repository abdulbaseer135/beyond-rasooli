"use client";
import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
export function ShareRow({ title }: { title: string }) {
  const t = useTranslations("ui");
  const url = useSyncExternalStore(
    () => () => {},
    () => window.location.href,
    () => "",
  );
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("copied");
    } catch {
      setStatus("copy_error");
    }
  }
  const links = [
    [
      "whatsapp",
      `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
    ],
    [
      "facebook",
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    ],
    [
      "x",
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    ],
  ];
  return (
    <div className="share-row">
      <button type="button" className="button button-secondary" onClick={copy}>
        {t("copy")}
      </button>
      {url &&
        links.map(([key, href]) => (
          <a
            key={key}
            className="button button-secondary"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t(key)}
          </a>
        ))}
      <span role="status" className="type-meta">
        {status && t(status)}
      </span>
    </div>
  );
}
