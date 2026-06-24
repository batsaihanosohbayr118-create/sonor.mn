import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    const articles = await Article.find().sort({ createdAt: -1 });
    return res.status(200).json({ articles });
  }

  if (req.method === 'POST') {
    const lastArticle = await Article.findOne().sort({ id: -1 });
    const newId = (lastArticle?.id ?? 0) + 1;
    const article = await Article.create({ ...req.body, id: newId });
    const articles = await Article.find().sort({ createdAt: -1 });
    return res.status(201).json({ article, articles });
  }

  if (req.method === 'PUT') {
    const { id, ...data } = req.body;
    const article = await Article.findOneAndUpdate({ id }, data, { new: true }); // ← findOne({id}) болгов
    const articles = await Article.find().sort({ createdAt: -1 });
    return res.status(200).json({ article, articles });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    await Article.findOneAndDelete({ id: Number(id) }); // ← findOne({id}) болгов
    const articles = await Article.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, articles });
  }

  res.status(405).end();
}