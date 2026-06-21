import fs from 'fs/promises';
import path from 'path';
import type { Ad } from '@/data/newsData';

const adsPath = path.join(process.cwd(), 'data', 'ads.json');

const readStoredAds = async (): Promise<Ad[]> => {
  try {
    const raw = await fs.readFile(adsPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Ad[]) : [];
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return [];
    throw error;
  }
};

export const getAds = async (): Promise<Ad[]> => {
  return readStoredAds();
};

export const getActiveAds = async (): Promise<Ad[]> => {
  const ads = await readStoredAds();
  return ads.filter(ad => ad.active);
};

export const saveAds = async (ads: Ad[]) => {
  await fs.mkdir(path.dirname(adsPath), { recursive: true });
  await fs.writeFile(adsPath, `${JSON.stringify(ads, null, 2)}\n`, 'utf8');
};

export const normalizeAdInput = (input: Partial<Ad>, nextId: number): Ad => {
  return {
    id: typeof input.id === 'number' ? input.id : nextId,
    title: String(input.title ?? '').trim() || 'Нэргүй сурталчилгаа',
    image: String(input.image ?? '').trim(),
    link: String(input.link ?? '').trim() || undefined,
    active: Boolean(input.active),
  };
};

export const validateAd = (ad: Ad) => {
  const errors: string[] = [];
  if (!ad.title) errors.push('Нэр (тэмдэглэгээ) оруулна уу.');
  if (!ad.image) errors.push('Зураг оруулна уу.');
  return errors;
};