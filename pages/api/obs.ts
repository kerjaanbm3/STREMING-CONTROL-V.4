import type { NextApiRequest, NextApiResponse } from 'next';
import obsClient from '@/lib/obs-client';
import DataSyncService from '@/lib/data-sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      status: obsClient.getStatus(),
    });
  }

  if (req.method === 'POST') {
    const { action, address, password } = req.body;

    if (action === 'connect') {
      const connected = await obsClient.connect(address || 'ws://127.0.0.1:4455', password || '');
      DataSyncService.syncAllChannels({ obsConnected: connected });
      return res.status(200).json({ success: connected, status: obsClient.getStatus() });
    }

    if (action === 'disconnect') {
      await obsClient.disconnect();
      DataSyncService.syncAllChannels({ obsConnected: false });
      return res.status(200).json({ success: true, status: obsClient.getStatus() });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
