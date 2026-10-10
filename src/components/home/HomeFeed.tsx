"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { TopicChip, TopicChipBar } from "@/components/ui/TopicChip";
import { VideoCard } from "@/components/cards/VideoCard";
import type { PublicVideo } from "@/lib/data/content-types";
export function HomeFeed({
  initialVideos,
}: {
  initialVideos: PublicVideo[];
  locale: string;
}) {
  const t = useTranslations("ui");
  const home = useTranslations("home");
  const [topic, setTopic] = useState("all");
  const topics = [
    ...new Map(initialVideos.map((v) => [v.topicSlug, v.topicName])).entries(),
  ];
  const videos =
    topic === "all"
      ? initialVideos
      : initialVideos.filter((v) => v.topicSlug === topic);
  return (
    <div className="space-y-6">
      <TopicChipBar>
        <TopicChip
          label={home("chip_all")}
          isSelected={topic === "all"}
          onClick={() => setTopic("all")}
        />
        {topics.map(([slug, name]) => (
          <TopicChip
            key={slug}
            label={name}
            isSelected={topic === slug}
            onClick={() => setTopic(slug)}
          />
        ))}
      </TopicChipBar>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
        {videos.slice(0, 8).map((v) => (
          <VideoCard key={v.id} {...v} />
        ))}
      </div>
      {!videos.length && <p role="status">{t("no_results")}</p>}
    </div>
  );
}
