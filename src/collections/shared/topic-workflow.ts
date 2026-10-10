import { APIError, type CollectionBeforeValidateHook, type CollectionAfterChangeHook } from "payload";
import { canAccessEditorial } from "./auth-roles";
import { slugify } from "./slug";
import { invalidateCache } from "@/lib/data/cache-revalidate";
import { createFounderNotification, resolveFounderNotifications } from "@/lib/notifications";

export const topicState: CollectionBeforeValidateHook = ({ data, originalDoc, req }) => {
  if (!data) return data;
  if ((!data.slug || !String(data.slug).trim()) && data.name) data.slug = slugify(String(data.name));
  if (req.user?.role === "admin") return data;
  if (!canAccessEditorial(req.user)) throw new APIError("Founder or approved editor access required.", 403);
  if (originalDoc?.id) {
    const owner = typeof originalDoc.submittedBy === "object" ? originalDoc.submittedBy?.id : originalDoc.submittedBy;
    if (String(owner) !== String(req.user?.id) || originalDoc.status !== "draft") throw new APIError("Only your own eligible topic drafts may be changed.", 403);
    data.submittedBy = owner;
    data.reviewDecision = originalDoc.reviewDecision;
    data.reviewNotes = originalDoc.reviewNotes;
    data.reviewedBy = originalDoc.reviewedBy;
    data.reviewedAt = originalDoc.reviewedAt;
  } else {
    data.submittedBy = req.user?.id;
    data.reviewDecision = "none";
    data.reviewNotes = "";
  }
  data.status = data.status === "pending" || data.status === "published" ? "pending" : "draft";
  if (data.status === "pending") data.reviewDecision = "none";
  return data;
};

export const topicChanged: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  invalidateCache("cms:topics");
  invalidateCache("cms:library");
  if (doc.status === "pending" && previousDoc?.status !== "pending") {
    const actor = typeof doc.submittedBy === "object" ? doc.submittedBy?.id : doc.submittedBy;
    await createFounderNotification({ payload: req.payload, req, type: "topic_approval", title: "Topic Awaiting Approval", message: `${req.user?.name || "Editor"} submitted "${doc.name}" for approval.`, actorId: actor, targetCollection: "topics", targetId: doc.id, submissionRevision: doc.updatedAt, deduplicationKey: `topics:${doc.id}:submission:${previousDoc?.updatedAt || doc.updatedAt}`, link: "/admin/content-approvals" });
  }
  if (previousDoc?.status === "pending" && doc.status !== "pending") await resolveFounderNotifications({ payload: req.payload, req, targetCollection: "topics", targetId: doc.id });
  return doc;
};
