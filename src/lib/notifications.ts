import type { Payload, Where } from "payload";

export type NotificationType =
  | "editor_registration"
  | "article_approval"
  | "video_approval"
  | "article_resubmission"
  | "video_resubmission";

export interface CreateNotificationParams {
  payload: Payload;
  type: NotificationType;
  title: string;
  message: string;
  actorId?: number | string | null;
  targetCollection?: "users" | "articles" | "videos";
  targetId?: number | string | null;
  submissionRevision?: string | null;
  deduplicationKey: string;
  link?: string;
  req?: any;
}

/**
 * Creates a notification for all Founder (admin) accounts.
 * Idempotent: Skips if deduplicationKey already exists.
 */
export async function createFounderNotification({
  payload,
  type,
  title,
  message,
  actorId,
  targetCollection,
  targetId,
  submissionRevision,
  deduplicationKey,
  link,
  req,
}: CreateNotificationParams) {
  try {
    // 1. Find all founder/admin users
    const founders = await payload.find({
      collection: "users",
      where: { role: { equals: "admin" } },
      overrideAccess: true,
      limit: 10,
      req,
    });

    if (!founders.docs.length) {
      return [];
    }

    const createdNotifications = [];

    for (const founder of founders.docs) {
      const scopedKey = `${founder.id}:${deduplicationKey}`;

      // Check for existing notification with this deduplication key
      const existing = await payload.find({
        collection: "notifications",
        where: { deduplicationKey: { equals: scopedKey } },
        overrideAccess: true,
        limit: 1,
        req,
      });

      if (existing.docs.length > 0) {
        continue;
      }

      const notifData = {
        recipient: founder.id,
        type,
        title,
        message,
        actor: actorId
          ? typeof actorId === "number"
            ? actorId
            : Number(actorId) || undefined
          : undefined,
        targetCollection,
        targetId: targetId ? String(targetId) : undefined,
        submissionRevision: submissionRevision || undefined,
        deduplicationKey: scopedKey,
        link: link || undefined,
      };

      let notif;
      try {
        notif = await payload.create({
          collection: "notifications",
          overrideAccess: true,
          data: notifData,
          req,
        });
      } catch (err: any) {
        // If actor FK constraint fails (e.g. uncommitted transaction or deferred), retry without actor
        if (err?.code === "23503" || err?.message?.includes("foreign key")) {
          notif = await payload.create({
            collection: "notifications",
            overrideAccess: true,
            data: {
              ...notifData,
              actor: undefined,
            },
            req,
          });
        } else {
          throw err;
        }
      }

      createdNotifications.push(notif);
    }

    return createdNotifications;
  } catch (error) {
    console.error("Failed to create founder notification:", error);
    return [];
  }
}

/**
 * Marks notifications associated with a target as resolved (e.g. after approval/rejection).
 */
export async function resolveFounderNotifications({
  payload,
  targetCollection,
  targetId,
}: {
  payload: Payload;
  targetCollection: "users" | "articles" | "videos";
  targetId: number | string;
}) {
  try {
    const stringId = String(targetId);
    const pending = await payload.find({
      collection: "notifications",
      where: {
        and: [
          { targetCollection: { equals: targetCollection } },
          { targetId: { equals: stringId } },
          { resolvedAt: { exists: false } },
        ],
      },
      overrideAccess: true,
      limit: 50,
    });

    const now = new Date().toISOString();
    for (const notif of pending.docs) {
      await payload.update({
        collection: "notifications",
        id: notif.id,
        overrideAccess: true,
        data: {
          resolvedAt: now,
        },
      });
    }
  } catch (error) {
    console.error("Failed to resolve founder notifications:", error);
  }
}

/**
 * Fetches notifications for a founder with optional status filters and pagination.
 */
export async function getFounderNotifications({
  payload,
  userId,
  filter = "all",
  page = 1,
  limit = 20,
}: {
  payload: Payload;
  userId: number | string;
  filter?: "all" | "unread" | "pending" | "resolved";
  page?: number;
  limit?: number;
}) {
  const baseClauses: Where[] = [{ recipient: { equals: userId } }];

  if (filter === "unread") {
    baseClauses.push({
      or: [
        { readAt: { exists: false } },
        { readAt: { equals: null } },
      ],
    });
  } else if (filter === "pending") {
    baseClauses.push({
      or: [
        { resolvedAt: { exists: false } },
        { resolvedAt: { equals: null } },
      ],
    });
  } else if (filter === "resolved") {
    baseClauses.push({
      and: [
        { resolvedAt: { exists: true } },
        { resolvedAt: { not_equals: null } },
      ],
    });
  }

  const [result, unreadCountResult] = await Promise.all([
    payload.find({
      collection: "notifications",
      where: { and: baseClauses },
      overrideAccess: true,
      sort: "-createdAt",
      page,
      limit,
    }),
    payload.count({
      collection: "notifications",
      where: {
        and: [
          { recipient: { equals: userId } },
          {
            or: [
              { readAt: { exists: false } },
              { readAt: { equals: null } },
            ],
          },
        ],
      },
      overrideAccess: true,
    }),
  ]);

  return {
    ...result,
    unreadCount: unreadCountResult.totalDocs,
  };
}

/**
 * Formats ISO timestamps into friendly relative strings (e.g. "5m ago", "2h ago", "yesterday").
 */
export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "just now";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
