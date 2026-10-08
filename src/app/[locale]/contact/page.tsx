import type { Locale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/forms/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const ui = await getTranslations({ locale, namespace: "ui" });

  return pageMetadata(locale, "contact", {
    title: t("contact"),
    description: ui("contact_intro"),
    alternates: { canonical: `/${locale}/contact` },
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const ui = await getTranslations({ locale, namespace: "ui" });

  return (
    <div className="site-container page-start content-narrow space-y-10 text-start">
      <header className="page-heading">
        <h1 className="type-h1">{tNav("contact")}</h1>
        <p className="text-base text-[var(--ink-muted)] leading-relaxed">
          {ui("contact_intro")}
        </p>
      </header>

      <ContactForm />
    </div>
  );
}
