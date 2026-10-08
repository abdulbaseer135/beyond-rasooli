import { getPayload } from "payload";
import config from "../src/payload.config";
import ps from "../src/messages/ps.json";
import fa from "../src/messages/fa.json";
if (process.env.DATABASE_URI !== "file:./.qa/final.sqlite")
  throw new Error("Isolated QA database required");
const payload = await getPayload({ config });
const result = await payload.find({
  collection: "ui-strings",
  limit: 1000,
  depth: 0,
});
let updated = 0;
for (const doc of result.docs) {
  const [namespace, key] = doc.key.split(".");
  const data: { valuePs?: string; valueFa?: string } = {};
  if (!doc.valuePs)
    data.valuePs = (ps as Record<string, Record<string, string>>)[namespace]?.[
      key
    ];
  if (!doc.valueFa)
    data.valueFa = (fa as Record<string, Record<string, string>>)[namespace]?.[
      key
    ];
  if (Object.values(data).some(Boolean)) {
    await payload.update({
      collection: "ui-strings",
      id: doc.id,
      data,
      overrideAccess: true,
    });
    updated++;
  }
}
console.log(
  `Updated ${updated} isolated QA starter strings; review remains required.`,
);
await payload.destroy();
process.exit(0);
