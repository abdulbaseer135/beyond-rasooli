import Link from "next/link";
import type { ServerProps } from "payload";
import { getMergedMessages } from "@/lib/ui-strings";
export async function QuickAdd({ user, locale }: ServerProps) {
  if (!user || !["admin", "editor"].includes(user.role)) return null;
  const isFounder = user.role === "admin";
  const language =
    locale?.code === "ps" || locale?.code === "fa" ? locale.code : "en";
  const messages = await getMergedMessages(language);
  const items: Array<[string, "new_video" | "new_article" | "new_topic" | "new_collection" | "new_page"]> = isFounder
    ? [
        ["videos", "new_video"],
        ["articles", "new_article"],
        ["topics", "new_topic"],
        ["collections", "new_collection"],
        ["pages", "new_page"],
      ]
    : [
        ["videos", "new_video"],
        ["articles", "new_article"],
        ["topics", "new_topic"],
        ["collections", "new_collection"],
      ];

  return (
    <>
      <details className="br-quick-add">
        <summary>{messages.ui.add_content}</summary>
        <ul>
          {items.map(([collection, key]) => (
            <li key={collection}>
              <Link href={`/admin/collections/${collection}/create`}>
                {messages.ui[key]}
              </Link>
            </li>
          ))}
        </ul>
      </details>
      {isFounder && (
        <nav
          className="br-founder-nav-shortcuts"
          aria-label="Founder Management"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            padding: "0.5rem 0",
            borderBottom: "1px solid var(--theme-elevation-150, #e4e4e7)",
            marginBottom: "0.5rem",
          }}
        >
          <Link
            href="/admin"
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--theme-elevation-700, #3f3f46)",
              textDecoration: "none",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.375rem",
            }}
          >
            📊 Founder Dashboard
          </Link>
          <Link
            href="/admin/content-approvals"
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--theme-elevation-700, #3f3f46)",
              textDecoration: "none",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.375rem",
            }}
          >
            🛡️ Content Approvals
          </Link>
          <Link
            href="/admin/editor-requests"
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--theme-elevation-700, #3f3f46)",
              textDecoration: "none",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.375rem",
            }}
          >
            👥 Editor Requests
          </Link>
          <Link
            href="/admin/manage-editors"
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--theme-elevation-700, #3f3f46)",
              textDecoration: "none",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.375rem",
            }}
          >
            ⚙️ Manage Editors
          </Link>
          <Link
            href="/admin/notifications"
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--theme-elevation-700, #3f3f46)",
              textDecoration: "none",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.375rem",
            }}
          >
            🔔 Notifications
          </Link>
        </nav>
      )}
      <nav className="br-editorial-review-tools" aria-label={messages.ui.review_tools}>
        <Link href={`/${language}/review-report`}>{messages.ui.review_title}</Link>
        <Link href={`/${language}/translation-review`}>{messages.ui.translation_title}</Link>
      </nav>
    </>
  );
}
