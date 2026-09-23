import React from 'react';
import { LiveBroadcastState } from '@/lib/types';
import { Trophy, Shield, Zap, MonitorPlay, Keyboard } from 'lucide-react';
import { BaseControllerDashboard, CardDefinition } from '../dashboard/BaseControllerDashboard';
import { renderProgramMonitor } from '../dashboard/cards/ProgramMonitorCard';
import { renderOperatorHotkeys } from '../dashboard/cards/OperatorHotkeysCard';

interface BadmintonControllerProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
  triggerAlert: (alert: any) => void;
}

export const BadmintonController: React.FC<BadmintonControllerProps> = ({
  state,
  updateState,
  triggerAlert,
}) => {
  const currentSet = state.currentSet || 1;
  const gamesA = state.scoreA || 0;
  const gamesB = state.scoreB || 0;
  const pointsA = state.teamA.points || 0;
  const pointsB = state.teamB.points || 0;
  const serverTeam = state.serverTeam || 'TEAM_A';

  const handlePointChange = (team: 'A' | 'B', delta: number) => {
    if (team === 'A') {
      const newPts = Math.max(0, pointsA + delta);
      updateState({
        teamA: { ...state.teamA, points: newPts },
        serverTeam: 'TEAM_A',
      });
      // Check game/match point (20 points or deuce)
      if (newPts >= 20 && newPts - pointsB >= 1) {
        const isMatchPoint = gamesA === 1;
        triggerAlert({
          type: 'MATCH_POINT',
          teamType: 'TEAM_A',
          teamName: state.teamA.name,
          title: isMatchPoint ? 'MATCH POINT!' : 'GAME POINT!',
          subtitle: `${state.teamA.name} to Win ${isMatchPoint ? 'Match' : `Game ${currentSet}`}`,
          durationMs: 4000,
        });
      }
    } else {
      const newPts = Math.max(0, pointsB + delta);
      updateState({
        teamB: { ...state.teamB, points: newPts },
        serverTeam: 'TEAM_B',
      });
      if (newPts >= 20 && newPts - pointsA >= 1) {
        const isMatchPoint = gamesB === 1;
        triggerAlert({
          type: 'MATCH_POINT',
          teamType: 'TEAM_B',
          teamName: state.teamB.name,
          title: isMatchPoint ? 'MATCH POINT!' : 'GAME POINT!',
          subtitle: `${state.teamB.name} to Win ${isMatchPoint ? 'Match' : `Game ${currentSet}`}`,
          durationMs: 4000,
        });
      }
    }
  };

  const handleWinGame = (winner: 'TEAM_A' | 'TEAM_B') => {
    const winnerName = winner === 'TEAM_A' ? state.teamA.name : state.teamB.name;
    const newGamesA = winner === 'TEAM_A' ? gamesA + 1 : gamesA;
    const newGamesB = winner === 'TEAM_B' ? gamesB + 1 : gamesB;

    updateState({
      scoreA: newGamesA,
      scoreB: newGamesB,
      teamA: { ...state.teamA, points: 0 },
      teamB: { ...state.teamB, points: 0 },
      currentSet: Math.min(3, currentSet + 1),
      currentPeriod: `Game ${Math.min(3, currentSet + 1)}`,
    });

    triggerAlert({
      type: 'CUSTOM',
      teamType: winner,
      teamName: winnerName,
      title: `GAME ${currentSet} WON!`,
      subtitle: `${winnerName} Wins Game ${currentSet}`,
      durationMs: 5000,
    });
  };

  const renderScoreAlerts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch font-sans text-xs">
      {/* PLAYER / TEAM A */}
      <div className={`lg:col-span-5 p-3 rounded-xl bg-[#121215] border flex flex-col justify-between space-y-2 ${
        serverTeam === 'TEAM_A' ? 'border-amber-500/50 shadow-md shadow-amber-500/5' : 'border-rose-500/20'
      }`}>
        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">TEAM / PLAYER [A]</span>
            {serverTeam === 'TEAM_A' && (
              <span className="text-[9px] font-mono font-bold bg-amber-500 text-black px-1.5 py-0.2 rounded animate-pulse">
                🏸 SERVING
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-zinc-400">Games: <strong className="text-white text-sm">{gamesA}</strong></span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img
              src={state.teamA.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + state.teamA.name}
              alt={state.teamA.name}
              className="w-10 h-10 rounded-lg bg-black/50 p-1 border border-zinc-800 object-contain shrink-0"
            />
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={state.teamA.name}
                onChange={(e) => updateState({ teamA: { ...state.teamA, name: e.target.value } })}
                className="bg-transparent font-heading font-black text-sm text-white focus:outline-none focus:border-b border-rose-500 w-full truncate"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-14 h-12 rounded-xl bg-black/60 border border-rose-500/30 flex items-center justify-center font-digits font-black text-3xl text-white">
              {pointsA}
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handlePointChange('A', 1)}
                className="w-8 h-5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-mono font-bold text-xs flex items-center justify-center"
              >
                +1
              </button>
              <button
                onClick={() => handlePointChange('A', -1)}
                className="w-8 h-5 rounded bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-mono font-bold text-xs flex items-center justify-center"
              >
                -1
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-white/[0.06]">
          <button
            onClick={() => handleWinGame('TEAM_A')}
            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-[10px] uppercase"
          >
            🏆 MENANG GAME {currentSet}
          </button>
          <button
            onClick={() => updateState({ serverTeam: 'TEAM_A' })}
            className="px-2 py-1 rounded bg-amber-950/40 hover:bg-amber-900 border border-amber-700 text-amber-300 font-mono text-[10px]"
          >
            🏸 Servis [A]
          </button>
        </div>
      </div>

      {/* GAME TRACKER POD (2 Cols) */}
      <div className="lg:col-span-2 p-3 rounded-xl bg-[#121215] border border-white/[0.08] flex flex-col items-center justify-between text-center space-y-1.5">
        <div className="w-full">
          <div className="text-[9px] font-mono font-bold text-zinc-400 uppercase">GAME TRACKER</div>
          <div className="font-heading font-black text-xl text-white my-1">
            GAME {currentSet}
          </div>
          <div className="text-[10px] font-mono text-zinc-400">
            Games: <strong className="text-white">{gamesA} - {gamesB}</strong>
          </div>
        </div>

        <div className="w-full space-y-1">
          <div className="grid grid-cols-3 gap-0.5 font-mono text-[9px]">
            {[1, 2, 3].map((g) => (
              <button
                key={g}
                onClick={() => updateState({ currentSet: g, currentPeriod: `Game ${g}` })}
                className={`py-1 rounded font-bold ${
                  currentSet === g ? 'bg-teal-600 text-white' : 'bg-[#18181b] text-zinc-500 hover:text-white'
                }`}
              >
                G{g}
              </button>
            ))}
          </div>
          <button
            onClick={() => updateState({ teamA: { ...state.teamA, points: 0 }, teamB: { ...state.teamB, points: 0 } })}
            className="w-full py-1 rounded bg-[#18181b] text-zinc-400 hover:text-white text-[9px] font-mono border border-zinc-800"
          >
            Reset Poin Game
          </button>
        </div>
      </div>

      {/* PLAYER / TEAM B */}
      <div className={`lg:col-span-5 p-3 rounded-xl bg-[#121215] border flex flex-col justify-between space-y-2 ${
        serverTeam === 'TEAM_B' ? 'border-amber-500/50 shadow-md shadow-amber-500/5' : 'border-blue-500/20'
      }`}>
        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
          <span className="text-[10px] font-mono text-zinc-400">Games: <strong className="text-white text-sm">{gamesB}</strong></span>
          <div className="flex items-center gap-1.5">
            {serverTeam === 'TEAM_B' && (
              <span className="text-[9px] font-mono font-bold bg-amber-500 text-black px-1.5 py-0.2 rounded animate-pulse">
                🏸 SERVING
              </span>
            )}
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">TEAM / PLAYER [B]</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-row-reverse text-right">
          <div className="flex items-center gap-2 flex-1 min-w-0 flex-row-reverse text-right">
            <img
              src={state.teamB.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + state.teamB.name}
              alt={state.teamB.name}
              className="w-10 h-10 rounded-lg bg-black/50 p-1 border border-zinc-800 object-contain shrink-0"
            />
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={state.teamB.name}
                onChange={(e) => updateState({ teamB: { ...state.teamB, name: e.target.value } })}
                className="bg-transparent font-heading font-black text-sm text-white focus:outline-none focus:border-b border-blue-500 text-right w-full truncate"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-row-reverse">
            <div className="w-14 h-12 rounded-xl bg-black/60 border border-blue-500/30 flex items-center justify-center font-digits font-black text-3xl text-white">
              {pointsB}
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handlePointChange('B', 1)}
                className="w-8 h-5 rounded bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300 font-mono font-bold text-xs flex items-center justify-center"
              >
                +1
              </button>
              <button
                onClick={() => handlePointChange('B', -1)}
                className="w-8 h-5 rounded bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-mono font-bold text-xs flex items-center justify-center"
              >
                -1
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-white/[0.06] flex-row-reverse">
          <button
            onClick={() => handleWinGame('TEAM_B')}
            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-[10px] uppercase"
          >
            🏆 MENANG GAME {currentSet}
          </button>
          <button
            onClick={() => updateState({ serverTeam: 'TEAM_B' })}
            className="px-2 py-1 rounded bg-amber-950/40 hover:bg-amber-900 border border-amber-700 text-amber-300 font-mono text-[10px]"
          >
            🏸 Servis [B]
          </button>
        </div>
      </div>
    </div>
  );

  const cards: CardDefinition[] = [
    { type: 'SCORE_ALERTS', label: 'Score & Sets', icon: <Zap className="w-3.5 h-3.5" />, render: renderScoreAlerts },
    { type: 'PROGRAM_MONITOR', label: 'Program Monitor', icon: <MonitorPlay className="w-3.5 h-3.5" />, render: renderProgramMonitor },
    { type: 'OPERATOR_HOTKEYS', label: 'Operator Hotkeys', icon: <Keyboard className="w-3.5 h-3.5" />, render: renderOperatorHotkeys },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-teal-950/30 border border-teal-800/40 text-teal-300 font-mono text-[11px]">
        <span className="font-bold flex items-center gap-1.5">
          <span>🏸 KONTROLER KHUSUS BULUTANGKIS (BADMINTON)</span>
        </span>
        <span>GAME AKTIF: GAME {currentSet} • TARGET 21 POIN (MAX 30)</span>
      </div>
      <BaseControllerDashboard 
        cards={cards} 
        storageKey="badminton_controller_templates" 
        defaultLayout={[
          { type: 'SCORE_ALERTS', size: 12 },
          { type: 'PROGRAM_MONITOR', size: 6 }
        ]}
      />
    </div>
  );
};
