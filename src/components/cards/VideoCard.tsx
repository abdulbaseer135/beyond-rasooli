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
              sizes="(min-width:1024px) 280px, (min-width:480px) 45vw, 100vw"
              className="object-cover"
            />
          )}
          <span className="video-play-cue" aria-hidden="true">
            <Play strokeWidth={1.5} />
          </span>
          {duration && (
            <bdi className="video-duration type-meta">{duration}</bdi>
          )}
        </div>
        <div className="video-card-copy">
          <div className="card-meta type-meta">
            <span>{topicName}</span>
            <span>{t(`language_${audio}`)}</span>
          </div>
          <h3 className="type-h3">{title}</h3>
        </div>
      </Link>
    </article>
  );
}
