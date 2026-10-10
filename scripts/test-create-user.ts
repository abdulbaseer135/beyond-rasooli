import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });
import { getPayload } from "payload";

async function testCreateUser() {
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });
  try {
    const user = await payload.create({
      collection: "users",
      overrideAccess: true,
      context: { publicEditorRegistration: true },
      data: {
        name: "Test Editor Application",
        email: `test-editor-${Date.now()}@example.com`,
        password: "TestPassword123!",
        role: "editor",
        status: "pending",
        bio: "Testing registration",
        reasonForJoining: "Testing",
      },
    });
    console.log("Success! Created user id:", user.id);
    // Clean up
    await payload.delete({
      collection: "users",
      id: user.id,
      overrideAccess: true,
    });
    console.log("Cleaned up test user.");
  } catch (err: any) {
    console.error("Payload create error:", err);
    if (err.data?.errors) {
      console.error("Errors detail:", JSON.stringify(err.data.errors, null, 2));
    }
  }
}

testCreateUser().then(() => process.exit(0)).catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
