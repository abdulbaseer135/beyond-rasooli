"use client";
import { useTranslations } from "next-intl";
import { VideoCard } from "@/components/cards/VideoCard";
import type { PublicVideo } from "@/lib/data/content-types";
export function HomeFeed({
  initialVideos,
}: {
  initialVideos: PublicVideo[];
  locale: string;
}) {
  const t = useTranslations("ui");
  return (
    <div className="space-y-6">
      <div className="home-video-row">
        {initialVideos.slice(0, 4).map((v) => (
          <VideoCard key={v.id} {...v} showMetadata={false} showDuration={false} />
        ))}
      </div>
      {!initialVideos.length && <p role="status">{t("no_results")}</p>}
    </div>
  );
}
