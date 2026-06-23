import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/adminAuth';
import { getVideos, normalizeVideoInput, saveVideos, validateVideo } from '@/lib/videosStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    const videos = await getVideos();
    return res.status(200).json({ videos });
  }

  if (req.method === 'POST') {
    const videos = await getVideos();
    const nextId = videos.reduce((max, video) => Math.max(max, video.id), 0) + 1;
    const video = normalizeVideoInput(req.body, nextId);
    const errors = validateVideo(video);

    if (errors.length > 0) return res.status(400).json({ message: errors.join(' ') });

    const updatedVideos = [video, ...videos];
    await saveVideos(updatedVideos);
    return res.status(201).json({ video, videos: updatedVideos });
  }

  if (req.method === 'PUT') {
    const videos = await getVideos();
    const id = Number(req.body?.id);
    const current = videos.find(video => video.id === id);

    if (!current) return res.status(404).json({ message: 'Видео олдсонгүй.' });

    const video = normalizeVideoInput({ ...current, ...req.body, id }, id);
    const errors = validateVideo(video);

    if (errors.length > 0) return res.status(400).json({ message: errors.join(' ') });

    const updatedVideos = videos.map(item => (item.id === id ? video : item));
    await saveVideos(updatedVideos);
    return res.status(200).json({ video, videos: updatedVideos });
  }

  if (req.method === 'DELETE') {
    const videos = await getVideos();
    const id = Number(req.query.id);
    const updatedVideos = videos.filter(video => video.id !== id);

    if (updatedVideos.length === videos.length) {
      return res.status(404).json({ message: 'Видео олдсонгүй.' });
    }

    await saveVideos(updatedVideos);
    return res.status(200).json({ videos: updatedVideos });
  }

  res.setHeader('Allow', 'GET, POST, PUT, DELETE');
  return res.status(405).json({ message: 'Method not allowed' });
}