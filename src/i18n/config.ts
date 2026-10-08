import { defineRouting } from "next-intl/routing";

export const locales = ["ps", "fa", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ps";

export const localeMetadata: Record<
  Locale,
  {
    name: string;
    nativeName: string;
    dir: "rtl" | "ltr";
    htmlLang: string;
    hreflang: string;
  }
> = {
  ps: {
    name: "Pashto",
    nativeName: "پښتو",
    dir: "rtl",
    htmlLang: "ps",
    hreflang: "ps",
  },
  fa: {
    // PRD Section 7 & 13: Labelled Dari (دری), HTML lang and hreflang fa-AF
    name: "Dari",
    nativeName: "دری",
    dir: "rtl",
    htmlLang: "fa-AF",
    hreflang: "fa-AF",
  },
  en: {
    name: "English",
    nativeName: "English",
    dir: "ltr",
    htmlLang: "en",
    hreflang: "en",
  },
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  alternateLinks: false,
});
