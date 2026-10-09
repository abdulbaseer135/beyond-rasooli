import { randomUUID } from "node:crypto";
import { collectProse } from "@/lib/translation/structure";
import { extractYouTubeId } from "@/lib/youtube";
import { invalid } from "./validation";
import { slugify } from "./slug";
import { ValidationError, type CollectionBeforeValidateHook } from "payload";
import type { Access, CollectionBeforeChangeHook, Where } from "payload";
export const publicContentRead: Access = async ({ req }) => {
  if (req.user) return true;
  let requireReview = true;
  try {
    const cached = req.context ? (req.context as Record<string, unknown>)._requireReviewBeforePublic : undefined;
    if (typeof cached === "boolean") {
      requireReview = cached;
    } else {
      const settings = await req.payload.findGlobal({
        slug: "site-settings",
        overrideAccess: true,
      });
      requireReview = Boolean(settings?.requireReviewBeforePublic);
      if (req.context) {
        (req.context as Record<string, unknown>)._requireReviewBeforePublic = requireReview;
      }
    }
  } catch {
    // Fail-safe: if settings cannot be fetched due to transient DB connection timeout,
    // enforce the safest review requirement so unreviewed drafts are never leaked.
    requireReview = true;
  }

  const clauses: Where[] = [
    { status: { equals: "published" } },
    {
      or: [
        { publishedAt: { less_than_equal: new Date().toISOString() } },
        { publishedAt: { exists: false } },
      ],
    },
  ];
  if (requireReview) {
    clauses.push({
      or: [
        { translationStatus: { not_equals: "machine_draft" } },
        { translationStatus: { exists: false } },
      ],
    });
  }
  return { and: clauses };
};
export function calculateReadingTime(prose: string): number {
  return Math.max(1, Math.ceil(prose.trim().split(/\s+/).filter(Boolean).length / 200));
}

export const contentState: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
  collection,
}) => {
  const status = data.status ?? originalDoc?.status ?? "draft";
  const system = Boolean(
    req.context?.reviewApproval ||
    (req.context.scheduledPublish &&
      originalDoc?.status === "scheduled" &&
      status === "published") ||
    (req.context.sourceChangeFlag &&
      Object.keys(data).every((key) =>
        ["sourceChanged", "updatedAt"].includes(key),
      )),
  );
  if (
    req.user?.role !== "admin" &&
    !system &&
    (!["draft", "in_review"].includes(status) ||
      (originalDoc?.status &&
        !["draft", "in_review"].includes(originalDoc.status)))
  )
    await invalid(req, "status", "admin_required");
  if (status === "scheduled" && (!Number.isFinite(Date.parse(data.publishedAt ?? originalDoc?.publishedAt)) || Date.parse(data.publishedAt ?? originalDoc?.publishedAt) <= Date.now())) await invalid(req, "publishedAt", "schedule_required");
  if (["articles","videos"].includes(collection.slug) && status === "published" && (data.translationStatus ?? originalDoc?.translationStatus) === "machine_draft") {
    const settings = await req.payload.findGlobal({slug:"site-settings",req,overrideAccess:true});
    if(settings.requireReviewBeforePublic)await invalid(req,"translationStatus","review_required");
  }
  if (collection.slug === "articles") {
    if (data.summary === undefined || data.summary === null) {
      data.summary = originalDoc?.summary ?? "";
    }
    const prose = collectProse(data.body ?? originalDoc?.body).join(" ");
    data.readingTimeMinutes = calculateReadingTime(prose);
  }
  if (collection.slug === "videos") {
    const next = { ...originalDoc, ...data };
    if (next.duration && typeof next.duration === "string") {
      const parts = next.duration.trim().split(":").map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        data.durationSeconds = parts[0] * 60 + parts[1];
      } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        data.durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    } else if (typeof next.durationSeconds === "number" && !next.duration) {
      const mins = Math.floor(next.durationSeconds / 60);
      const secs = next.durationSeconds % 60;
      data.duration = `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    if (data.description && !data.summary) data.summary = data.description;
    if (data.summary && !data.description) data.description = data.summary;
    if (data.youtubeUrl !== undefined && !extractYouTubeId(data.youtubeUrl)) await invalid(req, "youtubeUrl", "youtube_invalid");
  }

  if (["articles", "videos"].includes(collection.slug) && req.user && req.user.role !== "admin" && !system) {
    if (data.status === "published" || data.status === "scheduled" || data.status === "archived") {
      throw new ValidationError({
        errors: [{ path: "status", message: "Editors are not permitted to publish, schedule, or archive content directly. Please submit for founder approval." }],
        req,
      });
    }

    if (originalDoc?.id) {
      if (originalDoc.status === "published" || originalDoc.status === "archived") {
        throw new ValidationError({
          errors: [{ path: "status", message: "Published or archived content cannot be edited directly by editors." }],
          req,
        });
      }

      const authorId = typeof originalDoc.author === "object" && originalDoc.author ? originalDoc.author.id : originalDoc.author;
      const submitterId = typeof originalDoc.submittedBy === "object" && originalDoc.submittedBy ? originalDoc.submittedBy.id : originalDoc.submittedBy;
      const isOwner =
        (authorId !== undefined && String(authorId) === String(req.user.id)) ||
        (submitterId !== undefined && String(submitterId) === String(req.user.id));

      if (!isOwner) {
        throw new ValidationError({
          errors: [{ path: "author", message: "You are not authorized to edit another contributor's content." }],
          req,
        });
      }

      // Preserve founder decisions and published metadata against editor manipulation
      data.author = originalDoc.author;
      data.submittedBy = originalDoc.submittedBy;
      if (originalDoc.reviewNotes !== undefined && data.reviewNotes === undefined) {
        data.reviewNotes = originalDoc.reviewNotes;
      }
      if (data.reviewDecision && data.reviewDecision !== originalDoc.reviewDecision) {
        data.reviewDecision = originalDoc.reviewDecision;
      }
      if (data.reviewNotes && data.reviewNotes !== originalDoc.reviewNotes) {
        data.reviewNotes = originalDoc.reviewNotes;
      }
      if (data.publishedAt && data.publishedAt !== originalDoc.publishedAt) {
        data.publishedAt = originalDoc.publishedAt;
      }
      if (data.featuredOrder !== undefined && data.featuredOrder !== originalDoc.featuredOrder) {
        data.featuredOrder = originalDoc.featuredOrder;
      }
    }
  }

  if (["articles", "videos"].includes(collection.slug) && req.user) {
    if (req.user.role !== "admin") {
      if (!originalDoc?.id) {
        data.author = req.user.id;
        data.submittedBy = req.user.id;
      }
    } else {
      if (!data.author && originalDoc?.author) data.author = originalDoc.author;
      if (!data.author && !originalDoc?.author) data.author = req.user.id;
    }

    if (!data.authorProfile && originalDoc?.authorProfile) {
      data.authorProfile = originalDoc.authorProfile;
    }

    if (!data.authorProfile && !originalDoc?.authorProfile) {
      const userAuthorProfile = (req.user as unknown as { authorProfile?: unknown })?.authorProfile;
      if (userAuthorProfile) {
        data.authorProfile = typeof userAuthorProfile === "object" && userAuthorProfile && "id" in userAuthorProfile
          ? (userAuthorProfile as { id: unknown }).id
          : userAuthorProfile;
      }
    }
  }

  // PRD & Founder Publishing Validation (P0 hard check for published/scheduled states)
  const isPublishTransition = (data.status === "published" || data.status === "scheduled") && originalDoc?.status !== data.status;
  const isDirectPublishCreate = !originalDoc?.id && (data.status === "published" || data.status === "scheduled");
  if (!system && (isPublishTransition || isDirectPublishCreate)) {
    const next = { ...originalDoc, ...data };
    if (collection.slug === "articles") {
      const missing: string[] = [];
      if (!next.title?.trim()) missing.push("Title");
      if (!next.language) missing.push("Language");
      if (!next.slug?.trim()) missing.push("Slug");
      if (!next.body) missing.push("Article Body");
      if (!next.topic) missing.push("Topic");
      if (!next.authorProfile && !next.author) missing.push("Author");
      if (missing.length > 0) {
        throw new ValidationError({
          errors: [{ path: "status", message: `Cannot publish yet: please complete the following required fields before publishing: ${missing.join(", ")}.` }],
          req,
        });
      }
    } else if (collection.slug === "videos") {
      const missing: string[] = [];
      if (!next.title?.trim()) missing.push("Title");
      if (!next.language) missing.push("Page Language");
      if (!next.spokenLanguage) missing.push("Spoken Language");
      if (!next.slug?.trim()) missing.push("Slug");
      if (!next.youtubeUrl?.trim() || !extractYouTubeId(next.youtubeUrl)) missing.push("Valid YouTube URL");
      if (!next.topic) missing.push("Topic");
      if (missing.length > 0) {
        throw new ValidationError({
          errors: [{ path: "status", message: `Cannot publish yet: please complete the following required fields before publishing: ${missing.join(", ")}.` }],
          req,
        });
      }
    }
  }

  if (status === "in_review" && req.user) {
    data.submittedBy = req.user.id;
    if (req.user.role !== "admin") {
      data.reviewDecision = "none";
    }
  }

  if (data.translationStatus === "reviewed" && !req.context.sourceChangeFlag) { data.reviewedBy = req.user?.id; data.reviewedAt = new Date().toISOString(); }
  if (data.translationStatus === "reviewed" && !req.context.sourceChangeFlag)
    data.sourceChanged = false;
  if (status === "scheduled" && !data.publishedAt && !originalDoc?.publishedAt)
    throw new Error("schedule_date_required");
  if (status === "published" && !data.publishedAt && !originalDoc?.publishedAt)
    data.publishedAt = new Date().toISOString();
  return data;
};

export const contentIdentity: CollectionBeforeValidateHook = async ({ data, originalDoc, req, collection }) => {
  if (!data) return data;
  if (!originalDoc?.id && !data.translationGroup) data.translationGroup = randomUUID();
  const next = { ...originalDoc, ...data };
  if ((!next.slug || !String(next.slug).trim()) && (next.title || next.name)) {
    data.slug = slugify(String(next.title || next.name));
    next.slug = data.slug;
  }
  if (typeof next.slug === "string" && (!next.slug.trim() || /[\s/?#%\\]/.test(next.slug))) await invalid(req, "slug", "slug_invalid");
  for (const field of ["slug", "translationGroup"] as const) {
    if (!next[field] || !next.language) continue;
    const duplicates = await req.payload.find({ collection: collection.slug, req, overrideAccess: true, depth: 0, limit: 1, where: { and: [{ [field]: { equals: next[field] } }, { language: { equals: next.language } }, ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : [])] } });
    if (duplicates.docs.length) await invalid(req, field, "unique_language");
  }
  return data;
};
