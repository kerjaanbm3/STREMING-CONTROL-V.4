import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const hotkeys = await prisma.hotkeyConfig.findMany();
      return res.status(200).json({ success: true, hotkeys });
    }

    if (req.method === 'POST') {
      const { configs } = req.body; // Array of { actionName, keyCode, description, category }
      if (Array.isArray(configs)) {
        for (const item of configs) {
          await prisma.hotkeyConfig.upsert({
            where: { actionName: item.actionName },
            update: { keyCode: item.keyCode, description: item.description, category: item.category },
            create: { actionName: item.actionName, keyCode: item.keyCode, description: item.description, category: item.category || 'GENERAL' },
          });
        }
      }
      const updated = await prisma.hotkeyConfig.findMany();
      return res.status(200).json({ success: true, hotkeys: updated });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
