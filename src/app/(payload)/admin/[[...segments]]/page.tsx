import configPromise from "@payload-config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import { getPayload } from "payload";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { importMap } from "../importMap";

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

  let totalUsers = 0;
  try {
    const payload = await getPayload({ config: configPromise });
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

