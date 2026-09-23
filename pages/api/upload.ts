import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create uploads directory:', err);
  }
}

/**
 * Offline Media Upload Engine: Saves images directly to public/uploads/
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { dataBase64, fileName } = req.body;

    if (!dataBase64) {
      return res.status(400).json({ success: false, message: 'Missing base64 data' });
    }

    // Strip header if data URL format (e.g. data:image/png;base64,...)
    const base64Data = dataBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const cleanFileName = `${Date.now()}_${(fileName || 'media.png').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, cleanFileName);

    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${cleanFileName}`;

    return res.status(200).json({
      success: true,
      url: publicUrl,
      fileName: cleanFileName,
    });
  } catch (err: any) {
    console.error('[Upload API Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
