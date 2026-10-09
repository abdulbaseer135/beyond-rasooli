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
      // Founder dashboard
      const [
        pubArticles,
        pubVideos,
        pendingApps,
        reviewArticles,
        reviewVideos,
        activeEditors,
      ] = await Promise.all([
        payload.count({
          collection: "articles",
          where: { status: { equals: "published" } },
          overrideAccess: true,
        }).catch(() => ({ totalDocs: 0 })),
        payload.count({
          collection: "videos",
          where: { status: { equals: "published" } },
          overrideAccess: true,
        }).catch(() => ({ totalDocs: 0 })),
        payload.count({
          collection: "users",
          where: { status: { equals: "pending" } },
          overrideAccess: true,
        }).catch(() => ({ totalDocs: 0 })),
        payload.find({
          collection: "articles",
          where: { status: { equals: "in_review" } },
          overrideAccess: true,
          limit: 5,
          sort: "-updatedAt",
        }).catch(() => ({ docs: [] })),
        payload.find({
          collection: "videos",
          where: { status: { equals: "in_review" } },
          overrideAccess: true,
          limit: 5,
          sort: "-updatedAt",
        }).catch(() => ({ docs: [] })),
        payload.count({
          collection: "users",
          where: {
            and: [
              { role: { equals: "editor" } },
              { status: { equals: "approved" } },
            ],
          },
          overrideAccess: true,
        }).catch(() => ({ totalDocs: 0 })),
      ]);

      const awaitingCount = reviewArticles.docs.length + reviewVideos.docs.length;

      const recentSubmissions = [
        ...reviewArticles.docs.map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          type: "article" as const,
          submittedBy: typeof doc.submittedBy === "object" ? doc.submittedBy?.name || doc.submittedBy?.email : undefined,
          submittedAt: doc.updatedAt,
          language: doc.language,
        })),
        ...reviewVideos.docs.map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          type: "video" as const,
          submittedBy: typeof doc.submittedBy === "object" ? doc.submittedBy?.name || doc.submittedBy?.email : undefined,
          submittedAt: doc.updatedAt,
          language: doc.language,
        })),
      ].sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));

      return (
        <FounderDashboard
          user={user}
          stats={{
            publishedArticles: pubArticles.totalDocs,
            publishedVideos: pubVideos.totalDocs,
            pendingApplications: pendingApps.totalDocs,
            awaitingApproval: awaitingCount,
            activeEditors: activeEditors.totalDocs,
          }}
          recentSubmissions={recentSubmissions}
        />
      );
    }

    if (user.role === "editor") {
      // Editor dashboard
      const authorId = user.authorProfile ? (typeof user.authorProfile === "object" ? user.authorProfile.id : user.authorProfile) : null;
      const userCondition: any = authorId
        ? { or: [{ author: { equals: authorId } }, { author: { equals: user.id } }, { submittedBy: { equals: user.id } }] }
        : { or: [{ author: { equals: user.id } }, { submittedBy: { equals: user.id } }] };

      const [myArticles, myVideos] = await Promise.all([
        payload.find({
          collection: "articles",
          where: userCondition,
          overrideAccess: true,
          limit: 100,
          sort: "-updatedAt",
        }).catch(() => ({ docs: [] })),
        payload.find({
          collection: "videos",
          where: userCondition,
          overrideAccess: true,
          limit: 100,
          sort: "-updatedAt",
        }).catch(() => ({ docs: [] })),
      ]);

      const allItems = [
        ...myArticles.docs.map((a: any) => ({
          id: a.id,
          title: a.title,
          type: "article" as const,
          status: a.status,
          reviewDecision: a.reviewDecision,
          reviewNotes: a.reviewNotes,
          updatedAt: a.updatedAt,
          slug: a.slug,
          language: a.language,
        })),
        ...myVideos.docs.map((v: any) => ({
          id: v.id,
          title: v.title,
          type: "video" as const,
          status: v.status,
          reviewDecision: v.reviewDecision,
          reviewNotes: v.reviewNotes,
          updatedAt: v.updatedAt,
          slug: v.slug,
          language: v.language,
        })),
      ].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));

      const stats = {
        myDrafts: allItems.filter(
          (i) =>
            i.status === "draft" &&
            i.reviewDecision !== "changes_requested" &&
            i.reviewDecision !== "rejected",
        ).length,
        awaitingApproval: allItems.filter((i) => i.status === "in_review").length,
        changesRequested: allItems.filter(
          (i) => i.reviewDecision === "changes_requested",
        ).length,
        rejectedSubmissions: allItems.filter(
          (i) => i.reviewDecision === "rejected",
        ).length,
        publishedContributions: allItems.filter((i) => i.status === "published").length,
      };

      return (
        <EditorDashboard
          user={user}
          stats={stats}
          mySubmissions={allItems}
        />
      );
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

    const [articlesRes, videosRes, topicsRes] = await Promise.all([
      payload.find({
        collection: "articles",
        where: {
          or: [
            { status: { equals: "in_review" } },
            { reviewDecision: { in: ["changes_requested", "rejected"] } },
          ],
        },
        overrideAccess: true,
        sort: "-updatedAt",
      }).catch(() => ({ docs: [] })),
      payload.find({
        collection: "videos",
        where: {
          or: [
            { status: { equals: "in_review" } },
            { reviewDecision: { in: ["changes_requested", "rejected"] } },
          ],
        },
        overrideAccess: true,
        sort: "-updatedAt",
      }).catch(() => ({ docs: [] })),
      payload.find({
        collection: "topics",
        where: { status: { equals: "pending" } },
        overrideAccess: true,
        sort: "-updatedAt",
      }).catch(() => ({ docs: [] })),
    ]);

    const initialItems = [
      ...articlesRes.docs.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        type: "article" as const,
        language: doc.language,
        submittedBy: typeof doc.submittedBy === "object" ? doc.submittedBy?.name || doc.submittedBy?.email : undefined,
        submittedAt: doc.updatedAt,
        status: doc.status,
        reviewDecision: doc.reviewDecision,
        reviewNotes: doc.reviewNotes,
        slug: doc.slug,
      })),
      ...videosRes.docs.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        type: "video" as const,
        language: doc.language,
        submittedBy: typeof doc.submittedBy === "object" ? doc.submittedBy?.name || doc.submittedBy?.email : undefined,
        submittedAt: doc.updatedAt,
        status: doc.status,
        reviewDecision: doc.reviewDecision,
        reviewNotes: doc.reviewNotes,
        slug: doc.slug,
      })),
      ...topicsRes.docs.map((doc: any) => ({
        id: doc.id,
        title: doc.name,
        type: "topic" as const,
        status: doc.status || "pending",
        reviewDecision: doc.status === "pending" ? "in_review" : undefined,
        slug: doc.slug,
        submittedAt: doc.updatedAt,
      })),
    ].sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));

    return <ContentApprovalsView user={user} initialItems={initialItems} />;
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

