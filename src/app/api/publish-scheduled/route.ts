import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { timingSafeEqual } from "node:crypto";
export async function POST(req: Request) {
  const key = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") || "";
  const expected = `Bearer ${key}`;
  if (
    !key ||
    Buffer.byteLength(auth) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(auth), Buffer.from(expected))
  )
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const payload = await getPayload({ config });
  let published = 0;
  const failed: number[] = [];
  for (const collection of [
    "articles",
    "videos",
    "collections",
    "pages",
  ] as const)
    for (const locale of (collection === "pages" ? ["ps", "fa", "en"] : ["en"]) as ("ps" | "fa" | "en")[]) {
      for (;;) {
      const result = await payload.find({
        collection,
        locale,
        fallbackLocale: false,
        overrideAccess: true,
        depth: 0,
        limit: 100,
        where: {
          and: [
            { status: { equals: "scheduled" } },
            { publishedAt: { less_than_equal: new Date().toISOString() } },
          ],
        },
      });
      if (!result.docs.length) break;
      let successes = 0;
      for (const doc of result.docs) {
        try {
          await payload.update({
            collection,
            id: doc.id,
            locale,
            overrideAccess: true,
            context: { scheduledPublish: true },
            data: { status: "published" },
          });
          published++;
          successes++;
        } catch {
          failed.push(doc.id);
        }
      }
      if (successes === 0 || result.docs.length < 100) break;
      }
    }
  return NextResponse.json(
    { published, failed },
    {
      status: failed.length ? 207 : 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
