import { revalidateTag, revalidatePath } from "next/cache";

export function invalidateCache(tag: string): void {
  try {
    // Purge tag cache in Next.js 16
    try {
      (revalidateTag as unknown as (t: string, p?: unknown) => void)(tag, { expire: 0 });
    } catch {
      try {
        revalidateTag(tag, "max");
      } catch {
        // fallback
      }
    }

    // Invalidate root layout so all public routes (/en, /ps, /fa, /en/read, /watch, etc.) receive fresh data
    revalidatePath("/", "layout");
  } catch {
    // Graceful fallback if invoked outside Next.js request lifecycle (e.g. migrations or CLI scripts)
  }
}

