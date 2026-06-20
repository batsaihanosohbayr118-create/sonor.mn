import type { NextApiRequest, NextApiResponse } from 'next';
import { getTwitterBearerToken, getTwitterPoliticsHighlights, TwitterPoliticsItem } from '@/lib/twitterPolitics';

type TwitterPoliticsResponse = {
  items: TwitterPoliticsItem[];
  configured: boolean;
  error?: string;
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<TwitterPoliticsResponse>
) {
  const configured = Boolean(getTwitterBearerToken());

  if (!configured) {
    res.status(200).json({ items: [], configured });
    return;
  }

  try {
    const items = await getTwitterPoliticsHighlights();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
    res.status(200).json({ items, configured });
  } catch {
    res.status(200).json({
      items: [],
      configured,
      error: 'X API-гаас мэдээлэл татаж чадсангүй',
    });
  }
}
