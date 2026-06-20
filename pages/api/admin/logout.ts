import type { NextApiRequest, NextApiResponse } from 'next';
import { clearAdminCookie } from '@/lib/adminAuth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  res.setHeader('Set-Cookie', clearAdminCookie());
  return res.status(200).json({ ok: true });
}
