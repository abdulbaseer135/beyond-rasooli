"use client";

import React, { useState } from "react";
import { User } from "@/payload-types";
import { AdminShell } from "./AdminShell";
import { Check, X, AlertCircle, Loader2, UserCheck } from "lucide-react";

export interface PendingEditor {
  id: string | number;
  name: string;
  email: string;
  appliedAt?: string;
  bio?: string;
  reasonForJoining?: string;
}

interface EditorRequestsViewProps {
  user: User;
  initialRequests: PendingEditor[];
}

export function EditorRequestsView({
  user,
  initialRequests,
}: EditorRequestsViewProps) {
  const [requests, setRequests] = useState<PendingEditor[]>(initialRequests);
  const [loadingId, setLoadingId] = useState<string | number | null>(null);
  const [rejectModalId, setRejectModalId] = useState<string | number | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAction = async (action: "approve" | "reject", userId: string | number, notes?: string) => {
    setLoadingId(userId);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/editors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, notes }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Action failed." });
      } else {
        setMessage({ type: "success", text: data.message || "Updated successfully." });
        setRequests((prev) => prev.filter((r) => r.id !== userId));
        if (rejectModalId === userId) {
          setRejectModalId(null);
          setRejectNote("");
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
      title="Editor Requests"
      subtitle="Review prospective editor applications submitted through the public website. Approve or reject contributor access."
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
              Pending Applications ({requests.length})
            </h2>
            <span className="text-xs text-zinc-400">
              Founder Approval Required
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 space-y-2">
              <UserCheck className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-semibold text-zinc-800">
                No Pending Editor Applications
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                All editor applications have been reviewed. New applications submitted at /apply-as-editor will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {requests.map((req) => (
                <div key={req.id} className="p-5 sm:p-6 space-y-4 hover:bg-zinc-50/50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold text-zinc-900">
                          {req.name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          Pending Review
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 font-mono">
                        {req.email}
                      </p>
                      {req.appliedAt && (
                        <p className="text-xs text-zinc-400">
                          Applied on: {new Date(req.appliedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleAction("approve", req.id)}
                        disabled={loadingId === req.id}
                        className="px-4 py-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        {loadingId === req.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>Approve Editor</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRejectModalId(req.id)}
                        disabled={loadingId === req.id}
                        className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  {/* Applicant Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {req.bio && (
                      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs">
                        <span className="font-semibold text-zinc-700 block mb-1">
                          Short Biography:
                        </span>
                        <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
                          {req.bio}
                        </p>
                      </div>
                    )}

                    {req.reasonForJoining && (
                      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs">
                        <span className="font-semibold text-zinc-700 block mb-1">
                          Reason for Joining:
                        </span>
                        <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
                          {req.reasonForJoining}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Reject Note Input if clicked */}
                  {rejectModalId === req.id && (
                    <div className="mt-3 p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
                      <label className="block text-xs font-semibold text-rose-900">
                        Optional Rejection Reason (Internal Founder Note):
                      </label>
                      <textarea
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="e.g. Does not meet research citation criteria..."
                        rows={2}
                        className="w-full p-2.5 rounded-lg border border-rose-300 text-xs bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRejectModalId(null);
                            setRejectNote("");
                          }}
                          className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs text-zinc-700 hover:bg-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction("reject", req.id, rejectNote)}
                          disabled={loadingId === req.id}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-semibold hover:bg-rose-800 disabled:opacity-50"
                        >
                          Confirm Rejection
                        </button>
                      </div>
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
