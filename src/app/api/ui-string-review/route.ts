import en from "@/messages/en.json";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export async function GET(req: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  if (!user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const docs = [];
  let page = 1;
  for (;;) {
    const result = await payload.find({
      collection: "ui-strings",
      user,
      overrideAccess: false,
      depth: 0,
      limit: 250,
      page,
      sort: "key",
    });
    docs.push(...result.docs);
    if (!result.hasNextPage) break;
    page++;
  }
  const items = docs.map((doc) => ({
    id: doc.id,
    key: doc.key,
    namespace: doc.namespace,
    en: doc.valueEn,
    ps: doc.valuePs || "",
    fa: doc.valueFa || "",
    statusPs: doc.valuePs?.trim() ? doc.statusPs : "missing",
    statusFa: doc.valueFa?.trim() ? doc.statusFa : "missing",
  }));
  const known = new Set(items.map((d) => d.key));
  for (const [namespace, values] of Object.entries(en))
    for (const [key, value] of Object.entries(values))
      if (!known.has(`${namespace}.${key}`))
        items.push({
          id: 0,
          key: `${namespace}.${key}`,
          namespace: namespace as (typeof items)[number]["namespace"],
          en: value,
          ps: "",
          fa: "",
          statusPs: "missing",
          statusFa: "missing",
        });
  return NextResponse.json(
    { total: items.length, items, canApprove: user.role === "admin" },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}

export async function PATCH(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  if (!user) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { key, locale, status } = await req.json();
  if (
    typeof key !== "string" ||
    !["ps", "fa"].includes(locale) ||
    !["ai_draft", "needs_review", "approved"].includes(status)
  ) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  if (status === "approved" && user.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const result = await payload.find({
    collection: "ui-strings",
    user,
    overrideAccess: false,
    where: { key: { equals: key } },
    limit: 1,
  });
  const doc = result.docs[0];
  if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (
    status === "approved" &&
    !(locale === "ps" ? doc.valuePs : doc.valueFa)?.trim()
  ) {
    return NextResponse.json({ error: "missing_value" }, { status: 400 });
  }
  await payload.update({
    collection: "ui-strings",
    id: doc.id,
    user,
    overrideAccess: false,
    data: locale === "ps" ? { statusPs: status } : { statusFa: status },
  });
  return NextResponse.json({ success: true });
}
