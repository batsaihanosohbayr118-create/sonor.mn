import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminCookie, getAdminCredentials } from '@/lib/adminAuth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body ?? {};
  const credentials = getAdminCredentials();

  if (username !== credentials.username || password !== credentials.password) {
    return res.status(401).json({ message: 'Нэвтрэх нэр эсвэл нууц үг буруу байна.' });
  }

  res.setHeader('Set-Cookie', createAdminCookie(credentials.username));
  return res.status(200).json({ ok: true, username: credentials.username });
}
