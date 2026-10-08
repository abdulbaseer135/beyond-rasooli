import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale, type Locale } from "./routing";
import { getMergedMessages } from "@/lib/ui-strings";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  const messages = await getMergedMessages(locale as Locale);

  return {
    locale,
    messages,
  };
});
