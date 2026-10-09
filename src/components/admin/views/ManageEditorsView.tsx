"use client";

import React, { useState } from "react";
import { User } from "@/payload-types";
import { AdminShell } from "./AdminShell";
import {
  Users as UsersIcon,
  ShieldAlert,
  RotateCcw,
  Trash2,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";
import Link from "next/link";

export interface ManagedEditor {
  id: string | number;
  name: string;
  email: string;
  status: "approved" | "suspended" | "rejected" | "pending";
  bio?: string;
  articleCount: number;
  videoCount: number;
  appliedAt?: string;
}

interface ManageEditorsViewProps {
  user: User;
  initialEditors: ManagedEditor[];
}

export function ManageEditorsView({
  user,
  initialEditors,
}: ManageEditorsViewProps) {
  const [editors, setEditors] = useState<ManagedEditor[]>(initialEditors);
  const [loadingId, setLoadingId] = useState<string | number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAction = async (action: "suspend" | "reactivate" | "remove", userId: string | number) => {
    if (action === "remove") {
      const confirmed = window.confirm(
        "Are you sure you want to remove this editor? Their account access will be revoked. Published content by this author will retain attribution.",
      );
      if (!confirmed) return;
    }

    setLoadingId(userId);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/editors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Action failed." });
      } else {
        setMessage({ type: "success", text: data.message || "Updated successfully." });
        if (action === "remove") {
          setEditors((prev) => prev.filter((e) => e.id !== userId));
        } else if (action === "suspend") {
          setEditors((prev) =>
            prev.map((e) => (e.id === userId ? { ...e, status: "suspended" } : e)),
          );
        } else if (action === "reactivate") {
          setEditors((prev) =>
            prev.map((e) => (e.id === userId ? { ...e, status: "approved" } : e)),
          );
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
      title="Manage Editors"
      subtitle="View all contributors, suspend or reactivate access, and manage editorial privileges."
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
            <span>{message.text}</span>
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-zinc-900">
              Approved & Suspended Contributors ({editors.length})
            </h2>
            <span className="text-xs text-zinc-400">
              Founder Oversight
            </span>
          </div>

          {editors.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 space-y-2">
              <UsersIcon className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-semibold text-zinc-800">
                No Active Editors
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                When editor applications are approved, contributors will be listed here with options to manage their status.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {editors.map((editor) => {
                const isApproved = editor.status === "approved";
                const isSuspended = editor.status === "suspended";

                return (
                  <div
                    key={editor.id}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold text-zinc-900">
                          {editor.name}
                        </h3>
                        {isApproved && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        )}
                        {isSuspended && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            Suspended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-600 font-mono">
                        {editor.email}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-zinc-500 pt-1">
                        <span>Articles: <strong>{editor.articleCount}</strong></span>
                        <span>Videos: <strong>{editor.videoCount}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link
                        href={`/admin/collections/articles?where[author][equals]=${editor.id}`}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-medium transition inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Content</span>
                      </Link>

                      {isApproved ? (
                        <button
                          type="button"
                          onClick={() => handleAction("suspend", editor.id)}
                          disabled={loadingId === editor.id}
                          className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-medium transition flex items-center gap-1 disabled:opacity-50"
                        >
                          {loadingId === editor.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          )}
                          <span>Suspend</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAction("reactivate", editor.id)}
                          disabled={loadingId === editor.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-medium transition flex items-center gap-1 disabled:opacity-50"
                        >
                          {loadingId === editor.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                          <span>Reactivate</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleAction("remove", editor.id)}
                        disabled={loadingId === editor.id}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium transition flex items-center gap-1 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
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
