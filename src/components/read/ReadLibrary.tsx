import { ArticleCard } from "@/components/cards/ArticleCard";
import type { PublicArticle } from "@/lib/data/content-types";
export function ReadLibrary({
  articles,
}: {
  articles: PublicArticle[];
  locale: string;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((a) => (
        <ArticleCard key={a.id} {...a} />
      ))}
    </div>
  );
}
