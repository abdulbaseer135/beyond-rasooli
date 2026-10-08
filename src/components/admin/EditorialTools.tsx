import type { UIFieldServerProps } from "payload";
import { getMergedMessages } from "@/lib/ui-strings";
import { EditorialToolsClient } from "./EditorialToolsClient";
export async function EditorialTools({ req }: UIFieldServerProps) {
  const locale = req.locale === "ps" || req.locale === "fa" ? req.locale : "en";
  const messages = await getMergedMessages(locale);
  const settings = await req.payload.findGlobal({slug:"site-settings",req,overrideAccess:false,depth:0});
  return <EditorialToolsClient messages={messages.ui} locale={locale} timezone={settings.publishingTimezone || "Asia/Kabul"} />;
}
