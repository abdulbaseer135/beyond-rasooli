import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { headers } from "next/headers";

type AllowedCollection = "articles" | "videos" | "topics" | "collections";

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { user } = await payload.auth({ headers: await headers() });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Founder administrator privileges required." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { action, collection, id, notes } = body || {};

    if (!action || !collection || !id) {
      return NextResponse.json(
        { error: "Missing required parameters: action, collection, id." },
        { status: 400 },
      );
    }

    const validCollections: AllowedCollection[] = [
      "articles",
      "videos",
      "topics",
      "collections",
    ];

    if (!validCollections.includes(collection as AllowedCollection)) {
      return NextResponse.json(
        { error: `Invalid collection: ${collection}` },
        { status: 400 },
      );
    }

    const doc = await payload.findByID({
      collection: collection as AllowedCollection,
      id,
      overrideAccess: true,
    });

    if (!doc) {
      return NextResponse.json(
        { error: `Document ${id} not found in ${collection}.` },
        { status: 404 },
      );
    }

    const contentTitle = (doc as any).title || (doc as any).name || id;

    const { resolveFounderNotifications } = await import("@/lib/notifications");

    switch (action) {
      case "approve": {
        if (collection === "topics") {
          await payload.update({
            collection: "topics" as any,
            id,
            overrideAccess: true,
            data: {
              status: "published",
            } as any,
          });
          return NextResponse.json({
            success: true,
            message: `Topic "${contentTitle}" has been approved and published.`,
          });
        }

        // For articles, videos, collections:
        await payload.update({
          collection: collection as any,
          id,
          user,
          overrideAccess: true,
          context: {
            reviewApproval: true,
          },
          data: {
            status: "published",
            publishedAt: new Date().toISOString(),
            reviewDecision: "approved",
            reviewNotes: "",
          } as any,
        });

        const { invalidateCache } = await import("@/lib/data/cache-revalidate");
        invalidateCache(`cms:${collection}`);
        invalidateCache("cms:articles");
        invalidateCache("cms:videos");
        invalidateCache("cms:library");

        await resolveFounderNotifications({
          payload,
          targetCollection: collection as any,
          targetId: id,
        });

        const slug = (doc as any).slug || id;
        const locale = (doc as any).language || "en";
        const section = collection === "articles" ? "read" : collection === "videos" ? "watch" : collection;
        const liveUrl = `/${locale}/${section}/${slug}`;

        return NextResponse.json({
          success: true,
          message: `Content "${contentTitle}" approved and published.`,
          liveUrl,
        });
      }

      case "request-changes": {
        if (collection === "topics") {
          return NextResponse.json({
            success: true,
            message: "Topics can be approved or kept in draft.",
          });
        }

        await payload.update({
          collection: collection as any,
          id,
          user,
          overrideAccess: true,
          data: {
            status: "draft",
            reviewDecision: "changes_requested",
            reviewNotes: typeof notes === "string" ? notes.trim() : "",
          } as any,
        });

        await resolveFounderNotifications({
          payload,
          targetCollection: collection as any,
          targetId: id,
        });

        return NextResponse.json({
          success: true,
          message: `Changes requested for "${contentTitle}". Feedback sent to editor.`,
        });
      }

      case "reject": {
        if (collection === "topics") {
          await payload.update({
            collection: "topics" as any,
            id,
            user,
            overrideAccess: true,
            data: {
              status: "draft",
            } as any,
          });
          return NextResponse.json({
            success: true,
            message: `Topic proposal "${contentTitle}" has been rejected.`,
          });
        }

        await payload.update({
          collection: collection as any,
          id,
          user,
          overrideAccess: true,
          data: {
            status: "draft",
            reviewDecision: "rejected",
            reviewNotes: typeof notes === "string" ? notes.trim() : "",
          } as any,
        });

        await resolveFounderNotifications({
          payload,
          targetCollection: collection as any,
          targetId: id,
        });

        return NextResponse.json({
          success: true,
          message: `Content "${contentTitle}" has been rejected.`,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (error: any) {
    console.error("Content review API error:", error);
    const message =
      error?.data?.errors?.[0]?.message ||
      error?.message ||
      "Failed to process review action.";
    return NextResponse.json(
      { error: message },
      { status: 400 },
    );
  }
}
