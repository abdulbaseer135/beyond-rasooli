"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@/payload-types";
import { AdminShell } from "./AdminShell";
import {
  Bell,
  UserPlus,
  FileText,
  Video,
  CheckCheck,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export interface NotificationItem {
  id: number | string;
  type:
    | "editor_registration"
    | "article_approval"
    | "video_approval"
    | "article_resubmission"
    | "video_resubmission";
  title: string;
  message: string;
  relativeTime: string;
  createdAt: string;
  isRead: boolean;
  isResolved: boolean;
  link?: string;
  actor?: {
    name?: string;
    email?: string;
  };
  targetCollection?: string;
  targetId?: string;
}

interface NotificationsViewProps {
  user: User;
  initialItems: NotificationItem[];
  initialUnreadCount: number;
  initialTotalDocs: number;
}

export function NotificationsView({
  user,
  initialItems,
  initialUnreadCount,
  initialTotalDocs,
}: NotificationsViewProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread" | "pending" | "resolved">("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NotificationItem[]>(initialItems);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [totalDocs, setTotalDocs] = useState<number>(initialTotalDocs);
  const [totalPages, setTotalPages] = useState<number>(Math.ceil(initialTotalDocs / 15) || 1);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = useCallback(
    async (activeFilter: string, activePage: number) => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/admin/notifications?filter=${activeFilter}&page=${activePage}&limit=15`,
        );
        if (res.ok) {
          const data = await res.json();
          setItems(data.docs || []);
          setTotalDocs(data.totalDocs || 0);
          setTotalPages(data.totalPages || 1);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let ignore = false;
    async function fetchItems() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/admin/notifications?filter=${filter}&page=${page}&limit=15`,
        );
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setItems(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 1);
            setUnreadCount(data.unreadCount || 0);
          }
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchItems();

    return () => {
      ignore = true;
    };
  }, [filter, page]);

  const handleMarkAsRead = async (id: number | string, link?: string) => {
    try {
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-read", id }),
      });

      if (link) {
        router.push(link);
      }
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    setIsLoading(true);
    try {
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-all-read" }),
      });
      loadNotifications(filter, page);
    } catch (err) {
      console.error("Error marking all read:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getItemIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "editor_registration":
        return <UserPlus className="w-5 h-5 text-emerald-600 shrink-0" />;
      case "article_approval":
      case "article_resubmission":
        return <FileText className="w-5 h-5 text-amber-600 shrink-0" />;
      case "video_approval":
      case "video_resubmission":
        return <Video className="w-5 h-5 text-blue-600 shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-zinc-500 shrink-0" />;
    }
  };

  const getActionLabel = (notif: NotificationItem) => {
    if (notif.type === "editor_registration") return "Review Application";
    if (notif.type.startsWith("article")) return "Review Article";
    if (notif.type.startsWith("video")) return "Review Video";
    return "Review Request";
  };

  const tabs: Array<{ id: "all" | "unread" | "pending" | "resolved"; label: string }> = [
    { id: "all", label: "All Notifications" },
    { id: "unread", label: "Unread" },
    { id: "pending", label: "Pending Review" },
    { id: "resolved", label: "Resolved History" },
  ];

  return (
    <AdminShell
      title="Notifications Center"
      subtitle="Exclusively for the Founder — incoming editor applications, article/video submissions, and editorial approvals"
      user={user}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadNotifications(filter, page)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-xs text-zinc-700 hover:bg-zinc-50 transition flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-xs"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3">
          {tabs.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFilter(tab.id);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <span>{tab.label}</span>
                {tab.id === "unread" && unreadCount > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notification Items List */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
          {items.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Bell className="w-6 h-6 opacity-80" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900">
                You&apos;re all caught up!
              </h3>
              <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
                No notifications found in this view. New contributor requests and content
                submissions will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {items.map((notif) => {
                const targetLink =
                  notif.link ||
                  (notif.type === "editor_registration"
                    ? "/admin/editor-requests"
                    : "/admin/content-approvals");

                return (
                  <div
                    key={notif.id}
                    className={`p-5 transition hover:bg-zinc-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      !notif.isRead ? "bg-amber-50/30" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="p-2.5 rounded-xl bg-zinc-100/90 shrink-0 mt-0.5">
                        {getItemIcon(notif.type)}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-semibold text-zinc-900">
                            {notif.title}
                          </h4>

                          {/* Status badges */}
                          {!notif.isRead ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-700">
                              Unread
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600">
                              Read
                            </span>
                          )}

                          {notif.isResolved ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
                              Decided / Resolved
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">
                              Action Required
                            </span>
                          )}

                          <span className="text-xs text-zinc-400 ml-auto whitespace-nowrap">
                            {notif.relativeTime}
                          </span>
                        </div>

                        <p className="text-sm text-zinc-600 leading-relaxed max-w-3xl">
                          {notif.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-zinc-400">
                          {notif.actor && (
                            <span>
                              Contributor:{" "}
                              <strong className="text-zinc-700 font-medium">
                                {notif.actor.name || notif.actor.email}
                              </strong>
                            </span>
                          )}
                          <span>
                            Event timestamp:{" "}
                            {new Date(notif.createdAt).toLocaleString("en-GB", { timeZone: "UTC" })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 sm:self-center pl-12 sm:pl-0">
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notif.id)}
                          title="Mark as read"
                          className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Mark Read</span>
                        </button>
                      )}

                      <Link
                        href={targetLink}
                        onClick={() => {
                          if (!notif.isRead) handleMarkAsRead(notif.id);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <span>{getActionLabel(notif)}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 pt-2 text-sm text-zinc-600">
            <span>
              Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> (
              {totalDocs} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
