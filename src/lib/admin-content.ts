import type { Payload } from "payload";
import type { User } from "@/payload-types";
import type { Where } from "payload";

export const editorialTypes = ["articles", "videos", "topics"] as const;
type Collection = typeof editorialTypes[number];
export interface DashboardItem {
  id: number | string;
  collection: Collection;
  type: "article" | "video" | "topic";
  title: string;
  status: string;
  reviewDecision?: string;
  reviewNotes?: string;
  contributor?: string;
  language?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}
export function dashboardWhere(collection: Collection, user: { id: number | string; role?: string }, status?: string): Where {
  const clauses: Where[] = [];
  if (user.role !== "admin") clauses.push(collection === "topics" ? { submittedBy: { equals: user.id } } : { or: [{ author: { equals: user.id } }, { submittedBy: { equals: user.id } }] });
  if (["rejected", "changes_requested"].includes(status || "")) clauses.push({ reviewDecision: { equals: status } });
  else if (status === "draft") clauses.push({ status: { equals: "draft" } }, { reviewDecision: { not_in: ["rejected", "changes_requested"] } });
  else if (["in_review", "published", "scheduled", "archived"].includes(status || "")) clauses.push({ status: { equals: collection === "topics" && status === "in_review" ? "pending" : status } });
  return clauses.length ? { and: clauses } : {};
}

export async function getDashboardContent(payload: Payload, user: User, params: Record<string, string | string[] | undefined>, approvals = false) {
  const type = typeof params.type === "string" && editorialTypes.includes(params.type as Collection) ? params.type as Collection : undefined;
  const status = typeof params.state === "string" ? params.state : approvals ? "in_review" : undefined;
  const page = Math.max(1, Math.min(10000, Math.trunc(Number(params.page)) || 1));
  const selected = type ? [type] : editorialTypes;
  // Each type has its own bounded page; every record is reachable without loading the full library.
  const results = await Promise.all(selected.map(collection => payload.find({ collection, user, overrideAccess: false, fallbackLocale: "en", depth: 1, limit: 10, page, sort: "-updatedAt", where: dashboardWhere(collection, user, status) })));
  const items: DashboardItem[] = results.flatMap((result, index) => result.docs.map((document): DashboardItem => {
    const doc = document as unknown as Record<string, unknown>;
    const contributor = (doc.submittedBy || doc.author) as { name?: string; email?: string } | undefined;
    return { id: document.id, collection: selected[index], type: selected[index] === "topics" ? "topic" : selected[index] === "videos" ? "video" : "article", title: String(doc.title || doc.name || doc.slug || document.id), status: doc.status === "pending" ? "in_review" : String(doc.status), reviewDecision: doc.reviewDecision as string, reviewNotes: doc.reviewNotes as string, contributor: contributor && typeof contributor === "object" ? contributor.name || contributor.email : undefined, language: doc.language as string, slug: doc.slug as string, createdAt: doc.createdAt as string, updatedAt: doc.updatedAt as string, publishedAt: doc.publishedAt as string };
  })).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  const total = results.reduce((sum, result) => sum + result.totalDocs, 0);
  return { items, total, page, hasNextPage: results.some(result => result.hasNextPage), type, status };
}

export async function dashboardCount(payload: Payload, user: User, status: string) {
  const counts = await Promise.all(editorialTypes.map(collection => payload.count({ collection, user, overrideAccess: false, where: dashboardWhere(collection, user, status) })));
  return counts.reduce((sum, count) => sum + count.totalDocs, 0);
}
