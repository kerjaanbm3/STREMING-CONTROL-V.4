import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import DataSyncService from '@/lib/data-sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. GET: Fetch all teams with player count
    if (req.method === 'GET') {
      const teams = await prisma.team.findMany({
        include: {
          event: true,
          players: true,
          _count: { select: { players: true } },
        },
        orderBy: { name: 'asc' },
      });
      return res.status(200).json({ success: true, teams });
    }

    // 2. POST: Create a new team or bulk import
    if (req.method === 'POST') {
      const { name, institution, logoUrl, brandColor, eventId, bulk } = req.body;

      if (bulk && Array.isArray(bulk)) {
        for (const item of bulk) {
          if (item.name) {
            const cleanName = item.name.trim().toUpperCase();
            const existing = await prisma.team.findFirst({ where: { name: cleanName } });
            if (!existing) {
              await prisma.team.create({
                data: {
                  name: cleanName,
                  institution: item.institution ? item.institution.trim() : null,
                  logoUrl: item.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanName)}`,
                  brandColor: item.brandColor || '#2563eb',
                  eventId: eventId || null,
                },
              });
            }
          }
        }
        const updated = await prisma.team.findMany({
          include: { players: true, _count: { select: { players: true } } },
          orderBy: { name: 'asc' },
        });
        return res.status(201).json({ success: true, teams: updated });
      }

      if (!name) {
        return res.status(400).json({ success: false, error: 'Team name is required' });
      }

      const team = await prisma.team.create({
        data: {
          name: name.trim().toUpperCase(),
          institution: institution ? institution.trim() : null,
          logoUrl: logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name.trim())}`,
          brandColor: brandColor || '#2563eb',
          eventId: eventId || null,
        },
      });
      return res.status(201).json({ success: true, team });
    }

    // 3. PUT: Update an existing team
    if (req.method === 'PUT') {
      const { id, name, institution, logoUrl, brandColor, eventId } = req.body;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Team ID is required' });
      }

      const updated = await prisma.team.update({
        where: { id },
        data: {
          name: name ? name.trim().toUpperCase() : undefined,
          institution: institution !== undefined ? institution.trim() : undefined,
          logoUrl: logoUrl || undefined,
          brandColor: brandColor || undefined,
          eventId: eventId || undefined,
        },
      });

      // If active match is using this team, sync to live overlay
      const currentState = DataSyncService.getState();
      if (currentState.teamA.id === updated.id) {
        DataSyncService.syncAllChannels({
          teamA: {
            ...currentState.teamA,
            name: updated.name,
            brandColor: updated.brandColor || currentState.teamA.brandColor,
            logoUrl: updated.logoUrl || currentState.teamA.logoUrl,
          },
        });
      } else if (currentState.teamB.id === updated.id) {
        DataSyncService.syncAllChannels({
          teamB: {
            ...currentState.teamB,
            name: updated.name,
            brandColor: updated.brandColor || currentState.teamB.brandColor,
            logoUrl: updated.logoUrl || currentState.teamB.logoUrl,
          },
        });
      }

      return res.status(200).json({ success: true, team: updated });
    }

    // 4. DELETE: Delete a team
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Team ID is required' });
      }

      await prisma.team.delete({
        where: { id },
      });

      return res.status(200).json({ success: true, message: 'Team deleted' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('API /teams error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
