import React, { useState, useEffect } from 'react';
import { LiveBroadcastState, HeroData, PickBanSlot } from '@/lib/types';
import {
  Shield,
  Swords,
  Lock,
  Unlock,
  Search,
  X,
  Flame,
  Crown,
  Sparkles,
  User,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface MobaDraftControllerProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
  triggerAlert?: (alert: any) => void;
}

const DEFAULT_ROLES = [
  { name: 'Exp Lane', icon: '⚔️' },
  { name: 'Jungler', icon: '🌲' },
  { name: 'Mid Lane', icon: '🔮' },
  { name: 'Gold Lane', icon: '🏹' },
  { name: 'Roamer', icon: '🛡️' },
];

export const MobaDraftController: React.FC<MobaDraftControllerProps> = ({
  state,
  updateState,
  triggerAlert,
}) => {
  const [heroes, setHeroes] = useState<HeroData[]>([]);
  const [matchesList, setMatchesList] = useState<any[]>([]);
  const [playersList, setPlayersList] = useState<any[]>([]);
  const [activePicker, setActivePicker] = useState<{
    action: 'PICK' | 'BAN';
    teamType: 'TEAM_A' | 'TEAM_B';
    slotOrder: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  // Collapsible sections state
  const [isBansOpen, setIsBansOpen] = useState(true);
  const [isPicksOpen, setIsPicksOpen] = useState(true);

  // Objective state
  const [selectedFbPlayerId, setSelectedFbPlayerId] = useState<string>('A_1');
  const [selectedTurtlePlayerId, setSelectedTurtlePlayerId] = useState<string>('A_2');
  const [selectedLordPlayerId, setSelectedLordPlayerId] = useState<string>('A_2');

  useEffect(() => {
    fetch('/api/heroes')
      .then((res) => res.json())
      .then((data) => {
        if (data.heroes) setHeroes(data.heroes);
      })
      .catch((err) => console.error('Failed to load heroes:', err));

    fetch('/api/players')
      .then((res) => res.json())
      .then((data) => {
        if (data.players) setPlayersList(data.players);
      })
      .catch((err) => console.error('Failed to load players:', err));

      fetch('/api/matches')
      .then((res) => res.json())
      .then((data) => {
        if (data.matches) setMatchesList(data.matches);
      })
      .catch((err) => console.error('Failed to load matches:', err));
  }, []);

  // Auto-sync roster from Biodata based on Role matching
  useEffect(() => {
    if (playersList.length === 0) return;

    let hasChanges = false;
    const newSlots = [...(state.mobaSlots || [])];

    const syncTeam = (teamType: 'TEAM_A' | 'TEAM_B', teamId: string) => {
      [1, 2, 3, 4, 5].forEach((slotOrder) => {
        const roleDef = DEFAULT_ROLES[slotOrder - 1];
        const player = playersList.find((p) => p.teamId === teamId && p.role?.toLowerCase() === roleDef.name.toLowerCase());
        
        let idx = newSlots.findIndex((s) => s.teamType === teamType && s.action === 'PICK' && s.slotOrder === slotOrder);
        
        // If slot doesn't exist yet, we must create it so we can sync it
        if (idx === -1) {
          newSlots.push({
            slotOrder,
            teamType,
            action: 'PICK',
            hero: null,
            playerName: `Player ${teamType === 'TEAM_A' ? 'A' : 'B'}${slotOrder}`,
            roleName: roleDef.name,
            roleIcon: roleDef.icon,
            isLocked: false,
          });
          idx = newSlots.length - 1;
          hasChanges = true; // We created a new slot
        }

        const expectedName = player ? player.name : '';
        const expectedIgn = player ? (player.inGameName || '') : '';
        const expectedPhoto = player ? (player.photoProfile || '') : '';

        if (
          newSlots[idx].playerName !== expectedName ||
          newSlots[idx].inGameName !== expectedIgn ||
          newSlots[idx].playerPhoto !== expectedPhoto
        ) {
          newSlots[idx] = {
            ...newSlots[idx],
            playerName: expectedName,
            inGameName: expectedIgn,
            playerPhoto: expectedPhoto,
          };
          hasChanges = true;
        }
      });
    };

    syncTeam('TEAM_A', state.teamA.id);
    syncTeam('TEAM_B', state.teamB.id);

    if (hasChanges) {
      updateState({ mobaSlots: newSlots });
    }
  }, [playersList, state.teamA.id, state.teamB.id, state.mobaSlots, updateState]);

  const handleMatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const matchId = e.target.value;
    const match = matchesList.find((m) => m.id === matchId);
    if (!match) return;

    updateState({
      matchId: match.id,
      teamA: {
        id: match.teamA?.id || 'ta',
        name: match.teamA?.name || 'TEAM A',
        logoUrl: match.teamA?.logoUrl || '',
        brandColor: match.teamA?.brandColor || '#3b82f6',
      },
      teamB: {
        id: match.teamB?.id || 'tb',
        name: match.teamB?.name || 'TEAM B',
        logoUrl: match.teamB?.logoUrl || '',
        brandColor: match.teamB?.brandColor || '#ef4444',
      },
      scoreA: match.scoreA || 0,
      scoreB: match.scoreB || 0,
      boSeries: match.boSeries || 1,
      currentPeriod: 'Game 1',
    });
  };

  // Ensure slots exist for 5 Picks and 5 Bans per team
  const getSlot = (teamType: 'TEAM_A' | 'TEAM_B', action: 'PICK' | 'BAN', slotOrder: number): PickBanSlot => {
    const found = state.mobaSlots?.find(
      (s) => s.teamType === teamType && s.action === action && s.slotOrder === slotOrder
    );
    if (found) return found;

    return {
      slotOrder,
      teamType,
      action,
      hero: null,
      playerName: action === 'PICK' ? `Player ${teamType === 'TEAM_A' ? 'A' : 'B'}${slotOrder}` : null,
      playerPhoto: null,
      roleName: action === 'PICK' ? DEFAULT_ROLES[slotOrder - 1]?.name : null,
      roleIcon: action === 'PICK' ? DEFAULT_ROLES[slotOrder - 1]?.icon : null,
      isLocked: false,
    };
  };

  const updateSlot = (
    teamType: 'TEAM_A' | 'TEAM_B',
    action: 'PICK' | 'BAN',
    slotOrder: number,
    partial: Partial<PickBanSlot>
  ) => {
    const currentSlots = state.mobaSlots || [];
    const index = currentSlots.findIndex(
      (s) => s.teamType === teamType && s.action === action && s.slotOrder === slotOrder
    );

    let newSlots = [...currentSlots];
    if (index >= 0) {
      newSlots[index] = { ...newSlots[index], ...partial };
    } else {
      newSlots.push({
        slotOrder,
        teamType,
        action,
        hero: null,
        playerName: `Player ${teamType === 'TEAM_A' ? 'A' : 'B'}${slotOrder}`,
        roleName: DEFAULT_ROLES[slotOrder - 1]?.name,
        roleIcon: DEFAULT_ROLES[slotOrder - 1]?.icon,
        isLocked: false,
        ...partial,
      });
    }

    updateState({ mobaSlots: newSlots });
  };

  const handleSelectHero = (hero: HeroData) => {
    if (!activePicker) return;
    updateSlot(activePicker.teamType, activePicker.action, activePicker.slotOrder, {
      hero,
      isLocked: true,
    });
    setActivePicker(null);
  };

  const handleClearSlot = (teamType: 'TEAM_A' | 'TEAM_B', action: 'PICK' | 'BAN', slotOrder: number) => {
    updateSlot(teamType, action, slotOrder, {
      hero: null,
      isLocked: false,
    });
  };

  // Compile full 10 player list for First Blood & Objective selection
  const allPickPlayers = [
    ...[1, 2, 3, 4, 5].map((i) => {
      const s = getSlot('TEAM_A', 'PICK', i);
      return {
        id: `A_${i}`,
        teamName: state.teamA.name,
        teamType: 'TEAM_A' as const,
        teamLogo: state.teamA.logoUrl,
        name: s.playerName || `Player A${i}`,
        role: s.roleName || DEFAULT_ROLES[i - 1].name,
        roleIcon: s.roleIcon || DEFAULT_ROLES[i - 1].icon,
        photo: s.playerPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=A_${i}`,
      };
    }),
    ...[1, 2, 3, 4, 5].map((i) => {
      const s = getSlot('TEAM_B', 'PICK', i);
      return {
        id: `B_${i}`,
        teamName: state.teamB.name,
        teamType: 'TEAM_B' as const,
        teamLogo: state.teamB.logoUrl,
        name: s.playerName || `Player B${i}`,
        role: s.roleName || DEFAULT_ROLES[i - 1].name,
        roleIcon: s.roleIcon || DEFAULT_ROLES[i - 1].icon,
        photo: s.playerPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=B_${i}`,
      };
    }),
  ];

  const selectedFbPlayer = allPickPlayers.find((p) => p.id === selectedFbPlayerId) || allPickPlayers[0];
  const selectedTurtlePlayer = allPickPlayers.find((p) => p.id === selectedTurtlePlayerId) || allPickPlayers[1];
  const selectedLordPlayer = allPickPlayers.find((p) => p.id === selectedLordPlayerId) || allPickPlayers[1];

  const handleTriggerFirstBlood = () => {
    if (!selectedFbPlayer) return;
    if (triggerAlert) {
      triggerAlert({
        type: 'FIRST_BLOOD',
        teamType: selectedFbPlayer.teamType,
        teamName: selectedFbPlayer.teamName,
        title: 'FIRST BLOOD!',
        subtitle: `${selectedFbPlayer.name} (${selectedFbPlayer.teamName}) draws First Blood!`,
        durationMs: 6000,
      });
    }
  };

  const handleTriggerTurtle = () => {
    if (!selectedTurtlePlayer) return;
    if (triggerAlert) {
      triggerAlert({
        type: 'TURTLE',
        teamType: selectedTurtlePlayer.teamType,
        teamName: selectedTurtlePlayer.teamName,
        title: 'TURTLE SECURED! 🐢',
        subtitle: `${selectedTurtlePlayer.name} (${selectedTurtlePlayer.teamName}) slays Turtle`,
        durationMs: 5000,
      });
    }
  };

  const handleTriggerLord = () => {
    if (!selectedLordPlayer) return;
    if (triggerAlert) {
      triggerAlert({
        type: 'LORD',
        teamType: selectedLordPlayer.teamType,
        teamName: selectedLordPlayer.teamName,
        title: 'LORD SUMMONED! 👑',
        subtitle: `${selectedLordPlayer.name} (${selectedLordPlayer.teamName}) secures the Lord`,
        durationMs: 6000,
      });
    }
  };

  const filteredHeroes = heroes.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'ALL' || h.role.toUpperCase() === selectedRoleFilter.toUpperCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* 1. HERO BAN TABLE (5 Bans Tim A & 5 Bans Tim B) */}
      <div className="p-3.5 rounded-xl bg-[#121215] border border-zinc-800 space-y-2.5">
        <div 
          className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80 cursor-pointer hover:bg-zinc-800/30 px-1 -mx-1 rounded transition-colors"
          onClick={() => setIsBansOpen(!isBansOpen)}
        >
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold font-mono">🚫 HERO BANS (10 SLOTS)</span>
          </div>
          <button className="text-zinc-400 hover:text-white transition-colors">
            {isBansOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {isBansOpen && (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead>
              <tr className="text-zinc-400 border-b border-zinc-800 bg-[#18181b]/60">
                <th className="p-2 w-10 text-center">No</th>
                <th className="p-2 w-44">Nama Team</th>
                <th className="p-2 text-center">Ban 1</th>
                <th className="p-2 text-center">Ban 2</th>
                <th className="p-2 text-center">Ban 3</th>
                <th className="p-2 text-center">Ban 4</th>
                <th className="p-2 text-center">Ban 5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {/* Row 1: Team A Bans */}
              <tr className="hover:bg-[#18181b]/30 transition-colors">
                <td className="p-2 text-center font-bold text-blue-400">1</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={state.teamA.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + state.teamA.name}
                      alt={state.teamA.name}
                      className="w-5 h-5 rounded object-contain bg-black/50 p-0.5 border border-zinc-800 shrink-0"
                    />
                    <span className="font-heading font-black text-xs text-white truncate max-w-[130px]">
                      {state.teamA.name} (BLUE)
                    </span>
                  </div>
                </td>
                {[1, 2, 3, 4, 5].map((slotOrder) => {
                  const s = getSlot('TEAM_A', 'BAN', slotOrder);
                  return (
                    <td key={slotOrder} className="p-2 text-center">
                      {s.hero ? (
                        <div className="relative inline-block group">
                          <img
                            src={s.hero.avatarUrl}
                            alt={s.hero.name}
                            className="w-9 h-9 rounded-lg object-cover bg-black/60 border border-rose-500/70 shadow-sm"
                            title={s.hero.name}
                          />
                          <button
                            onClick={() => handleClearSlot('TEAM_A', 'BAN', slotOrder)}
                            className="absolute -top-1 -right-1 p-0.5 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hapus Ban"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActivePicker({ action: 'BAN', teamType: 'TEAM_A', slotOrder })}
                          className="w-9 h-9 rounded-lg border border-dashed border-zinc-700 bg-[#18181b] hover:border-rose-500 text-zinc-500 hover:text-rose-400 flex items-center justify-center text-[10px] font-bold mx-auto transition-colors"
                        >
                          + Ban
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Team B Bans */}
              <tr className="hover:bg-[#18181b]/30 transition-colors">
                <td className="p-2 text-center font-bold text-rose-400">2</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={state.teamB.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + state.teamB.name}
                      alt={state.teamB.name}
                      className="w-5 h-5 rounded object-contain bg-black/50 p-0.5 border border-zinc-800 shrink-0"
                    />
                    <span className="font-heading font-black text-xs text-white truncate max-w-[130px]">
                      {state.teamB.name} (RED)
                    </span>
                  </div>
                </td>
                {[1, 2, 3, 4, 5].map((slotOrder) => {
                  const s = getSlot('TEAM_B', 'BAN', slotOrder);
                  return (
                    <td key={slotOrder} className="p-2 text-center">
                      {s.hero ? (
                        <div className="relative inline-block group">
                          <img
                            src={s.hero.avatarUrl}
                            alt={s.hero.name}
                            className="w-9 h-9 rounded-lg object-cover bg-black/60 border border-rose-500/70 shadow-sm"
                            title={s.hero.name}
                          />
                          <button
                            onClick={() => handleClearSlot('TEAM_B', 'BAN', slotOrder)}
                            className="absolute -top-1 -right-1 p-0.5 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hapus Ban"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActivePicker({ action: 'BAN', teamType: 'TEAM_B', slotOrder })}
                          className="w-9 h-9 rounded-lg border border-dashed border-zinc-700 bg-[#18181b] hover:border-rose-500 text-zinc-500 hover:text-rose-400 flex items-center justify-center text-[10px] font-bold mx-auto transition-colors"
                        >
                          + Ban
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* 3. ROSTER PEMAIN / PICK HERO TABLE (5v5 Roster Pick Table) */}
      <div className="p-3.5 rounded-xl bg-[#121215] border border-zinc-800 space-y-3">
        <div 
          className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80 cursor-pointer hover:bg-zinc-800/30 px-1 -mx-1 rounded transition-colors"
          onClick={() => setIsPicksOpen(!isPicksOpen)}
        >
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-bold font-mono">🎮 ROSTER PEMAIN / PICK HERO</span>
            <span className="text-[10px] font-mono text-zinc-400">(5v5 Lineup & Hero Matchup)</span>
          </div>
          <button className="text-zinc-400 hover:text-white transition-colors">
            {isPicksOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Combined 5v5 Table */}
        {isPicksOpen && (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="text-zinc-400 border-b border-zinc-800 bg-[#18181b]/60 text-[10px] uppercase">
                <th className="p-2 w-8 text-center">No</th>
                <th className="p-2 w-28">Logo Team</th>
                <th className="p-2 w-14 text-center">Foto Player</th>
                <th className="p-2 min-w-[130px]">Nama Player</th>
                <th className="p-2 w-10 text-center">Icon</th>
                <th className="p-2 w-24">Nama Role</th>
                <th className="p-2 w-14 text-center">Foto Hero</th>
                <th className="p-2 min-w-[120px]">Pick Hero</th>
                <th className="p-2 w-20 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {/* TEAM A PICKS (Rows 1 to 5) */}
              {[1, 2, 3, 4, 5].map((slotOrder) => {
                const s = getSlot('TEAM_A', 'PICK', slotOrder);
                const roleDef = DEFAULT_ROLES[slotOrder - 1];

                return (
                  <tr key={`A_${slotOrder}`} className="hover:bg-blue-950/20 transition-colors">
                    <td className="p-2 text-center font-bold text-blue-400">{slotOrder}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={state.teamA.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + state.teamA.name}
                          alt={state.teamA.name}
                          className="w-5 h-5 rounded object-contain bg-black/50 p-0.5 border border-zinc-800 shrink-0"
                        />
                        <span className="font-heading font-black text-[11px] text-blue-300 truncate max-w-[80px]">
                          {state.teamA.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <img
                        src={s.playerPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=A_${slotOrder}`}
                        alt="Player"
                        className="w-8 h-8 rounded-lg object-cover bg-black/60 border border-zinc-700 mx-auto"
                      />
                    </td>
                    <td className="p-2">
                      <div className="font-heading font-bold text-white text-xs px-1 truncate max-w-[130px]">
                        {s.playerName || 'Pemain Kosong'}
                      </div>
                      <div className="font-mono text-[10px] text-blue-300/80 mt-1 truncate px-1 max-w-[130px]">
                        {s.inGameName || 'IGN Kosong'}
                      </div>
                    </td>
                    <td className="p-2 text-center text-sm">{s.roleIcon || roleDef.icon}</td>
                    <td className="p-2 font-mono text-[11px] text-zinc-300">
                      {s.roleName || roleDef.name}
                    </td>
                    <td className="p-2 text-center">
                      {s.hero ? (
                        <img
                          src={s.hero.avatarUrl}
                          alt={s.hero.name}
                          className="w-8 h-8 rounded-lg object-cover bg-black/60 border border-blue-500 mx-auto"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-dashed border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500 mx-auto">
                          -
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      {s.hero ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs truncate max-w-[80px]">{s.hero.name}</span>
                          <button
                            onClick={() => setActivePicker({ action: 'PICK', teamType: 'TEAM_A', slotOrder })}
                            className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px]"
                          >
                            Ubah
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActivePicker({ action: 'PICK', teamType: 'TEAM_A', slotOrder })}
                          className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 text-[10px] font-bold"
                        >
                          + Pick Hero
                        </button>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => updateSlot('TEAM_A', 'PICK', slotOrder, { isLocked: !s.isLocked })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          s.isLocked
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {s.isLocked ? 'LOCKED' : 'DRAFT'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Divider between Team A and Team B */}
              <tr className="bg-[#18181b] border-y border-zinc-700/80">
                <td colSpan={9} className="py-1 px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  VS (AWAY / RED TEAM ROSTER)
                </td>
              </tr>

              {/* TEAM B PICKS (Rows 6 to 10) */}
              {[1, 2, 3, 4, 5].map((slotOrder) => {
                const s = getSlot('TEAM_B', 'PICK', slotOrder);
                const roleDef = DEFAULT_ROLES[slotOrder - 1];

                return (
                  <tr key={`B_${slotOrder}`} className="hover:bg-rose-950/20 transition-colors">
                    <td className="p-2 text-center font-bold text-rose-400">{slotOrder + 5}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={state.teamB.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + state.teamB.name}
                          alt={state.teamB.name}
                          className="w-5 h-5 rounded object-contain bg-black/50 p-0.5 border border-zinc-800 shrink-0"
                        />
                        <span className="font-heading font-black text-[11px] text-rose-300 truncate max-w-[80px]">
                          {state.teamB.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <img
                        src={s.playerPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=B_${slotOrder}`}
                        alt="Player"
                        className="w-8 h-8 rounded-lg object-cover bg-black/60 border border-zinc-700 mx-auto"
                      />
                    </td>
                    <td className="p-2">
                      <div className="font-heading font-bold text-white text-xs px-1 truncate max-w-[130px]">
                        {s.playerName || 'Pemain Kosong'}
                      </div>
                      <div className="font-mono text-[10px] text-rose-300/80 mt-1 truncate px-1 max-w-[130px]">
                        {s.inGameName || 'IGN Kosong'}
                      </div>
                    </td>
                    <td className="p-2 text-center text-sm">{s.roleIcon || roleDef.icon}</td>
                    <td className="p-2 font-mono text-[11px] text-zinc-300">
                      {s.roleName || roleDef.name}
                    </td>
                    <td className="p-2 text-center">
                      {s.hero ? (
                        <img
                          src={s.hero.avatarUrl}
                          alt={s.hero.name}
                          className="w-8 h-8 rounded-lg object-cover bg-black/60 border border-rose-500 mx-auto"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-dashed border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500 mx-auto">
                          -
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      {s.hero ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs truncate max-w-[80px]">{s.hero.name}</span>
                          <button
                            onClick={() => setActivePicker({ action: 'PICK', teamType: 'TEAM_B', slotOrder })}
                            className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px]"
                          >
                            Ubah
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActivePicker({ action: 'PICK', teamType: 'TEAM_B', slotOrder })}
                          className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/40 text-rose-300 text-[10px] font-bold"
                        >
                          + Pick Hero
                        </button>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => updateSlot('TEAM_B', 'PICK', slotOrder, { isLocked: !s.isLocked })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          s.isLocked
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {s.isLocked ? 'LOCKED' : 'DRAFT'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* 4. FIRST BLOOD & TURTLE / LORD OBJECTIVE SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* FIRST BLOOD SECTION */}
        <div className="p-3.5 rounded-xl bg-[#121215] border border-rose-500/30 space-y-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-rose-500/20">
            <span className="font-heading font-black text-xs text-rose-400 uppercase flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-yellow-400" />
              <span>FIRST BLOOD</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400">DSK: BROADCAST</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                  <th className="p-1.5">Nama Player</th>
                  <th className="p-1.5 text-center">Foto Player</th>
                  <th className="p-1.5">Role</th>
                  <th className="p-1.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1.5">
                    <select
                      value={selectedFbPlayerId}
                      onChange={(e) => setSelectedFbPlayerId(e.target.value)}
                      className="bg-[#18181b] border border-zinc-700 text-white rounded px-2 py-1 text-xs focus:outline-none max-w-[130px] truncate"
                    >
                      {allPickPlayers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.teamName})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1.5 text-center">
                    <img
                      src={selectedFbPlayer?.photo}
                      alt="Player"
                      className="w-8 h-8 rounded-lg object-cover bg-black/60 border border-rose-500 mx-auto"
                    />
                  </td>
                  <td className="p-1.5 text-zinc-300 text-[11px]">
                    {selectedFbPlayer?.roleIcon} {selectedFbPlayer?.role}
                  </td>
                  <td className="p-1.5 text-right">
                    <button
                      onClick={handleTriggerFirstBlood}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-heading font-black text-[11px] uppercase tracking-wider flex items-center gap-1 ml-auto shadow-md shadow-rose-600/30"
                    >
                      <Flame className="w-3.5 h-3.5 text-yellow-300" />
                      <span>FIRST BLOOD!</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TURTLE & LORD SECTION */}
        <div className="p-3.5 rounded-xl bg-[#121215] border border-emerald-500/30 space-y-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-emerald-500/20">
            <span className="font-heading font-black text-xs text-emerald-400 uppercase flex items-center gap-1.5">
              <span>🐢 TURTLE & 👑 LORD OBJECTIVES</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400">DSK: BROADCAST</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                  <th className="p-1.5">Nama Player</th>
                  <th className="p-1.5 text-center">Foto Player</th>
                  <th className="p-1.5">Role</th>
                  <th className="p-1.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {/* Turtle Row */}
                <tr className="border-b border-zinc-800/60">
                  <td className="p-1.5">
                    <select
                      value={selectedTurtlePlayerId}
                      onChange={(e) => setSelectedTurtlePlayerId(e.target.value)}
                      className="bg-[#18181b] border border-zinc-700 text-white rounded px-2 py-1 text-xs focus:outline-none max-w-[130px] truncate"
                    >
                      {allPickPlayers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.teamName})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1.5 text-center">
                    <img
                      src={selectedTurtlePlayer?.photo}
                      alt="Player"
                      className="w-8 h-8 rounded-lg object-cover bg-black/60 border border-emerald-500 mx-auto"
                    />
                  </td>
                  <td className="p-1.5 text-zinc-300 text-[11px]">
                    {selectedTurtlePlayer?.roleIcon} {selectedTurtlePlayer?.role}
                  </td>
                  <td className="p-1.5 text-right">
                    <button
                      onClick={handleTriggerTurtle}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-black text-[10px] uppercase tracking-wider flex items-center gap-1 ml-auto shadow-sm"
                    >
                      <span>🐢 SLAY TURTLE</span>
                    </button>
                  </td>
                </tr>

                {/* Lord Row */}
                <tr>
                  <td className="p-1.5">
                    <select
                      value={selectedLordPlayerId}
                      onChange={(e) => setSelectedLordPlayerId(e.target.value)}
                      className="bg-[#18181b] border border-zinc-700 text-white rounded px-2 py-1 text-xs focus:outline-none max-w-[130px] truncate"
                    >
                      {allPickPlayers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.teamName})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1.5 text-center">
                    <img
                      src={selectedLordPlayer?.photo}
                      alt="Player"
                      className="w-8 h-8 rounded-lg object-cover bg-black/60 border border-amber-500 mx-auto"
                    />
                  </td>
                  <td className="p-1.5 text-zinc-300 text-[11px]">
                    {selectedLordPlayer?.roleIcon} {selectedLordPlayer?.role}
                  </td>
                  <td className="p-1.5 text-right">
                    <button
                      onClick={handleTriggerLord}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-heading font-black text-[10px] uppercase tracking-wider flex items-center gap-1 ml-auto shadow-sm"
                    >
                      <Crown className="w-3 h-3" />
                      <span>👑 SUMMON LORD</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. HERO SELECTION MODAL POPUP */}
      {activePicker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="min-card w-full max-w-2xl bg-[#121215] border border-purple-500/50 p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div>
                <h3 className="font-heading font-black text-sm text-white uppercase flex items-center gap-2">
                  <span>Pilih Hero ({activePicker.action} #{activePicker.slotOrder})</span>
                </h3>
                <p className="text-xs font-mono text-purple-400">
                  Untuk {activePicker.teamType === 'TEAM_A' ? state.teamA.name : state.teamB.name}
                </p>
              </div>
              <button
                onClick={() => setActivePicker(null)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama hero MLBB..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#18181b] border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  autoFocus
                />
              </div>

              <div className="flex gap-1 overflow-x-auto">
                {['ALL', 'Assassin', 'Tank', 'Mage', 'Marksman', 'Fighter', 'Support'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRoleFilter(role)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      selectedRoleFilter === role
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#18181b] text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Heroes Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-72 overflow-y-auto p-1">
              {filteredHeroes.map((hero) => (
                <button
                  key={hero.id}
                  onClick={() => handleSelectHero(hero)}
                  className="group flex flex-col items-center p-2 rounded-xl bg-[#18181b] hover:bg-purple-950/60 border border-zinc-800 hover:border-purple-500 transition-all text-center"
                >
                  <img
                    src={hero.avatarUrl}
                    alt={hero.name}
                    className="w-12 h-12 rounded-lg object-cover bg-black/50 group-hover:scale-105 transition-transform"
                  />
                  <span className="text-xs font-bold text-white mt-1 truncate w-full">{hero.name}</span>
                  <span className="text-[9px] text-zinc-400 font-mono">{hero.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
