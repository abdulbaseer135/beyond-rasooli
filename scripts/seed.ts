import { missingUIValues } from "../src/lib/localization/ui-seed";
import config from "../src/payload.config";
import { getPayload } from "payload";
import type { UiString } from "../src/payload-types";
import { SEED_TOPICS } from "../src/lib/data/seed-data";
import en from "../src/messages/en.json";
import ps from "../src/messages/ps.json";
import fa from "../src/messages/fa.json";
const payload = await getPayload({ config });
const users = await payload.find({
  collection: "users",
  where: { role: { equals: "admin" } },
  limit: 1,
  overrideAccess: true,
});
let admin = users.docs[0];
if (!admin) {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password || password.length < 12)
    throw new Error(
      "Create a founder account in Payload, or supply SEED_ADMIN_EMAIL and a secure SEED_ADMIN_PASSWORD.",
    );
  admin = await payload.create({
    collection: "users",
    overrideAccess: true,
    data: {
      email,
      password,
      role: "admin",
      status: "approved",
      name: process.env.SEED_ADMIN_NAME || "Beyond Rasooli",
    } as any,
  });
}
let created = 0;
for (const [namespace, values] of Object.entries(en))
  for (const [key, value] of Object.entries(values)) {
    const fullKey = `${namespace}.${key}`;
    const existing = await payload.find({
      collection: "ui-strings",
      where: { key: { equals: fullKey } },
      limit: 1,
    });
    if (existing.totalDocs) {
      const patch = missingUIValues(fullKey, existing.docs[0]);
      if (Object.keys(patch).length)
        await payload.update({
          collection: "ui-strings",
          id: existing.docs[0].id,
          user: admin,
          overrideAccess: false,
          data: patch,
        });
      continue;
    }
    await payload.create({
      collection: "ui-strings",
      user: admin,
      overrideAccess: false,
      data: {
        key: fullKey,
        namespace: namespace as UiString["namespace"],
        valueEn: value,
        valuePs:
          (ps as Record<string, Record<string, string>>)[namespace]?.[key] ||
          "",
        valueFa:
          (fa as Record<string, Record<string, string>>)[namespace]?.[key] ||
          "",
        statusPs: "ai_draft",
        statusFa: "ai_draft",
      },
    });
    created++;
  }
for (const topic of SEED_TOPICS) {
  const existing = await payload.find({
    collection: "topics",
    where: { slug: { equals: topic.slug } },
    limit: 1,
  });
  if (existing.totalDocs) continue;
  const doc = await payload.create({
    collection: "topics",
    locale: "en",
    user: admin,
    overrideAccess: false,
    data: {
      slug: topic.slug,
      name: topic.name.en,
      description: topic.description.en,
      order: topic.order,
      status: "published",
    },
  });
  for (const locale of ["ps", "fa"] as const)
    if (topic.name[locale])
      await payload.update({
        collection: "topics",
        id: doc.id,
        locale,
        user: admin,
        overrideAccess: false,
        data: {
          name: topic.name[locale],
          description: topic.description[locale],
        },
      });
}
// Legal text and approval remain exclusively the founder's responsibility. No legal pages or public stories are invented here.
console.log(
  `Created ${created} missing UI records. Existing wording, approval statuses and public content were preserved.`,
);
await payload.destroy();
