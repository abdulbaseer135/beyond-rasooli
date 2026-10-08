"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
export interface ArticleCardProps {
  slug: string;
  title: string;
  summary: string;
  topicName: string;
  readingTimeMinutes: number;
  publishedDate: string;
  authorName?: string;
  coverImageUrl?: string;
  coverAlt?: string;
  isFeature?: boolean;
  className?: string;
  language?: "en" | "ps" | "fa";
}
export function ArticleCard({
  slug,
  title,
  summary,
  topicName,
  readingTimeMinutes,
  publishedDate,
  authorName,
  coverImageUrl,
  coverAlt = "",
  isFeature = false,
  className = "",
  language,
}: ArticleCardProps) {
  const t = useTranslations("ui");
  return (
    <article
      lang={language === "fa" ? "fa-AF" : language}
      dir={language ? (language === "en" ? "ltr" : "rtl") : undefined}
      className={`article-card ${isFeature ? "article-feature" : ""} ${className}`}
    >
      <Link
        href={`/read/${slug}`}
        locale={language}
        className="editorial-card-link"
      >
        {coverImageUrl && (
          <div className="article-card-image">
            <Image
              src={coverImageUrl}
              alt={coverAlt}
              fill
              sizes={
                isFeature
                  ? "(min-width:1024px) 700px, 100vw"
                  : "(min-width:1024px) 380px, (min-width:480px) 50vw, 100vw"
              }
              className="object-cover"
            />
          </div>
        )}
        <div className="article-card-copy">
          <p className="type-meta text-[var(--sage-700)]">{topicName}</p>
          {isFeature ? (
            <h2 className="type-h2">{title}</h2>
          ) : (
            <h3 className="type-h3">{title}</h3>
          )}
          <p className={isFeature ? "type-standfirst" : "type-ui"}>{summary}</p>
          <div className="card-meta type-meta">
            {authorName && <bdi>{authorName}</bdi>}
            <span>{publishedDate}</span>
            <span>{t("read_time", { minutes: readingTimeMinutes })}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
