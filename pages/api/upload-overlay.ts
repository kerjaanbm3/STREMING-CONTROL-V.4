import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { fileName, fileContent } = req.body;

    if (!fileName || !fileContent) {
      return res.status(400).json({ success: false, message: 'Missing fileName or fileContent' });
    }

    // Pastikan nama file aman
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '').toLowerCase();
    
    // Pastikan ekstensi file adalah .tsx atau .ts
    if (!safeFileName.endsWith('.tsx') && !safeFileName.endsWith('.ts')) {
      return res.status(400).json({ success: false, message: 'Only .tsx or .ts files are allowed' });
    }

    // 1. Simpan file fisik ke pages/overlay/
    const overlaysDir = path.join(process.cwd(), 'pages', 'overlay');
    
    // Buat direktori jika belum ada (walaupun seharusnya sudah ada)
    if (!fs.existsSync(overlaysDir)) {
      fs.mkdirSync(overlaysDir, { recursive: true });
    }

    const filePath = path.join(overlaysDir, safeFileName);
    await fs.promises.writeFile(filePath, fileContent, 'utf-8');

    // 2. Daftarkan ke Database Prisma
    // Dapatkan nama tanpa ekstensi untuk dijadikan ID path
    const routeName = safeFileName.replace('.tsx', '').replace('.ts', '');
    const overlayPath = `/overlay/${routeName}`;

    // Cek apakah sudah ada di database
    const existing = await prisma.overlay.findFirst({
      where: { path: overlayPath }
    });

    let overlayRecord;
    
    if (existing) {
      // Update jika sudah ada
      overlayRecord = await prisma.overlay.update({
        where: { id: existing.id },
        data: {
          title: `Custom Overlay: ${routeName}`,
        }
      });
    } else {
      // Buat baru jika belum ada
      overlayRecord = await prisma.overlay.create({
        data: {
          title: `Custom Overlay: ${routeName}`,
          category: 'HUD', // Kategori default
          categoryLabel: 'Custom Imported',
          description: 'Overlay custom yang diimpor melalui file upload.',
          path: overlayPath,
          resolution: '1920x1080 Alpha Transparent',
          badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-950/40',
          icon: 'Layers'
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'File successfully uploaded and registered',
      overlay: overlayRecord
    });
    
  } catch (err: any) {
    console.error('[Upload Overlay API Error]', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
}
