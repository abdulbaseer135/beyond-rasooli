import { getDashboardContent, dashboardCount } from "@/lib/admin-content";
import { UnifiedContentList } from "@/components/admin/views/UnifiedContentList";
import { getMergedMessages } from "@/lib/ui-strings";
import configPromise from "@payload-config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import { getPayload } from "payload";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { importMap } from "../importMap";
import { FounderDashboard } from "@/components/admin/views/FounderDashboard";
import { EditorDashboard } from "@/components/admin/views/EditorDashboard";
import { EditorRequestsView } from "@/components/admin/views/EditorRequestsView";
import { ManageEditorsView } from "@/components/admin/views/ManageEditorsView";
import { ContentApprovalsView } from "@/components/admin/views/ContentApprovalsView";
import { NotificationsView } from "@/components/admin/views/NotificationsView";
import type { User } from "@/payload-types";

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config: configPromise, params, searchParams });

export default async function AdminPage({ params, searchParams }: Args) {
  const resolvedParams = await params;
  const segments = resolvedParams?.segments || [];
  const isRootAdmin = segments.length === 0;
  const isLoginRoute = segments.length === 1 && segments[0] === "login";
  const isFirstUserRoute =
    segments.length === 1 && segments[0] === "create-first-user";

  const payload = await getPayload({ config: configPromise });

  let totalUsers = 0;
  try {
    const userCount = await payload.count({
      collection: "users",
      overrideAccess: true,
    });
    totalUsers = userCount.totalDocs;
  } catch {
    totalUsers = 0;
  }

  if (totalUsers === 0) {
    if (isRootAdmin || isLoginRoute) {
      redirect("/admin/create-first-user");
    }
  } else {
    if (isFirstUserRoute) {
      redirect("/admin/login");
    }
  }

  // Check authenticated user
  const reqHeaders = await headers();
  const { user } = (await payload.auth({ headers: reqHeaders })) as { user: User | null };

  // Deny access to unapproved, pending, rejected, or suspended editors
  if (user && user.role !== "admin" && user.status !== "approved") {
    redirect("/admin/login");
  }

  // 1. Root /admin Route: Custom Dashboard (if authenticated)
  if (isRootAdmin && user) {
    if (user.role === "admin") {
      const query = await searchParams;
      const messages = (await getMergedMessages("en")).admin_content;
      const [content, approvals, awaitingApproval, pubArticles, pubVideos, pubTopics, pendingApps, activeEditors] = await Promise.all([
        getDashboardContent(payload, user, query), getDashboardContent(payload, user, {}, true), dashboardCount(payload, user, "in_review"),
        ...["articles", "videos", "topics"].map(collection => payload.count({ collection: collection as "articles" | "videos" | "topics", where: { status: { equals: "published" } }, user, overrideAccess: false })),
        payload.count({ collection: "users", where: { role: { equals: "editor" }, status: { equals: "pending" } }, user, overrideAccess: false }),
        payload.count({ collection: "users", where: { role: { equals: "editor" }, status: { equals: "approved" } }, user, overrideAccess: false }),
      ]);
      return <FounderDashboard user={user} stats={{ publishedArticles: pubArticles.totalDocs, publishedVideos: pubVideos.totalDocs, publishedTopics: pubTopics.totalDocs, pendingApplications: pendingApps.totalDocs, awaitingApproval, activeEditors: activeEditors.totalDocs }} recentSubmissions={approvals.items.slice(0, 5).map(item => ({ ...item, submittedBy: item.contributor, submittedAt: item.updatedAt }))} contentList={<UnifiedContentList {...content} messages={messages} />} topicsLabel={messages.topics} />;

    }

    if (user.role === "editor") {
      const query = await searchParams;
      const messages = (await getMergedMessages("en")).admin_content;
      const [content, myDrafts, awaitingApproval, changesRequested, rejectedSubmissions, publishedContributions] = await Promise.all([getDashboardContent(payload, user, query), ...["draft", "in_review", "changes_requested", "rejected", "published"].map(state => dashboardCount(payload, user, state))]);
      return <EditorDashboard user={user} stats={{ myDrafts, awaitingApproval, changesRequested, rejectedSubmissions, publishedContributions }} mySubmissions={content.items} contentList={<UnifiedContentList {...content} messages={messages} />} />;

    }
  }

  // 2. Founder Dedicated Views
  if (segments.length === 1 && segments[0] === "editor-requests") {
    if (!user || user.role !== "admin") {
      redirect("/admin");
    }

    const pendingResult = await payload.find({
      collection: "users",
      where: { status: { equals: "pending" } },
      overrideAccess: true,
      sort: "-appliedAt",
    }).catch(() => ({ docs: [] }));

    const initialRequests = pendingResult.docs.map((u: any) => ({
      id: u.id,
      name: u.name || u.email,
      email: u.email,
      appliedAt: u.appliedAt || u.createdAt,
      bio: u.bio || "",
      reasonForJoining: u.reasonForJoining || "",
    }));

    return <EditorRequestsView user={user} initialRequests={initialRequests} />;
  }

  if (segments.length === 1 && segments[0] === "manage-editors") {
    if (!user || user.role !== "admin") {
      redirect("/admin");
    }

    const editorsResult = await payload.find({
      collection: "users",
      where: { role: { equals: "editor" } },
      overrideAccess: true,
      sort: "-createdAt",
    }).catch(() => ({ docs: [] }));

    const initialEditors = await Promise.all(
      editorsResult.docs.map(async (ed: any) => {
        const [aCount, vCount] = await Promise.all([
          payload.count({
            collection: "articles",
            where: { "author.id": { equals: ed.id } },
            overrideAccess: true,
          }).catch(() => ({ totalDocs: 0 })),
          payload.count({
            collection: "videos",
            where: { "author.id": { equals: ed.id } },
            overrideAccess: true,
          }).catch(() => ({ totalDocs: 0 })),
        ]);

        return {
          id: ed.id,
          name: ed.name || ed.email,
          email: ed.email,
          status: (ed.status as any) || "approved",
          bio: ed.bio || "",
          articleCount: aCount.totalDocs,
          videoCount: vCount.totalDocs,
          appliedAt: ed.appliedAt || ed.createdAt,
        };
      })
    );

    return <ManageEditorsView user={user} initialEditors={initialEditors} />;
  }

  if (segments.length === 1 && segments[0] === "content-approvals") {
    if (!user || user.role !== "admin") {
      redirect("/admin");
    }

    const content = await getDashboardContent(payload, user, await searchParams, true);
    const [pending, changes, rejected] = await Promise.all(["in_review", "changes_requested", "rejected"].map(state => dashboardCount(payload, user, state)));
    const messages = (await getMergedMessages("en")).admin_content;
    const initialItems = content.items.map(item => ({ ...item, submittedBy: item.contributor, submittedAt: item.updatedAt }));
    return <><ContentApprovalsView user={user} initialItems={initialItems} reviewCounts={{ pending, changes, rejected }} /><div className="max-w-6xl mx-auto px-4 pb-8"><UnifiedContentList {...content} basePath="/admin/content-approvals" messages={messages} /></div></>;

  }

  if (segments.length === 1 && segments[0] === "notifications") {
    if (!user || user.role !== "admin") {
      redirect("/admin");
    }

    const { getFounderNotifications, formatRelativeTime } = await import(
      "@/lib/notifications"
    );

    const notifResult = await getFounderNotifications({
      payload,
      userId: user.id,
      filter: "all",
      page: 1,
      limit: 15,
    });

    const initialItems = notifResult.docs.map((doc: any) => ({
      id: doc.id,
      type: doc.type,
      title: doc.title,
      message: doc.message,
      relativeTime: formatRelativeTime(doc.createdAt),
      createdAt: doc.createdAt,
      readAt: doc.readAt,
      isRead: Boolean(doc.readAt),
      resolvedAt: doc.resolvedAt,
      isResolved: Boolean(doc.resolvedAt),
      link: doc.link,
      actor:
        doc.actor && typeof doc.actor === "object"
          ? { name: doc.actor.name, email: doc.actor.email }
          : undefined,
      targetCollection: doc.targetCollection,
      targetId: doc.targetId,
      submissionRevision: doc.submissionRevision,
    }));

    return (
      <NotificationsView
        user={user}
        initialItems={initialItems}
        initialUnreadCount={notifResult.unreadCount}
        initialTotalDocs={notifResult.totalDocs}
      />
    );
  }

  // 3. Fallback to standard Payload RootPage for collections, accounts, login, etc.
  const rootPageElement = await RootPage({
    config: configPromise,
    params,
    searchParams,
    importMap,
  });

  if (isFirstUserRoute) {
    const cookieStore = await cookies();
    const locale = cookieStore.get("payload-lng")?.value;
    const isRtl = locale === "fa" || locale === "ps";
    const backLabel = isRtl
      ? locale === "ps"
        ? "← بېرته وېبپاڼې ته"
        : "← بازگشت به وب‌سایت"
      : "← Back to website";

    return (
      <div className="br-founder-setup-wrapper">
        {rootPageElement}
        <div className="br-auth-footer br-first-user-footer">
          <Link href="/" className="br-back-to-website">
            {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  return rootPageElement;
}

