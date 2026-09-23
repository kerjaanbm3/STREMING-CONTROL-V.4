import type { NextApiRequest, NextApiResponse } from 'next';
import DataSyncService from '@/lib/data-sync';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      state: DataSyncService.getState(),
    });
  }

  if (req.method === 'POST') {
    const payload = req.body;
    const updatedState = DataSyncService.syncAllChannels(payload);
    return res.status(200).json({
      success: true,
      state: updatedState,
    });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
