import { VideoCard } from "@/components/cards/VideoCard";
import type { PublicVideo } from "@/lib/data/content-types";
export function WatchLibrary({
  initialVideos,
}: {
  initialVideos: PublicVideo[];
  locale: string;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {initialVideos.map((v) => (
        <VideoCard key={v.id} {...v} />
      ))}
    </div>
  );
}
