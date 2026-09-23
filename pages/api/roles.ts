import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

const DEFAULT_ROLES = [
  { name: 'Tank', imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Tank' },
  { name: 'Fighter', imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Fighter' },
  { name: 'Assassin', imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Assassin' },
  { name: 'Mage', imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Mage' },
  { name: 'Marksman', imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Marksman' },
  { name: 'Support', imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Support' },
  { name: 'Roamer', imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Roamer' },
  { name: 'Jungler', imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Jungler' },
  { name: 'Mid Laner', imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Midlaner' },
  { name: 'Gold Laner', imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=GoldLaner' },
  { name: 'EXP Laner', imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=ExpLaner' },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      let roles = await prisma.role.findMany({
        orderBy: { name: 'asc' },
      });

      // Auto-seed default roles if empty
      if (roles.length === 0) {
        for (const r of DEFAULT_ROLES) {
          try {
            await prisma.role.create({
              data: {
                name: r.name,
                imageUrl: r.imageUrl,
              },
            });
          } catch (e) {
            // Ignore uniqueness conflicts
          }
        }
        roles = await prisma.role.findMany({
          orderBy: { name: 'asc' },
        });
      }

      return res.status(200).json({ success: true, roles });
    }

    if (req.method === 'POST') {
      const { name, imageUrl } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Nama role wajib diisi' });
      }

      const role = await prisma.role.create({
        data: {
          name: name.trim(),
          imageUrl: imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`,
        },
      });
      return res.status(201).json({ success: true, role });
    }

    if (req.method === 'PUT') {
      const { id, name, imageUrl } = req.body;
      if (!id) return res.status(400).json({ success: false, error: 'Role ID is required' });

      const role = await prisma.role.update({
        where: { id },
        data: {
          name: name.trim(),
          imageUrl: imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`,
        },
      });
      return res.status(200).json({ success: true, role });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      const roleId = (id as string) || req.body?.id;
      if (!roleId) return res.status(400).json({ success: false, error: 'Role ID is required' });

      await prisma.role.delete({
        where: { id: roleId },
      });
      return res.status(200).json({ success: true, message: 'Role deleted successfully' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
