import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight, Play } from "lucide-react";
export interface HeroProps {
  headline?: string;
  subheading?: string;
  featuredVideoSlug?: string;
  featuredVideoTitle?: string;
  featuredPosterUrl?: string;
  featuredPosterAlt?: string;
  onPlayFeatured?: () => void;
}
export function Hero({
  headline,
  subheading,
  featuredVideoSlug,
  featuredVideoTitle,
  featuredPosterUrl,
  featuredPosterAlt = "",
}: HeroProps) {
  const t = useTranslations("home");
  return (
    <section className="hero">
      <div className="site-container hero-layout">
        <div className="hero-copy">
          <h1 className="type-display">{headline || t("hero_headline")}</h1>
          <p className="type-standfirst">
            {subheading || t("hero_subheading")}
          </p>
          <div className="share-row">
              <Link
                href={featuredVideoSlug ? `/watch/${featuredVideoSlug}` : "/watch"}
                className="button button-primary"
              >
                <Play size={18} strokeWidth={1.5} aria-hidden="true" />
                {t("cta_watch")}
              </Link>
            <Link href="/read" className="button button-secondary">
              {t("cta_read")}
              <ArrowRight className="rtl-mirror" size={18} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
        </div>
        {featuredVideoSlug && featuredPosterUrl && (
          <div className="hero-feature">
          <Link
            href={`/watch/${featuredVideoSlug}`}
            className="hero-image"
            aria-label={featuredVideoTitle}
          >
            <Image
              src={featuredPosterUrl}
              alt={featuredPosterAlt}
              fill
              priority
              sizes="(min-width:1280px) 536px, (min-width:1024px) 45vw, 100vw"
              className="object-contain"
            />
            <span className="video-play-cue" aria-hidden="true">
              <Play strokeWidth={1.5} />
            </span>
          </Link>
          <div className="hero-caption">
            <p className="eyebrow">{t("latest_videos_title")}</p>
            <Link href={`/watch/${featuredVideoSlug}`} className="type-h3">{featuredVideoTitle}</Link>
          </div>
          </div>
        )}
      </div>
    </section>
  );
}
