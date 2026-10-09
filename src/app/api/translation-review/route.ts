import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { canAccessEditorial } from "@/collections/shared/auth-roles";
export async function GET(req: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  if (!user || !canAccessEditorial(user))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const u = new URL(req.url);
  const collection =
    u.searchParams.get("collection") === "videos" ? "videos" : "articles";
  const id = u.searchParams.get("id");
  if (!id) {
    const result = await payload.find({
      collection,
      overrideAccess: false,
      user,
      depth: 0,
      limit: 100,
      sort: "-updatedAt",
    });
    return NextResponse.json(
      {
        items: result.docs.map((d) => ({
          id: d.id,
          title: d.title,
          language: d.language,
          translationGroup: d.translationGroup,
        })),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }
  try {
    const target = await payload.findByID({
      collection,
      id,
      user,
      overrideAccess: false,
      depth: 1,
    });
    const sources = await payload.find({
      collection,
      user,
      overrideAccess: false,
      depth: 1,
      limit: 3,
      where: {
        and: [
          { translationGroup: { equals: target.translationGroup } },
          { language: { not_equals: target.language } },
        ],
      },
    });
    const source =
      sources.docs.find(
        (d) =>
          d.language ===
          ("translatedFromLocale" in target
            ? target.translatedFromLocale
            : undefined),
      ) || sources.docs.find((d) => d.translationStatus === "none");
    return NextResponse.json(
      { target, source, collection },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
export async function PATCH(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  if (!user || !canAccessEditorial(user))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { collection, id, title, text, body, transcript, seoTitle, metaDescription } = await req.json();
    if (body !== undefined && (JSON.stringify(body).length > 200000 || !body?.root || !Array.isArray(body.root.children))) return NextResponse.json({error:"invalid_request"},{status:400});
    if ([transcript, seoTitle, metaDescription].some(value => value !== undefined && (typeof value !== "string" || value.length > 50000))) return NextResponse.json({error:"invalid_request"},{status:400});
    if (
      !["articles", "videos"].includes(collection) ||
      !id ||
      typeof title !== "string" ||
      !title.trim() ||
      typeof text !== "string" ||
      !text.trim() ||
      text.length > 50000
    )
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    const slug = collection as "articles" | "videos";
    await payload.update({
      collection: slug,
      id,
      user,
      overrideAccess: false,
      data:
        slug === "articles"
          ? { title, summary: text, ...(body !== undefined ? {body} : {}), ...(seoTitle !== undefined ? {seoTitle} : {}), ...(metaDescription !== undefined ? {metaDescription} : {}), translationStatus: "reviewed" }
          : { title, description: text, ...(transcript !== undefined ? {transcript} : {}), ...(seoTitle !== undefined ? {seoTitle} : {}), ...(metaDescription !== undefined ? {metaDescription} : {}), translationStatus: "reviewed" },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "save_error" }, { status: 400 });
  }
}
