import { readCollection, writeCollection } from '@/lib/db';
import { ARTICLES, CATS, FEATURED, Article } from '@/data/newsData';

const COLLECTION = 'articles';

type StoredArticle = Article & { createdAt?: string };

const sortStoredArticles = (articles: StoredArticle[]) =>
  [...articles].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (aTime !== bTime) return bTime - aTime;
    return b.id - a.id;
  });

const stripCreatedAt = ({ createdAt, ...article }: StoredArticle): Article => article;

const withCreatedAt = (article: Article, createdAt = new Date().toISOString()): StoredArticle => ({
  ...article,
  createdAt,
});

const readStored = () => readCollection<StoredArticle>(COLLECTION);
const writeStored = (articles: StoredArticle[]) => writeCollection(COLLECTION, sortStoredArticles(articles));

export const getArticles = async (): Promise<Article[]> => {
  const stored = await readStored();
  const list = sortStoredArticles(stored).map(stripCreatedAt);
  return list.length > 0 ? list : ARTICLES;
};

export const getArticleById = async (id: number): Promise<Article | null> => {
  const stored = await readStored();
  const match = stored.find(article => article.id === id);
  return match ? stripCreatedAt(match) : null;
};

export const saveArticle = async (article: Article): Promise<Article[]> => {
  const articles = await readStored();
  const next = withCreatedAt(article);
  const index = articles.findIndex(item => item.id === article.id);

  if (index >= 0) {
    articles[index] = { ...articles[index], ...next, createdAt: articles[index].createdAt ?? next.createdAt };
  } else {
    articles.push(next);
  }

  await writeStored(articles);
  return getArticles();
};

export const deleteArticle = async (id: number): Promise<Article[]> => {
  const articles = (await readStored()).filter(article => article.id !== id);
  await writeStored(articles);
  return getArticles();
};

export const getFeaturedArticles = (articles: Article[]) => {
  const manuallyFeatured = articles.filter(article => article.featured);
  if (manuallyFeatured.length > 0) return manuallyFeatured.slice(0, 5);

  return FEATURED
    .map(id => articles.find(article => article.id === id))
    .filter((article): article is Article => Boolean(article))
    .slice(0, 5);
};

export const normalizeArticleInput = (input: Partial<Article>, nextId: number): Article => {
  const cat = typeof input.cat === 'string' && CATS[input.cat] ? input.cat : 'uih';
  const body = Array.isArray(input.body)
    ? input.body.map(String).map(item => item.trim()).filter(Boolean)
    : String(input.body ?? '').split('\n').map(item => item.trim()).filter(Boolean);

  return {
    id: typeof input.id === 'number' ? input.id : nextId,
    cat,
    featured: Boolean(input.featured),
    title: String(input.title ?? '').trim(),
    excerpt: String(input.excerpt ?? '').trim(),
    author: String(input.author ?? '').trim() || 'Редакц',
    time: String(input.time ?? '').trim() || 'Саяхан',
    image: String(input.image ?? '').trim() || undefined,
    body,
    src: String(input.src ?? '').trim() || 'Эх сурвалж: Сонор.мн',
  };
};

export const validateArticle = (article: Article) => {
  const errors: string[] = [];
  if (!article.title) errors.push('Гарчиг оруулна уу.');
  if (!article.excerpt) errors.push('Товч тайлбар оруулна уу.');
  if (article.body.length === 0) errors.push('Мэдээний үндсэн текст оруулна уу.');
  if (!CATS[article.cat]) errors.push('Ангилал буруу байна.');
  return errors;
};
