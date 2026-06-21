import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = formidable({ maxFileSize: 5 * 1024 * 1024 });
  form.parse(req, async (err: Error | null, _fields: any, files: any) => {
    if (err) return res.status(500).json({ message: 'Upload алдаа' });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return res.status(400).json({ message: 'Файл олдсонгүй' });

    const ext = path.extname(file.originalFilename ?? '.jpg');
    const name = `${Date.now()}${ext}`;
    const dest = path.join(process.cwd(), 'public', 'uploads', name);

    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(file.filepath, dest);

    res.status(200).json({ url: `/uploads/${name}` });
  });
}