import type { NextApiRequest, NextApiResponse } from 'next';
import { getOfficialFeed } from '@/lib/officialFeed';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const limit = Math.min(Math.max(Number(req.query.limit ?? 8) || 8, 1), 12);

  try {
    const items = await getOfficialFeed(limit);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
    res.status(200).json({ items, source: '1212' });
  } catch {
    res.status(200).json({ items: [], source: '1212' });
  }
}

