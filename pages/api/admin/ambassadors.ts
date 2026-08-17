// pages/api/admin/ambassadors.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdminRequest } from '@/lib/adminAuth';
import { readAmbassadors, writeAmbassadors, AmbassadorRecord } from '@/lib/ambassadorsStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const ambassadors = await readAmbassadors();
    return res.status(200).json({ ambassadors });
  }

  if (!isAdminRequest(req)) return res.status(401).json({ message: 'Unauthorized' });

  const ambassadors = await readAmbassadors();

  if (req.method === 'POST') {
    const data = req.body as AmbassadorRecord;
    if (!data.name?.trim() || !data.country?.trim()) {
      return res.status(400).json({ message: 'Нэр болон улсыг оруулна уу.' });
    }
    const updated = [...ambassadors, data];
    await writeAmbassadors(updated);
    return res.status(200).json({ ambassadors: updated, ambassador: data });
  }

  if (req.method === 'PUT') {
    const idx = Number(req.query.idx);
    if (isNaN(idx) || idx < 0 || idx >= ambassadors.length) {
      return res.status(400).json({ message: 'Индекс буруу байна.' });
    }
    const data = req.body as AmbassadorRecord;
    if (!data.name?.trim() || !data.country?.trim()) {
      return res.status(400).json({ message: 'Нэр болон улсыг оруулна уу.' });
    }
    const updated = ambassadors.map((a, i) => i === idx ? data : a);
    await writeAmbassadors(updated);
    return res.status(200).json({ ambassadors: updated, ambassador: data });
  }

  if (req.method === 'DELETE') {
    const idx = Number(req.query.idx);
    if (isNaN(idx) || idx < 0 || idx >= ambassadors.length) {
      return res.status(400).json({ message: 'Индекс буруу байна.' });
    }
    const updated = ambassadors.filter((_, i) => i !== idx);
    await writeAmbassadors(updated);
    return res.status(200).json({ ambassadors: updated });
  }

  return res.status(405).end();
}