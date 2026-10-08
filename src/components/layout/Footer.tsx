import { SocialIcon } from "@/components/ui/SocialIcon";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import NextLink from "next/link";
import { getFooterData } from "@/lib/data/cms";
import type { Locale } from "@/i18n/routing";

export async function Footer({ locale }: { locale: Locale }) {
  const [footerData, t, nav, ui] = await Promise.all([
    getFooterData(locale),
    getTranslations({ locale, namespace: "footer" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "ui" }),
  ]);

  const {
    settings,
    hasArticles,
    hasVideos,
    hasTopics,
    hasCollections,
    hasSources,
    privacy,
    terms,
  } = footerData;

  const links = [
    ["/contact", nav("contact")],
    ...(hasVideos ? [["/watch", nav("watch")]] : []),
    ...(hasArticles ? [["/read", nav("read")]] : []),
    ...(hasSources ? [["/sources", t("sources")]] : []),
    ...(hasTopics ? [["/topics", nav("topics")]] : []),
    ...(hasCollections ? [["/collections", ui("collections")]] : []),
    ["/about", nav("about")],
    ...(privacy ? [["/privacy", t("privacy")]] : []),
    ...(terms ? [["/terms", t("terms")]] : []),
  ];

  return (
    <footer className="site-footer">
      <div className="site-container footer-grid">
        <div>
          <Link href="/" className="wordmark">
            {settings.siteName}
          </Link>
          <p className="type-standfirst">{settings.tagline || t("tagline")}</p>
          <p className="type-ui">{t("description")}</p>
        </div>
        <nav aria-label={t("nav_group_explore")} className="footer-links">
          {links.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <nav aria-label={t("nav_group_editorial")} className="footer-links">
          {Object.entries(settings.socialLinks || {})
            .filter(([, url]) => url && /^https?:/.test(url))
            .map(([key, url]) => (
              <a
                key={key}
                href={url!}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SocialIcon platform={key} />
                <bdi>{ui(key)}</bdi>
              </a>
            ))}
        </nav>
        {settings.newsletterEnabled && privacy && <NewsletterForm />}
        <div className="footer-bottom type-meta">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p>{t("founder_ownership")}</p>
          <p>
            <NextLink href="/admin" className="footer-admin-link">
              {nav("admin")}
            </NextLink>
          </p>
        </div>
      </div>
    </footer>
  );
}
