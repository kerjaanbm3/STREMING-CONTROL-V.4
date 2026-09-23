import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { action, eventData, teamsData, playersData, matchesData } = req.body;

    if (!eventData || !eventData.name) {
      return res.status(400).json({ success: false, error: 'Data Event tidak valid atau nama Event kosong' });
    }

    const eventName = eventData.name.trim().toUpperCase();

    // Check for existing event
    const existingEvent = await prisma.event.findFirst({
      where: { name: eventName }
    });

    if (existingEvent && !action) {
      // Return 409 Conflict to prompt user for action
      return res.status(409).json({
        success: false,
        error: 'EventConflict',
        message: `Event dengan nama "${eventName}" sudah ada.`,
        existingEventId: existingEvent.id
      });
    }

    let finalEventName = eventName;
    
    // Determine the final name if action is CREATE_NEW
    if (existingEvent && action === 'CREATE_NEW') {
      const timestamp = new Date().getTime().toString().slice(-4);
      finalEventName = `${eventName} (${timestamp})`;
    }

    const createdEvent = await prisma.$transaction(async (tx) => {
      // If action is OVERWRITE, delete the existing one first
      if (existingEvent && action === 'OVERWRITE') {
        await tx.event.delete({
          where: { id: existingEvent.id }
        });
      }

      // 1. Create Event
      let derivedEventType = eventData.eventType || 'SPORT';
      if (eventData.category === 'ESPORT' || eventData.category === 'MULTI_EVENT') {
        if (eventData.subType === 'MLBB') derivedEventType = 'ESPORT_MOBA';
        else if (eventData.subType === 'PUBG_MOBILE' || eventData.subType === 'FREE_FIRE') derivedEventType = 'ESPORT_BR';
        else if (eventData.subType === 'TALKSHOW' || eventData.subType === 'AWARD_SHOW' || eventData.subType === 'MUSIC_CONCERT') derivedEventType = 'GENERAL';
        else derivedEventType = 'SPORT';
      } else if (eventData.category === 'GENERAL') {
        derivedEventType = 'GENERAL';
      }

      const newEvent = await tx.event.create({
        data: {
          name: finalEventName,
          category: eventData.category || 'SPORT',
          subType: eventData.subType || 'FOOTBALL',
          eventType: derivedEventType,
          bracketFormat: eventData.bracketFormat || 'SINGLE_ELIMINATION',
          bracketSize: eventData.bracketSize || 8,
          hasThirdPlace: eventData.hasThirdPlace || false,
          location: eventData.location || null,
        }
      });

      // 2. Map and Create Teams
      const teamIdMap: Record<string, string> = {}; // Old Excel ID to New DB ID
      if (teamsData && Array.isArray(teamsData)) {
        for (const t of teamsData) {
          const excelId = String(t.id || t.ID || '').trim();
          const teamName = String(t.name || t.Name || '').trim();
          if (!teamName) continue; // Skip empty
          
          const newTeam = await tx.team.create({
            data: {
              name: teamName,
              institution: String(t.institution || t.Institution || ''),
              logoUrl: String(t.logoUrl || t.LogoUrl || ''),
              eventId: newEvent.id
            }
          });
          
          if (excelId) {
            teamIdMap[excelId] = newTeam.id;
          }
        }
      }

      // 3. Map and Create Players
      if (playersData && Array.isArray(playersData)) {
        for (const p of playersData) {
          const excelTeamId = String(p.teamId || p.TeamID || '').trim();
          const realTeamId = teamIdMap[excelTeamId];
          const playerName = String(p.name || p.Name || '').trim();
          
          if (!realTeamId || !playerName) continue;

          await tx.player.create({
            data: {
              teamId: realTeamId,
              name: playerName,
              inGameName: String(p.inGameName || p.IGN || ''),
              role: String(p.role || p.Role || ''),
              jerseyNumber: parseInt(p.jerseyNumber || p.Jersey || 0) || null,
              positionType: String(p.positionType || 'PLAYER').toUpperCase()
            }
          });
        }
      }

      // 4. Map and Create Matches
      if (matchesData && Array.isArray(matchesData)) {
        for (const m of matchesData) {
          const excelTeamAId = String(m.teamAId || m.TeamAID || '').trim();
          const excelTeamBId = String(m.teamBId || m.TeamBID || '').trim();
          
          const realTeamAId = teamIdMap[excelTeamAId] || null;
          const realTeamBId = teamIdMap[excelTeamBId] || null;
          
          const scheduledTimeStr = m.scheduledTime || m.ScheduledTime;
          let scheduledTimeDate: Date | undefined = undefined;
          if (scheduledTimeStr) {
            const date = new Date(scheduledTimeStr);
            if (!isNaN(date.getTime())) {
              scheduledTimeDate = date;
            }
          }

          await tx.match.create({
            data: {
              eventId: newEvent.id,
              teamAId: realTeamAId,
              teamBId: realTeamBId,
              matchNumber: parseInt(m.matchNumber || m.MatchNumber || 1) || 1,
              round: String(m.round || m.Round || 'Round 1'),
              boSeries: parseInt(m.boSeries || m.BOSeries || 1) || 1,
              scheduledTime: scheduledTimeDate,
              status: 'UPCOMING'
            }
          });
        }
      }

      return newEvent;
    });

    return res.status(200).json({ success: true, event: createdEvent });
    
  } catch (error: any) {
    console.error('API /events/import error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Terjadi kesalahan saat mengimpor event.' });
  }
}
