import Link from "next/link";
import type { ServerProps } from "payload";
import { getMergedMessages } from "@/lib/ui-strings";
export async function QuickAdd({ user, locale }: ServerProps) {
  if (!user || !["admin", "editor"].includes(user.role)) return null;
  const language =
    locale?.code === "ps" || locale?.code === "fa" ? locale.code : "en";
  const messages = await getMergedMessages(language);
  const items = [
    ["videos", "new_video"],
    ["articles", "new_article"],
    ["topics", "new_topic"],
    ["collections", "new_collection"],
    ["pages", "new_page"],
    ["authors", "new_author"],
  ] as const;
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
      <nav className="br-editorial-review-tools" aria-label={messages.ui.review_tools}>
        <Link href={`/${language}/review-report`}>{messages.ui.review_title}</Link>
        <Link href={`/${language}/translation-review`}>{messages.ui.translation_title}</Link>
      </nav>
    </>
  );
}
