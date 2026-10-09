import React from "react";
import Link from "next/link";
import { User } from "@/payload-types";
import { NotificationBellClient } from "@/components/admin/NotificationBellClient";

interface AdminShellProps {
  title: string;
  subtitle?: string;
  user: User;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function AdminShell({
  title,
  subtitle,
  user,
  actions,
  children,
}: AdminShellProps) {
  const isFounder = user.role === "admin";

  return (
    <div className="br-custom-admin-container min-h-screen bg-[var(--theme-bg,#fcfcfd)] text-[var(--theme-text,#18181b)] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Breadcrumb & User Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--theme-border,#e4e4e7)]">
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/admin"
              className="font-semibold text-emerald-700 hover:underline"
            >
              Beyond Rasooli Admin
            </Link>
            <span className="text-zinc-400">/</span>
            <span className="text-zinc-600 font-medium">{title}</span>
          </div>

          <div className="flex items-center gap-3">
            {isFounder && <NotificationBellClient />}
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                isFounder
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-blue-100 text-blue-900 border border-blue-300"
              }`}
            >
              {isFounder ? "Founder (Admin)" : "Editor"}
            </span>
            <span className="text-sm font-medium text-zinc-700">
              {user.name}
            </span>
            <Link
              href="/admin/account"
              className="text-xs text-zinc-500 hover:text-zinc-800 underline"
            >
              Profile
            </Link>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-zinc-500 mt-1 max-w-2xl">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>

        {/* Navigation Bar for Quick Switching */}
        <nav className="flex flex-wrap gap-2 text-sm pt-2">
          <Link
            href="/admin"
            className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700 hover:bg-zinc-50 shadow-xs transition"
          >
            Dashboard
          </Link>
          {isFounder ? (
            <>
              <Link
                href="/admin/content-approvals"
                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700 hover:bg-zinc-50 shadow-xs transition"
              >
                Content Approvals
              </Link>
              <Link
                href="/admin/editor-requests"
                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700 hover:bg-zinc-50 shadow-xs transition"
              >
                Editor Requests
              </Link>
              <Link
                href="/admin/manage-editors"
                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700 hover:bg-zinc-50 shadow-xs transition"
              >
                Manage Editors
              </Link>
              <Link
                href="/admin/notifications"
                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700 hover:bg-zinc-50 shadow-xs transition"
              >
                Notifications
              </Link>
              <Link
                href="/admin/collections/articles"
                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700 hover:bg-zinc-50 shadow-xs transition"
              >
                Articles
              </Link>
              <Link
                href="/admin/collections/videos"
                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700 hover:bg-zinc-50 shadow-xs transition"
              >
                Videos
              </Link>
              <Link
                href="/admin/collections/topics"
                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700 hover:bg-zinc-50 shadow-xs transition"
              >
                Topics
              </Link>
              <Link
                href="/admin/collections/collections"
                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700 hover:bg-zinc-50 shadow-xs transition"
              >
                Collections
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/admin/collections/articles"
                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700 hover:bg-zinc-50 shadow-xs transition"
              >
                My Articles
              </Link>
              <Link
                href="/admin/collections/videos"
                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700 hover:bg-zinc-50 shadow-xs transition"
              >
                My Videos
              </Link>
              <Link
                href="/admin/collections/topics/create"
                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700 hover:bg-zinc-50 shadow-xs transition"
              >
                Propose Topic
              </Link>
            </>
          )}
        </nav>

        {/* Main Content Area */}
        <main className="pt-2">{children}</main>
      </div>
    </div>
  );
}
