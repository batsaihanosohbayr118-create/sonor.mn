import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    const articles = await Article.find().sort({ createdAt: -1 });
    return res.status(200).json(articles);
  }

  if (req.method === 'POST') {
    const article = await Article.create(req.body);
    return res.status(201).json(article);
  }

  if (req.method === 'PUT') {
    const { id, ...data } = req.body;
    const article = await Article.findByIdAndUpdate(id, data, { new: true });
    return res.status(200).json(article);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    await Article.findByIdAndDelete(id);
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}