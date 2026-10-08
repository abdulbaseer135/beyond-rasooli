"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
export interface CollectionCardProps {
  slug: string;
  title: string;
  description: string;
  itemCount: number;
  isSequential?: boolean;
  coverImageUrl?: string;
  className?: string;
}
export function CollectionCard({
  slug,
  title,
  description,
  itemCount,
  isSequential = false,
  coverImageUrl,
  className = "",
}: CollectionCardProps) {
  const t = useTranslations("ui");
  if (itemCount < 3) return null;
  return (
    <article className={`collection-card ${className}`}>
      <Link href={`/collections/${slug}`} className="editorial-card-link">
        {coverImageUrl && (
          <div className="article-card-image">
            <Image
              src={coverImageUrl}
              alt=""
              fill
              sizes="(min-width:768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="article-card-copy">
          <h3 className="type-h3">{title}</h3>
          <p className="type-ui">{description}</p>
          <div className="card-meta type-meta">
            <span>{t("stories", { count: itemCount })}</span>
            {isSequential && <span>{t("sequential")}</span>}
          </div>
        </div>
      </Link>
    </article>
  );
}
