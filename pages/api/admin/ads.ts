import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/adminAuth';
import { getAds, normalizeAdInput, saveAds, validateAd } from '@/lib/adsStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    const ads = await getAds();
    return res.status(200).json({ ads });
  }

  if (req.method === 'POST') {
    const ads = await getAds();
    const nextId = ads.reduce((max, ad) => Math.max(max, ad.id), 0) + 1;
    const ad = normalizeAdInput(req.body, nextId);
    const errors = validateAd(ad);

    if (errors.length > 0) return res.status(400).json({ message: errors.join(' ') });

    const updatedAds = [ad, ...ads];
    await saveAds(updatedAds);
    return res.status(201).json({ ad, ads: updatedAds });
  }

  if (req.method === 'PUT') {
    const ads = await getAds();
    const id = Number(req.body?.id);
    const current = ads.find(ad => ad.id === id);

    if (!current) return res.status(404).json({ message: 'Сурталчилгаа олдсонгүй.' });

    const ad = normalizeAdInput({ ...current, ...req.body, id }, id);
    const errors = validateAd(ad);

    if (errors.length > 0) return res.status(400).json({ message: errors.join(' ') });

    const updatedAds = ads.map(item => (item.id === id ? ad : item));
    await saveAds(updatedAds);
    return res.status(200).json({ ad, ads: updatedAds });
  }

  if (req.method === 'DELETE') {
    const ads = await getAds();
    const id = Number(req.query.id);
    const updatedAds = ads.filter(ad => ad.id !== id);

    if (updatedAds.length === ads.length) {
      return res.status(404).json({ message: 'Сурталчилгаа олдсонгүй.' });
    }

    await saveAds(updatedAds);
    return res.status(200).json({ ads: updatedAds });
  }

  res.setHeader('Allow', 'GET, POST, PUT, DELETE');
  return res.status(405).json({ message: 'Method not allowed' });
}