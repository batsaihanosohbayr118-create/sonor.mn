import { Redis } from '@upstash/redis';
import type { Video } from '@/data/newsData';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL!,
  token: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN!,
});

const VIDEOS_KEY = 'videos:list';

const readStoredVideos = async (): Promise<Video[]> => {
  const videos = await redis.get<Video[]>(VIDEOS_KEY);
  return Array.isArray(videos) ? videos : [];
};

export const getVideos = async (): Promise<Video[]> => {
  return readStoredVideos();
};

export const getActiveVideos = async (): Promise<Video[]> => {
  const videos = await readStoredVideos();
  return videos.filter(video => video.active);
};

export const saveVideos = async (videos: Video[]) => {
  await redis.set(VIDEOS_KEY, videos);
};

// YouTube линк (watch/youtu.be/embed/shorts, playlist эсвэл timestamp
// параметртэй ч) эсвэл хатуу 11-тэмдэгтийн ID-аас цэвэр youtubeId гаргаж авна.
export const extractYoutubeId = (input: string): string => {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '');
    }
    if (url.hostname.includes('youtube.com')) {
      if (url.pathname === '/watch') return url.searchParams.get('v') ?? trimmed;
      if (url.pathname.startsWith('/embed/')) return url.pathname.split('/embed/')[1];
      if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/shorts/')[1];
    }
  } catch {
    // URL биш бол доор анхны утгыг буцаана
  }

  return trimmed;
};

export const normalizeVideoInput = (input: Partial<Video>, nextId: number): Video => {
  return {
    id: typeof input.id === 'number' ? input.id : nextId,
    title: String(input.title ?? '').trim() || 'Нэргүй видео',
    youtubeId: extractYoutubeId(String(input.youtubeId ?? '').trim()),
    active: Boolean(input.active),
  };
};

export const validateVideo = (video: Video) => {
  const errors: string[] = [];
  if (!video.title) errors.push('Нэр (тэмдэглэгээ) оруулна уу.');
  if (!video.youtubeId) errors.push('YouTube линк эсвэл ID оруулна уу.');
  return errors;
};