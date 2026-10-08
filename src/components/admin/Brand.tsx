import { getPayload } from "payload";
import config from "@payload-config";
export async function Logo() {
  const payload = await getPayload({ config });
  const settings = await payload.findGlobal({
    slug: "site-settings",
    locale: "en",
    overrideAccess: false,
  });
  return (
    <span
      style={{
        fontFamily: "var(--font-serif-latin), serif",
        fontSize: 28,
        color: "var(--theme-text)",
      }}
    >
      {settings.siteName}
    </span>
  );
}
export async function Icon() {
  const payload = await getPayload({ config });
  const settings = await payload.findGlobal({
    slug: "site-settings",
    locale: "en",
    overrideAccess: false,
  });
  return (
    <span
      aria-label={settings.siteName}
      style={{ fontFamily: "var(--font-serif-latin), serif", fontSize: 20 }}
    >
      {settings.siteName
        .split(/\s+/)
        .map((word) => word[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
