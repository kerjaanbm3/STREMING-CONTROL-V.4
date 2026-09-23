import type { NextApiRequest, NextApiResponse } from 'next';
import DataSyncService from '@/lib/data-sync';

/**
 * Channel 2: Local JSON API Endpoint for vMix Data Sources and 3rd party integrators
 * Accessible at: http://localhost:3000/api/live-data
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers so external broadcast tools can poll this endpoint without issues
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const state = DataSyncService.getState();
  const timeFormatted = DataSyncService.formatTime(state.timerSeconds);

  return res.status(200).json({
    success: true,
    data: {
      ...state,
      timerFormatted: timeFormatted,
      scoreCombined: `${state.scoreA} - ${state.scoreB}`,
      currentSponsor: state.sponsors[state.currentSponsorIndex] || null,
    },
  });
}
