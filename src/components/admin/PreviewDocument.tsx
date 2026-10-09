"use client";
import {
  RefreshRouteOnSave,
  useLivePreview,
} from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { EvidenceNote, SourcesList } from "@/components/article/EditorialBlocks";
import { RichText } from "@/components/article/RichText";
import { VideoPlayerFacade } from "@/components/video/VideoPlayerFacade";
import type { Article, Video, Page, Collection } from "@/payload-types";
export function PreviewDocument({
  initialData,
  serverURL,
  siteName,
}: {
  initialData: Article | Video | Page | Collection;
  serverURL: string;
  siteName: string;
}) {
  const router = useRouter();
  const locale = useLocale() as "en" | "ps" | "fa";
  const t = useTranslations("ui");
  const { data } = useLivePreview({ initialData, serverURL, depth: 2 });
  return (
    <>
      <RefreshRouteOnSave
        serverURL={serverURL}
        refresh={() => router.refresh()}
      />
      <div
        className="preview-indicator-bar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          padding: "8px 16px",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--divider)",
          borderRadius: "4px",
          fontSize: "13px",
          marginBlockEnd: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              display: "inline-block",
              padding: "2px 8px",
              backgroundColor: "var(--sage-700)",
              color: "var(--bg)",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {t("preview")}
          </span>
          <span style={{ color: "var(--ink-muted)" }}>
            {t("preview_draft_notice")}
          </span>
        </div>
        <Link
          href="/admin"
          className="text-link"
          style={{ fontSize: "13px", minHeight: "auto", textDecoration: "none" }}
        >
          [{t("back_to_admin")}]
        </Link>
      </div>
      {"body" in data && "summary" in data ? (
        <ArticleHeader
          title={data.title}
          standfirst={data.summary || ""}
          topicName={typeof data.topic === "object" && data.topic ? (data.topic as { name?: string }).name || "" : ""}
          topicSlug={typeof data.topic === "object" && data.topic ? (data.topic as { slug?: string }).slug || "" : ""}
          authorName={typeof data.authorProfile === "object" && data.authorProfile ? (data.authorProfile as { name?: string }).name || siteName : siteName}
          publishedDate={data.publishedAt && Number.isFinite(Date.parse(data.publishedAt)) ? new Intl.DateTimeFormat(locale === "fa" ? "fa-AF" : locale, { dateStyle: "medium" }).format(new Date(data.publishedAt)) : t("draft")}
          readingTimeMinutes={data.readingTimeMinutes || 1}
        />
      ) : (
        <h1 className="type-h1">{data.title}</h1>
      )}
      {"coverImage" in data && typeof data.coverImage === "object" && data.coverImage?.url && <figure className="article-measure mx-auto"><Image src={data.coverImage.url} alt={("coverAlt" in data ? data.coverAlt : "") || data.coverImage.alt} width={1200} height={800} className="w-full h-auto" /><figcaption>{"coverCaption" in data ? data.coverCaption : ""}</figcaption></figure>}
      {"youtubeUrl" in data && (
        <VideoPlayerFacade youtubeUrl={data.youtubeUrl} title={data.title} posterUrl={typeof data.thumbnail === "object" && data.thumbnail ? data.thumbnail.url || undefined : data.remotePosterUrl || undefined} />
      )}
      {"description" in data && <p className="type-body">{data.description}</p>}
      {"body" in data && <RichText locale={locale} data={data.body} />}
      {"evidenceNote" in data && data.evidenceNote?.status && data.evidenceNote.text && <EvidenceNote status={data.evidenceNote.status} text={data.evidenceNote.text} />}
      {"transcript" in data && data.transcript && <p className="type-body whitespace-pre-line">{data.transcript}</p>}
      {"sources" in data && data.sources?.length ? <SourcesList sources={data.sources} /> : null}
    </>
  );
}
