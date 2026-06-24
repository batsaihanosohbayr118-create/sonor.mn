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
    const article = await Article.create(req.body);
    const articles = await Article.find().sort({ createdAt: -1 });
    return res.status(201).json({ article, articles });
  }

  if (req.method === 'PUT') {
    const { id, ...data } = req.body;
    const article = await Article.findByIdAndUpdate(id, data, { new: true });
    const articles = await Article.find().sort({ createdAt: -1 });
    return res.status(200).json({ article, articles });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query; // ← req.body биш req.query!
    await Article.findByIdAndDelete(id);
    const articles = await Article.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, articles });
  }

  res.status(405).end();
}