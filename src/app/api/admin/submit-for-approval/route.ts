import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { headers } from "next/headers";
import { createFounderNotification } from "@/lib/notifications";

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
    }

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot submit yet: the following required fields are missing: ${missing.join(", ")}.`,
        },
        { status: 400 },
      );
    }

    const isArticle = collection === "articles";
    const labelPrefix = isArticle ? "Article" : "Video";
    const isResubmission = doc.reviewDecision === "changes_requested";

    // Update document status to in_review
    const updated = await payload.update({
      collection: collection as AllowedCollection,
      id,
      user,
      overrideAccess: true,
      data: {
        status: "in_review",
        submittedBy: user.id,
        reviewDecision: "none",
      } as Record<string, unknown>,
    });

    // Generate Founder notification
    const editorName = user.name || user.email || "Editor";
    const notifType = isResubmission
      ? isArticle
        ? "article_resubmission"
        : "video_resubmission"
      : isArticle
        ? "article_approval"
        : "video_approval";

    const notifTitle = isResubmission
      ? `${labelPrefix} Resubmission`
      : `New ${labelPrefix} Awaiting Approval`;

    const notifMessage = isResubmission
      ? `${editorName} resubmitted "${doc.title || "Untitled"}" for your approval.`
      : `${editorName} submitted "${doc.title || "Untitled"}" for your approval.`;

    await createFounderNotification({
      payload,
      type: notifType,
      title: notifTitle,
      message: notifMessage,
      actorId: user.id,
      targetCollection: collection as AllowedCollection,
      targetId: id,
      submissionRevision: `rev-${Date.now()}`,
      deduplicationKey: `${collection}:${id}:submit:${Date.now()}`,
      link: `/admin/content-approvals?type=${isArticle ? "article" : "video"}&id=${id}`,
    });

    return NextResponse.json({
      success: true,
      message: `Your ${labelPrefix.toLowerCase()} has been submitted successfully and is awaiting Founder approval.`,
      doc: updated,
    });
  } catch (err: unknown) {
    console.error("Submit for approval error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
