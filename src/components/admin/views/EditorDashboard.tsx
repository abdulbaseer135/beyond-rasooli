"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User } from "@/payload-types";
import { AdminShell } from "./AdminShell";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ExternalLink,
  User as UserIcon,
  Inbox,
  Eye,
} from "lucide-react";

export interface EditorSubmissionItem {
  id: string | number;
  title: string;
  type: "article" | "video";
  status: string;
  reviewDecision?: string;
  reviewNotes?: string;
  updatedAt?: string;
  slug?: string;
  language?: string;
}

interface EditorDashboardProps {
  user: User;
  stats: {
    myDrafts: number;
    awaitingApproval: number;
    changesRequested: number;
    rejectedSubmissions: number;
    publishedContributions: number;
  };
  mySubmissions: EditorSubmissionItem[];
}

export function EditorDashboard({
  user,
  stats,
  mySubmissions,
}: EditorDashboardProps) {
  const [filterTab, setFilterTab] = useState<
    "all" | "draft" | "in_review" | "changes_requested" | "rejected" | "published"
  >("all");

  const filteredItems = mySubmissions.filter((item) => {
    if (filterTab === "all") return true;
    if (filterTab === "draft") {
      return (
        item.status === "draft" &&
        item.reviewDecision !== "changes_requested" &&
        item.reviewDecision !== "rejected"
      );
    }
    if (filterTab === "in_review") return item.status === "in_review";
    if (filterTab === "changes_requested")
      return item.reviewDecision === "changes_requested";
    if (filterTab === "rejected") return item.reviewDecision === "rejected";
    if (filterTab === "published") return item.status === "published";
    return true;
  });

  return (
    <AdminShell
      title="Editor Dashboard"
      subtitle="Create research-backed articles and video explainers. Submit drafts to the founder for approval."
      user={user}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/account"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-700 font-medium text-xs sm:text-sm hover:bg-zinc-50 transition"
          >
            <UserIcon className="w-4 h-4 text-zinc-500" />
            <span>My Profile</span>
          </Link>
          <Link
            href="/admin/collections/articles/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white font-medium text-xs sm:text-sm hover:bg-zinc-800 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Article</span>
          </Link>
          <Link
            href="/admin/collections/videos/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-800 font-medium text-xs sm:text-sm hover:bg-zinc-50 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Video</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Editor Metric Cards (5 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* My Drafts */}
          <button
            type="button"
            onClick={() => setFilterTab("draft")}
            className={`p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between text-left ${
              filterTab === "draft"
                ? "border-zinc-900 ring-2 ring-zinc-900 bg-zinc-50/50"
                : "border-zinc-200 bg-white hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                My Drafts
              </span>
              <FileText className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-serif font-bold text-zinc-900">
                {stats.myDrafts}
              </div>
              <p className="text-xs text-zinc-500 mt-1">In progress</p>
            </div>
          </button>

          {/* Awaiting Approval */}
          <button
            type="button"
            onClick={() => setFilterTab("in_review")}
            className={`p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between text-left ${
              filterTab === "in_review"
                ? "border-amber-500 ring-2 ring-amber-500 bg-amber-50/80"
                : stats.awaitingApproval > 0
                  ? "bg-amber-50/70 border-amber-300 hover:border-amber-400"
                  : "bg-white border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Awaiting Approval
              </span>
              <Clock
                className={`w-5 h-5 ${
                  stats.awaitingApproval > 0
                    ? "text-amber-600"
                    : "text-zinc-400"
                }`}
              />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-serif font-bold text-zinc-900">
                {stats.awaitingApproval}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Under founder review
              </p>
            </div>
          </button>

          {/* Changes Requested */}
          <button
            type="button"
            onClick={() => setFilterTab("changes_requested")}
            className={`p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between text-left ${
              filterTab === "changes_requested"
                ? "border-orange-500 ring-2 ring-orange-500 bg-orange-50/80"
                : stats.changesRequested > 0
                  ? "bg-orange-50/70 border-orange-300 hover:border-orange-400"
                  : "bg-white border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Changes Requested
              </span>
              <AlertTriangle
                className={`w-5 h-5 ${
                  stats.changesRequested > 0
                    ? "text-orange-600"
                    : "text-zinc-400"
                }`}
              />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-serif font-bold text-zinc-900">
                {stats.changesRequested}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {stats.changesRequested > 0
                  ? "Requires revisions"
                  : "No items pending"}
              </p>
            </div>
          </button>

          {/* Rejected Submissions */}
          <button
            type="button"
            onClick={() => setFilterTab("rejected")}
            className={`p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between text-left ${
              filterTab === "rejected"
                ? "border-rose-500 ring-2 ring-rose-500 bg-rose-50/80"
                : stats.rejectedSubmissions > 0
                  ? "bg-rose-50/70 border-rose-300 hover:border-rose-400"
                  : "bg-white border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Rejected
              </span>
              <XCircle
                className={`w-5 h-5 ${
                  stats.rejectedSubmissions > 0
                    ? "text-rose-600"
                    : "text-zinc-400"
                }`}
              />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-serif font-bold text-zinc-900">
                {stats.rejectedSubmissions}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {stats.rejectedSubmissions > 0
                  ? "Founder feedback provided"
                  : "None rejected"}
              </p>
            </div>
          </button>

          {/* Published Contributions */}
          <button
            type="button"
            onClick={() => setFilterTab("published")}
            className={`p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between text-left ${
              filterTab === "published"
                ? "border-emerald-600 ring-2 ring-emerald-600 bg-emerald-50/80"
                : "border-zinc-200 bg-white hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Published
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-serif font-bold text-zinc-900">
                {stats.publishedContributions}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Live on website</p>
            </div>
          </button>
        </div>

        {/* Filter Tabs Header */}
        <div className="flex border-b border-zinc-200 gap-4 overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`pb-3 transition border-b-2 whitespace-nowrap ${
              filterTab === "all"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            All Submissions ({mySubmissions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("draft")}
            className={`pb-3 transition border-b-2 whitespace-nowrap ${
              filterTab === "draft"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Drafts ({stats.myDrafts})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("in_review")}
            className={`pb-3 transition border-b-2 whitespace-nowrap ${
              filterTab === "in_review"
                ? "border-amber-600 text-amber-800"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Awaiting Approval ({stats.awaitingApproval})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("changes_requested")}
            className={`pb-3 transition border-b-2 whitespace-nowrap ${
              filterTab === "changes_requested"
                ? "border-orange-600 text-orange-800"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Changes Requested ({stats.changesRequested})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("rejected")}
            className={`pb-3 transition border-b-2 whitespace-nowrap ${
              filterTab === "rejected"
                ? "border-rose-600 text-rose-800"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Rejected ({stats.rejectedSubmissions})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("published")}
            className={`pb-3 transition border-b-2 whitespace-nowrap ${
              filterTab === "published"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Published ({stats.publishedContributions})
          </button>
        </div>

        {/* Submissions List */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 space-y-3">
              <Inbox className="w-8 h-8 text-zinc-400 mx-auto" />
              <p className="text-sm font-medium text-zinc-700">
                No items in this filter
              </p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                {filterTab === "all"
                  ? 'Click "Create New Article" or "Add New Video" above to begin your first submission.'
                  : `You have no submissions currently under "${filterTab.replace(/_/g, " ")}".`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredItems.map((sub) => {
                const isChangesRequested =
                  sub.reviewDecision === "changes_requested";
                const isRejected = sub.reviewDecision === "rejected";
                const isPublished = sub.status === "published";
                const isReviewing = sub.status === "in_review";

                const collectionPath =
                  sub.type === "article" ? "articles" : "videos";
                const publicSection =
                  sub.type === "article" ? "read" : "watch";
                const publicUrl = `/${sub.language || "en"}/${publicSection}/${sub.slug || sub.id}`;

                return (
                  <div
                    key={`${sub.type}-${sub.id}`}
                    className="p-5 flex flex-col gap-3 hover:bg-zinc-50/50 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-zinc-100 text-zinc-700">
                            {sub.type}
                          </span>
                          {sub.language && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-600 uppercase">
                              {sub.language}
                            </span>
                          )}
                          <h3 className="text-sm sm:text-base font-bold text-zinc-900">
                            {sub.title}
                          </h3>
                        </div>
                        {sub.updatedAt && (
                          <p className="text-xs text-zinc-400">
                            Last edited:{" "}
                            {new Date(sub.updatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        {isPublished && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Published
                          </span>
                        )}
                        {isReviewing && !isChangesRequested && !isRejected && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            Awaiting Founder Approval
                          </span>
                        )}
                        {isChangesRequested && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                            Changes Requested
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            Rejected
                          </span>
                        )}
                        {sub.status === "draft" &&
                          !isChangesRequested &&
                          !isRejected && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
                              Draft
                            </span>
                          )}

                        {/* Public Link for Published Content */}
                        {isPublished && (
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-medium transition inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Live</span>
                          </a>
                        )}

                        {/* Preview for Unpublished Content */}
                        {!isPublished && (
                          <a
                            href={`/${sub.language || "en"}/preview?collection=${collectionPath}&id=${sub.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-medium transition inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </a>
                        )}

                        {/* Edit Document Link */}
                        <Link
                          href={`/admin/collections/${collectionPath}/${sub.id}`}
                          className="px-3.5 py-1 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 transition inline-flex items-center gap-1"
                        >
                          {isPublished ? "Propose Revision" : "Edit Draft"}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Feedback Notes from Founder if Changes Requested or Rejected */}
                    {sub.reviewNotes && (
                      <div
                        className={`p-3 rounded-xl border text-xs ${
                          isChangesRequested
                            ? "bg-orange-50/80 border-orange-200 text-orange-900"
                            : "bg-rose-50/80 border-rose-200 text-rose-900"
                        }`}
                      >
                        <span className="font-semibold block mb-0.5">
                          Founder Feedback:
                        </span>
                        <p className="whitespace-pre-wrap">{sub.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
