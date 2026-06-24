import { connectDB } from '@/lib/mongodb';
import ArticleModel from '@/models/Article';
import { ARTICLES, CATS, FEATURED, Article } from '@/data/newsData';

export const getArticles = async (): Promise<Article[]> => {
  await connectDB();
  const docs = await ArticleModel.find({ id: { $exists: true, $ne: null } }).sort({ createdAt: -1 }).lean();
  if (docs.length > 0) return docs as unknown as Article[];
  return ARTICLES;
};

export const getArticleById = async (id: number): Promise<Article | null> => {
  await connectDB();
  const doc = await ArticleModel.findOne({ id }).lean();
  return doc ? (doc as unknown as Article) : null;
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