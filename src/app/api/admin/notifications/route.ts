import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { headers } from "next/headers";
import {
  getFounderNotifications,
  formatRelativeTime,
} from "@/lib/notifications";
import type { Notification } from "@/payload-types";

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { user } = await payload.auth({ headers: await headers() });

    // Strict Founder (Admin) Authorization
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Founder administrator privileges required." },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get("filter") || "all") as
      | "all"
      | "unread"
      | "pending"
      | "resolved";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "15", 10) || 15),
    );

    const result = await getFounderNotifications({
      payload,
      userId: user.id,
      filter,
      page,
      limit,
    });

    const items = result.docs.map((doc: Notification) => {
      let actorName: string | undefined;
      let actorEmail: string | undefined;
      if (typeof doc.actor === "object" && doc.actor) {
        actorName = doc.actor.name;
        actorEmail = doc.actor.email;
      }

      return {
        id: doc.id,
        type: doc.type,
        title: doc.title,
        message: doc.message,
        relativeTime: formatRelativeTime(doc.createdAt),
        createdAt: doc.createdAt,
        readAt: doc.readAt,
        isRead: Boolean(doc.readAt),
        resolvedAt: doc.resolvedAt,
        isResolved: Boolean(doc.resolvedAt),
        link: doc.link,
        actor: actorName
          ? { name: actorName, email: actorEmail }
          : undefined,
        targetCollection: doc.targetCollection,
        targetId: doc.targetId,
        submissionRevision: doc.submissionRevision,
      };
    });

    return NextResponse.json({
      docs: items,
      totalDocs: result.totalDocs,
      page: result.page || 1,
      totalPages: result.totalPages || 1,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    console.error("Error fetching founder notifications:", error);
    return NextResponse.json(
      { error: "Failed to retrieve notifications." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { user } = await payload.auth({ headers: await headers() });

    // Strict Founder (Admin) Authorization
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Founder administrator privileges required." },
        { status: 403 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, id } = body || {};

    if (action === "mark-read" && id) {
      await payload.update({
        collection: "notifications",
        id,
        overrideAccess: true,
        data: {
          readAt: new Date().toISOString(),
        },
      });
    } else if (action === "mark-all-read") {
      const unread = await payload.find({
        collection: "notifications",
        where: {
          and: [
            { recipient: { equals: user.id } },
            {
              or: [
                { readAt: { exists: false } },
                { readAt: { equals: null } },
              ],
            },
          ],
        },
        overrideAccess: true,
        limit: 200,
      });

      const now = new Date().toISOString();
      for (const notif of unread.docs) {
        await payload.update({
          collection: "notifications",
          id: notif.id,
          overrideAccess: true,
          data: {
            readAt: now,
          },
        });
      }
    } else {
      return NextResponse.json(
        { error: "Invalid action. Supported actions: mark-read, mark-all-read." },
        { status: 400 },
      );
    }

    // Return updated unread count
    const countRes = await payload.count({
      collection: "notifications",
      where: {
        and: [
          { recipient: { equals: user.id } },
          {
            or: [
              { readAt: { exists: false } },
              { readAt: { equals: null } },
            ],
          },
        ],
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      unreadCount: countRes.totalDocs,
    });
  } catch (error) {
    console.error("Error updating founder notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification." },
      { status: 500 },
    );
  }
}
