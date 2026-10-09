import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { canAccessEditorial } from "@/collections/shared/auth-roles";
import { fetchYouTubeMetadata } from "@/lib/youtube";
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) return NextResponse.json({error:"forbidden"},{status:403});
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  if (!user || !canAccessEditorial(user))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { url } = await req.json();
    if (typeof url !== "string" || url.length > 2048)
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    const metadata = await fetchYouTubeMetadata(url);
    return metadata
      ? NextResponse.json(metadata)
      : NextResponse.json({ error: "invalid_request" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "youtube_metadata_unavailable" },
      { status: 502 },
    );
  }
}
