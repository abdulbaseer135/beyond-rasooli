import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getCMS, getSettings } from "@/lib/data/cms";
import type { Locale } from "@/i18n/config";
import { PreviewDocument } from "@/components/admin/PreviewDocument";
export const metadata = { robots: { index: false, follow: false } };
export default async function Preview({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ collection?: string; id?: string }>;
}) {
  const { locale } = await params;
  const { collection, id } = await searchParams;
  const payload = await getCMS();
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");
  if (
    !id ||
    !["articles", "videos", "pages", "collections"].includes(collection || "")
  )
    notFound();
  const doc = await payload.findByID({
    collection: collection as "articles" | "videos" | "pages" | "collections",
    id,
    locale,
    fallbackLocale: false,
    overrideAccess: false,
    user,
    depth: 2,
  });
  const requestHeaders = await headers();
  const origin = new URL(
    process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  ).origin;
  const host = requestHeaders.get("host");
  const serverURL =
    process.env.BEYOND_QA === "true" && host === "localhost:3100"
      ? "http://localhost:3100"
      : origin;
  return (
    <div className="site-container page-start content-narrow space-y-8">
      <PreviewDocument initialData={doc} serverURL={serverURL} siteName={(await getSettings(locale)).siteName} />
    </div>
  );
}
