import { withContentLock } from "@/lib/content-lock";
import { NextResponse } from "next/server";
import { APIError, getPayload } from "payload";
import configPromise from "@payload-config";
import { headers } from "next/headers";

type AllowedCollection = "articles" | "videos";

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { user } = await payload.auth({ headers: await headers() });

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401 },
      );
    }

    // Verify editor account is approved
    if (user.role !== "admin" && (user.role !== "editor" || user.status !== "approved")) {
      return NextResponse.json(
        { error: "Forbidden. Only approved editors may submit content for review." },
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

    if (!["articles", "videos", "topics"].includes(collection)) {
      return NextResponse.json(
        { error: `Invalid collection: ${collection}` },
        { status: 400 },
      );
    }

    return await withContentLock(payload, `${collection}:${id}`, async () => {
    if (collection === "topics") {
      const topic = await payload.findByID({ collection: "topics", id, locale: "all", user, overrideAccess: false });
      const owner = typeof topic.submittedBy === "object" ? topic.submittedBy?.id : topic.submittedBy;
      if (user.role !== "admin" && String(owner) !== String(user.id)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      if (topic.status === "pending") return NextResponse.json({ success: true, doc: topic });
      if (topic.status !== "draft") return NextResponse.json({ error: "Only topic drafts may be submitted." }, { status: 400 });
      const names = topic.name as unknown as Record<string, string>;
      const locale = (["en", "ps", "fa"] as const).find(value => names[value]?.trim());
      if (!locale) return NextResponse.json({ error: "Topic name is required." }, { status: 400 });
      const updated = await payload.update({ collection: "topics", id, locale, user, overrideAccess: false, data: { status: "pending" } });
      return NextResponse.json({ success: true, doc: updated });
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

    // Ownership verification: editors may only submit their own documents
    if (user.role !== "admin") {
      const docAny = doc as unknown as Record<string, unknown>;
      const authorId =
        typeof docAny.author === "object" && docAny.author
          ? (docAny.author as { id: unknown }).id
          : docAny.author;
      const submitterId =
        typeof docAny.submittedBy === "object" && docAny.submittedBy
          ? (docAny.submittedBy as { id: unknown }).id
          : docAny.submittedBy;

      const isOwner =
        (authorId !== undefined && String(authorId) === String(user.id)) ||
        (submitterId !== undefined && String(submitterId) === String(user.id)) ||
        false;

      if (!isOwner) {
        return NextResponse.json(
          { error: "Forbidden. You can only submit your own content for approval." },
          { status: 403 },
        );
      }
    }

    // State verification: must be in a valid draft state
    if (doc.status === "published" || doc.status === "archived") {
      return NextResponse.json(
        { error: "Cannot submit published or archived content directly." },
        { status: 400 },
      );
    }

    if (doc.status === "in_review" && doc.reviewDecision !== "changes_requested") {
      return NextResponse.json(
        { success: true, message: "This content is already awaiting founder approval.", doc },
      );
    }

    // Validation before submission
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
          error: `Cannot submit yet: the following required fields are missing: ${missing.join(", ")}.`,
        },
        { status: 400 },
      );
    }

    // Update document status to in_review and record authenticated submitter
    const updated = await payload.update({
      collection: collection as AllowedCollection,
      id,
      user,
      overrideAccess: true,
      data: {
        status: "in_review",
        submittedBy: user.id,
        author: (doc as any).author || user.id,
        reviewDecision: "none",
      } as Record<string, unknown>,
    });

    return NextResponse.json({
      success: true,
      message: "Your content has been submitted and is awaiting founder approval.",
      doc: updated,
    });
    });
  } catch (err: unknown) {
    console.error("Submit for approval error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: err instanceof APIError ? err.status : 500 });
  }
}
