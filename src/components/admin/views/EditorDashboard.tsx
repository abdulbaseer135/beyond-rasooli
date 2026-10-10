"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  User as UserIcon,
} from "lucide-react";

export interface EditorSubmissionItem {
  id: string | number;
  title: string;
  type: "article" | "video" | "topic";
  status: string;
  reviewDecision?: string;
  reviewNotes?: string;
  updatedAt?: string;
  slug?: string;
  language?: string;
}

interface EditorDashboardProps {
  contentList?: React.ReactNode;
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
  contentList,
}: EditorDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterTab = searchParams.get("state") || "all";
  const setFilterTab = (value: string) => {
    const query = new URLSearchParams(searchParams);
    if (value === "all") query.delete("state"); else query.set("state", value);
    query.set("page", "1");
    router.push(`/admin?${query}`);
  };


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

        {contentList}
      </div>
    </AdminShell>
  );
}
