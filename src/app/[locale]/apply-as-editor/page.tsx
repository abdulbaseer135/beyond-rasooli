import type { Locale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { EditorApplicationForm } from "@/components/forms/EditorApplicationForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === "ps"
      ? "د ایډیټر په توګه غوښتنلیک | Beyond Rasooli"
      : locale === "fa"
        ? "درخواست عضویت به عنوان ویراستار | Beyond Rasooli"
        : "Apply as an Editor | Beyond Rasooli";

  const description =
    locale === "ps"
      ? "له بیاند رسولي سره د علمي او څېړنیزو مقالو د لیکوال په توګه یوځای شئ."
      : locale === "fa"
        ? "به جمع نویسندگان و پژوهشگران فراتر از رسولی بپیوندید."
        : "Apply to contribute research-backed articles, psychology explainers, and educational videos to Beyond Rasooli.";

  return pageMetadata(locale, "apply-as-editor", {
    title,
    description,
    alternates: { canonical: `/${locale}/apply-as-editor` },
  });
}

export default async function ApplyAsEditorPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const heading = {
    en: {
      title: "Apply to Become an Editor",
      subtitle:
        "Contribute research-backed explainers, psychology insights, and educational videos to Beyond Rasooli. Applications are reviewed directly by the founder.",
    },
    ps: {
      title: "د ایډیټر په توګه غوښتنلیک وسپارئ",
      subtitle:
        "له بیاند رسولي سره د ارواپوهنې، ادراکي علومو او علمي مفاهیمو په خپرولو کې ملګري شئ. ټول غوښتنلیکونه په مستقیم ډول د بنسټ ایښودونکي لخوا کتل کېږي.",
    },
    fa: {
      title: "ارسال درخواست برای عضویت در هیئت تحریریه",
      subtitle:
        "در فراتر از رسولی مقالات علمی، روان‌شناسی و ویدیوهای آموزشی منتشر کنید. تمام درخواست‌ها مستقیماً توسط بنیان‌گذار بررسی می‌شوند.",
    },
  }[locale as "en" | "ps" | "fa"] || {
    title: "Apply to Become an Editor",
    subtitle:
      "Contribute research-backed explainers, psychology insights, and educational videos to Beyond Rasooli. Applications are reviewed directly by the founder.",
  };

  return (
    <div className="site-container page-start content-narrow space-y-10 text-center">
      <header className="page-heading max-w-xl mx-auto space-y-3">
        <h1 className="type-h1">{heading.title}</h1>
        <p className="text-sm sm:text-base text-[var(--ink-muted)] leading-relaxed">
          {heading.subtitle}
        </p>
      </header>

      <EditorApplicationForm />
    </div>
  );
}
