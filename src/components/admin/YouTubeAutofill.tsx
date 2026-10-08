import type { UIFieldServerProps } from "payload";
import { getMergedMessages } from "@/lib/ui-strings";
import { YouTubeAutofillClient } from "./YouTubeAutofillClient";

export async function YouTubeAutofill({ req }: UIFieldServerProps) {
  const locale = req.locale === "ps" || req.locale === "fa" ? req.locale : "en";
  const messages = await getMergedMessages(locale);
  return <YouTubeAutofillClient messages={messages.ui} locale={locale} />;
}
