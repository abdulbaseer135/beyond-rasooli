"use client";

import React, { useState } from "react";
import { useDocumentInfo, useForm, useFormFields } from "@payloadcms/ui";
import {
  CheckCircle2,
  Clock,
  Eye,
  Send,
  AlertTriangle,
  ExternalLink,
  Loader2,
  FileText,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface PublishControlsClientProps {
  userRole: string;
  userId?: string;
  userName?: string;
  collectionSlug: string;
  adminLocale: string;
}

export function PublishControlsClient({
  userRole,
  userId,
  collectionSlug,
}: PublishControlsClientProps) {
  const isFounder = userRole === "admin";
  const { id } = useDocumentInfo();
  const { dispatchFields, submit } = useForm();

  // Read current form field values
  const currentStatus =
    (useFormFields(([f]) => f.status?.value as string | undefined)) || "draft";
  const title = useFormFields(([f]) => f.title?.value as string | undefined);
  const slug = useFormFields(([f]) => f.slug?.value as string | undefined);
  const language =
    (useFormFields(([f]) => f.language?.value as string | undefined)) || "en";
  const publishedAt = useFormFields(([f]) => f.publishedAt?.value as string | undefined);
  const reviewDecision = useFormFields(([f]) => f.reviewDecision?.value as string | undefined);
  const reviewNotes = useFormFields(([f]) => f.reviewNotes?.value as string | undefined);

  // Article specific fields
  const topic = useFormFields(([f]) => f.topic?.value);
  const body = useFormFields(([f]) => f.body?.value);

  // Video specific fields
  const youtubeUrl = useFormFields(([f]) => f.youtubeUrl?.value as string | undefined);
  const spokenLanguage = useFormFields(([f]) => f.spokenLanguage?.value as string | undefined);

  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    text: string;
    liveUrl?: string;
  } | null>(null);

  const isArticle = collectionSlug === "articles";
  const itemTypeLabel = isArticle ? "Article" : "Video";
  const publicSection = isArticle ? "read" : "watch";

  // Construct live URL if published
  const liveSlug = slug || (id ? String(id) : "");
  const liveUrl = liveSlug ? `/${language}/${publicSection}/${liveSlug}` : undefined;

  // Validate required fields before publish or submission
  const validateFields = (): string[] => {
    const errors: string[] = [];
    if (!title || !title.trim()) errors.push("Title is required");
    if (!language) errors.push("Language is required");
    if (!topic) errors.push("Topic is required");

    if (isArticle) {
      if (!body) errors.push("Article Body is required");
    } else {
      if (!youtubeUrl || !youtubeUrl.trim()) errors.push("YouTube URL is required");
      if (!spokenLanguage) errors.push("Spoken Language is required");
    }
    return errors;
  };

  // 1. SAVE DRAFT
  const handleSaveDraft = async () => {
    setIsProcessing(true);
    setFeedback(null);
    try {
      if (currentStatus !== "published") {
        dispatchFields({ type: "UPDATE", path: "status", value: "draft" });
      }
      await submit();
      setFeedback({ type: "success", text: "Draft saved successfully." });
    } catch {
      setFeedback({ type: "error", text: "Failed to save draft. Check required fields." });
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. PREVIEW
  const handlePreview = () => {
    if (!id) {
      setFeedback({
        type: "info",
        text: "Please click 'Save Draft' first before previewing.",
      });
      return;
    }
    const previewUrl = `/${language}/preview?collection=${collectionSlug}&id=${id}`;
    window.open(previewUrl, "_blank");
  };

  // 3. FOUNDER: PUBLISH NOW
  const handlePublishNow = async () => {
    setFeedback(null);
    const errors = validateFields();
    if (errors.length > 0) {
      setFeedback({
        type: "error",
        text: `Cannot publish yet: ${errors.join(", ")}.`,
      });
      return;
    }

    setIsProcessing(true);
    const nowIso = new Date().toISOString();

    try {
      // Step A: Update form state
      dispatchFields({ type: "UPDATE", path: "status", value: "published" });
      dispatchFields({ type: "UPDATE", path: "publishedAt", value: nowIso });
      dispatchFields({ type: "UPDATE", path: "reviewDecision", value: "approved" });
      dispatchFields({ type: "UPDATE", path: "reviewNotes", value: "" });

      // Step B: Submit current form
      await submit();

      // Step C: If document has ID, trigger server-side publish-now verification & cache purge
      if (id) {
        const res = await fetch("/api/admin/publish-now", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collection: collectionSlug, id }),
        });
        const data = await res.json();
        if (data.success && data.liveUrl) {
          setFeedback({
            type: "success",
            text: `Published successfully! Your ${itemTypeLabel.toLowerCase()} is now live.`,
            liveUrl: data.liveUrl,
          });
          setIsProcessing(false);
          return;
        }
      }

      setFeedback({
        type: "success",
        text: `Published successfully! Your ${itemTypeLabel.toLowerCase()} is now live.`,
        liveUrl,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish.";
      setFeedback({ type: "error", text: `Publication error: ${msg}` });
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. EDITOR: SUBMIT FOR APPROVAL
  const handleSubmitForApproval = async () => {
    setFeedback(null);
    const errors = validateFields();
    if (errors.length > 0) {
      setFeedback({
        type: "error",
        text: `Cannot submit yet: ${errors.join(", ")}.`,
      });
      return;
    }

    const confirmed = window.confirm(
      `Submit this ${itemTypeLabel.toLowerCase()} for Founder review and approval?`,
    );
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      dispatchFields({ type: "UPDATE", path: "status", value: "in_review" });
      if (userId) {
        dispatchFields({ type: "UPDATE", path: "submittedBy", value: userId });
      }
      dispatchFields({ type: "UPDATE", path: "reviewDecision", value: "none" });

      await submit();

      if (id) {
        await fetch("/api/admin/submit-for-approval", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collection: collectionSlug, id }),
        });
      }

      setFeedback({
        type: "success",
        text: `Your ${itemTypeLabel.toLowerCase()} has been submitted successfully and is awaiting Founder approval.`,
      });
    } catch {
      setFeedback({
        type: "error",
        text: "Submission failed. Please verify required fields and try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. FOUNDER: UNPUBLISH
  const handleUnpublish = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to unpublish this ${itemTypeLabel.toLowerCase()}? It will be removed from the public website immediately.`,
    );
    if (!confirmed) return;

    setIsProcessing(true);
    setFeedback(null);
    try {
      dispatchFields({ type: "UPDATE", path: "status", value: "draft" });
      await submit();

      if (id) {
        await fetch("/api/admin/content-reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "request-changes",
            collection: collectionSlug,
            id,
            notes: "Unpublished by Founder back to draft.",
          }),
        });
      }

      setFeedback({
        type: "info",
        text: `${itemTypeLabel} unpublished and reverted to draft.`,
      });
    } catch {
      setFeedback({ type: "error", text: "Failed to unpublish." });
    } finally {
      setIsProcessing(false);
    }
  };

  // Status Badge Rendering
  const renderStatusBadge = () => {
    if (currentStatus === "published") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Published (Live)
        </span>
      );
    }
    if (currentStatus === "in_review") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          In Review (Awaiting Founder)
        </span>
      );
    }
    if (reviewDecision === "changes_requested") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
          Changes Requested
        </span>
      );
    }
    if (reviewDecision === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          Rejected
        </span>
      );
    }
    if (currentStatus === "scheduled") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          Scheduled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
        Draft
      </span>
    );
  };

  return (
    <div className="my-4 p-4 rounded-xl border border-zinc-200 bg-zinc-50/70 shadow-xs space-y-3">
      {/* Header bar: Status and Role Info */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {renderStatusBadge()}
          <span className="text-xs font-medium text-zinc-500">
            {isFounder ? "Founder Control" : "Editor Workspace"}
          </span>
        </div>

        {/* Live Link Button if Published */}
        {currentStatus === "published" && liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 hover:bg-emerald-50 transition"
          >
            <span>View Live {itemTypeLabel}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Changes Requested Callout for Editor */}
      {reviewDecision === "changes_requested" && reviewNotes && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-amber-800">
            <AlertTriangle className="w-4 h-4" />
            Founder Revision Feedback:
          </div>
          <p className="whitespace-pre-wrap pl-5">{reviewNotes}</p>
        </div>
      )}

      {/* Feedback Messages */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : feedback.type === "error"
                ? "bg-rose-50 text-rose-900 border border-rose-200"
                : "bg-blue-50 text-blue-900 border border-blue-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : feedback.type === "error" ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p>{feedback.text}</p>
            {feedback.liveUrl && (
              <a
                href={feedback.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 font-bold underline hover:text-emerald-800"
              >
                <span>View Live {itemTypeLabel} &rarr;</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Main Publishing Actions */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        {/* Save Draft */}
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isProcessing}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-zinc-500" />
          )}
          <span>Save Draft</span>
        </button>

        {/* Preview */}
        <button
          type="button"
          onClick={handlePreview}
          disabled={isProcessing}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
        >
          <Eye className="w-3.5 h-3.5 text-zinc-500" />
          <span>Preview</span>
        </button>

        {/* FOUNDER ACTIONS */}
        {isFounder && (
          <>
            {/* Publish Now */}
            <button
              type="button"
              onClick={handlePublishNow}
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              )}
              <span>{currentStatus === "published" ? "Update Published" : "Publish Now"}</span>
            </button>

            {/* Unpublish button if currently published */}
            {currentStatus === "published" && (
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1 disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                <span>Unpublish</span>
              </button>
            )}
          </>
        )}

        {/* EDITOR ACTIONS */}
        {!isFounder && (
          <button
            type="button"
            onClick={handleSubmitForApproval}
            disabled={isProcessing || currentStatus === "in_review"}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-indigo-200" />
            )}
            <span>
              {currentStatus === "in_review"
                ? "Submitted for Approval"
                : "Submit for Approval"}
            </span>
          </button>
        )}
      </div>

      {publishedAt && (
        <p className="text-[11px] text-zinc-500">
          Published timestamp (UTC):{" "}
          <span className="font-mono text-zinc-700">{publishedAt}</span>
        </p>
      )}
    </div>
  );
}
