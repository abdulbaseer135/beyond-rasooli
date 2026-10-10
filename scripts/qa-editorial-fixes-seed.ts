import { getPayload } from "payload";
import config from "../src/payload.config";
import en from "../src/messages/en.json";
import ps from "../src/messages/ps.json";
import fa from "../src/messages/fa.json";
if (process.env.DATABASE_URI !== "file:./.qa/editorial-fixes.sqlite" || process.env.BEYOND_QA !== "true") throw new Error("Isolated QA database required");
const payload = await getPayload({ config });
const existing = await payload.find({ collection: "users", overrideAccess: true, where: { email: { equals: "founder-fixes@example.test" } } });
const founder = existing.docs[0] || await payload.create({ collection: "users", overrideAccess: true, data: { name: "QA Founder", email: "founder-fixes@example.test", password: "QA-founder-fixes-9273!", role: "admin", status: "approved" } });
const editor = await payload.find({ collection: "users", overrideAccess: true, where: { email: { equals: "editor-fixes@example.test" } } });
if (!editor.docs.length) await payload.create({ collection: "users", user: founder, overrideAccess: true, data: { name: "QA Contributor", email: "editor-fixes@example.test", password: "QA-editor-fixes-9273!", role: "editor", status: "approved" } });
for (const [namespace, values] of Object.entries(en)) for (const [key, value] of Object.entries(values)) {
  const name = `${namespace}.${key}`;
  const found = await payload.find({ collection: "ui-strings", overrideAccess: true, where: { key: { equals: name } }, limit: 1 });
  if (!found.docs.length) await payload.create({ collection: "ui-strings", overrideAccess: true, user: founder, data: { key: name, namespace: namespace as never, valueEn: value, valuePs: (ps as Record<string, Record<string, string>>)[namespace]?.[key] || value, valueFa: (fa as Record<string, Record<string, string>>)[namespace]?.[key] || value } });
}
console.log("Isolated QA users and UI strings ready.");
process.exit(0);
