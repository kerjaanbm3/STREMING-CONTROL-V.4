import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import DataSyncService from '@/lib/data-sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. GET: List all matches
    if (req.method === 'GET') {
      const matches = await prisma.match.findMany({
        orderBy: { scheduledTime: 'asc' },
        include: {
          teamA: true,
          teamB: true,
          event: true,
        },
      });
      return res.status(200).json({ success: true, matches });
    }

    // 2. POST: Create a new match or bulk import
    if (req.method === 'POST') {
      const { eventId, teamAId, teamBId, placeholderA, placeholderB, winnerNextId, loserNextId, matchCode, boSeries, scheduledTime, currentPeriod, bulk } = req.body;

      // Support bulk import
      if (bulk && Array.isArray(bulk)) {
        for (const item of bulk) {
          let targetEventId = item.eventId;
          if (!targetEventId && item.eventName) {
            const ev = await prisma.event.findFirst({ where: { name: item.eventName } });
            if (ev) targetEventId = ev.id;
          }
          if (!targetEventId) {
            const firstEv = await prisma.event.findFirst();
            if (firstEv) targetEventId = firstEv.id;
          }

          let tAId = item.teamAId;
          if (!tAId && item.teamAName) {
            const tA = await prisma.team.findFirst({ where: { name: item.teamAName.trim().toUpperCase() } });
            if (tA) tAId = tA.id;
          }
          let tBId = item.teamBId;
          if (!tBId && item.teamBName) {
            const tB = await prisma.team.findFirst({ where: { name: item.teamBName.trim().toUpperCase() } });
            if (tB) tBId = tB.id;
          }

          if (targetEventId) {
            await prisma.match.create({
              data: {
                eventId: targetEventId,
                teamAId: tAId || undefined,
                teamBId: tBId || undefined,
                placeholderA: item.placeholderA || undefined,
                placeholderB: item.placeholderB || undefined,
                winnerNextId: item.winnerNextId || undefined,
                loserNextId: item.loserNextId || undefined,
                matchCode: item.matchCode || undefined,
                boSeries: item.boSeries ? parseInt(String(item.boSeries), 10) : 1,
                currentPeriod: item.currentPeriod || 'Half 1',
                scheduledTime: item.scheduledTime ? new Date(item.scheduledTime) : new Date(),
                matchNumber: item.matchNumber !== undefined ? parseInt(String(item.matchNumber), 10) : 1,
                round: item.round || null,
                status: item.status || 'UPCOMING',
                scoreA: item.scoreA ? parseInt(String(item.scoreA), 10) : 0,
                scoreB: item.scoreB ? parseInt(String(item.scoreB), 10) : 0,
              },
            });
          }
        }

        const updated = await prisma.match.findMany({
          orderBy: { scheduledTime: 'asc' },
          include: { teamA: true, teamB: true, event: true },
        });
        return res.status(201).json({ success: true, matches: updated });
      }

      if (!eventId) {
        return res.status(400).json({ success: false, error: 'eventId is required' });
      }

      const match = await prisma.match.create({
        data: {
          eventId,
          teamAId: teamAId || undefined,
          teamBId: teamBId || undefined,
          placeholderA: placeholderA || undefined,
          placeholderB: placeholderB || undefined,
          winnerNextId: winnerNextId || undefined,
          loserNextId: loserNextId || undefined,
          matchCode: matchCode || undefined,
          boSeries: boSeries ? parseInt(String(boSeries), 10) : 1,
          matchNumber: req.body.matchNumber !== undefined ? parseInt(String(req.body.matchNumber), 10) : 1,
          round: req.body.round || null,
          currentPeriod: currentPeriod || 'Half 1',
          scheduledTime: scheduledTime ? new Date(scheduledTime) : new Date(),
          status: 'UPCOMING',
          scoreA: 0,
          scoreB: 0,
        },
        include: {
          teamA: true,
          teamB: true,
          event: true,
        },
      });

      return res.status(201).json({ success: true, match });
    }

    // 3. PUT: Update a match
    if (req.method === 'PUT') {
      const { id, scoreA, scoreB, status, currentPeriod, boSeries, teamAId, teamBId, scheduledTime, matchNumber, round, setActive, placeholderA, placeholderB, winnerNextId, loserNextId, matchCode } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, error: 'Match ID is required' });
      }

      const updated = await prisma.match.update({
        where: { id },
        data: {
          scoreA: scoreA !== undefined ? parseInt(String(scoreA), 10) : undefined,
          scoreB: scoreB !== undefined ? parseInt(String(scoreB), 10) : undefined,
          status: status || undefined,
          currentPeriod: currentPeriod || undefined,
          boSeries: boSeries !== undefined ? parseInt(String(boSeries), 10) : undefined,
          matchNumber: matchNumber !== undefined ? parseInt(String(matchNumber), 10) : undefined,
          round: round !== undefined ? round : undefined,
          scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
          teamAId: teamAId || undefined,
          teamBId: teamBId || undefined,
          placeholderA: placeholderA || undefined,
          placeholderB: placeholderB || undefined,
          winnerNextId: winnerNextId || undefined,
          loserNextId: loserNextId || undefined,
          matchCode: matchCode || undefined,
        },
        include: {
          teamA: true,
          teamB: true,
          event: true,
        },
      });

      if (setActive) {
        DataSyncService.syncAllChannels({
          matchId: updated.id,
          eventName: updated.event?.name || 'LIVE MATCH',
          eventType: (updated.event?.eventType as any) || 'SPORT',
          teamA: {
            id: updated.teamA.id,
            name: updated.teamA.name,
            brandColor: updated.teamA.brandColor || '#ef4444',
            logoUrl: updated.teamA.logoUrl || '',
            fouls: 0,
            timeouts: 0,
          },
          teamB: {
            id: updated.teamB.id,
            name: updated.teamB.name,
            brandColor: updated.teamB.brandColor || '#2563eb',
            logoUrl: updated.teamB.logoUrl || '',
            fouls: 0,
            timeouts: 0,
          },
          scoreA: updated.scoreA,
          scoreB: updated.scoreB,
          boSeries: updated.boSeries,
          currentPeriod: updated.currentPeriod || 'Half 1',
        });
      }

      // MATCH PROGRESSION ENGINE: Automatically forward winners/losers
      if (status === 'FINISHED' && updated.teamAId && updated.teamBId) {
        const isWinnerA = updated.scoreA > updated.scoreB;
        const winnerId = isWinnerA ? updated.teamAId : updated.teamBId;
        const loserId = isWinnerA ? updated.teamBId : updated.teamAId;

        if (updated.winnerNextId) {
          const nextMatch = await prisma.match.findUnique({ where: { id: updated.winnerNextId } });
          if (nextMatch) {
            // Fill empty slot
            if (!nextMatch.teamAId) {
              await prisma.match.update({ where: { id: nextMatch.id }, data: { teamAId: winnerId } });
            } else if (!nextMatch.teamBId && nextMatch.teamAId !== winnerId) {
              await prisma.match.update({ where: { id: nextMatch.id }, data: { teamBId: winnerId } });
            }
          }
        }

        if (updated.loserNextId) {
          const nextMatch = await prisma.match.findUnique({ where: { id: updated.loserNextId } });
          if (nextMatch) {
            if (!nextMatch.teamAId) {
              await prisma.match.update({ where: { id: nextMatch.id }, data: { teamAId: loserId } });
            } else if (!nextMatch.teamBId && nextMatch.teamAId !== loserId) {
              await prisma.match.update({ where: { id: nextMatch.id }, data: { teamBId: loserId } });
            }
          }
        }
      }

      return res.status(200).json({ success: true, match: updated });
    }

    // 4. DELETE: Delete a match
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Match ID is required' });
      }

      await prisma.match.delete({
        where: { id },
      });

      return res.status(200).json({ success: true, message: 'Match deleted' });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('API /matches error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
