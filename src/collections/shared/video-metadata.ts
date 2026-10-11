import type { CollectionBeforeChangeHook } from "payload";
import { extractYouTubeId, fetchYouTubeMetadata } from "@/lib/youtube";

/** Derive video artwork and duration from the linked YouTube video. */
export const populateVideoLinkMetadata: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
}) => {
  const youtubeUrl = typeof data.youtubeUrl === "string" ? data.youtubeUrl.trim() : "";
  const originalUrl = typeof originalDoc?.youtubeUrl === "string" ? originalDoc.youtubeUrl.trim() : "";
  const videoId = extractYouTubeId(youtubeUrl);
  if (!videoId) return data;

  const isNewLink = youtubeUrl !== originalUrl;
  const hasPoster = Boolean(data.remotePosterUrl ?? originalDoc?.remotePosterUrl);
  if (!isNewLink && hasPoster) return data;

  // This stable fallback works even during a temporary metadata outage.
  data.remotePosterUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  if (isNewLink) {
    data.duration = "";
    data.durationSeconds = null;
  }

  try {
    const metadata = await fetchYouTubeMetadata(youtubeUrl);
    if (!metadata) return data;
    data.remotePosterUrl = metadata.thumbnailUrl;
    if (metadata.duration && typeof metadata.durationSeconds === "number") {
      data.duration = metadata.duration;
      data.durationSeconds = metadata.durationSeconds;
    }
  } catch {
    // A valid URL remains saveable if YouTube is temporarily unavailable.
  }
  return data;
};
