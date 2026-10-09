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
        (!authorId && !submitterId);

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
        { error: "This content is already awaiting founder approval." },
        { status: 400 },
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

    const isArticle = collection === "articles";
    const labelPrefix = isArticle ? "Article" : "Video";
    const isResubmission = doc.reviewDecision === "changes_requested";

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

    // Generate Founder notification with stable deduplication key
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

    const submissionRevision = `rev-${doc.updatedAt || Date.now()}`;
    const deduplicationKey = `${collection}:${id}:submit:${submissionRevision}`;

    await createFounderNotification({
      payload,
      type: notifType,
      title: notifTitle,
      message: notifMessage,
      actorId: user.id,
      targetCollection: collection as AllowedCollection,
      targetId: id,
      submissionRevision,
      deduplicationKey,
      link: `/admin/content-approvals?type=${isArticle ? "article" : "video"}&id=${id}`,
    });

    return NextResponse.json({
      success: true,
      message: "Your content has been submitted and is awaiting founder approval.",
      doc: updated,
    });
  } catch (err: unknown) {
    console.error("Submit for approval error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
