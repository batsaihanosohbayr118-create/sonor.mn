// pages/api/admin/facts.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdminRequest } from '@/lib/adminAuth';
import { readFacts, writeFacts, Fact } from '@/lib/factsStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminRequest(req)) return res.status(401).json({ message: 'Unauthorized' });

  const facts = await readFacts();

  if (req.method === 'GET') {
    return res.status(200).json({ facts });
  }

  if (req.method === 'POST') {
    const data = req.body as Partial<Fact>;
    if (!data.claim?.trim()) return res.status(400).json({ message: 'Мэдэгдлийг оруулна уу.' });
    if (!data.vlabel?.trim()) return res.status(400).json({ message: 'Шошгыг оруулна уу.' });
    if (!data.verdict) return res.status(400).json({ message: 'Дүгнэлтийг сонгоно уу.' });

    const newId = Math.max(0, ...facts.map(f => f.id)) + 1;
    const newFact: Fact = { ...data, id: newId } as Fact;
    const updated = [...facts, newFact];
    await writeFacts(updated);
    return res.status(200).json({ facts: updated, fact: newFact });
  }

  if (req.method === 'PUT') {
    const data = req.body as Partial<Fact> & { id: number };
    if (!data.id) return res.status(400).json({ message: 'ID байхгүй байна.' });
    if (!data.claim?.trim()) return res.status(400).json({ message: 'Мэдэгдлийг оруулна уу.' });
    if (!data.vlabel?.trim()) return res.status(400).json({ message: 'Шошгыг оруулна уу.' });
    if (!data.verdict) return res.status(400).json({ message: 'Дүгнэлтийг сонгоно уу.' });

    const updated = facts.map(f => (f.id === data.id ? ({ ...f, ...data } as Fact) : f));
    await writeFacts(updated);
    const fact = updated.find(f => f.id === data.id)!;
    return res.status(200).json({ facts: updated, fact });
  }

  if (req.method === 'DELETE') {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ message: 'ID байхгүй байна.' });
    const updated = facts.filter(f => f.id !== id);
    await writeFacts(updated);
    return res.status(200).json({ facts: updated });
  }

  res.setHeader('Allow', 'GET, POST, PUT, DELETE');
  return res.status(405).json({ message: 'Method not allowed' });
}