import React from "react";
import Link from "next/link";
import { User } from "@/payload-types";
import { AdminShell } from "./AdminShell";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  ExternalLink,
} from "lucide-react";

interface EditorDashboardProps {
  user: User;
  stats: {
    myDrafts: number;
    awaitingApproval: number;
    changesRequested: number;
    publishedContributions: number;
  };
  mySubmissions: Array<{
    id: string | number;
    title: string;
    type: "article" | "video";
    status: string;
    reviewDecision?: string;
    reviewNotes?: string;
    updatedAt?: string;
  }>;
}

export function EditorDashboard({
  user,
  stats,
  mySubmissions,
}: EditorDashboardProps) {
  return (
    <AdminShell
      title="Editor Dashboard"
      subtitle="Create research-backed articles and video explainers. Submit drafts to the founder for approval."
      user={user}
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/admin/collections/articles/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white font-medium text-xs sm:text-sm hover:bg-zinc-800 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Write Article</span>
          </Link>
          <Link
            href="/admin/collections/videos/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-800 font-medium text-xs sm:text-sm hover:bg-zinc-50 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Video</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Editor Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* My Drafts */}
          <Link
            href="/admin/collections/articles"
            className="p-5 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 transition shadow-xs flex flex-col justify-between"
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
          </Link>

          {/* Awaiting Approval */}
          <div
            className={`p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between ${
              stats.awaitingApproval > 0
                ? "bg-amber-50/70 border-amber-300"
                : "bg-white border-zinc-200"
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
          </div>

          {/* Changes Requested */}
          <div
            className={`p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between ${
              stats.changesRequested > 0
                ? "bg-rose-50/70 border-rose-300"
                : "bg-white border-zinc-200"
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Changes Requested
              </span>
              <AlertTriangle
                className={`w-5 h-5 ${
                  stats.changesRequested > 0
                    ? "text-rose-600"
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
                  : "No items pending revision"}
              </p>
            </div>
          </div>

          {/* Published Contributions */}
          <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-xs flex flex-col justify-between">
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
              <p className="text-xs text-zinc-500 mt-1">
                Live on website with your byline
              </p>
            </div>
          </div>
        </div>

        {/* My Submissions & Feedback */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-zinc-200">
            <h2 className="text-lg font-serif font-bold text-zinc-900">
              My Submissions & Status
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Track founder reviews, revisions, and published contributions.
            </p>
          </div>

          {mySubmissions.length === 0 ? (
            <div className="p-10 text-center text-zinc-500 space-y-3">
              <FileText className="w-8 h-8 text-zinc-400 mx-auto" />
              <p className="text-sm font-medium text-zinc-700">
                No submissions yet
              </p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Ready to contribute? Click &ldquo;Write Article&rdquo; or &ldquo;Add Video&rdquo; above to start drafting your first piece.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {mySubmissions.map((sub) => {
                const isChangesRequested =
                  sub.reviewDecision === "changes_requested";
                const isRejected = sub.reviewDecision === "rejected";
                const isPublished = sub.status === "published";
                const isReviewing = sub.status === "in_review";

                return (
                  <div
                    key={`${sub.type}-${sub.id}`}
                    className="p-4 sm:p-5 flex flex-col gap-3 hover:bg-zinc-50/50 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-zinc-100 text-zinc-700">
                          {sub.type}
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-900">
                          {sub.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
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
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            Changes Requested
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
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

                        <Link
                          href={`/admin/collections/${sub.type === "article" ? "articles" : "videos"}/${sub.id}`}
                          className="px-3 py-1 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition inline-flex items-center gap-1"
                        >
                          Edit <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Feedback Notes from Founder if Changes Requested */}
                    {sub.reviewNotes && (
                      <div className="mt-1 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                        <span className="font-semibold block mb-0.5">
                          Founder Feedback:
                        </span>
                        <span>{sub.reviewNotes}</span>
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
