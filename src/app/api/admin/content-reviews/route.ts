import { withContentLock } from "@/lib/content-lock";
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

    return await withContentLock(payload, `${collection}:${id}`, async () => {
    const doc = await payload.findByID({
      collection: collection as AllowedCollection,
      id,
      locale: collection === "topics" ? "all" : undefined,
      overrideAccess: true,
    });

    if (!doc) {
      return NextResponse.json(
        { error: `Document ${id} not found in ${collection}.` },
        { status: 404 },
      );
    }

    const names = (doc as any).name;
    const topicLocale = names && typeof names === "object" ? (["en", "ps", "fa"] as const).find(locale => names[locale]?.trim()) : "en";
    const contentTitle = (doc as any).title || (names && typeof names === "object" ? names[topicLocale || "en"] : names) || id;

    const { resolveFounderNotifications } = await import("@/lib/notifications");

    switch (action) {
      case "approve": {
        if (collection === "topics") {
          if (doc.status === "published") return NextResponse.json({ success: true });
          if ((doc as any).status !== "pending") {
            return NextResponse.json(
              { error: `Topic is not awaiting approval (current status: ${(doc as any).status}).` },
              { status: 400 },
            );
          }
          await payload.update({
            collection: "topics" as any,
            locale: topicLocale,
            id,
            user,
            overrideAccess: true,
            data: {
              status: "published", reviewDecision: "approved", reviewNotes: "", reviewedBy: user.id, reviewedAt: new Date().toISOString(),
            } as any,
          });
          return NextResponse.json({
            success: true,
            message: `Topic "${contentTitle}" has been approved and published.`,
          });
        }

        if (doc.status === "published") return NextResponse.json({ success: true });
        // For articles and videos: verify the document is actually awaiting review
        if ((doc as any).status !== "in_review") {
          return NextResponse.json(
            {
              error: `Document is not awaiting approval. Current status is "${(doc as any).status}".`,
            },
            { status: 400 },
          );
        }

        // Concurrency check: if expectedUpdatedAt was supplied, ensure draft has not been modified
        const { expectedUpdatedAt } = body || {};
        if (expectedUpdatedAt && (doc as any).updatedAt !== expectedUpdatedAt) {
          return NextResponse.json(
            {
              error:
                "This document has been updated by the editor since it was loaded. Please review the latest revision before approving.",
            },
            { status: 409 },
          );
        }

        // Validate required publication fields
        const missing: string[] = [];
        const docAny = doc as unknown as Record<string, unknown>;
        if (!docAny.title || !String(docAny.title).trim()) missing.push("Title");
        if (!docAny.language) missing.push("Language");
        if (!docAny.topic) missing.push("Topic");

        if (collection === "articles") {
          if (!docAny.body) missing.push("Article Body");
          if (!docAny.slug || !String(docAny.slug).trim()) missing.push("Slug");
        } else if (collection === "videos") {
          const { extractYouTubeId } = await import("@/lib/youtube");
          if (!docAny.youtubeUrl || !extractYouTubeId(String(docAny.youtubeUrl))) {
            missing.push("Valid YouTube URL");
          }
          if (!docAny.spokenLanguage) missing.push("Spoken Language");
          if (!docAny.slug || !String(docAny.slug).trim()) missing.push("Slug");
        }

        if (missing.length > 0) {
          return NextResponse.json(
            {
              error: `Cannot approve and publish: the following required fields are missing: ${missing.join(", ")}.`,
            },
            { status: 400 },
          );
        }

        const nowIso = new Date().toISOString();

        // Preserve author attribution and record founder approval metadata
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
            publishedAt: docAny.publishedAt || nowIso,
            reviewDecision: "approved",
            reviewNotes: "",
            reviewedBy: user.id,
            reviewedAt: nowIso,
            author: docAny.author || docAny.submittedBy || user.id,
            submittedBy: docAny.submittedBy || user.id,
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
          await payload.update({ collection: "topics", locale: topicLocale, id, user, overrideAccess: true, data: { status: "draft", reviewDecision: "changes_requested", reviewNotes: typeof notes === "string" ? notes.trim() : "" } });
          return NextResponse.json({ success: true });
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
            locale: topicLocale,
            id,
            user,
            overrideAccess: true,
            data: {
              status: "draft", reviewDecision: "rejected", reviewNotes: typeof notes === "string" ? notes.trim() : "", reviewedBy: user.id, reviewedAt: new Date().toISOString(),
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
    });
  } catch (error: any) {
    console.error("Content review API error:", error);
    const message =
      error?.data?.errors?.[0]?.message ||
      error?.message ||
      "Failed to process review action.";
    return NextResponse.json(
      { error: message },
      { status: error?.status || 400 },
    );
  }
}
