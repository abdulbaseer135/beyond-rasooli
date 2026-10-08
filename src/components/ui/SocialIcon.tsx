export function SocialIcon({ platform }: { platform: string }) {
  if (!["youtube", "instagram", "facebook", "x", "tiktok"].includes(platform)) return null;
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{ flexShrink: 0 }}>
      {platform === "youtube" && <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3V9Z" /></>}
      {platform === "instagram" && <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".5" fill="currentColor" stroke="none" /></>}
      {platform === "facebook" && <path d="M15 21v-8h3l.5-4H15V7c0-1 .5-2 2-2h2V2h-3c-3 0-5 2-5 5v2H8v4h3v8h4Z" />}
      {platform === "x" && <path d="m4 3 12 18h4L8 3H4Zm0 18 6.5-7.5M14 10l6-7" />}
      {platform === "tiktok" && <path d="M14 3h3a6 6 0 0 0 4 5v3a9 9 0 0 1-4-1v7a5 5 0 1 1-5-5v3a2 2 0 1 0 2 2V3Z" />}
    </svg>
  );
}
