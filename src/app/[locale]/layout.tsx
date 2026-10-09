import { getSettings } from "@/lib/data/cms";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { locales, localeMetadata, type Locale } from "@/i18n/routing";
import {
  newsreader,
  inter,
  notoNaskhArabic,
  notoSansArabic,
} from "@/lib/fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "@/app/globals.css";

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) return {};

  const meta = localeMetadata[locale as Locale];
  const settings = await getSettings(locale as Locale);
  const title = settings.defaultSEOTitle || settings.siteName;
  const description = settings.defaultSEODescription || settings.tagline || undefined;

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
    ),
    openGraph: {
      title,
      description,
      siteName: title,
      locale: meta.htmlLang,
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const settings = await getSettings(locale as Locale);
  const meta = localeMetadata[locale as Locale];

  const fontVariables = `${newsreader.variable} ${inter.variable} ${notoNaskhArabic.variable} ${notoSansArabic.variable}`;

  return (
    <html
      lang={meta.htmlLang}
      dir={meta.dir}
      className={fontVariables}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header brand={settings.siteName} />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer locale={locale as Locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
