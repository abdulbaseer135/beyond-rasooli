import { getLibrary } from '../src/lib/data/cms';

async function main() {
  const lib = await getLibrary('en');
  console.log('Articles count:', lib.articles.length);
  console.log('Articles topics:', lib.articles.map(a => ({ id: a.id, slug: a.slug, topicSlug: a.topicSlug })));
  console.log('Videos count:', lib.videos.length);
  console.log('Videos topics:', lib.videos.map(v => ({ id: v.id, slug: v.slug, topicSlug: v.topicSlug })));
  console.log('Topics count:', lib.topics.length);
  console.log('Topics:', lib.topics);
}

main().catch(console.error);
