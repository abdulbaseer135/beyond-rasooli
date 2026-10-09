import type { UIFieldServerProps } from "payload";
import { PublishControlsClient } from "./PublishControlsClient";

export async function PublishControls({ req, collectionSlug }: UIFieldServerProps) {
  const user = req.user;
  const userRole = user?.role || "editor";
  const userId = user?.id ? String(user.id) : undefined;
  const userName = user?.name || user?.email || "Founder";
  const locale = req.locale === "ps" || req.locale === "fa" ? req.locale : "en";

  return (
    <PublishControlsClient
      userRole={userRole}
      userId={userId}
      userName={userName}
      collectionSlug={collectionSlug}
      adminLocale={locale}
    />
  );
}
