import { getPayload } from "payload";
import config from "../src/payload.config";
import en from "../src/messages/en.json";
import ps from "../src/messages/ps.json";
import fa from "../src/messages/fa.json";
if (process.env.DATABASE_URI !== "file:./.qa/final.sqlite")
  throw new Error("Isolated QA only");
const payload = await getPayload({ config });
const user = (
  await payload.find({
    collection: "users",
    where: { email: { equals: "qa@beyondrasooli.test" } },
    limit: 1,
  })
).docs[0];
for (const key of [
  "ui.add_content",
  "ui.new_video",
  "ui.new_article",
  "ui.new_topic",
  "ui.new_collection",
  "ui.new_page",
  "topics.empty",
]) {
  if (
    (
      await payload.find({
        collection: "ui-strings",
        where: { key: { equals: key } },
        limit: 1,
      })
    ).docs.length
  )
    continue;
  const [namespace, k] = key.split(".");
  const value = (dictionary: Record<string, Record<string, string>>) =>
    dictionary[namespace][k];
  await payload.create({
    collection: "ui-strings",
    user,
    overrideAccess: false,
    data: {
      key,
      namespace: namespace as "ui" | "topics",
      valueEn: value(en),
      valuePs: value(ps),
      valueFa: value(fa),
      statusPs: "ai_draft",
      statusFa: "ai_draft",
    },
  });
}
await payload.destroy();
console.log("Isolated QA strings added without approval");
process.exit(0);
