"use client";

import React, { useState } from "react";
import { User } from "@/payload-types";
import { AdminShell } from "./AdminShell";
import {
  Check,
  X,
  MessageSquare,
  ExternalLink,
  AlertCircle,
  Loader2,
  Inbox,
} from "lucide-react";
import Link from "next/link";

export interface PendingContentItem {
  id: string | number;
  title: string;
  type: "article" | "video" | "topic" | "collection";
  language?: string;
  submittedBy?: string;
  submittedAt?: string;
  status: string;
  reviewDecision?: string;
  reviewNotes?: string;
  slug?: string;
}

interface ContentApprovalsViewProps {
  user: User;
  initialItems: PendingContentItem[];
}

export function ContentApprovalsView({
  user,
  initialItems,
}: ContentApprovalsViewProps) {
  const [items, setItems] = useState<PendingContentItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<"pending" | "changes" | "rejected">("pending");
  const [loadingId, setLoadingId] = useState<string | number | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    id: string | number;
    collection: string;
    action: "request-changes" | "reject";
  } | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
    liveUrl?: string;
  } | null>(null);

  const filteredItems = items.filter((item) => {
    if (activeTab === "pending") {
      return (
        item.status === "in_review" ||
        (item.type === "topic" && item.status === "pending")
      );
    }
    if (activeTab === "changes") {
      return item.reviewDecision === "changes_requested";
    }
    if (activeTab === "rejected") {
      return item.reviewDecision === "rejected";
    }
    return true;
  });

  const handleAction = async (
    action: "approve" | "request-changes" | "reject",
    collection: string,
    id: string | number,
    notes?: string,
  ) => {
    setLoadingId(id);
    setMessage(null);

    const mappedCollection =
      collection === "topic"
        ? "topics"
        : collection === "collection"
          ? "collections"
          : `${collection}s`;

    try {
      const res = await fetch("/api/admin/content-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          collection: mappedCollection,
          id,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Action failed." });
      } else {
        setMessage({
          type: "success",
          text: data.message || "Updated successfully.",
          liveUrl: data.liveUrl,
        });
        if (action === "approve") {
          setItems((prev) => prev.filter((i) => i.id !== id));
        } else if (action === "request-changes") {
          setItems((prev) =>
            prev.map((i) =>
              i.id === id
                ? {
                    ...i,
                    reviewDecision: "changes_requested",
                    reviewNotes: notes,
                  }
                : i,
            ),
          );
          setFeedbackModal(null);
          setFeedbackNote("");
        } else if (action === "reject") {
          setItems((prev) =>
            prev.map((i) =>
              i.id === id
                ? { ...i, reviewDecision: "rejected", reviewNotes: notes }
                : i,
            ),
          );
          setFeedbackModal(null);
          setFeedbackNote("");
        }
      }
    } catch {
      setMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AdminShell
      title="Content Approvals"
      subtitle="Exclusive founder authority to approve, publish, request changes, or reject editor submissions."
      user={user}
    >
      <div className="space-y-6">
        {message && (
          <div
            className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
              message.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-800"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-800"
            }`}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
              <span>{message.text}</span>
              {message.liveUrl && (
                <a
                  href={message.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-emerald-900 hover:text-emerald-950 inline-flex items-center gap-1 shrink-0"
                >
                  <span>View Live Content</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex border-b border-zinc-200 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === "pending"
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Awaiting Approval (
            {
              items.filter(
                (i) =>
                  i.status === "in_review" ||
                  (i.type === "topic" && i.status === "pending"),
              ).length
            }
            )
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("changes")}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === "changes"
                ? "border-amber-600 text-amber-800"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Changes Requested (
            {items.filter((i) => i.reviewDecision === "changes_requested").length}
            )
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rejected")}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === "rejected"
                ? "border-rose-600 text-rose-800"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Rejected (
            {items.filter((i) => i.reviewDecision === "rejected").length}
            )
          </button>
        </div>

        {/* Content Table / List */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 space-y-2">
              <Inbox className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-semibold text-zinc-800">
                No items in this queue
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                {activeTab === "pending"
                  ? "All submissions have been reviewed and published."
                  : activeTab === "changes"
                    ? "No content is currently awaiting revision by editors."
                    : "No submissions have been rejected."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="p-5 sm:p-6 space-y-4 hover:bg-zinc-50/50 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-zinc-100 text-zinc-700">
                          {item.type}
                        </span>
                        {item.language && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-600 uppercase">
                            {item.language}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-zinc-900">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Submitted by:{" "}
                        <span className="font-medium text-zinc-700">
                          {item.submittedBy || "Editor"}
                        </span>
                        {item.submittedAt &&
                          ` • ${new Date(item.submittedAt).toLocaleDateString()}`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                      {/* Preview Button */}
                      <Link
                        href={`/${item.language || "en"}/preview?collection=${
                          item.type === "topic"
                            ? "topics"
                            : item.type === "collection"
                              ? "collections"
                              : `${item.type}s`
                        }&id=${item.id}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-medium transition inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </Link>

                      {/* Edit Document */}
                      <Link
                        href={`/admin/collections/${
                          item.type === "topic"
                            ? "topics"
                            : item.type === "collection"
                              ? "collections"
                              : `${item.type}s`
                        }/${item.id}`}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-medium transition"
                      >
                        Edit
                      </Link>

                      {/* Approve & Publish Button */}
                      <button
                        type="button"
                        onClick={() =>
                          handleAction("approve", item.type, item.id)
                        }
                        disabled={loadingId === item.id}
                        className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        {loadingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Approve & Publish</span>
                      </button>

                      {/* Request Changes */}
                      <button
                        type="button"
                        onClick={() =>
                          setFeedbackModal({
                            id: item.id,
                            collection: item.type,
                            action: "request-changes",
                          })
                        }
                        disabled={loadingId === item.id}
                        className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-medium transition flex items-center gap-1 disabled:opacity-50"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Request Changes</span>
                      </button>

                      {/* Reject */}
                      <button
                        type="button"
                        onClick={() =>
                          setFeedbackModal({
                            id: item.id,
                            collection: item.type,
                            action: "reject",
                          })
                        }
                        disabled={loadingId === item.id}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium transition flex items-center gap-1 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  {/* Feedback Modal / Prompt */}
                  {feedbackModal?.id === item.id && (
                    <div className="mt-3 p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-3">
                      <label className="block text-xs font-semibold text-zinc-900">
                        {feedbackModal.action === "request-changes"
                          ? "Feedback / Revision Notes for Editor:"
                          : "Rejection Reason (Notes for Editor):"}
                      </label>
                      <textarea
                        value={feedbackNote}
                        onChange={(e) => setFeedbackNote(e.target.value)}
                        placeholder={
                          feedbackModal.action === "request-changes"
                            ? "e.g. Please clarify Part 2 with the original citation link..."
                            : "e.g. Content does not align with editorial scope..."
                        }
                        rows={2}
                        className="w-full p-2.5 rounded-lg border border-zinc-300 text-xs bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFeedbackModal(null);
                            setFeedbackNote("");
                          }}
                          className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs text-zinc-700 hover:bg-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleAction(
                              feedbackModal.action,
                              item.type,
                              item.id,
                              feedbackNote,
                            )
                          }
                          disabled={loadingId === item.id}
                          className={`px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold disabled:opacity-50 ${
                            feedbackModal.action === "request-changes"
                              ? "bg-amber-700 hover:bg-amber-800"
                              : "bg-rose-700 hover:bg-rose-800"
                          }`}
                        >
                          {feedbackModal.action === "request-changes"
                            ? "Send Revision Request"
                            : "Confirm Rejection"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Existing Review Notes */}
                  {item.reviewNotes && (
                    <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                      <span className="font-semibold block mb-0.5">
                        Current Review Notes:
                      </span>
                      <span>{item.reviewNotes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
