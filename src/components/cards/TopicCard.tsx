import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link, type Locale } from "@/i18n/routing";
import type { PublicTopic } from "@/lib/data/content-types";

export async function TopicCard({ topic, locale, headingLevel = 3, compact = false }: {
  topic: PublicTopic;
  locale: Locale;
  headingLevel?: 2 | 3;
  compact?: boolean;
}) {
  const t = await getTranslations({ locale, namespace: "topics" });
  const ui = compact ? await getTranslations({ locale, namespace: "buttons" }) : undefined;
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <Link href={`/topics/${topic.slug}`} className="topic-destination">
      {topic.coverImageUrl && (
        <div className="topic-card-image">
          <Image src={topic.coverImageUrl} alt="" fill sizes="(min-width:1024px) 360px, (min-width:480px) 45vw, 100vw" className="object-cover" />
        </div>
      )}
      <div className="topic-card-copy">
        <Heading className="type-h3">{topic.name[locale]}</Heading>
        {!compact && <p className="type-ui">{topic.description[locale]}</p>}
        <span className="text-link">
          {ui ? ui("read_more") : t("view_topic", { topic: topic.name[locale] })}
          <ArrowRight className="rtl-mirror shrink-0" size={20} strokeWidth={1.5} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
