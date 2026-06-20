import type { NextApiRequest, NextApiResponse } from 'next';
import { readAdminSession } from '@/lib/adminAuth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = readAdminSession(req.headers.cookie);
  return res.status(200).json({ authenticated: Boolean(session), username: session?.username ?? null });
}
