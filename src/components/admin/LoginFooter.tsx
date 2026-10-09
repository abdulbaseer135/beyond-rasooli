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

  const currentLocale = locale === "fa" || locale === "ps" ? locale : "en";
  const applyLabel = isRtl
    ? locale === "ps"
      ? "د ایډیټر په توګه غوښتنلیک وسپارئ"
      : "درخواست عضویت به عنوان ویراستار"
    : "Apply to Become an Editor";

  return (
    <div className="br-login-footer" dir={isRtl ? "rtl" : "ltr"}>
      <div className="br-login-actions" style={{ marginBottom: "0.75rem" }}>
        <Link
          href={`/${currentLocale}/apply-as-editor`}
          className="br-apply-as-editor"
          style={{
            display: "inline-block",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--theme-elevation-900, #18181b)",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            marginBottom: "0.5rem",
          }}
        >
          {applyLabel}
        </Link>
      </div>
      <p className="br-login-note">{noteText}</p>
      <Link href="/" className="br-back-to-website">
        {backLabel}
      </Link>
    </div>
  );
}
