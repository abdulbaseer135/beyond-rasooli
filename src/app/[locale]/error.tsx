"use client";
import { useTranslations } from "next-intl";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations("ui");
  return (
    <div className="site-container page-start space-y-6">
      <h1 className="type-h1">{t("error")}</h1>
      <button className="button button-primary" type="button" onClick={reset}>
        {t("retry")}
      </button>
    </div>
  );
}
