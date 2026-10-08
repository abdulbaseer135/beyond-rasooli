import { getTranslations } from '../src/lib/data/cms';

async function test() {
  const trans = await getTranslations('articles', 'd2e567d4-6cbe-409b-a324-38e90b3add92', true);
  console.log('ARTICLE TRANSLATIONS:', trans);
  process.exit(0);
}
test().catch(console.error);
