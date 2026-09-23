export type EventType = 'SPORT' | 'ESPORT_MOBA' | 'ESPORT_BR' | 'GENERAL';

export type EventCategory = 'SPORT' | 'ESPORT' | 'GENERAL' | 'MULTI_EVENT';

export type EventSubType =
  // Sports:
  | 'FOOTBALL'
  | 'FUTSAL'
  | 'VOLLEYBALL'
  | 'BADMINTON'
  | 'BASKETBALL'
  // Esports:
  | 'MLBB'
  | 'PUBG_MOBILE'
  | 'FREE_FIRE'
  | 'VALORANT'
  | 'EFOOTBALL'
  // General:
  | 'TALKSHOW'
  | 'AWARD_SHOW'
  | 'MUSIC_CONCERT'
  | 'GENERAL';

export interface TeamData {
  id: string;
  name: string;
  institution?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
  score?: number;
  fouls?: number;
  timeouts?: number;
  setsWon?: number; // for Volleyball / Badminton
  points?: number; // for Volleyball / Badminton current set point
}

export interface PlayerData {
  id: string;
  name: string;
  inGameName?: string | null;
  role?: string | null;
  positionType: string;
  jerseyNumber?: number | null;
  photoProfile?: string | null;
  photoPose2?: string | null;
  photoPose3?: string | null;
}

export interface HeroData {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
}

export interface PickBanSlot {
  slotOrder: number; // 1 to 5 for picks, 1 to 5 for bans
  teamType: 'TEAM_A' | 'TEAM_B';
  action: 'PICK' | 'BAN';
  hero?: HeroData | null;
  playerName?: string | null;
  inGameName?: string | null;
  playerPhoto?: string | null;
  roleName?: string | null;
  roleIcon?: string | null;
  isLocked: boolean;
}

export interface BRStandingItem {
  teamId: string;
  teamName: string;
  logoUrl?: string | null;
  brandColor?: string | null;
  placementRank: number;
  killPoints: number;
  totalPoints: number;
  isEliminated?: boolean;
}

export interface CasterInfo {
  name: string;
  role: string;
  socialHandle?: string;
  avatarUrl?: string;
  visible: boolean;
}

export interface SponsorItem {
  id: string;
  name: string;
  logoUrl: string;
}

export interface CelebrationAlert {
  id: string;
  type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'FOUL' | 'TIMEOUT' | 'WWCD' | 'BOOYAH' | 'MATCH_POINT' | 'FIRST_BLOOD' | 'TURTLE' | 'LORD' | 'CUSTOM';
  teamType?: 'TEAM_A' | 'TEAM_B';
  teamName?: string;
  title: string;
  subtitle?: string;
  playerPhoto?: string | null;
  durationMs: number;
  timestamp: number;
}

export interface MatchStats {
  possessionA: number; // e.g. 54%
  possessionB: number; // 46%
  shotsOnTargetA: number;
  shotsOnTargetB: number;
  cornersA: number;
  cornersB: number;
  foulsA: number;
  foulsB: number;
}

export interface LayerVisibility {
  scoreboard: boolean;
  lowerThird: boolean;
  ticker: boolean;
  sponsor: boolean;
  watermark: boolean;
  popups: boolean;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  scale: number;
  isGlassmorphism: boolean;
}

export interface LiveBroadcastState {
  matchId: string;
  eventName: string;
  eventType: EventType;
  eventCategory: EventCategory;
  eventSubType: EventSubType;
  teamA: TeamData;
  teamB: TeamData;
  scoreA: number;
  scoreB: number;
  boSeries: number; // 1, 3, 5, 7
  timerSeconds: number;
  isTimerRunning: boolean;
  timerDirection: 'UP' | 'DOWN';
  currentPeriod: string; // 'Game 1', 'Game 2', 'Game 3', etc.
  injuryTimeSeconds?: number;
  
  // Specific Game Telemetries:
  // Volleyball / Badminton:
  currentSet?: number; // 1, 2, 3, 4, 5
  setsScoreA?: number[];
  setsScoreB?: number[];
  serverTeam?: 'TEAM_A' | 'TEAM_B';
  
  // Basketball:
  shotClockSeconds?: number;
  isShotClockRunning?: boolean;
  quarterFoulsA?: number;
  quarterFoulsB?: number;

  // Futsal:
  secondPenaltyA?: boolean;
  secondPenaltyB?: boolean;

  // MLBB Esports:
  firstBloodKiller?: string | null;
  firstBloodPhoto?: string | null;
  turtleSlayer?: string | null;
  turtlePhoto?: string | null;
  lordSlayer?: string | null;
  lordPhoto?: string | null;

  // General / Talkshow:
  currentTopic?: string;
  speakerName?: string;
  speakerRole?: string;

  caster: CasterInfo;
  sponsors: SponsorItem[];
  currentSponsorIndex: number;
  sponsorCarouselVisible: boolean;
  mobaSlots: PickBanSlot[];
  activeDraftSlot?: number;
  brStandings: BRStandingItem[];
  stats: MatchStats;
  celebrationAlert?: CelebrationAlert | null;
  tickerText: string;
  tickerVisible: boolean;
  obsConnected: boolean;
  
  // Design & Layers
  theme: ThemeConfig;
  layers: LayerVisibility;

  lastUpdated: number;
}
