import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCMS } from "@/lib/data/cms";
export const metadata = { robots: { index: false, follow: false } };
export default async function ProtectedTool({children}:{children:React.ReactNode}) { const payload = await getCMS();const {user}=await payload.auth({headers:await headers()});if(!user || !["admin","editor"].includes(user.role))redirect("/admin/login");return children; }
