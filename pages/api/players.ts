import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. GET: Fetch all players
    if (req.method === 'GET') {
      const { teamId } = req.query;
      const whereClause = teamId && typeof teamId === 'string' ? { teamId } : {};

      const players = await prisma.player.findMany({
        where: whereClause,
        include: {
          team: {
            include: { event: true },
          },
        },
        orderBy: [{ teamId: 'asc' }, { jerseyNumber: 'asc' }, { name: 'asc' }],
      });
      return res.status(200).json({ success: true, players });
    }

    // 2. POST: Create new player with 3 images or bulk import
    if (req.method === 'POST') {
      const {
        teamId,
        name,
        inGameName,
        role,
        positionType,
        jerseyNumber,
        photoProfile,
        photoPose2,
        photoPose3,
        bulk,
      } = req.body;

      // Support bulk import
      if (bulk && Array.isArray(bulk)) {
        for (const item of bulk) {
          if (item.name) {
            // Find team by teamId or teamName
            let targetTeamId = item.teamId;
            if (!targetTeamId && item.teamName) {
              const foundTeam = await prisma.team.findFirst({
                where: { name: item.teamName.trim().toUpperCase() },
              });
              if (foundTeam) targetTeamId = foundTeam.id;
            }

            if (!targetTeamId) {
              const firstTeam = await prisma.team.findFirst();
              if (firstTeam) targetTeamId = firstTeam.id;
            }

            if (targetTeamId) {
              await prisma.player.create({
                data: {
                  teamId: targetTeamId,
                  name: item.name.trim(),
                  inGameName: item.inGameName ? item.inGameName.trim() : null,
                  role: item.role ? item.role.trim() : 'Player',
                  positionType: item.positionType || 'PLAYER',
                  jerseyNumber: item.jerseyNumber ? parseInt(String(item.jerseyNumber), 10) : null,
                  photoProfile: item.photoProfile || null,
                  photoPose2: item.photoPose2 || null,
                  photoPose3: item.photoPose3 || null,
                },
              });
            }
          }
        }
        const updated = await prisma.player.findMany({
          include: { team: true },
          orderBy: [{ teamId: 'asc' }, { jerseyNumber: 'asc' }, { name: 'asc' }],
        });
        return res.status(201).json({ success: true, players: updated });
      }

      if (!teamId || !name) {
        return res.status(400).json({ success: false, error: 'teamId and name are required' });
      }

      const player = await prisma.player.create({
        data: {
          teamId,
          name: name.trim(),
          inGameName: inGameName ? inGameName.trim() : null,
          role: role ? role.trim() : 'Player',
          positionType: positionType || 'PLAYER',
          jerseyNumber: jerseyNumber !== undefined && jerseyNumber !== '' ? parseInt(String(jerseyNumber), 10) : null,
          photoProfile: photoProfile || null,
          photoPose2: photoPose2 || null,
          photoPose3: photoPose3 || null,
        },
        include: {
          team: true,
        },
      });

      return res.status(201).json({ success: true, player });
    }

    // 3. PUT: Update player with 3 images
    if (req.method === 'PUT') {
      const {
        id,
        teamId,
        name,
        inGameName,
        role,
        positionType,
        jerseyNumber,
        photoProfile,
        photoPose2,
        photoPose3,
      } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, error: 'Player ID is required' });
      }

      const updated = await prisma.player.update({
        where: { id },
        data: {
          teamId: teamId || undefined,
          name: name ? name.trim() : undefined,
          inGameName: inGameName !== undefined ? inGameName.trim() : undefined,
          role: role !== undefined ? role.trim() : undefined,
          positionType: positionType || undefined,
          jerseyNumber: jerseyNumber !== undefined ? (jerseyNumber !== '' ? parseInt(String(jerseyNumber), 10) : null) : undefined,
          photoProfile: photoProfile !== undefined ? photoProfile : undefined,
          photoPose2: photoPose2 !== undefined ? photoPose2 : undefined,
          photoPose3: photoPose3 !== undefined ? photoPose3 : undefined,
        },
        include: {
          team: true,
        },
      });

      return res.status(200).json({ success: true, player: updated });
    }

    // 4. DELETE: Delete player
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Player ID is required' });
      }

      await prisma.player.delete({
        where: { id },
      });

      return res.status(200).json({ success: true, message: 'Player deleted' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('API /players error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
