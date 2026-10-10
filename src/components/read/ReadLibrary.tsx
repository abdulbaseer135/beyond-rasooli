import { ArticleCard } from "@/components/cards/ArticleCard";
import type { PublicArticle } from "@/lib/data/content-types";
export function ReadLibrary({
  articles,
}: {
  articles: PublicArticle[];
  locale: string;
}) {
  return (
    <div className="article-grid">
      {articles.map((a) => (
        <ArticleCard key={a.id} {...a} />
      ))}
    </div>
  );
}
