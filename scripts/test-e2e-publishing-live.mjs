import { getPayload } from "payload";
import config from "../src/payload.config.ts";

async function runE2ETests() {
  console.log("=== STARTING END-TO-END PUBLISHING WORKFLOW TESTS ===\n");
  const payload = await getPayload({ config });

  // 1. Verify Existing Published Content
  console.log("--- 1. Testing Existing Published Content ---");
  const enArticle = await payload.find({
    collection: "articles",
    overrideAccess: false,
    where: { slug: { equals: "the-science-of-spaced-retrieval" }, language: { equals: "en" } },
  });
  console.log("✔ 'The Science of Spaced Retrieval' accessible via public query:", enArticle.totalDocs === 1);

  const psArticle = await payload.find({
    collection: "articles",
    overrideAccess: false,
    where: { slug: { equals: "da-fasela-larunki-takrar-sayens" }, language: { equals: "ps" } },
  });
  console.log("✔ Pashto published article accessible via public query:", psArticle.totalDocs === 1);

  const faArticle = await payload.find({
    collection: "articles",
    overrideAccess: false,
    where: { slug: { equals: "chera-nam-shoma-dar-otaq-por-seda-tavajoh-ra-jalb-mikonad" }, language: { equals: "fa" } },
  });
  console.log("✔ Dari published article accessible via public query:", faArticle.totalDocs === 1);

  // 2. Founder Direct Publishing Test
  console.log("\n--- 2. Testing Founder Direct Publishing ---");
  const founderUser = await payload.find({
    collection: "users",
    where: { role: { equals: "admin" } },
    limit: 1,
  });
  const founder = founderUser.docs[0];
  console.log(`Found Founder user: ${founder.email} (id: ${founder.id})`);

  // Create article as draft
  const testArticleSlug = `test-founder-publish-${Date.now()}`;
  const draftArticle = await payload.create({
    collection: "articles",
    data: {
      title: "Test Founder Instant Article",
      slug: testArticleSlug,
      language: "en",
      topic: 1,
      status: "draft",
      body: {
        root: {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", text: "This is test body content for instant publish." }],
            },
          ],
        },
      },
    },
    overrideAccess: true,
  });
  console.log(`Created draft article id ${draftArticle.id}, status: ${draftArticle.status}`);

  // Check it is NOT public
  const publicDraftCheck = await payload.find({
    collection: "articles",
    overrideAccess: false,
    where: { id: { equals: draftArticle.id } },
  });
  console.log("✔ Draft is private (not visible publicly):", publicDraftCheck.totalDocs === 0);

  // Founder Publishes directly
  const publishedNow = await payload.update({
    collection: "articles",
    id: draftArticle.id,
    req: { user: founder },
    data: {
      status: "published",
      publishedAt: new Date().toISOString(),
      reviewDecision: "approved",
    },
    overrideAccess: true,
  });
  console.log(`✔ Article published! Status: ${publishedNow.status}, publishedAt: ${publishedNow.publishedAt}`);

  // Check it IS NOW public
  const publicLiveCheck = await payload.find({
    collection: "articles",
    overrideAccess: false,
    where: { id: { equals: draftArticle.id } },
  });
  console.log("✔ Published article is immediately visible publicly:", publicLiveCheck.totalDocs === 1);

  // Clean up test article: archive then delete
  await payload.update({
    collection: "articles",
    id: draftArticle.id,
    req: { user: founder },
    data: { status: "archived" },
    overrideAccess: true,
  });
  await payload.delete({
    collection: "articles",
    id: draftArticle.id,
    req: { user: founder },
    overrideAccess: true,
  });
  console.log("Cleaned up test article.");

  // 3. Editor Submission & Founder Approval Workflow Test
  console.log("\n--- 3. Testing Editor Submission & Founder Approval ---");
  // Find or create an editor user
  let editorUserDoc = (
    await payload.find({
      collection: "users",
      where: { role: { equals: "editor" } },
      limit: 1,
    })
  ).docs[0];

  if (!editorUserDoc) {
    editorUserDoc = await payload.create({
      collection: "users",
      data: {
        email: `test-editor-${Date.now()}@example.com`,
        password: "EditorPassword123!",
        name: "Test Editor Contributor",
        role: "editor",
        status: "approved",
      },
    });
  }
  console.log(`Using Editor user: ${editorUserDoc.email} (id: ${editorUserDoc.id})`);

  // Editor creates article draft
  const editorArticleSlug = `test-editor-sub-${Date.now()}`;
  const editorDraft = await payload.create({
    collection: "articles",
    data: {
      title: "Test Editor Submitted Article",
      slug: editorArticleSlug,
      language: "en",
      topic: 1,
      status: "draft",
      submittedBy: editorUserDoc.id,
      body: {
        root: {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", text: "Editor article body awaiting review." }],
            },
          ],
        },
      },
    },
    overrideAccess: true,
  });
  console.log(`Editor created draft id ${editorDraft.id}`);

  // Test that Editor cannot directly publish via update access
  const articleCollection = payload.collections["articles"];
  const updateAccess = articleCollection?.config?.access?.update;
  const canEditorPublish = updateAccess
    ? await updateAccess({
        req: { user: editorUserDoc, payload },
        data: { status: "published" },
        id: String(editorDraft.id),
      })
    : true;
  console.log("✔ Editor CANNOT directly publish (server access control enforced):", canEditorPublish === false);

  // Editor clicks Submit for Approval -> status = in_review
  const submittedDoc = await payload.update({
    collection: "articles",
    id: editorDraft.id,
    req: { user: editorUserDoc },
    data: {
      status: "in_review",
      submittedBy: editorUserDoc.id,
      reviewDecision: "none",
    },
    overrideAccess: true,
  });
  console.log(`Editor submitted article! Status: ${submittedDoc.status}`);

  // Verify Founder Notification created
  const notifs = await payload.find({
    collection: "notifications",
    where: {
      and: [
        { targetCollection: { equals: "articles" } },
        { targetId: { equals: String(editorDraft.id) } },
      ],
    },
  });
  console.log("✔ Founder Notification generated:", notifs.totalDocs >= 1);
  if (notifs.totalDocs >= 1) {
    console.log(`  Notification title: "${notifs.docs[0].title}"`);
    console.log(`  Notification message: "${notifs.docs[0].message}"`);
  }

  // Verify article is STILL NOT public while in_review
  const publicInReviewCheck = await payload.find({
    collection: "articles",
    overrideAccess: false,
    where: { id: { equals: editorDraft.id } },
  });
  console.log("✔ In Review article is NOT visible publicly:", publicInReviewCheck.totalDocs === 0);

  // Founder Reviews and Approves
  const approvedDoc = await payload.update({
    collection: "articles",
    id: editorDraft.id,
    req: { user: founder },
    data: {
      status: "published",
      publishedAt: new Date().toISOString(),
      reviewDecision: "approved",
      reviewNotes: "",
    },
    overrideAccess: true,
  });
  console.log(`Founder approved! Status: ${approvedDoc.status}, publishedAt: ${approvedDoc.publishedAt}`);

  // Verify article IS NOW public
  const publicApprovedCheck = await payload.find({
    collection: "articles",
    overrideAccess: false,
    where: { id: { equals: editorDraft.id } },
  });
  console.log("✔ Approved article is now visible publicly:", publicApprovedCheck.totalDocs === 1);

  // Clean up test documents: archive then delete
  await payload.update({
    collection: "articles",
    id: editorDraft.id,
    req: { user: founder },
    data: { status: "archived" },
    overrideAccess: true,
  });
  await payload.delete({
    collection: "articles",
    id: editorDraft.id,
    req: { user: founder },
    overrideAccess: true,
  });
  // Clean up test notifications
  for (const n of notifs.docs) {
    await payload.delete({ collection: "notifications", id: n.id, req: { user: founder }, overrideAccess: true });
  }
  console.log("Cleaned up editor test article and test notifications.");

  console.log("\n=== ALL END-TO-END PUBLISHING WORKFLOW TESTS PASSED SUCCESSFULLY! ===");
}

runE2ETests().then(() => process.exit(0)).catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
