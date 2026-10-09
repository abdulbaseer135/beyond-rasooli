import React from "react";
import Link from "next/link";
import { User } from "@/payload-types";
import { AdminShell } from "./AdminShell";
import {
  FileText,
  Video,
  UserCheck,
  Clock,
  Users as UsersIcon,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface FounderDashboardProps {
  user: User;
  stats: {
    publishedArticles: number;
    publishedVideos: number;
    pendingApplications: number;
    awaitingApproval: number;
    activeEditors: number;
  };
  recentSubmissions: Array<{
    id: string | number;
    title: string;
    type: "article" | "video" | "topic" | "collection";
    submittedBy?: string;
    submittedAt?: string;
    language?: string;
  }>;
}

export function FounderDashboard({
  user,
  stats,
  recentSubmissions,
}: FounderDashboardProps) {
  return (
    <AdminShell
      title="Founder Dashboard"
      subtitle="Complete editorial control, editor approvals, and publication authority for Beyond Rasooli."
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
        {/* Stat Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Pending Applications Card */}
          <Link
            href="/admin/editor-requests"
            className={`p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between ${
              stats.pendingApplications > 0
                ? "bg-amber-50/70 border-amber-300 hover:border-amber-400"
                : "bg-white border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Editor Requests
              </span>
              <UserCheck
                className={`w-5 h-5 ${
                  stats.pendingApplications > 0
                    ? "text-amber-600"
                    : "text-zinc-400"
                }`}
              />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-serif font-bold text-zinc-900">
                {stats.pendingApplications}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {stats.pendingApplications > 0
                  ? "Awaiting your review"
                  : "All reviewed"}
              </p>
            </div>
          </Link>

          {/* Content Awaiting Approval Card */}
          <Link
            href="/admin/content-approvals"
            className={`p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between ${
              stats.awaitingApproval > 0
                ? "bg-rose-50/70 border-rose-300 hover:border-rose-400"
                : "bg-white border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Needs Approval
              </span>
              <Clock
                className={`w-5 h-5 ${
                  stats.awaitingApproval > 0
                    ? "text-rose-600"
                    : "text-zinc-400"
                }`}
              />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-serif font-bold text-zinc-900">
                {stats.awaitingApproval}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {stats.awaitingApproval > 0
                  ? "Submitted by editors"
                  : "Queue is clear"}
              </p>
            </div>
          </Link>

          {/* Active Editors Card */}
          <Link
            href="/admin/manage-editors"
            className="p-5 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 transition shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Active Editors
              </span>
              <UsersIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-serif font-bold text-zinc-900">
                {stats.activeEditors}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Approved contributors</p>
            </div>
          </Link>

          {/* Published Articles Card */}
          <Link
            href="/admin/collections/articles"
            className="p-5 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 transition shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Articles
              </span>
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-serif font-bold text-zinc-900">
                {stats.publishedArticles}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Live published</p>
            </div>
          </Link>

          {/* Published Videos Card */}
          <Link
            href="/admin/collections/videos"
            className="p-5 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 transition shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Videos
              </span>
              <Video className="w-5 h-5 text-violet-600" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-serif font-bold text-zinc-900">
                {stats.publishedVideos}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Live short explainers</p>
            </div>
          </Link>
        </div>

        {/* Content Awaiting Approval Section */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-bold text-zinc-900">
                Content Awaiting Founder Approval
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Editor submissions require explicit approval before appearing publicly.
              </p>
            </div>
            <Link
              href="/admin/content-approvals"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
            >
              View All Approvals →
            </Link>
          </div>

          {recentSubmissions.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-medium text-zinc-700">
                All submissions have been reviewed!
              </p>
              <p className="text-xs text-zinc-400">
                When editors submit articles, videos, or topic proposals, they will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {recentSubmissions.map((sub) => (
                <div
                  key={`${sub.type}-${sub.id}`}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 transition"
                >
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
                      <h3 className="text-sm font-semibold text-zinc-900 line-clamp-1">
                        {sub.title}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Submitted by:{" "}
                      <span className="font-medium text-zinc-700">
                        {sub.submittedBy || "Editor"}
                      </span>
                      {sub.submittedAt && ` • ${new Date(sub.submittedAt).toLocaleDateString()}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href={`/admin/collections/${sub.type === "topic" ? "topics" : sub.type === "collection" ? "collections" : `${sub.type}s`}/${sub.id}`}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-medium transition"
                    >
                      Review
                    </Link>
                    <Link
                      href="/admin/content-approvals"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-medium transition"
                    >
                      Publish
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Website Management Quick Links */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-zinc-900 font-serif font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Website Management & Settings</span>
          </div>
          <p className="text-xs text-zinc-500">
            Founder-only administrative controls for site-wide configuration, legal governance, and contact inquiries.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Link
              href="/admin/collections/pages"
              className="p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 transition flex flex-col justify-between"
            >
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">
                  Legal Pages
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Manage About, Privacy Policy, and Terms & Conditions.
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-700 mt-3 inline-flex items-center gap-1">
                Edit Pages <ExternalLink className="w-3 h-3" />
              </span>
            </Link>

            <Link
              href="/admin/globals/site-settings"
              className="p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 transition flex flex-col justify-between"
            >
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">
                  Site Settings
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Branding, SEO defaults, social links, and timezone.
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-700 mt-3 inline-flex items-center gap-1">
                Configure <ExternalLink className="w-3 h-3" />
              </span>
            </Link>

            <Link
              href="/admin/collections/contacts"
              className="p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 transition flex flex-col justify-between"
            >
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">
                  Contact Inquiries
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  View messages submitted via the public contact form.
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-700 mt-3 inline-flex items-center gap-1">
                View Messages <ExternalLink className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
