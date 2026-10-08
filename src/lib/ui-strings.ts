import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Locale } from "@/i18n/routing";
import enMessages from "@/messages/en.json";

interface RawUIString {
  key: string;
  valueEn?: string | null;
  valuePs?: string | null;
  valueFa?: string | null;
}

const getCachedUIStringsList = unstable_cache(
  async (): Promise<RawUIString[]> => {
    const payload = await getPayload({ config });
    const docs: RawUIString[] = [];
    let page = 1;
    for (;;) {
      const t0 = performance.now();
      const result = await payload.find({
        collection: "ui-strings",
        depth: 0,
        overrideAccess: false,
        limit: 250,
        page,
        select: {
          key: true,
          valueEn: true,
          valuePs: true,
          valueFa: true,
        } as never,
      });
      const { recordPayloadCall } = await import("@/lib/perf-profiler");
      recordPayloadCall("find", "ui-strings", performance.now() - t0, `page ${page}`);
      for (const d of (result.docs as unknown as RawUIString[])) {
        docs.push({
          key: d.key,
          valueEn: d.valueEn,
          valuePs: d.valuePs,
          valueFa: d.valueFa,
        });
      }
      if (!result.hasNextPage) break;
      page++;
    }
    return docs;
  },
  ["cms-ui-strings-records"],
  {
    tags: ["cms:ui-strings"],
    revalidate: 3600,
  },
);

/** CMS first, bundled English only when a value is absent. Request-scoped
 * memoization avoids stale translations within a single render cycle,
 * while Next.js data cache avoids uncached remote DB queries on every request. */
export const getMergedMessages = cache(
  async (locale: Locale): Promise<Record<string, Record<string, string>>> => {
    const messages: Record<string, Record<string, string>> = structuredClone(
      enMessages,
    );
    const docs = await getCachedUIStringsList();
    const missingNative = new Set(
      Object.entries(enMessages).flatMap(([namespace, values]) =>
        Object.keys(values).map((key) => `${namespace}.${key}`),
      ),
    );
    for (const record of docs) {
      const segments = record.key.split(".");
      if (
        segments.some((part) =>
          ["__proto__", "prototype", "constructor"].includes(part),
        )
      )
        continue;
      const value =
        locale === "ps"
          ? record.valuePs
          : locale === "fa"
            ? record.valueFa
            : record.valueEn;
      if (value?.trim()) missingNative.delete(record.key);
      const text = value?.trim() ? value : record.valueEn;
      if (!text?.trim()) continue;
      if (segments.length !== 2) continue;
      const [namespace, key] = segments;
      const target = (messages[namespace] ??= {});
      target[key] = text;
    }
    if (locale !== "en" && missingNative.size)
      console.warn(
        `[ui-strings:${locale}] ${missingNative.size} keys use English fallback. Run npm run seed:localization and review missing CMS wording.`,
      );
    return messages;
  },
);
