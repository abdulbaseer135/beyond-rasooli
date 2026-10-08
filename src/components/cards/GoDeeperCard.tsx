import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
export interface GoDeeperCardProps {
  articleSlug: string;
  articleTitle: string;
  readingTimeMinutes: number;
  thumbnailUrl?: string;
  className?: string;
  onClick?: () => void;
}
export function GoDeeperCard({
  articleSlug,
  articleTitle,
  readingTimeMinutes,
  thumbnailUrl,
  className = "",
  onClick,
}: GoDeeperCardProps) {
  const t = useTranslations("video");
  const ui = useTranslations("ui");
  return (
    <aside className={`go-deeper ${className}`}>
      <Link
        href={`/read/${articleSlug}`}
        onClick={onClick}
        className="go-deeper-link"
      >
        {thumbnailUrl && (
          <div className="bridge-image">
            <Image
              src={thumbnailUrl}
              alt=""
              fill
              sizes="120px"
              className="object-cover rounded"
            />
          </div>
        )}
        <div className="space-y-2">
          <p className="type-meta">{t("go_deeper_title")}</p>
          <h2 className="type-h3">{articleTitle}</h2>
          <p className="type-meta">
            {ui("read_time", { minutes: readingTimeMinutes })}
          </p>
          <span className="text-link">
            {t("go_deeper_action")}
            <ArrowRight
              className="rtl-mirror"
              aria-hidden="true"
              strokeWidth={1.5}
            />
          </span>
        </div>
      </Link>
    </aside>
  );
}
