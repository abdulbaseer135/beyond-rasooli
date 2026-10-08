import { revalidateTag, revalidatePath } from "next/cache";

export function invalidateCache(tag: string): void {
  try {
    (revalidateTag as unknown as (t: string, p?: unknown) => void)(tag, { expire: 0 });
    revalidatePath("/[locale]", "layout");
  } catch {
    // Graceful fallback if invoked outside Next.js request lifecycle (e.g. migrations or CLI scripts)
  }
}
