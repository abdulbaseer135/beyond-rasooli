import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { headers } from "next/headers";

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
    const { action, userId, notes } = body || {};

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: userId and action." },
        { status: 400 },
      );
    }

    const targetUser = await payload.findByID({
      collection: "users",
      id: userId,
      overrideAccess: true,
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found." },
        { status: 404 },
      );
    }

    // Safety: Protect founder account from demotion/suspension/deletion
    if (targetUser.role === "admin") {
      const adminCount = await payload.count({
        collection: "users",
        where: { role: { equals: "admin" } },
        overrideAccess: true,
      });
      if (adminCount.totalDocs <= 1 && (action === "suspend" || action === "remove")) {
        return NextResponse.json(
          { error: "Cannot modify or remove the permanent founder account." },
          { status: 400 },
        );
      }
    }

    // Verify target account is an editor (except for founder self-protection checks)
    if (targetUser.role !== "editor" && action !== "suspend" && action !== "remove") {
      return NextResponse.json(
        { error: "Only contributor editor accounts can be approved or rejected." },
        { status: 400 },
      );
    }

    const { resolveFounderNotifications } = await import("@/lib/notifications");

    switch (action) {
      case "approve": {
        // Idempotency: if already approved, safely return success
        if (targetUser.status === "approved") {
          return NextResponse.json({
            success: true,
            message: `Editor ${targetUser.name} is already approved and active.`,
          });
        }

        // Validate state transition: only pending accounts can be approved
        if (targetUser.status !== "pending") {
          return NextResponse.json(
            {
              error: `Cannot approve editor account in "${targetUser.status}" status. Only pending applications can be approved.`,
            },
            { status: 400 },
          );
        }

        await payload.update({
          collection: "users",
          id: userId,
          overrideAccess: true,
          data: {
            status: "approved",
            rejectionReason: "",
          },
        });
        await resolveFounderNotifications({
          payload,
          targetCollection: "users",
          targetId: userId,
        });
        return NextResponse.json({
          success: true,
          message: `Editor ${targetUser.name} has been approved and activated.`,
        });
      }

      case "reject": {
        // Idempotency: if already rejected, safely return success
        if (targetUser.status === "rejected") {
          return NextResponse.json({
            success: true,
            message: `Editor application for ${targetUser.name} is already rejected.`,
          });
        }

        // Validate state transition: only pending accounts can be rejected
        if (targetUser.status !== "pending") {
          return NextResponse.json(
            {
              error: `Cannot reject editor account in "${targetUser.status}" status. Only pending applications can be rejected.`,
            },
            { status: 400 },
          );
        }

        await payload.update({
          collection: "users",
          id: userId,
          overrideAccess: true,
          data: {
            status: "rejected",
            rejectionReason: typeof notes === "string" ? notes.trim() : "",
          },
        });
        await resolveFounderNotifications({
          payload,
          targetCollection: "users",
          targetId: userId,
        });
        return NextResponse.json({
          success: true,
          message: `Editor application for ${targetUser.name} has been rejected.`,
        });
      }

      case "suspend": {
        if (targetUser.role === "admin") {
          return NextResponse.json(
            { error: "Cannot suspend administrator accounts." },
            { status: 400 },
          );
        }

        if (targetUser.status === "suspended") {
          return NextResponse.json({
            success: true,
            message: `Editor ${targetUser.name} is already suspended.`,
          });
        }

        await payload.update({
          collection: "users",
          id: userId,
          overrideAccess: true,
          data: {
            status: "suspended",
          },
        });
        return NextResponse.json({
          success: true,
          message: `Editor ${targetUser.name} has been suspended. Editorial access revoked.`,
        });
      }

      case "reactivate": {
        if (targetUser.status === "approved") {
          return NextResponse.json({
            success: true,
            message: `Editor ${targetUser.name} is already active.`,
          });
        }

        if (targetUser.status !== "suspended") {
          return NextResponse.json(
            {
              error: `Cannot reactivate editor in "${targetUser.status}" status. Only suspended accounts can be reactivated.`,
            },
            { status: 400 },
          );
        }

        await payload.update({
          collection: "users",
          id: userId,
          overrideAccess: true,
          data: {
            status: "approved",
          },
        });
        return NextResponse.json({
          success: true,
          message: `Editor ${targetUser.name} has been reactivated.`,
        });
      }

      case "remove": {
        // If the editor has authored published articles, preserve authorship attribution
        const hasPublishedArticles = await payload.count({
          collection: "articles",
          where: { author: { equals: userId } },
          overrideAccess: true,
        });

        const hasPublishedVideos = await payload.count({
          collection: "videos",
          where: { author: { equals: userId } },
          overrideAccess: true,
        });

        if (hasPublishedArticles.totalDocs > 0 || hasPublishedVideos.totalDocs > 0) {
          // Soft-delete/suspend to preserve foreign keys and public author byline integrity
          await payload.update({
            collection: "users",
            id: userId,
            overrideAccess: true,
            data: {
              status: "suspended",
              rejectionReason: "Account permanently revoked by founder. Content authorship preserved.",
            },
          });
          return NextResponse.json({
            success: true,
            message: `Editor ${targetUser.name} access revoked. Historical author attribution preserved on published content.`,
          });
        }

        // If no published content, safe hard delete
        await payload.delete({
          collection: "users",
          id: userId,
          overrideAccess: true,
        });

        return NextResponse.json({
          success: true,
          message: `Editor account ${targetUser.name} has been removed.`,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Editor management API error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
