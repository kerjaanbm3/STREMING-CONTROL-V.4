import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const heroes = await prisma.hero.findMany({
        orderBy: { name: 'asc' },
      });
      return res.status(200).json({ success: true, heroes });
    }

    if (req.method === 'POST') {
      const { name, role, avatarUrl, bulk } = req.body;

      // Support bulk seed
      if (bulk && Array.isArray(bulk)) {
        for (const item of bulk) {
          const existing = await prisma.hero.findFirst({ where: { name: item.name } });
          if (!existing) {
            await prisma.hero.create({
              data: {
                name: item.name,
                role: item.role || 'Fighter',
                avatarUrl: item.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.name}`,
              },
            });
          }
        }
        const updated = await prisma.hero.findMany({ orderBy: { name: 'asc' } });
        return res.status(201).json({ success: true, heroes: updated });
      }

      const hero = await prisma.hero.create({
        data: {
          name,
          role: role || 'Fighter',
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
        },
      });
      return res.status(201).json({ success: true, hero });
    }

    if (req.method === 'PUT') {
      const { id, name, role, avatarUrl } = req.body;
      if (!id) return res.status(400).json({ success: false, error: 'Hero ID is required' });

      const hero = await prisma.hero.update({
        where: { id },
        data: {
          name,
          role,
          avatarUrl,
        },
      });
      return res.status(200).json({ success: true, hero });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      const heroId = (id as string) || req.body?.id;
      if (!heroId) return res.status(400).json({ success: false, error: 'Hero ID is required' });

      await prisma.hero.delete({
        where: { id: heroId },
      });
      return res.status(200).json({ success: true, message: 'Hero deleted successfully' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
