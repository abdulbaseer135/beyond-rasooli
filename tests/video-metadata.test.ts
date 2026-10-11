import test from "node:test";
import assert from "node:assert/strict";
import { populateVideoLinkMetadata } from "../src/collections/shared/video-metadata";

test("a YouTube link supplies hidden poster and duration metadata", async () => {
  const previousFetch = globalThis.fetch;
  const previousKey = process.env.YOUTUBE_API_KEY;
  process.env.YOUTUBE_API_KEY = "test-key";
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes("oembed")) {
      return Response.json({
        title: "A linked video",
        thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      });
    }
    return Response.json({ items: [{ contentDetails: { duration: "PT1M2S" } }] });
  };
  try {
    const data: Record<string, unknown> = {
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    };
    await populateVideoLinkMetadata({ data, originalDoc: undefined } as never);
    assert.equal(data.remotePosterUrl, "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
    assert.equal(data.duration, "1:02");
    assert.equal(data.durationSeconds, 62);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.YOUTUBE_API_KEY;
    else process.env.YOUTUBE_API_KEY = previousKey;
  }
});
