import test from "node:test";
import assert from "node:assert/strict";
import { Users } from "../src/collections/Users";
import { Articles } from "../src/collections/Articles";
import { Videos } from "../src/collections/Videos";
import { Topics } from "../src/collections/Topics";
import { Notifications } from "../src/collections/Notifications";
import { contentState } from "../src/collections/shared/publication";
import {
  isAdmin,
  isApprovedEditor,
  canAccessEditorial,
  editorialContentCreateAccess,
  editorialContentUpdateAccess,
  founderOnlyFieldUpdate,
} from "../src/collections/shared/auth-roles";
import { eligible } from "../src/lib/data/publication";
import { extractYouTubeId } from "../src/lib/youtube";
import { slugify } from "../src/collections/shared/slug";

// ==============================================================================
// TEST 1: Founder Setup
// ==============================================================================
test("Phase 12 - Test 1: Founder setup and bootstrap protection", async () => {
  const beforeValidate = Users.hooks?.beforeValidate?.[0];
  assert(beforeValidate, "Users beforeValidate hook must exist");

  // 1. Initial system bootstrap: first user setup when totalUsers is 0
  const firstUserReq = {
    payload: {
      count: async () => ({ totalDocs: 0 }),
    },
    context: {}, // Not a public registration
  };
  const bootstrapData = await (beforeValidate as any)({
    data: { email: "founder@beyondrasooli.com", name: "Founder" },
    operation: "create",
    req: firstUserReq,
  });
  assert.equal(bootstrapData.role, "admin", "First bootstrap user must become admin");
  assert.equal(bootstrapData.status, "approved", "Bootstrap founder must be approved");

  // 2. Second user creation: cannot become founder
  const secondUserReq = {
    payload: {
      count: async () => ({ totalDocs: 1 }),
    },
    context: {},
  };
  const normalUser = await (beforeValidate as any)({
    data: { email: "editor@beyondrasooli.com", name: "Editor Candidate" },
    operation: "create",
    req: secondUserReq,
  });
  assert.equal(normalUser.role, "editor", "Subsequent user cannot automatically become admin");

  // 3. Founder login succeeds
  const beforeLogin = Users.hooks?.beforeLogin?.[0];
  assert(beforeLogin, "Users beforeLogin hook must exist");
  const founderLoginResult = await (beforeLogin as any)({
    user: { id: 1, role: "admin", email: "founder@beyondrasooli.com" },
    req: {},
  });
  assert.equal(founderLoginResult.role, "admin", "Founder login must be permitted without restrictions");
});

// ==============================================================================
// TEST 2: Editor Registration
// ==============================================================================
test("Phase 12 - Test 2: Editor registration creates pending status and denies early login", async () => {
  const beforeValidate = Users.hooks?.beforeValidate?.[0];
  const beforeLogin = Users.hooks?.beforeLogin?.[0];
  assert(beforeValidate && beforeLogin);

  // Visitor registers through public registration flow
  const publicRegReq = {
    payload: {
      count: async () => ({ totalDocs: 0 }), // Even if totalDocs was 0
    },
    context: { publicEditorRegistration: true },
  };
  const applicantData = await (beforeValidate as any)({
    data: {
      email: "applicant@example.com",
      name: "New Applicant",
      reasonForJoining: "Passionate about behavioral neuroscience.",
    },
    operation: "create",
    req: publicRegReq,
  });

  assert.equal(applicantData.role, "editor", "Public registration must strictly be role: editor");
  assert.equal(applicantData.status, "pending", "Public registration must strictly be status: pending");
  assert.ok(applicantData.appliedAt, "appliedAt timestamp must be recorded");

  // Pending applicant login is denied
  await assert.rejects(
    async () => {
      await (beforeLogin as any)({
        user: { id: 2, role: "editor", status: "pending", email: "applicant@example.com" },
        req: {},
      });
    },
    /pending approval/i,
    "Pending applicant must not be allowed to log in"
  );
});

// ==============================================================================
// TEST 3: Founder Approves Editor
// ==============================================================================
test("Phase 12 - Test 3: Founder approves editor, status becomes approved, login succeeds", async () => {
  const beforeLogin = Users.hooks?.beforeLogin?.[0];
  assert(beforeLogin);

  const approvedEditor = {
    id: 42,
    role: "editor",
    status: "approved",
    email: "approved.editor@beyondrasooli.com",
  };

  // Login succeeds for approved editor
  const loginResult = await (beforeLogin as any)({
    user: approvedEditor,
    req: {},
  });
  assert.equal(loginResult.status, "approved");
  assert.equal(isApprovedEditor(loginResult), true);
  assert.equal(canAccessEditorial(loginResult), true);

  // Editor dashboard access check
  const createAccess = editorialContentCreateAccess({
    req: { user: approvedEditor } as any,
  });
  assert.equal(createAccess, true, "Approved editor must have editorial content creation access");
});

// ==============================================================================
// TEST 4: Editor Creates Article
// ==============================================================================
test("Phase 12 - Test 4: Approved editor creates draft, ownership recorded, not publicly visible", async () => {
  const editorUser = { id: 10, role: "editor", status: "approved" };

  // Editor creates a draft
  const draftData: any = {
    title: "Understanding Cognitive Bias",
    status: "draft",
    summary: "A deep dive into heuristics and cognitive bias.",
    language: "en",
  };

  const processedData = await (contentState as any)({
    data: draftData,
    originalDoc: null,
    req: { user: editorUser, payload: {} as any, context: {} } as any,
    collection: { slug: "articles" } as any,
    operation: "create",
  });

  // Verify authenticated ownership recorded
  assert.equal(processedData.author, 10, "Authenticated editor ID must be assigned to author");
  assert.equal(processedData.submittedBy, 10, "Authenticated editor ID must be assigned to submittedBy");
  assert.equal(processedData.status, "draft", "Status must remain draft");

  // Verify draft is not publicly visible
  const isPublic = eligible(processedData as any);
  assert.equal(isPublic, false, "Draft content must not be publicly visible");
});

// ==============================================================================
// TEST 5: Founder Approves Article
// ==============================================================================
test("Phase 12 - Test 5: Founder approves article, published publicly with editor attribution", async () => {
  const founderUser = { id: 1, role: "admin" };
  const originalEditorId = 10;

  const inReviewDoc = {
    id: 100,
    title: "Understanding Cognitive Bias",
    slug: "understanding-cognitive-bias",
    status: "in_review",
    summary: "A deep dive into heuristics and cognitive bias.",
    body: { root: { children: [{ type: "p" }] } },
    language: "en",
    topic: 1,
    author: originalEditorId,
    submittedBy: originalEditorId,
    reviewDecision: "none",
  };

  // Founder approves and publishes
  const approvedData = await (contentState as any)({
    data: {
      status: "published",
      reviewDecision: "approved",
      reviewNotes: "Well researched. Approved for publication.",
    },
    originalDoc: inReviewDoc,
    req: { user: founderUser, payload: {} as any, context: {} } as any,
    collection: { slug: "articles" } as any,
    operation: "update",
  });

  assert.equal(approvedData.status, "published");
  assert.equal(approvedData.author, originalEditorId, "Original editor attribution must be preserved");
  assert.ok(approvedData.publishedAt, "publishedAt timestamp must be set on publication");

  // Check public eligibility of approved published document
  const isPublic = eligible({
    ...inReviewDoc,
    ...approvedData,
  } as any);
  assert.equal(isPublic, true, "Approved published article must be publicly visible");
});

// ==============================================================================
// TEST 6: Video Workflow
// ==============================================================================
test("Phase 12 - Test 6: Video draft, spokenLanguage validation, submission, founder approval", async () => {
  const editorUser = { id: 10, role: "editor", status: "approved" };
  const founderUser = { id: 1, role: "admin" };

  // 1. Editor creates video draft
  const videoDraft = await (contentState as any)({
    data: {
      title: "Neuroscience of Memory",
      slug: "neuroscience-of-memory",
      status: "draft",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      language: "en",
      spokenLanguage: "en",
      topic: 2,
    },
    originalDoc: null,
    req: { user: editorUser, payload: {} as any, context: {} } as any,
    collection: { slug: "videos" } as any,
    operation: "create",
  });

  assert.equal(videoDraft.author, 10);
  assert.equal(videoDraft.submittedBy, 10);
  assert.equal(eligible(videoDraft as any), false);

  // 2. Editor submits video for review
  const submittedVideo = await (contentState as any)({
    data: {
      status: "in_review",
    },
    originalDoc: videoDraft,
    req: { user: editorUser, payload: {} as any, context: {} } as any,
    collection: { slug: "videos" } as any,
    operation: "update",
  });
  assert.equal(submittedVideo.status, "in_review");
  assert.equal(submittedVideo.reviewDecision, "none");

  // 3. Founder approves and publishes video
  const publishedVideo = await (contentState as any)({
    data: {
      status: "published",
      reviewDecision: "approved",
    },
    originalDoc: { ...videoDraft, ...submittedVideo },
    req: { user: founderUser, payload: {} as any, context: {} } as any,
    collection: { slug: "videos" } as any,
    operation: "update",
  });

  assert.equal(publishedVideo.status, "published");
  assert.equal(publishedVideo.author, 10);
  assert.ok(publishedVideo.publishedAt);
  assert.equal(eligible({ ...videoDraft, ...publishedVideo } as any), true);
});

// ==============================================================================
// TEST 7: Revision Workflow
// ==============================================================================
test("Phase 12 - Test 7: Founder requests changes, editor sees feedback, revises and resubmits", async () => {
  const founderUser = { id: 1, role: "admin" };
  const editorUser = { id: 10, role: "editor", status: "approved" };

  const submittedDoc = {
    id: 101,
    title: "Initial Draft",
    slug: "initial-draft",
    status: "in_review",
    summary: "Summary text",
    body: { root: { children: [] } },
    language: "en",
    topic: 1,
    author: 10,
    submittedBy: 10,
    reviewDecision: "none",
  };

  // 1. Founder requests changes
  const changesRequested = await (contentState as any)({
    data: {
      status: "draft",
      reviewDecision: "changes_requested",
      reviewNotes: "Please add citations for paragraph 3.",
    },
    originalDoc: submittedDoc,
    req: { user: founderUser, payload: {} as any, context: {} } as any,
    collection: { slug: "articles" } as any,
    operation: "update",
  });

  assert.equal(changesRequested.status, "draft");
  assert.equal(changesRequested.reviewDecision, "changes_requested");
  assert.equal(changesRequested.reviewNotes, "Please add citations for paragraph 3.");
  assert.equal(eligible(changesRequested as any), false);

  // 2. Editor revises their draft (editing own content is permitted)
  const currentDoc = { ...submittedDoc, ...changesRequested };
  const revisedDraft = await (contentState as any)({
    data: {
      title: "Revised Draft with Citations",
      // Editor attempts to keep or update body
    },
    originalDoc: currentDoc,
    req: { user: editorUser, payload: {} as any, context: {} } as any,
    collection: { slug: "articles" } as any,
    operation: "update",
  });

  // Review notes from founder remain visible and preserved
  assert.equal(revisedDraft.reviewNotes, "Please add citations for paragraph 3.");

  // 3. Editor resubmits revised draft
  const resubmitted = await (contentState as any)({
    data: {
      status: "in_review",
    },
    originalDoc: { ...currentDoc, ...revisedDraft },
    req: { user: editorUser, payload: {} as any, context: {} } as any,
    collection: { slug: "articles" } as any,
    operation: "update",
  });

  assert.equal(resubmitted.status, "in_review");
  assert.equal(resubmitted.reviewDecision, "none", "Resubmission resets reviewDecision to none");

  // 4. Founder approves revised version
  const finalApproved = await (contentState as any)({
    data: {
      status: "published",
      reviewDecision: "approved",
    },
    originalDoc: { ...currentDoc, ...revisedDraft, ...resubmitted },
    req: { user: founderUser, payload: {} as any, context: {} } as any,
    collection: { slug: "articles" } as any,
    operation: "update",
  });

  assert.equal(finalApproved.status, "published");
  assert.equal(eligible({ ...currentDoc, ...finalApproved } as any), true);
});

// ==============================================================================
// TEST 8: Security & Unauthorized Attempt Rejections
// ==============================================================================
test("Phase 12 - Test 8: Comprehensive security attack vectors rejection", async () => {
  const editorA = { id: 10, role: "editor", status: "approved" };
  const editorB = { id: 20, role: "editor", status: "approved" };
  const suspendedEditor = { id: 30, role: "editor", status: "suspended" };
  const rejectedEditor = { id: 40, role: "editor", status: "rejected" };
  const visitor = null;

  // A. Suspended editor login and access rejection
  const beforeLogin = Users.hooks?.beforeLogin?.[0];
  assert(beforeLogin, "Users beforeLogin hook must exist");
  await assert.rejects(
    async () => {
      await (beforeLogin as any)({ user: suspendedEditor, req: {} });
    },
    /suspended/i,
    "Suspended editor must be rejected on login"
  );
  assert.equal(canAccessEditorial(suspendedEditor), false);
  assert.equal(canAccessEditorial(rejectedEditor), false);
  assert.equal(canAccessEditorial(visitor), false);

  // B. Editor attempting to publish directly
  await assert.rejects(
    async () => {
      await (contentState as any)({
        data: { status: "published" },
        originalDoc: { id: 1, author: 10, status: "draft" },
        req: { user: editorA, payload: {} as any, context: {} } as any,
        collection: { slug: "articles" } as any,
        operation: "update",
      });
    },
    (err: any) => err.name === "ValidationError" || /status/i.test(err.message),
    "Editor must not be allowed to set status: published directly"
  );

  // C. Editor attempting to schedule or archive directly
  await assert.rejects(
    async () => {
      await (contentState as any)({
        data: { status: "scheduled" },
        originalDoc: { id: 1, author: 10, status: "draft" },
        req: { user: editorA, payload: {} as any, context: {} } as any,
        collection: { slug: "articles" } as any,
        operation: "update",
      });
    },
    (err: any) => err.name === "ValidationError" || /status/i.test(err.message),
    "Editor must not be allowed to set status: scheduled directly"
  );

  // D. Cross-editor tampering: Editor B modifying Editor A's draft
  await assert.rejects(
    async () => {
      await (contentState as any)({
        data: { title: "Malicious Tampering" },
        originalDoc: { id: 1, author: 10, submittedBy: 10, status: "draft" },
        req: { user: editorB, payload: {} as any, context: {} } as any,
        collection: { slug: "articles" } as any,
        operation: "update",
      });
    },
    (err: any) => err.name === "ValidationError" || /author/i.test(err.message),
    "Editor B must be blocked from modifying Editor A's content"
  );

  // E. Direct published document overwrite attempt by editor
  await assert.rejects(
    async () => {
      await (contentState as any)({
        data: { title: "Defacing Live Article" },
        originalDoc: { id: 1, author: 10, submittedBy: 10, status: "published" },
        req: { user: editorA, payload: {} as any, context: {} } as any,
        collection: { slug: "articles" } as any,
        operation: "update",
      });
    },
    (err: any) => err.name === "ValidationError" || /status/i.test(err.message),
    "Editor must be blocked from directly modifying published content"
  );

  // F. Editor attempting to escalate role or change account status
  const beforeChangeUser = Users.hooks?.beforeChange?.[0];
  assert(beforeChangeUser, "Users beforeChange hook must exist");
  const userMutation = await (beforeChangeUser as any)({
    data: { role: "admin", status: "approved" },
    originalDoc: { id: 10, role: "editor", status: "approved" },
    req: { user: editorA, payload: {} as any },
    operation: "update",
  });
  assert.equal(userMutation.role, "editor", "Role escalation must be reverted by server hook");

  // G. Founder-only field locks (founderOnlyFieldUpdate)
  const isAuthorEditableByEditor = founderOnlyFieldUpdate({
    req: { user: editorA } as any,
  });
  assert.equal(isAuthorEditableByEditor, false, "founderOnlyFieldUpdate must return false for editors");

  const isAuthorEditableByFounder = founderOnlyFieldUpdate({
    req: { user: { role: "admin" } } as any,
  });
  assert.equal(isAuthorEditableByFounder, true, "founderOnlyFieldUpdate must return true for founder");
});

// ==============================================================================
// TEST 9: Regression Tests Across System
// ==============================================================================
test("Phase 12 - Test 9: Regressions across collections, topics, YouTube, and notifications", async () => {
  // 1. YouTube extractor handles standard, shorts, and embed formats
  assert.equal(extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(extractYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(extractYouTubeId("https://malicious-site.com/watch?v=dQw4w9WgXcQ"), null);

  // 2. Slugify handles multi-script titles
  assert.equal(slugify("Hello World & Science"), "hello-world-science");
  assert.ok(slugify("رواني روغتیا او مغز").length > 0);

  // 3. Topics collection forces editor proposal to pending
  const topicBeforeValidate = Topics.hooks?.beforeValidate?.[0];
  assert(topicBeforeValidate, "Topics beforeValidate hook must exist");
  const editorTopic = await (topicBeforeValidate as any)({
    data: { name: "Neuroeconomics", status: "published" },
    req: { user: { role: "editor", status: "approved" } },
  });
  assert.equal(editorTopic.status, "pending", "Editor proposing topic cannot directly publish");

  // 4. Notifications collection is restricted exclusively to founder
  assert.equal(Notifications.access?.read?.({ req: { user: { role: "admin" } } } as any), true);
  assert.equal(Notifications.access?.read?.({ req: { user: { role: "editor", status: "approved" } } } as any), false);
  assert.equal(Notifications.access?.read?.({ req: { user: null } } as any), false);
});
