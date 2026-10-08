import { redirect } from "next/navigation";
import { getSettings } from "@/lib/data/cms";
export const dynamic = "force-dynamic";
export default async function Index() { const settings = await getSettings("en"); redirect(`/${settings.defaultLocale || "ps"}`); }
