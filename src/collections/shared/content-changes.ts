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

  // Founder Notifications for Article & Video Review Workflow
  if (["articles", "videos"].includes(collection.slug)) {
    const isArticle = collection.slug === "articles";
    const targetCol = collection.slug as "articles" | "videos";
    const labelPrefix = isArticle ? "Article" : "Video";

    const isNewSubmission =
      doc.status === "in_review" && previousDoc?.status !== "in_review";
    const isResubmission =
      doc.status === "in_review" &&
      previousDoc?.reviewDecision === "changes_requested";

    if (isNewSubmission || isResubmission) {
      const editorName =
        (typeof doc.submittedBy === "object" && doc.submittedBy?.name) ||
        req.user?.name ||
        req.user?.email ||
        "An editor";
      const editorId =
        (typeof doc.submittedBy === "object"
          ? doc.submittedBy?.id
          : doc.submittedBy) || req.user?.id;

      const { createFounderNotification } = await import("@/lib/notifications");
      if (isResubmission) {
        await createFounderNotification({
          payload: req.payload,
          req,
          type: isArticle ? "article_resubmission" : "video_resubmission",
          title: `${labelPrefix} Resubmission`,
          message: `${editorName} resubmitted "${doc.title || "Untitled"}" for your approval.`,
          actorId: editorId,
          targetCollection: targetCol,
          targetId: doc.id,
          submissionRevision: `rev-${doc.updatedAt || Date.now()}`,
          deduplicationKey: `${collection.slug}:${doc.id}:resubmission:${previousDoc?.updatedAt || doc.updatedAt}`,
          link: `/admin/content-approvals?type=${isArticle ? "article" : "video"}&id=${doc.id}`,
        });
      } else {
        await createFounderNotification({
          payload: req.payload,
          req,
          type: isArticle ? "article_approval" : "video_approval",
          title: `New ${labelPrefix} Awaiting Approval`,
          message: `${editorName} submitted "${doc.title || "Untitled"}" for your approval.`,
          actorId: editorId,
          targetCollection: targetCol,
          targetId: doc.id,
          submissionRevision: `rev-${doc.updatedAt || Date.now()}`,
          deduplicationKey: `${collection.slug}:${doc.id}:submission:${previousDoc?.updatedAt || doc.updatedAt}`,
          link: `/admin/content-approvals?type=${isArticle ? "article" : "video"}&id=${doc.id}`,
        });
      }
    }

    if (
      (doc.status === "published" ||
        doc.reviewDecision === "approved" ||
        doc.reviewDecision === "rejected" ||
        doc.reviewDecision === "changes_requested") &&
      previousDoc?.status === "in_review"
    ) {
      const { resolveFounderNotifications } = await import(
        "@/lib/notifications"
      );
      await resolveFounderNotifications({
        payload: req.payload,
        req,
        targetCollection: targetCol,
        targetId: doc.id,
      });
    }
  }

  return doc;
};

