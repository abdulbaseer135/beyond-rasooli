import type { CollectionAfterChangeHook } from "payload";
import { sourceHashInput } from "@/lib/translation/structure";
import { invalidateCache } from "@/lib/data/cache-revalidate";
export const contentChanged: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  collection,
}) => {
  invalidateCache(`cms:${collection.slug}`);
  invalidateCache("cms:articles");
  invalidateCache("cms:videos");
  invalidateCache("cms:library");
  if (req.context.sourceChangeFlag) return doc;
  const slug = collection.slug as "articles" | "videos";
  if (
    previousDoc?.id &&
    sourceHashInput(doc) !== sourceHashInput(previousDoc)
  ) {
    const translations = await req.payload.find({
      collection: slug,
      req,
      overrideAccess: true,
      depth: 0,
      limit: 100,
      where: {
        and: [
          { translationGroup: { equals: doc.translationGroup } },
          { translatedFromLocale: { equals: doc.language } },
          { translationStatus: { equals: "reviewed" } },
        ],
      },
    });
    for (const target of translations.docs)
      if (target.id !== doc.id)
        await req.payload.update({
          collection: slug,
          id: target.id,
          req,
          overrideAccess: true,
          context: { ...req.context, sourceChangeFlag: true },
          data: { sourceChanged: true },
        });
  }
  if (
    previousDoc?.status === "published" &&
    previousDoc.slug !== doc.slug
  ) {
    const sourceKey = `${slug}:${doc.language}:${previousDoc.slug}`;
    const existing = await req.payload.find({
      collection: "slug-redirects",
      req,
      overrideAccess: true,
      limit: 1,
      where: { sourceKey: { equals: sourceKey } },
    });
    const data = {
      sourceKey,
      sourceSlug: previousDoc.slug,
      destinationSlug: doc.slug,
      kind: slug,
      language: doc.language,
    };
    if (existing.docs[0])
      await req.payload.update({
        collection: "slug-redirects",
        id: existing.docs[0].id,
        req,
        overrideAccess: true,
        data,
      });
    else
      await req.payload.create({
        collection: "slug-redirects",
        req,
        overrideAccess: true,
        data,
      });
  }
  return doc;
};
