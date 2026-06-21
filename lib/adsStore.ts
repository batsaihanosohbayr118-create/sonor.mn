import { kv } from '@vercel/kv';
import type { Ad } from '@/data/newsData';

const ADS_KEY = 'ads:list';

const readStoredAds = async (): Promise<Ad[]> => {
  const ads = await kv.get<Ad[]>(ADS_KEY);
  return Array.isArray(ads) ? ads : [];
};

export const getAds = async (): Promise<Ad[]> => {
  return readStoredAds();
};

export const getActiveAds = async (): Promise<Ad[]> => {
  const ads = await readStoredAds();
  return ads.filter(ad => ad.active);
};

export const saveAds = async (ads: Ad[]) => {
  await kv.set(ADS_KEY, ads);
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