import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/adminAuth';
import { getArticles, normalizeArticleInput, saveArticles, validateArticle } from '@/lib/articlesStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    const articles = await getArticles();
    return res.status(200).json({ articles });
  }

  if (req.method === 'POST') {
    const articles = await getArticles();
    const nextId = articles.reduce((max, article) => Math.max(max, article.id), 0) + 1;
    const article = normalizeArticleInput(req.body, nextId);
    const errors = validateArticle(article);

    if (errors.length > 0) return res.status(400).json({ message: errors.join(' ') });

    const updatedArticles = [article, ...articles];
    await saveArticles(updatedArticles);
    return res.status(201).json({ article, articles: updatedArticles });
  }

  if (req.method === 'PUT') {
    const articles = await getArticles();
    const id = Number(req.body?.id);
    const current = articles.find(article => article.id === id);

    if (!current) return res.status(404).json({ message: 'Мэдээ олдсонгүй.' });

    const article = normalizeArticleInput({ ...current, ...req.body, id }, id);
    const errors = validateArticle(article);

    if (errors.length > 0) return res.status(400).json({ message: errors.join(' ') });

    const updatedArticles = articles.map(item => (item.id === id ? article : item));
    await saveArticles(updatedArticles);
    return res.status(200).json({ article, articles: updatedArticles });
  }

  if (req.method === 'DELETE') {
    const articles = await getArticles();
    const id = Number(req.query.id);
    const updatedArticles = articles.filter(article => article.id !== id);

    if (updatedArticles.length === articles.length) {
      return res.status(404).json({ message: 'Мэдээ олдсонгүй.' });
    }

    await saveArticles(updatedArticles);
    return res.status(200).json({ articles: updatedArticles });
  }

  res.setHeader('Allow', 'GET, POST, PUT, DELETE');
  return res.status(405).json({ message: 'Method not allowed' });
}
