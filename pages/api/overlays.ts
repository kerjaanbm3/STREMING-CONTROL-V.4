import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const defaultOverlays = [
  {
    title: 'Scoreboard HUD Overlay (All Sports & Esports)',
    category: 'HUD',
    categoryLabel: 'HUD Utama Pertandingan',
    description: 'Overlay skor match transparan untuk Sepak Bola, Futsal, Voli, Badminton, Basket, MLBB, BR & Talkshow',
    path: '/overlay/scoreboard',
    resolution: '1920x1080 Alpha Transparent',
    badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-950/40',
    icon: 'Trophy',
  },
  {
    title: 'Lower Thirds & Running Ticker Overlay',
    category: 'HUD',
    categoryLabel: 'HUD Lower Third',
    description: 'Baris nama caster / narasumber, running text pengumuman berita, dan sponsor lower third animasi',
    path: '/overlay/lower-third',
    resolution: '1920x1080 Alpha Transparent',
    badgeColor: 'border-indigo-500/30 text-indigo-400 bg-indigo-950/40',
    icon: 'Tv',
  },
  {
    title: 'In-Game Popups & DSK Graphic Alerts (Master Layer)',
    category: 'ALERTS',
    categoryLabel: 'Layer DSK Terpisah',
    description: 'Channel overlay mandiri khusus untuk semua popup kartu kuning, kartu merah, extra time, gol, first blood & lord tanpa scoreboard',
    path: '/overlay/alerts',
    resolution: '1920x1080 Alpha Transparent (DSK)',
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-950/40',
    icon: 'Zap',
    testAlertPayload: JSON.stringify({
      type: 'GOAL',
      team: 'A',
      title: 'STANDALONE DSK ALERT',
      subtitle: 'Terpisah dari Scoreboard • 100% Alpha Transparent',
      duration: 4000,
    }),
  },
  {
    title: 'Kartu Kuning (Yellow Card Alert DSK)',
    category: 'ALERTS',
    categoryLabel: 'Alert Pelanggaran Olahraga',
    description: 'Animasi popup kartu kuning pemain sepak bola / futsal dengan nama pemain dan nomor punggung',
    path: '/overlay/alerts?filter=YELLOW_CARD',
    resolution: '1920x1080 Alpha Transparent (DSK)',
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-950/40',
    icon: 'AlertCircle',
    testAlertPayload: JSON.stringify({
      type: 'YELLOW_CARD',
      team: 'A',
      title: 'YELLOW CARD',
      subtitle: 'Bambang Pamungkas (#20) • Foul Warning',
      duration: 4500,
    }),
  },
  {
    title: 'Kartu Merah (Red Card Alert DSK)',
    category: 'ALERTS',
    categoryLabel: 'Alert Pelanggaran Olahraga',
    description: 'Animasi popup kartu merah dramatis pemain yang dikeluarkan dari pertandingan',
    path: '/overlay/alerts?filter=RED_CARD',
    resolution: '1920x1080 Alpha Transparent (DSK)',
    badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-950/40',
    icon: 'ShieldAlert',
    testAlertPayload: JSON.stringify({
      type: 'RED_CARD',
      team: 'B',
      title: 'RED CARD',
      subtitle: 'Marko Simic (#9) • Serious Foul Dismissal',
      duration: 5000,
    }),
  },
  {
    title: 'Penambahan Waktu (Added Extra Time / Injury Time)',
    category: 'ALERTS',
    categoryLabel: 'Alert Waktu Pertandingan',
    description: 'Popup papan digital penambahan waktu babak (+2, +3, +5 Menit Extra Time)',
    path: '/overlay/alerts?filter=TIME',
    resolution: '1920x1080 Alpha Transparent (DSK)',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/40',
    icon: 'Clock',
    testAlertPayload: JSON.stringify({
      type: 'TIME',
      title: 'EXTRA TIME',
      subtitle: '+4 MENIT INJURY TIME',
      duration: 4500,
    }),
  },
  {
    title: 'Goal Celebration Banner (Goal / Score Spike)',
    category: 'ALERTS',
    categoryLabel: 'Alert Gol & Poin',
    description: 'Animasi ledakan visual spektakuler saat tim mencetak gol dengan nama pencetak gol',
    path: '/overlay/alerts?filter=GOAL',
    resolution: '1920x1080 Alpha Transparent (DSK)',
    badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-950/40',
    icon: 'Flame',
    testAlertPayload: JSON.stringify({
      type: 'GOAL',
      team: 'A',
      title: 'GOOOOOAL!',
      subtitle: 'PERSIJA FC • Gol Indah Menit 42',
      duration: 5000,
    }),
  },
  {
    title: 'First Blood Alert (MLBB / Esports DSK)',
    category: 'ALERTS',
    categoryLabel: 'Alert Objektif Esports',
    description: 'Banner animasi First Blood pembuka pertandingan Mobile Legends dengan foto atlet & hero',
    path: '/overlay/alerts?filter=FIRST_BLOOD',
    resolution: '1920x1080 Alpha Transparent (DSK)',
    badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-950/40',
    icon: 'Swords',
    testAlertPayload: JSON.stringify({
      type: 'FIRST_BLOOD',
      team: 'A',
      title: 'FIRST BLOOD',
      subtitle: 'Kairi (Ling) • ONIC Esports',
      duration: 4500,
    }),
  },
  {
    title: 'Turtle & Lord Slayer Alert (MLBB Objectives)',
    category: 'ALERTS',
    categoryLabel: 'Alert Objektif Esports',
    description: 'Popup penguasaan Turtle / Lord Mobile Legends lengkap dengan icon objektif dan nama tim',
    path: '/overlay/alerts?filter=OBJECTIVE',
    resolution: '1920x1080 Alpha Transparent (DSK)',
    badgeColor: 'border-teal-500/30 text-teal-400 bg-teal-950/40',
    icon: 'ShieldAlert',
    testAlertPayload: JSON.stringify({
      type: 'OBJECTIVE',
      team: 'B',
      title: 'LORD SECURED',
      subtitle: 'Sanz (Faramis) • Secured Lord Buff',
      duration: 4500,
    }),
  },
  {
    title: 'MOBA Hero Draft Pick & Ban Screen (5v5)',
    category: 'ESPORTS',
    categoryLabel: 'Layar Esports MOBA',
    description: 'Layar 5v5 drafting MLBB lengkap dengan slot Ban, Pick Hero atlet, Icon Role, dan status Draft',
    path: '/overlay/pick-ban',
    resolution: '1920x1080 Fullscreen',
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-950/40',
    icon: 'Swords',
  },
  {
    title: 'Battle Royale Match Leaderboard (PUBG / Free Fire)',
    category: 'ESPORTS',
    categoryLabel: 'Layar Esports BR',
    description: 'Klasemen live pertandingan Battle Royale dengan total poin, penempatan posisi (rank), dan kill points',
    path: '/overlay/standings',
    resolution: '1920x1080 Fullscreen',
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-950/40',
    icon: 'Flame',
  },
  {
    title: '1v1 VS Showdown Matchup Screen',
    category: 'BROADCAST_SCREENS',
    categoryLabel: 'Layar Perkenalan Pertandingan',
    description: 'Layar perkenalan tim yang akan bertanding (Head-to-Head) dengan format Best of Series (BO)',
    path: '/overlay/vs-screen',
    resolution: '1920x1080 Fullscreen',
    badgeColor: 'border-rose-500/30 text-rose-300 bg-rose-950/40',
    icon: 'Swords',
  },
  {
    title: 'Starting XI / Roster Lineup Tactical Screen',
    category: 'BROADCAST_SCREENS',
    categoryLabel: 'Layar Susunan Pemain',
    description: 'Susunan formasi taktis pemain (Starting XI Sepak Bola / Roster Atlet Esports) beserta posisi & pelatih',
    path: '/overlay/lineup',
    resolution: '1920x1080 Fullscreen',
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-950/40',
    icon: 'Monitor',
  },
  {
    title: 'Tournament Playoff Bracket Tree Overlay',
    category: 'BROADCAST_SCREENS',
    categoryLabel: 'Layar Bagan Turnamen',
    description: 'Bagan pohon turnamen eliminasi & playoff (Quarterfinals, Semifinals, Grand Finals)',
    path: '/overlay/bracket',
    resolution: '1920x1080 Fullscreen',
    badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-950/40',
    icon: 'Layers',
  },
  {
    title: 'Break Screen & Starting Soon Countdown',
    category: 'BROADCAST_SCREENS',
    categoryLabel: 'Layar Jeda Siaran',
    description: 'Hitung mundur jeda babak / segmen siaran dengan jadwal pertandingan berikutnya dan sponsor carousel',
    path: '/overlay/break-screen',
    resolution: '1920x1080 Fullscreen',
    badgeColor: 'border-indigo-500/30 text-indigo-300 bg-indigo-950/40',
    icon: 'Clock',
  },
  {
    title: 'Post-Match Final Summary & Statistics Screen',
    category: 'BROADCAST_SCREENS',
    categoryLabel: 'Layar Ringkasan Pasca Pertandingan',
    description: 'Skor akhir pertandingan, bar penguasaan bola (possession), statistik tembakan, dan pemain terbaik (MVP)',
    path: '/overlay/summary',
    resolution: '1920x1080 Fullscreen',
    badgeColor: 'border-cyan-500/30 text-cyan-300 bg-cyan-950/40',
    icon: 'Trophy',
  },
  {
    title: 'vMix Live JSON Data Source Feed',
    category: 'DATA',
    categoryLabel: 'Feed Data Real-Time vMix',
    description: 'Endpoint REST API JSON live untuk disambungkan ke vMix Data Sources / Title GT secara otomatis',
    path: '/api/live-data',
    resolution: 'Real-time JSON REST API',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/40',
    icon: 'Database',
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. GET: List all overlays
    if (req.method === 'GET') {
      let overlays = await prisma.overlay.findMany({
        orderBy: { createdAt: 'asc' },
      });
      
      // Auto-seed default overlays if empty
      if (overlays.length === 0) {
        await prisma.overlay.createMany({
          data: defaultOverlays
        });
        overlays = await prisma.overlay.findMany({
          orderBy: { createdAt: 'asc' },
        });
      }

      // Sync manually added files in pages/overlay
      try {
        const overlaysDir = path.join(process.cwd(), 'pages', 'overlay');
        if (fs.existsSync(overlaysDir)) {
          const files = fs.readdirSync(overlaysDir);
          
          let newRecords = false;
          for (const file of files) {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
              const routeName = file.replace('.tsx', '').replace('.ts', '');
              const overlayPath = `/overlay/${routeName}`;
              
              // Cek apakah path ini sudah ada di array 'overlays'
              const exists = overlays.some(o => o.path === overlayPath);
              
              if (!exists) {
                // Tambahkan ke database jika belum ada
                await prisma.overlay.create({
                  data: {
                    title: `Custom Overlay: ${routeName}`,
                    category: 'HUD',
                    categoryLabel: 'Custom / Manual File',
                    description: 'Overlay yang ditambahkan secara manual melalui file explorer.',
                    path: overlayPath,
                    resolution: '1920x1080 Alpha Transparent',
                    badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-950/40',
                    icon: 'Layers'
                  }
                });
                newRecords = true;
              }
            }
          }
          
          if (newRecords) {
            // Fetch ulang jika ada data baru
            overlays = await prisma.overlay.findMany({
              orderBy: { createdAt: 'asc' },
            });
          }
        }
      } catch (syncError) {
        console.error('Error syncing overlay files:', syncError);
      }

      return res.status(200).json({ success: true, overlays });
    }

    // 2. POST: Create or Bulk Import
    if (req.method === 'POST') {
      const { title, category, categoryLabel, description, path, resolution, badgeColor, icon, testAlertPayload, bulk } = req.body;
      
      if (bulk && Array.isArray(bulk)) {
        await prisma.overlay.createMany({
          data: bulk.map(item => ({
            title: item.title,
            category: item.category || 'HUD',
            categoryLabel: item.categoryLabel || '',
            description: item.description || '',
            path: item.path || '',
            resolution: item.resolution || '1920x1080 Fullscreen',
            badgeColor: item.badgeColor || 'border-blue-500/30 text-blue-400 bg-blue-950/40',
            icon: item.icon || 'Monitor',
            testAlertPayload: typeof item.testAlertPayload === 'object' ? JSON.stringify(item.testAlertPayload) : item.testAlertPayload
          }))
        });
        const updated = await prisma.overlay.findMany({ orderBy: { createdAt: 'asc' } });
        return res.status(201).json({ success: true, overlays: updated });
      }

      if (!title || !path) {
        return res.status(400).json({ success: false, error: 'Title and path are required' });
      }

      const overlay = await prisma.overlay.create({
        data: {
          title,
          category: category || 'HUD',
          categoryLabel: categoryLabel || '',
          description: description || '',
          path,
          resolution: resolution || '1920x1080 Fullscreen',
          badgeColor: badgeColor || 'border-blue-500/30 text-blue-400 bg-blue-950/40',
          icon: icon || 'Monitor',
          testAlertPayload: typeof testAlertPayload === 'object' ? JSON.stringify(testAlertPayload) : testAlertPayload
        },
      });

      return res.status(201).json({ success: true, overlay });
    }

    // 3. PUT: Update an overlay
    if (req.method === 'PUT') {
      const { id, title, category, categoryLabel, description, path, resolution, badgeColor, icon, testAlertPayload } = req.body;

      if (!id) return res.status(400).json({ success: false, error: 'Overlay ID is required' });

      const updated = await prisma.overlay.update({
        where: { id },
        data: {
          title: title || undefined,
          category: category || undefined,
          categoryLabel: categoryLabel || undefined,
          description: description || undefined,
          path: path || undefined,
          resolution: resolution || undefined,
          badgeColor: badgeColor || undefined,
          icon: icon || undefined,
          testAlertPayload: testAlertPayload !== undefined ? (typeof testAlertPayload === 'object' ? JSON.stringify(testAlertPayload) : testAlertPayload) : undefined
        },
      });

      return res.status(200).json({ success: true, overlay: updated });
    }

    // 4. DELETE: Delete an overlay
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Overlay ID is required' });
      }

      await prisma.overlay.delete({ where: { id } });
      return res.status(200).json({ success: true, message: 'Overlay deleted' });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('API /overlays error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
