import React from "react";
import Link from "next/link";
import type { ServerProps } from "payload";

export function LoginFooter(props: ServerProps) {
  const locale = props.locale?.code;
  const isRtl = locale === "fa" || locale === "ps";

  const noteText = isRtl
    ? locale === "ps"
      ? "لاسرسی ته اړتیا لرئ؟ د سایټ له مدیر سره اړیکه ونیسئ."
      : "به دسترسی نیاز دارید؟ با مدیر سایت تماس بگیرید."
    : "Need access? Contact the site administrator.";

  const backLabel = isRtl
    ? locale === "ps"
      ? "← بېرته وېبپاڼې ته"
      : "← بازگشت به وب‌سایت"
    : "← Back to website";

  return (
    <div className="br-login-footer">
      <p className="br-login-note">{noteText}</p>
      <Link href="/" className="br-back-to-website">
        {backLabel}
      </Link>
    </div>
  );
}
