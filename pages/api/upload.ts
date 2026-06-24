import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';

export const config = { api: { bodyParser: false } };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = formidable({ maxFileSize: 5 * 1024 * 1024 });

  form.parse(req, async (err, _fields, files) => {
    if (err) return res.status(500).json({ message: 'Upload алдаа' });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return res.status(400).json({ message: 'Файл олдсонгүй' });

    try {
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: 'sonornews',
      });

      res.status(200).json({ url: result.secure_url });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });
}