import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { headers } from "next/headers";
import { invalidateCache } from "@/lib/data/cache-revalidate";
import { resolveFounderNotifications } from "@/lib/notifications";

type AllowedCollection = "articles" | "videos";

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { user } = await payload.auth({ headers: await headers() });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Founder administrator privileges required to publish." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { collection, id } = body || {};

    if (!collection || !id) {
      return NextResponse.json(
        { error: "Missing required parameters: collection, id." },
        { status: 400 },
      );
    }

    if (!["articles", "videos"].includes(collection)) {
      return NextResponse.json(
        { error: `Invalid collection for publishing: ${collection}` },
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

    // Server-side validation of required publishing fields
    const missing: string[] = [];
    if (!doc.title || !String(doc.title).trim()) missing.push("Title");
    if (!doc.language) missing.push("Language");
    if (!doc.topic) missing.push("Topic");

    if (collection === "articles") {
      const art = doc as unknown as Record<string, unknown>;
      if (!art.body) missing.push("Article Body");
    } else if (collection === "videos") {
      const vid = doc as unknown as Record<string, unknown>;
      if (!vid.youtubeUrl || !String(vid.youtubeUrl).trim()) missing.push("YouTube URL");
      if (!vid.spokenLanguage) missing.push("Spoken Language");
    }

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot publish yet: the following required fields are missing: ${missing.join(", ")}.`,
        },
        { status: 400 },
      );
    }

    const nowIso = new Date().toISOString();

    const updated = await payload.update({
      collection: collection as AllowedCollection,
      id,
      user,
      overrideAccess: true,
      context: {
        reviewApproval: true,
      },
      data: {
        status: "published",
        publishedAt: nowIso,
        reviewDecision: "approved",
        reviewNotes: "",
      } as Record<string, unknown>,
    });

    // Invalidate caches immediately
    invalidateCache(`cms:${collection}`);
    invalidateCache("cms:articles");
    invalidateCache("cms:videos");
    invalidateCache("cms:library");

    // Resolve any pending founder notifications for this document
    await resolveFounderNotifications({
      payload,
      targetCollection: collection as AllowedCollection,
      targetId: id,
    });

    const slug = updated.slug || String(id);
    const locale = updated.language || "en";
    const section = collection === "articles" ? "read" : "watch";
    const liveUrl = `/${locale}/${section}/${slug}`;

    return NextResponse.json({
      success: true,
      message: `${collection === "articles" ? "Article" : "Video"} published successfully!`,
      liveUrl,
      doc: updated,
    });
  } catch (err: unknown) {
    console.error("Direct publish error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
