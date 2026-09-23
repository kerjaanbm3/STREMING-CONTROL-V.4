import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { LiveBroadcastState } from '@/lib/types';

const PRESETS_FILE = path.join(process.cwd(), 'presets.json');

// Default initial presets
const defaultPresets = [
  {
    id: 'preset-elclasico',
    name: 'Football: Persija vs Persib (El Clasico)',
    eventType: 'SPORT',
    eventName: 'INDONESIA PREMIER LEAGUE',
    teamA: {
      id: 'team-persija',
      name: 'PERSIJA FC',
      brandColor: '#ef4444',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=PERSIJA',
      fouls: 0,
      timeouts: 0,
    },
    teamB: {
      id: 'team-persib',
      name: 'PERSIB BANDUNG',
      brandColor: '#2563eb',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=PERSIB',
      fouls: 0,
      timeouts: 0,
    },
    scoreA: 0,
    scoreB: 0,
    boSeries: 1,
    currentPeriod: 'Half 1',
    timerSeconds: 0,
  },
  {
    id: 'preset-mpl-grandfinals',
    name: 'MOBA: RRQ vs ONIC (Grand Finals BO7)',
    eventType: 'ESPORT_MOBA',
    eventName: 'MPL GRAND FINALS SEASON 13',
    teamA: {
      id: 'team-rex',
      name: 'RRQ HOSHI',
      brandColor: '#f59e0b',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=RRQ',
    },
    teamB: {
      id: 'team-onic',
      name: 'ONIC ESPORTS',
      brandColor: '#eab308',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=ONIC',
    },
    scoreA: 0,
    scoreB: 0,
    boSeries: 7,
    currentPeriod: 'Game 1',
    timerSeconds: 0,
  },
  {
    id: 'preset-pubg-finals',
    name: 'Battle Royale: PMSL Grand Finals',
    eventType: 'ESPORT_BR',
    eventName: 'PMSL SEA GRAND FINALS',
    scoreA: 0,
    scoreB: 0,
    boSeries: 1,
    currentPeriod: 'Match 1 (Erangel)',
    timerSeconds: 0,
  },
];

function loadPresets() {
  if (!fs.existsSync(PRESETS_FILE)) {
    fs.writeFileSync(PRESETS_FILE, JSON.stringify(defaultPresets, null, 2), 'utf8');
    return defaultPresets;
  }
  try {
    const data = fs.readFileSync(PRESETS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return defaultPresets;
  }
}

function savePresets(presets: any[]) {
  fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2), 'utf8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const presets = loadPresets();
      return res.status(200).json({ success: true, presets });
    }

    if (req.method === 'POST') {
      const { name, state } = req.body;
      const presets = loadPresets();
      const newPreset = {
        id: 'preset_' + Date.now(),
        name: name || 'Custom Match Preset',
        ...state,
      };
      presets.push(newPreset);
      savePresets(presets);
      return res.status(201).json({ success: true, preset: newPreset });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      let presets = loadPresets();
      presets = presets.filter((p: any) => p.id !== id);
      savePresets(presets);
      return res.status(200).json({ success: true, presets });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
