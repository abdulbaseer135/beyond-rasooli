import en from "@/messages/en.json";
import ps from "@/messages/ps.json";
import fa from "@/messages/fa.json";
import type { UiString } from "@/payload-types";
export const dictionaries: Record<
  "en" | "ps" | "fa",
  Record<string, Record<string, string>>
> = { en, ps, fa };
export function missingUIValues(
  key: string,
  existing?: Pick<UiString, "valueEn" | "valuePs" | "valueFa">,
) {
  const [namespace, name] = key.split(".");
  const source = en[namespace as keyof typeof en] as
    Record<string, string> | undefined;
  if (!source?.[name]) return {};
  const data: Partial<UiString> = {};
  if (!existing?.valueEn?.trim()) data.valueEn = source[name];
  // Stock native starter wording must never silently translate changed founder source text.
  if (existing?.valueEn?.trim() && existing.valueEn !== source[name])
    return data;
  for (const locale of ["ps", "fa"] as const) {
    const field = locale === "ps" ? "valuePs" : "valueFa";
    if (!existing?.[field]?.trim()) {
      const text = dictionaries[locale][namespace]?.[name];
      if (text?.trim()) {
        data[field] = text;
        data[locale === "ps" ? "statusPs" : "statusFa"] = "ai_draft";
      }
    }
  }
  return data;
}
