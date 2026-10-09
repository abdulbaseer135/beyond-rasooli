import { ValidationError, type PayloadRequest, type CollectionBeforeDeleteHook } from "payload";
import ps from "@/messages/ps.json";
import fa from "@/messages/fa.json";
import en from "@/messages/en.json";
export async function invalid(req: PayloadRequest, path: string, key: keyof typeof en.ui): Promise<never> {
  const lang = req?.i18n?.language;
  const locale = lang === "fa" ? "fa" : req?.locale === "ps" && lang !== "en" ? "ps" : "en";
  let message: string | undefined;
  if (req?.payload?.find) {
    try {
      const records = await req.payload.find({ collection: "ui-strings", req, overrideAccess: true, depth: 0, limit: 1, where: { key: { equals: `ui.${key}` } } });
      const record = records.docs[0];
      const dbValue = (locale === "fa" ? record?.valueFa : locale === "ps" ? record?.valuePs : record?.valueEn);
      if (typeof dbValue === "string" && dbValue.trim()) {
        message = dbValue;
      }
    } catch {
      // Fallback to static messages
    }
  }
  message = message || ({en,ps,fa}[locale]?.ui?.[key]) || (en.ui[key]) || key;
  throw new ValidationError({ errors: [{ path, message }], req });
}
export const archiveBeforeDelete: CollectionBeforeDeleteHook = async ({ req, id, collection }) => {
  // Founder (admin) and system/script contexts are permitted to delete directly
  if (req.user?.role === "admin" || !req.user || req.context?.allowDeletePublished) {
    return;
  }
  const doc = await req.payload.findByID({ collection: collection.slug, id, locale: "all", req, overrideAccess: true, depth: 0 });
  const status = (doc as unknown as { status?: unknown }).status;
  const statuses = typeof status === "object" && status ? Object.values(status) : [status];
  if (statuses.some(value => value === "published" || value === "scheduled")) await invalid(req, "status", "archive_before_delete");
};
