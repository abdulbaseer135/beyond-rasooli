import { pageMetadata } from "@/lib/seo/metadata";
import { getPage } from "@/lib/data/cms";
import type { Locale } from "@/i18n/routing";
import { RichText } from "@/components/article/RichText";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ContactChannels } from "@/components/ui/ContactChannels";

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
  const page = await getPage("about", locale);
  if (page)
    return (
      <div className="site-container page-start about-page">
        <header className="about-hero">
          <h1 className="type-h1">{page.title}</h1>
        </header>
        <div className="about-cms-body"><RichText locale={locale} data={page.body} /></div>
        <ContactChannels locale={locale} />
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
    <div className="site-container page-start about-page text-start">
      {/* 1. Header & Founder Introduction */}
      <header className="about-hero">
        <div className="about-hero-heading">
        <span className="about-eyebrow">
          {t("mission_title")}
        </span>
        <h1 className="type-h1">{t("title")}</h1>
        </div>
        <p className="about-tagline">
          &ldquo;{t("tagline")}&rdquo;
        </p>
      </header>

      {/* 2. Founder Bio Card (No-Face Presentation Rule) */}
      <div className="about-introduction">
      <section className="founder-panel">
        <div className="space-y-1">
          <h2 className="type-h2">{t("founder_name")}</h2>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--sage-700)]">
            {t("founder_role")}
          </p>
        </div>

        <p className="type-body">{t("founder_bio")}</p>

        {/* PRD & Brief: No-Face Presentation Note */}
        <div className="founder-note">
          {t("no_face_note")}
        </div>
      </section>

      {/* 3. Our Mission */}
      <section className="about-mission">
        <h2 className="type-h2">{t("mission_title")}</h2>
        <p className="type-body">{t("mission_text")}</p>
      </section>
      </div>

      {/* 4. Five Editorial Principles */}
      <section className="about-principles">
        <div className="about-section-heading">
          <h2 className="type-h2">{t("principles_title")}</h2>
        </div>

        <div className="principles-grid">
          {principles.map((pr, idx) => (
            <div
              key={idx}
              className="principle"
            >
              <div className="principle-title">
                <span className="principle-number" aria-hidden="true">{new Intl.NumberFormat(locale === "fa" ? "fa-AF" : locale, { minimumIntegerDigits: 2 }).format(idx + 1)}</span>
                <h3 className="type-h3 text-xl">{pr.title}</h3>
              </div>
              <p className="type-body text-[var(--ink-muted)] text-base sm:text-lg leading-relaxed">{pr.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Contact & Social Channels */}
      <section className="about-contact">
        <div className="space-y-1">
          <h2 className="type-h3 text-xl">{ui("about_cta")}</h2>
          <p className="font-editorial-sans text-sm text-[var(--ink-muted)]">
            {ui("contact_intro")}
          </p>
        </div>
        <ContactChannels locale={locale} />
      </section>
    </div>
  );
}
