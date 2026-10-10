"use client";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
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
  compact?: boolean;
  headingLevel?: 2 | 3;
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
  compact = false,
  headingLevel = 3,
  className = "",
  language,
}: ArticleCardProps) {
  const t = useTranslations("ui");
  const uiLocale = useLocale();
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article
      lang={language === "fa" ? "fa-AF" : language}
      dir={language ? (language === "en" ? "ltr" : "rtl") : undefined}
      className={`article-card ${isFeature ? "article-feature" : ""} ${coverImageUrl ? "" : "no-cover"} ${className}`}
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
                  ? "(min-width:1280px) 600px, (min-width:768px) 52vw, 100vw"
                  : "(min-width:1280px) 352px, (min-width:1024px) 30vw, (min-width:768px) 45vw, 100vw"
              }
              className="object-cover"
            />
          </div>
        )}
        <div className="article-card-copy">
          {!compact && <p className="type-meta text-xs uppercase tracking-wider font-semibold text-[var(--sage-700)]">
            {topicName}
          </p>}
          {isFeature ? (
            <h2 className="type-h2">{title}</h2>
          ) : (
            <Heading className="type-h3 line-clamp-2">{title}</Heading>
          )}
          {!compact && <p className={`${isFeature ? "type-standfirst" : "type-ui"} line-clamp-3 text-[var(--ink-muted)]`}>
            {summary}
          </p>}
          <div className="card-meta type-meta text-xs" lang={uiLocale === "fa" ? "fa-AF" : uiLocale} dir={uiLocale === "en" ? "ltr" : "rtl"}>
            {authorName && <bdi className="font-medium text-[var(--ink)]">{authorName}</bdi>}
            {!compact && authorName && <span>•</span>}
            <span>{publishedDate}</span>
            {!compact && <span>•</span>}
            {!compact && <span className="font-editorial-sans" lang={uiLocale === "fa" ? "fa-AF" : uiLocale} dir={uiLocale === "en" ? "ltr" : "rtl"}>{t("read_time", { minutes: readingTimeMinutes })}</span>}
          </div>
        </div>
      </Link>
    </article>
  );
}
