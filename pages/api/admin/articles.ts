import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteArticle, getArticles, saveArticle } from '@/lib/articlesStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const articles = await getArticles();
    return res.status(200).json({ articles });
  }

  if (req.method === 'POST') {
    const articles = await getArticles();
    const newId = Math.max(0, ...articles.map(article => article.id)) + 1;
    const article = { ...req.body, id: newId };
    const articlesAfterSave = await saveArticle(article);
    return res.status(201).json({ article, articles: articlesAfterSave });
  }

  if (req.method === 'PUT') {
    const { id, ...data } = req.body;
    const article = { ...data, id: Number(id) };
    const articles = await saveArticle(article);
    return res.status(200).json({ article, articles });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const articles = await deleteArticle(Number(id));
    return res.status(200).json({ success: true, articles });
  }

  res.status(405).end();
}
