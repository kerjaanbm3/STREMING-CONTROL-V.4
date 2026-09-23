import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import DataSyncService from '@/lib/data-sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. GET: List all events
    if (req.method === 'GET') {
      const events = await prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          matches: true,
          sponsors: true,
        },
      });
      return res.status(200).json({ success: true, events });
    }

    // 2. POST: Create a new event
    if (req.method === 'POST') {
      const { name, category, subType, eventType, location, startDate } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, error: 'Event name is required' });
      }

      // Map eventType from subType if not provided
      let derivedEventType = eventType || 'SPORT';
      if (category === 'ESPORT' || category === 'MULTI_EVENT') {
        if (subType === 'MLBB') derivedEventType = 'ESPORT_MOBA';
        else if (subType === 'PUBG_MOBILE' || subType === 'FREE_FIRE') derivedEventType = 'ESPORT_BR';
        else if (subType === 'TALKSHOW' || subType === 'AWARD_SHOW' || subType === 'MUSIC_CONCERT') derivedEventType = 'GENERAL';
        else derivedEventType = 'SPORT';
      } else if (category === 'GENERAL') {
        derivedEventType = 'GENERAL';
      }

      const newEvent = await prisma.event.create({
        data: {
          name: name.trim().toUpperCase(),
          category: category || 'SPORT',
          subType: subType || 'FOOTBALL',
          eventType: derivedEventType,
          bracketFormat: req.body.bracketFormat || 'SINGLE_ELIMINATION',
          bracketSize: req.body.bracketSize || 8,
          hasThirdPlace: req.body.hasThirdPlace || false,
          location: location || null,
          startDate: startDate ? new Date(startDate) : new Date(),
        },
      });

      return res.status(201).json({ success: true, event: newEvent });
    }

    // 3. PUT: Update an existing event
    if (req.method === 'PUT') {
      const { id, name, category, subType, eventType, bracketFormat, bracketSize, hasThirdPlace, location, startDate, setActive } = req.body;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Event ID is required' });
      }

      let derivedEventType = eventType;
      if (category === 'ESPORT' || category === 'MULTI_EVENT') {
        if (subType === 'MLBB') derivedEventType = 'ESPORT_MOBA';
        else if (subType === 'PUBG_MOBILE' || subType === 'FREE_FIRE') derivedEventType = 'ESPORT_BR';
        else if (subType === 'TALKSHOW' || subType === 'AWARD_SHOW' || subType === 'MUSIC_CONCERT') derivedEventType = 'GENERAL';
        else derivedEventType = 'SPORT';
      } else if (category === 'GENERAL') {
        derivedEventType = 'GENERAL';
      }

      const updated = await prisma.event.update({
        where: { id },
        data: {
          name: name ? name.trim().toUpperCase() : undefined,
          category: category !== undefined ? category : undefined,
          subType: subType !== undefined ? subType : undefined,
          eventType: derivedEventType !== undefined ? derivedEventType : undefined,
          bracketFormat: bracketFormat !== undefined ? bracketFormat : undefined,
          bracketSize: bracketSize !== undefined ? bracketSize : undefined,
          hasThirdPlace: hasThirdPlace !== undefined ? hasThirdPlace : undefined,
          location: location !== undefined ? location : undefined,
          startDate: startDate ? new Date(startDate) : undefined,
        },
      });

      // If active event is updated, sync to overlay
      const currentState = DataSyncService.getState();
      if (currentState.eventName === updated.name || setActive) {
        DataSyncService.syncAllChannels({
          eventName: updated.name,
          eventType: updated.eventType as any,
          eventCategory: updated.category as any,
          eventSubType: updated.subType as any,
        });
      }

      return res.status(200).json({ success: true, event: updated });
    }

    // 4. DELETE: Delete an event
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Event ID is required' });
      }

      await prisma.event.delete({
        where: { id },
      });

      return res.status(200).json({ success: true, message: 'Event deleted' });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('API /events error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
