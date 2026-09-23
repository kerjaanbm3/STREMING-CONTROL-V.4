import type { NextApiRequest, NextApiResponse } from 'next';
import DataSyncService from '@/lib/data-sync';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { type, teamType, teamName, title, subtitle, durationMs } = req.body;

  DataSyncService.triggerAlert({
    type: type || 'GOAL',
    teamType,
    teamName,
    title: title || 'GOAL!',
    subtitle: subtitle || '',
    durationMs: durationMs || 6000,
  });

  return res.status(200).json({ success: true, message: 'Alert triggered' });
}
