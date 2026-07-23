import { readCollection, writeCollection } from '@/lib/db';
import type { Ad } from '@/data/newsData';

const COLLECTION = 'ads';

export const getAds = async (): Promise<Ad[]> => {
  return readCollection<Ad>(COLLECTION);
};

export const getActiveAds = async (): Promise<Ad[]> => {
  const ads = await readCollection<Ad>(COLLECTION);
  return ads.filter(ad => ad.active);
};

export const saveAds = async (ads: Ad[]) => {
  await writeCollection(COLLECTION, ads);
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
