// pages/api/admin/mps.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdminRequest } from '@/lib/adminAuth';
import { readMps, writeMps } from '@/lib/mpsStore';
import { MP } from '@/data/newsData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const mps = await readMps();
    return res.status(200).json({ mps });
  }

  if (!isAdminRequest(req)) return res.status(401).json({ message: 'Unauthorized' });

  const mps = await readMps();

  if (req.method === 'POST') {
    const data = req.body as Partial<MP>;
    if (!data.name?.trim()) return res.status(400).json({ message: 'Нэрийг оруулна уу.' });
    const newId = Math.max(0, ...mps.map(m => m.id)) + 1;
    const newMp: MP = { ...data, id: newId } as MP;
    const updated = [...mps, newMp];
    await writeMps(updated);
    return res.status(200).json({ mps: updated, mp: newMp });
  }

  if (req.method === 'PUT') {
    const data = req.body as Partial<MP> & { id: number };
    if (!data.id) return res.status(400).json({ message: 'ID байхгүй байна.' });
    if (!data.name?.trim()) return res.status(400).json({ message: 'Нэрийг оруулна уу.' });
    const updated = mps.map(m => m.id === data.id ? { ...m, ...data } as MP : m);
    await writeMps(updated);
    const mp = updated.find(m => m.id === data.id)!;
    return res.status(200).json({ mps: updated, mp });
  }

  if (req.method === 'DELETE') {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ message: 'ID байхгүй байна.' });
    const updated = mps.filter(m => m.id !== id);
    await writeMps(updated);
    return res.status(200).json({ mps: updated });
  }

  return res.status(405).end();
}