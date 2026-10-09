import React from "react";
import type { ServerProps } from "payload";
import { NotificationBellClient } from "./NotificationBellClient";

export function NotificationBell({ user }: ServerProps) {
  // STRICT FOUNDER AUTHORIZATION:
  // Visible ONLY to the Founder (admin).
  // Must NEVER appear for editors, pending applicants, rejected, suspended, or unauthenticated visitors.
  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div
      className="br-founder-bell-header-action"
      style={{
        display: "inline-flex",
        alignItems: "center",
        marginRight: "0.5rem",
      }}
    >
      <NotificationBellClient />
    </div>
  );
}
