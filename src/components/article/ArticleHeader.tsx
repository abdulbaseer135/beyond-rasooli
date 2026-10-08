"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ShareRow } from "@/components/article/ShareRow";
export interface ArticleHeaderProps {
  title: string;
  standfirst: string;
  topicName: string;
  topicSlug: string;
  formatName?: string;
  authorName: string;
  publishedDate: string;
  updatedDate?: string;
  readingTimeMinutes: number;
}
export function ArticleHeader({
  title,
  standfirst,
  topicName,
  topicSlug,
  formatName,
  authorName,
  publishedDate,
  updatedDate,
  readingTimeMinutes,
}: ArticleHeaderProps) {
  const t = useTranslations("ui");
  return (
    <header className="article-measure article-heading">
      <nav aria-label={t("breadcrumb")} className="type-meta">
        <Link href={`/topics/${topicSlug}`} className="text-link">
          {topicName}
        </Link>
        {formatName && <span> / {formatName}</span>}
      </nav>
      <h1 className="type-h1">{title}</h1>
      <div className="card-meta type-meta">
        <bdi>{t("by", { name: authorName })}</bdi>
        <span>{publishedDate}</span>
        {updatedDate && <span>{t("updated", { date: updatedDate })}</span>}
        <span>{t("read_time", { minutes: readingTimeMinutes })}</span>
      </div>
      <ShareRow title={title} />
      <p className="type-standfirst">{standfirst}</p>
    </header>
  );
}
