import fs from 'fs';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { LiveBroadcastState, CelebrationAlert } from './types';
import obsClient from './obs-client';
import prisma from './prisma';

const TXT_OUTPUT_DIR = path.join(process.cwd(), 'live_output_txt');

// Ensure the local output folder exists
if (!fs.existsSync(TXT_OUTPUT_DIR)) {
  try {
    fs.mkdirSync(TXT_OUTPUT_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create live_output_txt directory:', err);
  }
}

// Global In-Memory Broadcast State
let currentState: LiveBroadcastState = {
  matchId: 'match-sport-01',
  eventName: 'NATIONAL PREMIER LEAGUE 2026',
  eventType: 'SPORT',
  eventCategory: 'SPORT',
  eventSubType: 'FOOTBALL',
  teamA: {
    id: 'team-persija',
    name: 'PERSIJA FC',
    brandColor: '#ef4444',
    logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=PERSIJA',
    fouls: 2,
    timeouts: 1,
    setsWon: 0,
    points: 0,
  },
  teamB: {
    id: 'team-persib',
    name: 'PERSIB BANDUNG',
    brandColor: '#2563eb',
    logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=PERSIB',
    fouls: 3,
    timeouts: 0,
    setsWon: 0,
    points: 0,
  },
  scoreA: 1,
  scoreB: 0,
  boSeries: 1,
  timerSeconds: 1530, // 25:30
  isTimerRunning: false,
  timerDirection: 'UP',
  currentPeriod: 'Half 1',
  injuryTimeSeconds: 0,
  currentSet: 1,
  setsScoreA: [0, 0, 0, 0, 0],
  setsScoreB: [0, 0, 0, 0, 0],
  serverTeam: 'TEAM_A',
  shotClockSeconds: 24,
  isShotClockRunning: false,
  quarterFoulsA: 2,
  quarterFoulsB: 3,
  secondPenaltyA: false,
  secondPenaltyB: false,
  currentTopic: 'Opening & Welcome Speech',
  speakerName: 'Dr. Ir. H. Ahmad Fauzi',
  speakerRole: 'Keynote Speaker & Tech Enthusiast',
  caster: {
    name: 'Rendra Soedjono & Bung Towel',
    role: 'Lead Commentators',
    socialHandle: '@rendrasoedjono',
    visible: false,
  },
  sponsors: [
    { id: 'sp-1', name: 'Tech Brand X', logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=TechBrand' },
    { id: 'sp-2', name: 'Energy Drink Ultra', logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=EnergyUltra' },
  ],
  currentSponsorIndex: 0,
  sponsorCarouselVisible: false,
  mobaSlots: [
    { slotOrder: 1, teamType: 'TEAM_A', action: 'BAN', hero: null, playerName: 'Player 1', roleName: 'Exp Lane', isLocked: false },
    { slotOrder: 2, teamType: 'TEAM_B', action: 'BAN', hero: null, playerName: 'Player 2', roleName: 'Exp Lane', isLocked: false },
    { slotOrder: 3, teamType: 'TEAM_A', action: 'BAN', hero: null, playerName: 'Player 3', roleName: 'Jungler', isLocked: false },
    { slotOrder: 4, teamType: 'TEAM_B', action: 'BAN', hero: null, playerName: 'Player 4', roleName: 'Jungler', isLocked: false },
    { slotOrder: 5, teamType: 'TEAM_A', action: 'PICK', hero: null, playerName: 'Player 5', roleName: 'Mid', isLocked: false },
    { slotOrder: 6, teamType: 'TEAM_B', action: 'PICK', hero: null, playerName: 'Player 6', roleName: 'Mid', isLocked: false },
    { slotOrder: 7, teamType: 'TEAM_B', action: 'PICK', hero: null, playerName: 'Player 7', roleName: 'Gold Lane', isLocked: false },
    { slotOrder: 8, teamType: 'TEAM_A', action: 'PICK', hero: null, playerName: 'Player 8', roleName: 'Gold Lane', isLocked: false },
    { slotOrder: 9, teamType: 'TEAM_A', action: 'PICK', hero: null, playerName: 'Player 9', roleName: 'Roamer', isLocked: false },
    { slotOrder: 10, teamType: 'TEAM_B', action: 'PICK', hero: null, playerName: 'Player 10', roleName: 'Roamer', isLocked: false },
  ],
  activeDraftSlot: 1,
  brStandings: [
    { teamId: 't1', teamName: 'BIGETRON RED VILLAINS', placementRank: 1, killPoints: 12, totalPoints: 22, logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=BTR' },
    { teamId: 't2', teamName: 'ALTER EGO ARES', placementRank: 2, killPoints: 8, totalPoints: 14, logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=AE' },
    { teamId: 't3', teamName: 'BOOM ESPORTS', placementRank: 3, killPoints: 5, totalPoints: 10, logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=BOOM' },
    { teamId: 't4', teamName: 'VOIN ESPORTS', placementRank: 4, killPoints: 4, totalPoints: 8, logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=VOIN' },
    { teamId: 't5', teamName: 'RRQ RYU', placementRank: 5, killPoints: 2, totalPoints: 5, logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=RRQRYU' },
  ],
  stats: {
    possessionA: 52,
    possessionB: 48,
    shotsOnTargetA: 6,
    shotsOnTargetB: 4,
    cornersA: 5,
    cornersB: 3,
    foulsA: 8,
    foulsB: 11,
  },
  celebrationAlert: null,
  tickerText: 'BM3 BROADCAST SYSTEM • WELCOME TO LIVE STREAMING OVERLAY • VISIT OUR OFFICIAL CHANNELS',
  tickerVisible: false,
  obsConnected: false,
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#f43f5e',
    backgroundColor: '#09090b',
    scale: 1.0,
    isGlassmorphism: true,
  },
  layers: {
    scoreboard: true,
    lowerThird: true,
    ticker: true,
    sponsor: false, // hidden by default as per previous instructions
    watermark: true,
    popups: true,
  },
  lastUpdated: Date.now(),
};

let ioInstance: SocketIOServer | null = null;
const fileContentCache = new Map<string, string>();

export class DataSyncService {
  public static setSocketIO(io: SocketIOServer) {
    ioInstance = io;
  }

  public static getState(): LiveBroadcastState {
    return { ...currentState, obsConnected: obsClient.getStatus().connected };
  }

  /**
   * Helper function to format seconds into mm:ss
   */
  public static formatTime(seconds: number): string {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Simultaneous 4-Channel Synchronizer with Deep Merge Safety
   */
  public static syncAllChannels(partialState: Partial<LiveBroadcastState>) {
    currentState = {
      ...currentState,
      ...partialState,
      teamA: partialState.teamA
        ? { ...currentState.teamA, ...partialState.teamA }
        : currentState.teamA,
      teamB: partialState.teamB
        ? { ...currentState.teamB, ...partialState.teamB }
        : currentState.teamB,
      stats: partialState.stats
        ? { ...currentState.stats, ...partialState.stats }
        : currentState.stats,
      caster: partialState.caster
        ? { ...currentState.caster, ...partialState.caster }
        : currentState.caster,
      theme: partialState.theme
        ? { ...currentState.theme, ...partialState.theme }
        : currentState.theme,
      layers: partialState.layers
        ? { ...currentState.layers, ...partialState.layers }
        : currentState.layers,
      lastUpdated: Date.now(),
    };

    const state = currentState;
    const timeFormatted = this.formatTime(state.timerSeconds);

    // ==========================================
    // CHANNEL 1: Socket.io Broadcast to Overlays (<1ms)
    // ==========================================
    if (ioInstance) {
      ioInstance.emit('broadcast:state_update', state);
    }

    // ==========================================
    // CHANNEL 2: Local JSON API (State in Memory)
    // ==========================================
    // Available automatically at GET /api/live-data via DataSyncService.getState()

    // ==========================================
    // CHANNEL 3: Local Text Files Generator (Cached Writes)
    // ==========================================
    try {
      this.writeTextFile('score_a.txt', String(state.scoreA));
      this.writeTextFile('score_b.txt', String(state.scoreB));
      this.writeTextFile('score_combined.txt', `${state.scoreA} - ${state.scoreB}`);
      this.writeTextFile('team_a_name.txt', state.teamA.name);
      this.writeTextFile('team_b_name.txt', state.teamB.name);
      this.writeTextFile('timer.txt', timeFormatted);
      this.writeTextFile('period.txt', state.currentPeriod || '');
      this.writeTextFile('event_name.txt', state.eventName);
      this.writeTextFile('event_subtype.txt', state.eventSubType || state.eventType);
      this.writeTextFile('caster_name.txt', state.caster.name);
      this.writeTextFile('caster_role.txt', state.caster.role);
      this.writeTextFile('ticker.txt', state.tickerText);
    } catch (err) {
      console.error('[DataSync] Error writing text files:', err);
    }

    // ==========================================
    // CHANNEL 4: Direct Push to OBS-WebSocket
    // ==========================================
    obsClient.setInputText('TeamA_Score', String(state.scoreA)).catch(() => {});
    obsClient.setInputText('TeamB_Score', String(state.scoreB)).catch(() => {});
    obsClient.setInputText('Match_Timer', timeFormatted).catch(() => {});
    obsClient.setInputText('Match_Period', state.currentPeriod || '').catch(() => {});

    // ==========================================
    // CHANNEL 5: Auto-Save to Database
    // ==========================================
    if (state.matchId && (partialState.scoreA !== undefined || partialState.scoreB !== undefined || partialState.currentPeriod !== undefined)) {
      prisma.match.update({
        where: { id: state.matchId },
        data: {
          scoreA: state.scoreA,
          scoreB: state.scoreB,
          currentPeriod: state.currentPeriod,
        }
      }).catch(err => console.error('[DataSync] Failed to auto-save to Match DB:', err));
    }

    return state;
  }

  /**
   * Writes safe cached file to disk for OBS text source only when content changes
   */
  private static writeTextFile(fileName: string, content: string) {
    if (fileContentCache.get(fileName) === content) {
      return; // Skip write if content is identical
    }
    fileContentCache.set(fileName, content);
    const filePath = path.join(TXT_OUTPUT_DIR, fileName);
    fs.writeFile(filePath, content, 'utf8', (err) => {
      if (err) console.error(`[DataSync] Failed to write ${fileName}:`, err);
    });
  }

  /**
   * Triggers a temporary celebration pop-up alert (e.g. Goal, Yellow Card, Booyah)
   */
  public static triggerAlert(alert: Omit<CelebrationAlert, 'id' | 'timestamp'>) {
    const fullAlert: CelebrationAlert = {
      ...alert,
      id: 'alert_' + Date.now(),
      timestamp: Date.now(),
    };

    this.syncAllChannels({ celebrationAlert: fullAlert });

    if (ioInstance) {
      ioInstance.emit('broadcast:alert', fullAlert);
    }

    // Auto clear alert after duration
    setTimeout(() => {
      if (currentState.celebrationAlert?.id === fullAlert.id) {
        this.syncAllChannels({ celebrationAlert: null });
      }
    }, alert.durationMs || 5000);
  }
}

export default DataSyncService;
