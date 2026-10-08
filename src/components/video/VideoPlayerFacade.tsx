"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Play, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { extractYouTubeId, isVerticalVideo } from "@/lib/youtube";

export interface VideoPlayerFacadeProps {
  youtubeUrl: string;
  title: string;
  posterUrl?: string;
  className?: string;
  isVertical?: boolean;
  onPlay?: () => void;
}

export function VideoPlayerFacade({
  youtubeUrl,
  title,
  posterUrl,
  className = "",
  isVertical: explicitIsVertical,
  onPlay,
}: VideoPlayerFacadeProps) {
  const t = useTranslations("ui");
  const id = extractYouTubeId(youtubeUrl);
  const isVertical = explicitIsVertical ?? isVerticalVideo(youtubeUrl);

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const watchUrl = id ? `https://www.youtube.com/watch?v=${id}` : undefined;

  useEffect(() => {
    if (playing && !loading) {
      frame.current?.focus();
    }
  }, [playing, loading]);

  const handlePlay = () => {
    setFailed(false);
    setLoading(true);
    setPlaying(true);
    onPlay?.();
  };

  const handleRetry = () => {
    setFailed(false);
    setLoading(true);
    setPlaying(true);
  };

  const formatClass = isVertical ? "video-player-vertical" : "video-player-landscape";

  return (
    <div className={`video-player ${formatClass} ${className}`}>
      <div className={`video-player-ratio ${isVertical ? "ratio-vertical" : "ratio-landscape"}`}>
        {!id || failed ? (
          <div className="player-failure-state" role="alert">
            <AlertCircle className="w-8 h-8 text-[var(--ink-muted)] mb-3" strokeWidth={1.5} />
            <p className="type-ui player-unavailable-text mb-4">
              {t("unavailable_video")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="button button-secondary text-sm py-2 px-4"
                onClick={handleRetry}
              >
                <RefreshCw className="w-4 h-4 me-1.5" strokeWidth={1.5} />
                {t("retry")}
              </button>
              {watchUrl && (
                <a
                  href={watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-primary text-sm py-2 px-4 inline-flex items-center"
                >
                  <ExternalLink className="w-4 h-4 me-1.5" strokeWidth={1.5} />
                  {t("watch_youtube")}
                </a>
              )}
            </div>
          </div>
        ) : playing ? (
          <div className="relative w-full h-full bg-[var(--inverse-bg)]">
            {loading && (
              <div className="player-loading-overlay" aria-hidden="true">
                <div className="player-spinner" />
              </div>
            )}
            <iframe
              ref={frame}
              tabIndex={0}
              src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setLoading(false)}
              onError={() => {
                setFailed(true);
                setLoading(false);
              }}
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <button
            className="player-facade"
            type="button"
            onClick={handlePlay}
            aria-label={t("play_video", { title })}
          >
            <Image
              src={posterUrl || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              fill
              sizes={
                isVertical
                  ? "(max-width: 480px) 100vw, 420px"
                  : "(max-width: 768px) 100vw, 960px"
              }
              className="object-cover"
              onError={(e) => {
                e.currentTarget.style.visibility = "hidden";
              }}
            />
            <span className="video-play-cue" aria-hidden="true">
              <Play strokeWidth={1.5} className="w-6 h-6 ms-0.5 fill-current" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
