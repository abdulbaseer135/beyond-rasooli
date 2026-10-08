import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });
const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");
const { dictionaries, missingUIValues } =
  await import("../src/lib/localization/ui-seed");
const seedConfig = await config;
// Repair stored content only; this command never pushes schema changes.
if (process.env.DATABASE_URI?.startsWith("postgres")) {
  const { postgresAdapter } = await import("@payloadcms/db-postgres");
  const adapter = postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
    push: false,
  });
  seedConfig.db = {
    ...adapter,
    allowIDOnCreate: adapter.allowIDOnCreate ?? false,
    name: adapter.name ?? "postgres",
  };
}
if (!process.env.DATABASE_URI?.startsWith("postgres")) {
  const { sqliteAdapter } = await import("@payloadcms/db-sqlite");
  const adapter = sqliteAdapter({client:{url:process.env.DATABASE_URI || "file:./data/beyond_rasooli.sqlite"},push:false});
  seedConfig.db = {...adapter,allowIDOnCreate:adapter.allowIDOnCreate??false,name:adapter.name??"sqlite"};
}
const payload = await getPayload({ config: seedConfig });
const report: {
  created: string[];
  filled: { key: string; fields: string[] }[];
  remaining: { key: string; locale: string }[];
  settingsFilled: string[];
} = { created: [], filled: [], remaining: [], settingsFilled: [] };
try {
  const records = new Map<string, import("../src/payload-types").UiString>();
  let page = 1;
  for (;;) {
    const result = await payload.find({
      collection: "ui-strings",
      overrideAccess: true,
      depth: 0,
      limit: 500,
      page,
    });
    for (const doc of result.docs) records.set(doc.key, doc);
    if (!result.hasNextPage) break;
    page++;
  }
  const user = (
    await payload.find({
      collection: "users",
      overrideAccess: true,
      where: { role: { equals: "admin" } },
      limit: 1,
      depth: 0,
    })
  ).docs[0];
  for (const [namespace, values] of Object.entries(dictionaries.en))
    for (const name of Object.keys(values)) {
      const key = `${namespace}.${name}`;
      const existing = records.get(key);
      const patch = missingUIValues(key, existing);
      let doc = existing;
      if (!existing) {
        doc = await payload.create({
          collection: "ui-strings",
          user,
          overrideAccess: true,
          data: {
            key,
            namespace:
              namespace as import("../src/payload-types").UiString["namespace"],
            ...patch,
          } as never,
        });
        report.created.push(key);
      } else if (Object.keys(patch).length) {
        doc = await payload.update({
          collection: "ui-strings",
          user,
          id: existing.id,
          overrideAccess: true,
          data: patch,
        });
        report.filled.push({ key, fields: Object.keys(patch) });
      }
      if (!doc) throw new Error("ui_seed_failed");
      records.set(key, doc);
      for (const locale of ["en", "ps", "fa"] as const)
        if (
          !(
            locale === "en"
              ? doc.valueEn
              : locale === "ps"
                ? doc.valuePs
                : doc.valueFa
          )?.trim()
        )
          report.remaining.push({ key, locale });
      if (report.created.length && report.created.length % 50 === 0)
        console.log(
          `Created ${report.created.length} missing localized UI records`,
        );
    }
  for (const locale of ["en", "ps", "fa"] as const) {
    const settings = await payload.findGlobal({
      slug: "site-settings",
      locale,
      fallbackLocale: false,
      overrideAccess: true,
    });
    if (!settings.tagline?.trim()) {
      const ui = (
        await payload.find({
          collection: "ui-strings",
          where: { key: { equals: "footer.tagline" } },
          overrideAccess: true,
          limit: 1,
        })
      ).docs[0];
      const tagline =
        locale === "ps"
          ? ui.valuePs
          : locale === "fa"
            ? ui.valueFa
            : ui.valueEn;
      if (tagline) {
        await payload.updateGlobal({
          slug: "site-settings",
          locale,
          overrideAccess: true,
          data: { tagline },
        });
        report.settingsFilled.push(locale);
      }
    }
  }
  const fs = await import("node:fs/promises");
  await fs.mkdir(".qa", { recursive: true });
  await fs.writeFile(
    ".qa/localization-seed-results.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        created: report.created.length,
        filled: report.filled.length,
        settingsFilled: report.settingsFilled,
        remaining: report.remaining,
      },
      null,
      2,
    ),
  );
} finally {
  await payload.destroy();
}
process.exit(0);
