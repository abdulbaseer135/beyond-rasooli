import type { Access, FieldAccess, Where } from "payload";

export interface AuthUserLike {
  id?: string | number;
  role?: string;
  status?: string;
  [key: string]: unknown;
}

export function isAdmin(user: unknown): boolean {
  if (!user || typeof user !== "object") return false;
  const u = user as AuthUserLike;
  return u.role === "admin";
}

export function isApprovedEditor(user: unknown): boolean {
  if (!user || typeof user !== "object") return false;
  const u = user as AuthUserLike;
  return u.role === "editor" && u.status === "approved";
}

export function canAccessEditorial(user: unknown): boolean {
  return isAdmin(user) || isApprovedEditor(user);
}

/**
 * Access control for creating editorial content (Articles, Videos, Topics).
 * Only Founder or Approved Editor can create.
 */
export const editorialContentCreateAccess: Access = ({ req: { user } }) => {
  return canAccessEditorial(user);
};

/**
 * Access control for reading editorial content in CMS collections.
 * - Founder: can read everything.
 * - Approved Editor: can read all published content plus their own drafts/submissions.
 * - Public / Unauthenticated / Unapproved: handled via publicContentRead query or false.
 */
export const editorialContentUpdateAccess: Access = ({ req: { user }, data }) => {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (!isApprovedEditor(user)) return false;

  // Block editors from mutating documents to published or archived directly
  if (data?.status === "published" || data?.status === "archived" || data?.status === "scheduled") {
    return false;
  }

  // Row-level query constraint: an editor can ONLY update their own documents,
  // and only documents that are NOT already published or archived.
  const userId = user.id;
  const ownershipWhere: Where = {
    and: [
      {
        or: [
          { author: { equals: userId } },
          { submittedBy: { equals: userId } },
        ],
      },
      {
        status: {
          not_in: ["published", "archived"],
        },
      },
    ],
  };

  return ownershipWhere;
};

/**
 * Field-level access: only Founder (admin) can update this field.
 */
export const founderOnlyFieldUpdate: FieldAccess = ({ req: { user } }) => {
  return isAdmin(user);
};

/**
 * Field-level access: only Founder (admin) can create this field value directly.
 */
export const founderOnlyFieldCreate: FieldAccess = ({ req: { user } }) => {
  return isAdmin(user);
};
