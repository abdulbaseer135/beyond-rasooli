import { VideoCard } from "@/components/cards/VideoCard";
import type { PublicVideo } from "@/lib/data/content-types";
export function WatchLibrary({
  initialVideos,
}: {
  initialVideos: PublicVideo[];
  locale: string;
}) {
  return (
    <div className="video-grid">
      {initialVideos.map((v) => (
        <VideoCard key={v.id} {...v} />
      ))}
    </div>
  );
}
