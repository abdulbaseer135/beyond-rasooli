import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
export default function NotFound() {
  const t = useTranslations("errors");
  const nav = useTranslations("nav");
  return (
    <div className="site-container page-start space-y-6">
      <h1 className="type-h1">{t("not_found_title")}</h1>
      <p className="type-body">{t("not_found_text")}</p>
      <div className="share-row">
        <Link href="/" className="button button-primary">
          {t("back_to_home")}
        </Link>
        <Link href="/watch" className="button button-secondary">
          {nav("watch")}
        </Link>
        <Link href="/read" className="button button-secondary">
          {nav("read")}
        </Link>
      </div>
    </div>
  );
}
