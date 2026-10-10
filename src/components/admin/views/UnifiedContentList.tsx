import Link from "next/link";
import type { DashboardItem } from "@/lib/admin-content";

export function UnifiedContentList({ items, total, page, hasNextPage, type, status, messages, basePath = "/admin" }: { items: DashboardItem[]; total: number; page: number; hasNextPage: boolean; type?: string; status?: string; messages: Record<string, string>; basePath?: string }) {
  const href = (changes: Record<string, string | undefined>) => {
    const values = { type, state: status, page: String(page), ...changes };
    const query = new URLSearchParams(Object.entries(values).filter((entry): entry is [string, string] => Boolean(entry[1])));
    return `${basePath}?${query}`;
  };
  const date = (value?: string) => value ? new Date(value).toLocaleString("en-GB", { timeZone: "UTC" }) : "—";
  return <section className="space-y-4">
    <h2 className="text-lg font-serif font-bold">{messages.content_list} ({total})</h2>
    <nav className="flex flex-wrap gap-2" aria-label={messages.type_filter}>
      {[undefined, "articles", "videos", "topics"].map(value => <Link key={value || "all"} href={href({ type: value, page: "1" })} aria-current={type === value ? "page" : undefined} className="px-3 py-2 rounded-lg border border-zinc-200 text-sm">{messages[value || "all"]}</Link>)}
    </nav>
    <nav className="flex flex-wrap gap-2" aria-label={messages.state_filter}>
      {[undefined, "draft", "in_review", "published", "changes_requested", "rejected"].map(value => <Link key={value || "all"} href={href({ state: value || "all", page: "1" })} aria-current={status === value || (!value && status === "all") ? "page" : undefined} className="px-3 py-2 rounded-lg border border-zinc-200 text-sm">{messages[value || "all"]}</Link>)}
    </nav>
    <div className="rounded-2xl border border-zinc-200 bg-white divide-y divide-zinc-100">
      {!items.length && <p className="p-6 text-sm text-zinc-500">{messages.empty}</p>}
      {items.map(item => <div key={`${item.collection}:${item.id}`} className="p-5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3"><Link href={`/admin/collections/${item.collection}/${item.id}`} className="font-semibold">{item.title}</Link><span className="text-xs">{messages[item.collection]} · {messages[item.status] || item.status} · {item.language}</span></div>
        <p className="text-xs text-zinc-500">{item.contributor} · {messages.created}: {date(item.createdAt)} · {messages.updated}: {date(item.updatedAt)}{item.publishedAt && ` · ${messages.published}: ${date(item.publishedAt)}`}</p>
        {item.reviewDecision && item.reviewDecision !== "none" && <p className="text-xs">{messages[item.reviewDecision] || item.reviewDecision}</p>}
        {item.reviewNotes && <p className="text-sm whitespace-pre-wrap">{item.reviewNotes}</p>}
        {item.status === "published" && <Link className="text-sm underline" href={`/${item.language || "en"}/${item.collection === "articles" ? "read" : item.collection === "videos" ? "watch" : "topics"}/${item.slug}`}>{messages.view_live}</Link>}
      </div>)}
    </div>
    <nav className="flex justify-between text-sm" aria-label={messages.pagination}>{page > 1 ? <Link href={href({ page: String(page - 1) })}>{messages.previous}</Link> : <span /> }<span>{messages.page} {page}</span>{hasNextPage ? <Link href={href({ page: String(page + 1) })}>{messages.next}</Link> : <span />}</nav>
  </section>;
}
