import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Article } from "@/payload-types";
export interface PartDividerProps {
  partNumber: number;
  title: string;
}
export function PartDivider({ partNumber, title }: PartDividerProps) {
  const t = useTranslations("ui");
  return (
    <section className="article-measure part-divider">
      <p className="type-meta">{t("part", { number: partNumber })}</p>
      <h2 className="type-h2">{title}</h2>
    </section>
  );
}
export interface EvidenceNoteProps {
  status: "established" | "emerging" | "debated";
  text: string;
}
export function EvidenceNote({ status, text }: EvidenceNoteProps) {
  const t = useTranslations("ui");
  return (
    <aside role="note" className="article-measure evidence-note">
      <p className="type-meta">{t(status)}</p>
      <p className="type-body">{text}</p>
    </aside>
  );
}
export interface PullQuoteProps {
  quote: string;
  attribution?: string;
}
export function PullQuote({ quote, attribution }: PullQuoteProps) {
  return (
    <blockquote className="article-measure pull-quote">
      <p className="type-standfirst">{quote}</p>
      {attribution && (
        <cite className="type-meta">
          <bdi>{attribution}</bdi>
        </cite>
      )}
    </blockquote>
  );
}
export interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
}
export function Figure({ src, alt, caption, credit }: FigureProps) {
  const t = useTranslations("ui");
  return (
    <figure className="article-measure">
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={800}
        sizes="(max-width:768px) calc(100vw - 40px), 680px"
        className="w-full h-auto"
      />
      <figcaption className="type-meta">
        {caption}
        {credit && <bdi>{t("credit", { credit })}</bdi>}
      </figcaption>
    </figure>
  );
}
export type SourceItem = NonNullable<Article["sources"]>[number];
export interface SourcesListProps {
  sources: SourceItem[];
  title?: string;
}
function sourceURL(value?: string | null) {
  if (!value) return;
  try {
    const u = new URL(value);
    if (["https:", "http:"].includes(u.protocol)) return u.href;
  } catch {
    /* invalid source addresses stay as plain text */
  }
}
export function SourcesList({ sources, title }: SourcesListProps) {
  const t = useTranslations("ui");
  if (!sources.length) return null;
  return (
    <details className="article-measure sources-list" open>
      <summary><h2 className="type-h2">{title || t("sources")}</h2></summary>
      <ol>
        {sources.map((s, i) => {
          const href = sourceURL(s.urlDoi);
          return (
            <li key={s.id || i}>
              <h3 className="type-ui">{s.title}</h3>
              <p className="type-meta">
                <bdi>{s.authorOrg}</bdi> (<bdi>{s.year}</bdi>)
              </p>
              <p className="type-meta">{t(`source_${s.evidenceLevel}`)}</p>
              {s.note && <p className="type-ui">{s.note}</p>}
              {href && (
                <a
                  className="text-link"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("source_link")}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </details>
  );
}
export interface AuthorBoxProps {
  name: string;
  bio: string;
  avatarUrl?: string;
  role?: string;
  socials?: Record<string, string>;
}
export function AuthorBox({
  name,
  bio,
  avatarUrl,
  role,
  socials,
}: AuthorBoxProps) {
  const t = useTranslations("ui");
  return (
    <aside className="article-measure author-box">
      {avatarUrl && <Image src={avatarUrl} alt="" width={56} height={56} />}
      <h2 className="type-h3">
        <bdi>{name}</bdi>
      </h2>
      {role && <p className="type-meta">{role}</p>}
      {bio && <p className="type-ui">{bio}</p>}
      {socials && (
        <div className="share-row">
          {Object.entries(socials)
            .filter(
              ([key, url]) =>
                ["youtube", "instagram", "facebook", "x"].includes(key) &&
                typeof url === "string" &&
                /^https?:\/\//.test(url),
            )
            .map(([key, href]) => (
              <a
                key={key}
                href={href}
                className="text-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t(key)}
              </a>
            ))}
        </div>
      )}
    </aside>
  );
}
