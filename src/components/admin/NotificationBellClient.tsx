"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  UserPlus,
  FileText,
  Video,
  CheckCheck,
  ExternalLink,
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

interface NotificationBellClientProps {
  initialUnreadCount?: number;
  initialNotifications?: NotificationItem[];
}

export function NotificationBellClient({
  initialUnreadCount = 0,
  initialNotifications = [],
}: NotificationBellClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    initialNotifications,
  );
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Fetch latest notifications and unread count
  const fetchNotifications = useCallback(async () => {
    // Avoid unnecessary background requests if tab is hidden
    if (typeof document !== "undefined" && document.hidden) {
      return;
    }

    try {
      const res = await fetch("/api/admin/notifications?limit=8");
      if (res.status === 403) {
        // Not a founder or unauthorized; clear state
        setUnreadCount(0);
        setNotifications([]);
        return;
      }
      if (!res.ok) return;

      const data = await res.json();
      setNotifications(data.docs || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Gracefully ignore temporary network failures
    }
  }, []);

  // Initial fetch and near-real-time polling (every 20s) + focus revalidation
  useEffect(() => {
    let isCancelled = false;

    async function load() {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch("/api/admin/notifications?limit=8");
        if (res.status === 403) {
          if (!isCancelled) {
            setUnreadCount(0);
            setNotifications([]);
          }
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (!isCancelled) {
          setNotifications(data.docs || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch {
        // Gracefully ignore temporary network failures
      }
    }

    load();

    const interval = setInterval(() => {
      load();
    }, 20000);

    const handleFocus = () => {
      load();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      isCancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (id: number | string, link?: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-read", id }),
      });

      if (link) {
        setIsOpen(false);
        router.push(link);
      }
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-all-read" }),
      });
    } catch (err) {
      console.error("Error marking all read:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getItemIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "editor_registration":
        return <UserPlus className="w-4 h-4 text-emerald-600 shrink-0" />;
      case "article_approval":
      case "article_resubmission":
        return <FileText className="w-4 h-4 text-amber-600 shrink-0" />;
      case "video_approval":
      case "video_resubmission":
        return <Video className="w-4 h-4 text-blue-600 shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-500 shrink-0" />;
    }
  };

  const getActionLabel = (notif: NotificationItem) => {
    if (notif.type === "editor_registration") return "Review Application";
    if (notif.type.startsWith("article")) return "Review Article";
    if (notif.type.startsWith("video")) return "Review Video";
    return "Review";
  };

  const displayBadgeText = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div className="relative inline-block text-left">
      {/* Bell Button */}
      <button
        ref={triggerRef}
        type="button"
        id="founder-notification-bell-btn"
        aria-label={`Founder notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 active:scale-95"
      >
        <Bell className="w-5 h-5 text-zinc-700" />

        {/* Unread Notification Badge */}
        {unreadCount > 0 && (
          <span
            id="founder-unread-badge"
            className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-600 border-2 border-white rounded-full animate-in zoom-in-50 duration-200"
          >
            {displayBadgeText}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="dialog"
          aria-label="Founder Notifications Center"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Dropdown Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/80">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 text-sm">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-rose-100 text-rose-800">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
                className="text-xs text-zinc-500 hover:text-zinc-900 font-medium flex items-center gap-1 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Bell className="w-5 h-5 opacity-70" />
                </div>
                <p className="text-sm font-medium text-zinc-800">
                  You&apos;re all caught up!
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  No new notifications at the moment.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const targetLink =
                  notif.link ||
                  (notif.type === "editor_registration"
                    ? "/admin/editor-requests"
                    : "/admin/content-approvals");

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 transition hover:bg-zinc-50/80 ${
                      !notif.isRead ? "bg-amber-50/30" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-zinc-100/80 mt-0.5 shrink-0">
                        {getItemIcon(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-zinc-900 truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                            {notif.relativeTime}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkAsRead(notif.id, targetLink)
                            }
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
                          >
                            <span>[{getActionLabel(notif)}]</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>

                          <div className="flex items-center gap-2">
                            {notif.isResolved ? (
                              <span className="text-[10px] text-zinc-400 italic">
                                Decided
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-600 font-medium">
                                Action needed
                              </span>
                            )}

                            {!notif.isRead && (
                              <button
                                type="button"
                                title="Mark as read"
                                onClick={() => handleMarkAsRead(notif.id)}
                                className="w-2 h-2 rounded-full bg-rose-500 hover:scale-125 transition"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Dropdown Footer */}
          <div className="px-4 py-2.5 border-t border-zinc-100 bg-zinc-50/80 flex items-center justify-between text-xs">
            <Link
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="font-medium text-emerald-700 hover:text-emerald-800 transition"
            >
              View All Notifications →
            </Link>
            {notifications.length > 0 && (
              <span className="text-zinc-400 text-[11px]">
                Founder Admin Center
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
