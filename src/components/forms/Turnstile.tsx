"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
type Widget = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
export function Turnstile({
  action,
  onToken,
}: {
  action: string;
  onToken: (value: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  const [ready, setReady] = useState(false);
  const key = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;
  useEffect(() => {
    callback.current = onToken;
  }, [onToken]);
  useEffect(() => {
    const api = (window as Window & { turnstile?: Widget }).turnstile;
    if (ready && api && container.current && key) {
      const id = api.render(container.current, {
        sitekey: key,
        action,
        callback: (token: string) => callback.current(token),
        "expired-callback": () => callback.current(""),
        "error-callback": () => callback.current(""),
      });
      return () => api.remove(id);
    }
  }, [ready, key, action]);
  return (
    <>
      {key && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          onReady={() => setReady(true)}
        />
      )}
      <div ref={container} />
    </>
  );
}
