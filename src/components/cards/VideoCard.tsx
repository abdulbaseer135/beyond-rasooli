"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
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
}: VideoCardProps) {
  const t = useTranslations("ui");
  const audio = spokenLanguage || language;
  return (
    <article className={`video-card ${className}`}>
      <Link href={`/watch/${slug}`} className="editorial-card-link">
        <div className="video-card-poster">
          {posterUrl && (
            <Image
              src={posterUrl}
              alt={posterAlt}
              fill
              sizes="(min-width:1280px) 340px, (min-width:768px) 33vw, (min-width:480px) 50vw, 100vw"
              className="object-cover"
            />
          )}
          <span className="video-play-cue" aria-hidden="true">
            <Play strokeWidth={1.5} className="w-5 h-5 translate-x-0.5" />
          </span>
          {duration && (
            <bdi className="video-duration type-meta">{duration}</bdi>
          )}
        </div>
        <div className="video-card-copy">
          <div className="card-meta type-meta text-xs uppercase tracking-wider font-medium text-[var(--sage-700)]">
            <span>{topicName}</span>
            <span>•</span>
            <span className="text-[var(--ink-muted)]">{t(`language_${audio}`)}</span>
          </div>
          <h3 className="type-h3 line-clamp-2 text-lg sm:text-xl">{title}</h3>
        </div>
      </Link>
    </article>
  );
}
