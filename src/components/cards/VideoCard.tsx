"use client";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Play } from "lucide-react";
export interface VideoCardProps {
  slug: string;
  title: string;
  topicName: string;
  duration: string;
  language: string;
  spokenLanguage?: string;
  posterUrl?: string;
  posterAlt?: string;
  className?: string;
  headingLevel?: 2 | 3;
  showMetadata?: boolean;
  showDuration?: boolean;
}
export function VideoCard({
  slug,
  title,
  topicName,
  duration,
  language,
  spokenLanguage,
  posterUrl,
  posterAlt = "",
  className = "",
  headingLevel = 3,
  showMetadata = true,
  showDuration = true,
}: VideoCardProps) {
  const t = useTranslations("ui");
  const uiLocale = useLocale();
  const audio = spokenLanguage || language;
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className={`video-card ${className}`} lang={language === "fa" ? "fa-AF" : language} dir={language === "en" ? "ltr" : "rtl"}>
      <Link href={`/watch/${slug}`} className="editorial-card-link">
        <div className="video-card-poster">
          {posterUrl && (
            <Image
              src={posterUrl}
              alt={posterAlt}
              fill
              sizes="(min-width:1280px) 262px, (min-width:1024px) 23vw, (min-width:768px) 30vw, 45vw"
              className="object-contain"
            />
          )}
          <span className="video-play-cue" aria-hidden="true">
            <Play strokeWidth={1.5} className="w-5 h-5 translate-x-0.5" />
          </span>
          {showDuration && duration && (
            <bdi className="video-duration type-meta">{duration}</bdi>
          )}
        </div>
        <div className="video-card-copy">
          {showMetadata && <div className="card-meta type-meta text-xs uppercase tracking-wider font-medium text-[var(--sage-700)]">
            <span>{topicName}</span>
            <span aria-hidden="true">•</span>
            <span className="font-editorial-sans text-[var(--ink-muted)]" lang={uiLocale === "fa" ? "fa-AF" : uiLocale} dir={uiLocale === "en" ? "ltr" : "rtl"}>{t(`language_${audio}`)}</span>
          </div>}
          <Heading className="type-h3">{title}</Heading>
        </div>
      </Link>
    </article>
  );
}
