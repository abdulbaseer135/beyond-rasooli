import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Play } from "lucide-react";
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
            {featuredVideoSlug && (
              <Link
                href={`/watch/${featuredVideoSlug}`}
                className="button button-primary"
              >
                {t("cta_watch")}
              </Link>
            )}
            <Link href="/read" className="button button-secondary">
              {t("cta_read")}
            </Link>
          </div>
        </div>
        {featuredVideoSlug && featuredPosterUrl && (
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
              sizes="(min-width:1024px) 600px, 100vw"
              className="object-cover rounded"
            />
            <span className="video-play-cue" aria-hidden="true">
              <Play strokeWidth={1.5} />
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
