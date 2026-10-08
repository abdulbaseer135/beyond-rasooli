import React from "react";
import type { Locale } from "@/i18n/config";
import Image from "next/image";
import { VideoPlayerFacade } from "@/components/video/VideoPlayerFacade";
import { EvidenceNote, PullQuote, PartDivider } from "./EditorialBlocks";
export interface RichNode {
  type?: string;
  text?: string;
  alt?: string;
  caption?: string;
  format?: number;
  tag?: string;
  listType?: string;
  url?: string;
  fields?: {
    doc?: { relationTo?: string; value?: { slug?: string; language?: Locale } };
    url?: string;
    blockType?: string;
    quote?: string;
    attribution?: string;
    status?: "established" | "emerging" | "debated";
    text?: string;
    partNumber?: number;
    title?: string;
    youtubeUrl?: string;
  };
  value?: {
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
    caption?: string;
    credit?: string;
  };
  children?: RichNode[];
  root?: RichNode;
}
export function safeURL(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const u = new URL(value);
    if (["http:", "https:", "mailto:"].includes(u.protocol)) return value;
  } catch {
    /* invalid URLs are rendered as plain text */
  }
}
export function RichText({
  data,
  locale = "en",
}: {
  data: unknown;
  locale?: Locale;
}) {
  function render(node: RichNode, key: number): React.ReactNode {
    const children = node.children?.map(render);
    if (node.type === "text") {
      let text: React.ReactNode = <bdi>{node.text}</bdi>;
      if ((node.format || 0) & 1) text = <strong>{text}</strong>;
      if ((node.format || 0) & 2) text = <em>{text}</em>;
      if ((node.format || 0) & 8) text = <u>{text}</u>;
      if ((node.format || 0) & 16) text = <code>{text}</code>;
      return <React.Fragment key={key}>{text}</React.Fragment>;
    }
    if (node.type === "paragraph") return <p key={key}>{children}</p>;
    if (node.type === "heading") {
      const Tag = (
        ["h2", "h3", "h4"].includes(node.tag || "") ? node.tag : "h2"
      ) as "h2" | "h3" | "h4";
      return <Tag key={key}>{children}</Tag>;
    }
    if (node.type === "list")
      return node.listType === "number" ? (
        <ol key={key}>{children}</ol>
      ) : (
        <ul key={key}>{children}</ul>
      );
    if (node.type === "listitem") return <li key={key}>{children}</li>;
    if (node.type === "linebreak") return <br key={key} />;
    if (node.type === "quote")
      return <blockquote key={key}>{children}</blockquote>;
    if (node.type === "link" || node.type === "autolink") {
      const relation = node.fields?.doc;
      const document = relation?.value;
      const section =
        relation?.relationTo === "articles"
          ? "read/"
          : relation?.relationTo === "videos"
            ? "watch/"
            : relation?.relationTo === "pages"
              ? ""
              : undefined;
      const internal =
        section !== undefined && document?.slug
          ? `/${document.language || locale}/${section}${encodeURIComponent(document.slug)}`
          : undefined;
      const href = safeURL(internal || node.fields?.url || node.url);
      return href ? (
        <a key={key} href={href}>
          {children}
        </a>
      ) : (
        <React.Fragment key={key}>{children}</React.Fragment>
      );
    }
    if (node.type === "upload") {
      const image = node.value;
      const url = safeURL(image?.url);
      return image && url ? (
        <figure key={key}>
          <Image
            src={url}
            alt={node.alt || image.alt || ""}
            width={image.width || 1200}
            height={image.height || 800}
            sizes="(max-width: 768px) calc(100vw - 40px), 680px"
          />
          <figcaption>
            {node.caption || image.caption}
            <bdi>{image.credit}</bdi>
          </figcaption>
        </figure>
      ) : null;
    }
    if (node.type === "block") {
      const f = node.fields || {};
      if (f.blockType === "pullQuote")
        return (
          <PullQuote
            key={key}
            quote={f.quote || ""}
            attribution={f.attribution}
          />
        );
      if (f.blockType === "evidenceNote")
        return (
          <EvidenceNote
            key={key}
            status={f.status || "emerging"}
            text={f.text || ""}
          />
        );
      if (f.blockType === "part")
        return (
          <PartDivider
            key={key}
            partNumber={f.partNumber || 1}
            title={f.title || ""}
          />
        );
      if (f.blockType === "video")
        return (
          <VideoPlayerFacade
            key={key}
            youtubeUrl={f.youtubeUrl || ""}
            title={f.title || ""}
          />
        );
    }
    return <React.Fragment key={key}>{children}</React.Fragment>;
  }
  const node = data as RichNode | null;
  return (
    <div className="editorial-body article-measure">
      {node?.root?.children?.map(render)}
    </div>
  );
}
