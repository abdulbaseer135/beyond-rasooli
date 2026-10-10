import { pageMetadata } from "@/lib/seo/metadata";
import { getPage } from "@/lib/data/cms";
import type { Locale } from "@/i18n/routing";
import { RichText } from "@/components/article/RichText";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CheckCircle2 } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return pageMetadata(locale, "about", {
    title: t("title"),
    description: t("founder_bio"),
    alternates: { canonical: `/${locale}/about` },
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "about" });

  const ui = await getTranslations({ locale, namespace: "ui" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const page = await getPage("about", locale);
  if (page)
    return (
      <div className="site-container page-start content-narrow space-y-10">
        <header className="page-heading">
          <h1 className="type-h1">{page.title}</h1>
        </header>
        <RichText locale={locale} data={page.body} />
        <Link href="/contact" className="button button-primary">
          {ui("about_cta")}
        </Link>
      </div>
    );

  const principles = [
    {
      title: t("principle_1_title"),
      desc: t("principle_1_desc"),
    },
    {
      title: t("principle_2_title"),
      desc: t("principle_2_desc"),
    },
    {
      title: t("principle_3_title"),
      desc: t("principle_3_desc"),
    },
    {
      title: t("principle_4_title"),
      desc: t("principle_4_desc"),
    },
    {
      title: t("principle_5_title"),
      desc: t("principle_5_desc"),
    },
  ];

  return (
    <div className="site-container page-start content-narrow space-y-12 text-start">
      {/* 1. Header & Founder Introduction */}
      <header className="space-y-4 border-b border-[var(--divider)] pb-8">
        <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-1 rounded bg-[var(--sage-100)] text-[var(--sage-700)]">
          {t("mission_title")}
        </span>
        <h1 className="type-h1">{t("title")}</h1>
        <p className="font-editorial-serif text-xl sm:text-2xl text-[var(--ink-muted)] italic">
          &ldquo;{t("tagline")}&rdquo;
        </p>
      </header>

      {/* 2. Founder Bio Card (No-Face Presentation Rule) */}
      <section className="p-8 sm:p-10 rounded-md bg-[var(--surface)] border border-[var(--divider)] space-y-6">
        <div className="space-y-1">
          <h2 className="type-h2">{t("founder_name")}</h2>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--sage-700)]">
            {t("founder_role")}
          </p>
        </div>

        <p className="type-body">{t("founder_bio")}</p>

        {/* PRD & Brief: No-Face Presentation Note */}
        <div className="p-4 rounded bg-[var(--surface-2)]/80 border-s-4 border-[var(--sage-600)] text-xs text-[var(--ink-muted)] leading-relaxed">
          {t("no_face_note")}
        </div>
      </section>

      {/* 3. Our Mission */}
      <section className="space-y-4">
        <h2 className="type-h2">{t("mission_title")}</h2>
        <p className="type-body">{t("mission_text")}</p>
      </section>

      {/* 4. Five Editorial Principles */}
      <section className="space-y-8">
        <div className="border-b border-[var(--divider)] pb-4">
          <h2 className="type-h2">{t("principles_title")}</h2>
        </div>

        <div className="grid gap-6">
          {principles.map((pr, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-lg bg-[var(--surface)] border border-[var(--divider)] space-y-3 transition-colors hover:border-[var(--sage-400)]"
            >
              <div className="flex items-center gap-3 text-[var(--sage-700)]">
                <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                <h3 className="type-h3 text-xl">{pr.title}</h3>
              </div>
              <p className="type-body text-[var(--ink-muted)] text-base sm:text-lg leading-relaxed">{pr.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Contact & Social Channels */}
      <section className="p-8 sm:p-10 rounded-lg bg-[var(--surface)] border border-[var(--divider)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <h3 className="type-h3 text-xl">{ui("about_cta")}</h3>
          <p className="font-editorial-sans text-sm text-[var(--ink-muted)]">
            {ui("contact_intro")}
          </p>
        </div>
        <Link href="/contact" className="button button-primary">
          {nav("contact")}
        </Link>
      </section>
    </div>
  );
}
