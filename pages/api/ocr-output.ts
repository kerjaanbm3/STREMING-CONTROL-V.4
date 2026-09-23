import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'live_output_txt', 'OCR');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Ensure the output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const { regions } = req.body as {
      regions: { name: string; text: string; confidence: number }[];
    };

    if (!regions || !Array.isArray(regions)) {
      return res.status(400).json({ message: 'Invalid payload: regions array required' });
    }

    const writtenFiles: string[] = [];

    for (const region of regions) {
      // Sanitize filename: replace spaces and special chars with underscores
      const safeName = region.name
        .replace(/[^a-zA-Z0-9_\-\u00C0-\u024F]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .toLowerCase();

      if (!safeName) continue;

      const filePath = path.join(OUTPUT_DIR, `${safeName}.txt`);
      fs.writeFileSync(filePath, region.text, 'utf8');
      writtenFiles.push(`${safeName}.txt`);
    }

    return res.status(200).json({
      success: true,
      directory: OUTPUT_DIR,
      written: writtenFiles,
    });
  } catch (err: any) {
    console.error('[OCR Output API]', err);
    return res.status(500).json({ message: 'Failed to write files', error: err.message });
  }
}
