"use client";

import { useEffect, useRef } from "react";
import { trackEvent, type AnalyticsEventName } from "@/lib/analytics/events";

interface ArticleAnalyticsProps {
  slug: string;
  topic: string;
  locale: string;
}

export function ArticleAnalytics({
  slug,
  topic,
  locale,
}: ArticleAnalyticsProps) {
  const firedMilestones = useRef(new Set<number>());

  useEffect(() => {
    // 1. 30 seconds engaged reading timer
    const timer = setTimeout(() => {
      trackEvent("article_engaged_30s", { slug, topic, locale });
    }, 30000);

    // 2. Scroll depth milestones (25%, 50%, 75%, 100%)
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      [25, 50, 75, 100].forEach((milestone) => {
        if (
          scrollPercent >= milestone &&
          !firedMilestones.current.has(milestone)
        ) {
          firedMilestones.current.add(milestone);
          trackEvent(`article_read_${milestone}` as AnalyticsEventName, {
            slug,
            topic,
            locale,
          });
        }
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [slug, topic, locale]);

  return null;
}
