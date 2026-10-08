import Link from "next/link";
import type { UIFieldServerProps } from "payload";
import { getMergedMessages } from "@/lib/ui-strings";
const helpKeys: Record<string, string> = {
  media: "create_help_media", videos: "create_help_videos", articles: "create_help_articles",
  topics: "create_help_topics", collections: "create_help_collections", pages: "create_help_pages",
  authors: "create_help_authors", glossary: "create_help_glossary", "ui-strings": "create_help_ui_strings",
  users: "create_help_users",
};
export async function CreationHelp({ req, collectionSlug }: UIFieldServerProps) {
  const key = helpKeys[collectionSlug];
  if (!key) return null;
  const locale = req.locale === "ps" || req.locale === "fa" ? req.locale : "en";
  const { ui } = await getMergedMessages(locale);
  return <aside className="br-creation-help" dir={locale === "en" ? "ltr" : "rtl"}>
    <p>{ui[key]}</p>
    {collectionSlug === "media" && <Link href="/admin/collections/videos/create">{ui.new_video}</Link>}
  </aside>;
}
