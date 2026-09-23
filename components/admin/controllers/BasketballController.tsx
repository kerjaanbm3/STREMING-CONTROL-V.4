import React from 'react';
import { LiveBroadcastState } from '@/lib/types';
import { Flame, Clock, Shield, AlertTriangle, MonitorPlay, Keyboard } from 'lucide-react';
import { BaseControllerDashboard, CardDefinition } from '../dashboard/BaseControllerDashboard';
import { renderProgramMonitor } from '../dashboard/cards/ProgramMonitorCard';
import { renderOperatorHotkeys } from '../dashboard/cards/OperatorHotkeysCard';

interface BasketballControllerProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
  triggerAlert: (alert: any) => void;
}

export const BasketballController: React.FC<BasketballControllerProps> = ({
  state,
  updateState,
  triggerAlert,
}) => {
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(Math.abs(totalSec) / 60);
    const secs = Math.abs(totalSec) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleScoreChange = (team: 'A' | 'B', delta: number) => {
    if (team === 'A') {
      const newScore = Math.max(0, state.scoreA + delta);
      updateState({ scoreA: newScore });
    } else {
      const newScore = Math.max(0, state.scoreB + delta);
      updateState({ scoreB: newScore });
    }
  };

  const handleShotClockReset = (seconds: number) => {
    updateState({ shotClockSeconds: seconds });
  };

  const handleFoulChange = (team: 'A' | 'B', delta: number) => {
    if (team === 'A') {
      const f = Math.max(0, (state.quarterFoulsA || 0) + delta);
      updateState({ quarterFoulsA: f });
      if (f >= 5) {
        triggerAlert({
          type: 'FOUL',
          teamType: 'TEAM_A',
          teamName: state.teamA.name,
          title: 'TEAM FOUL BONUS (FREE THROWS)',
          subtitle: `${state.teamA.name} in Penalty (5+ Fouls)`,
          durationMs: 4000,
        });
      }
    } else {
      const f = Math.max(0, (state.quarterFoulsB || 0) + delta);
      updateState({ quarterFoulsB: f });
      if (f >= 5) {
        triggerAlert({
          type: 'FOUL',
          teamType: 'TEAM_B',
          teamName: state.teamB.name,
          title: 'TEAM FOUL BONUS (FREE THROWS)',
          subtitle: `${state.teamB.name} in Penalty (5+ Fouls)`,
          durationMs: 4000,
        });
      }
    }
  };

  const renderScoreControl = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch font-sans text-xs">
      {/* TEAM A (HOME) */}
      <div className="p-3 rounded-xl bg-[#121215] border border-rose-500/20 flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
          <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">HOME • TEAM [A]</span>
          {(state.quarterFoulsA || 0) >= 5 && (
            <span className="text-[9px] font-mono font-bold bg-amber-500 text-black px-1.5 py-0.2 rounded font-black">
              BONUS (PENALTY)
            </span>
          )}
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
              <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                Fouls: <strong className="text-rose-400">{state.quarterFoulsA || 0}</strong> | T-Out: {state.teamA.timeouts || 0}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-14 h-12 rounded-xl bg-black/60 border border-rose-500/30 flex items-center justify-center font-digits font-black text-3xl text-white">
              {state.scoreA}
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleScoreChange('A', 1)}
                className="w-8 h-4 rounded bg-rose-950/80 border border-rose-800 text-rose-300 font-mono font-bold text-[10px] flex items-center justify-center"
              >
                +1
              </button>
              <button
                onClick={() => handleScoreChange('A', -1)}
                className="w-8 h-4 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-mono font-bold text-[10px] flex items-center justify-center"
              >
                -1
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-white/[0.06]">
          <div className="flex items-center gap-1">
            <button onClick={() => handleScoreChange('A', 1)} className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-mono font-bold text-[10px]">
              +1 FT
            </button>
            <button onClick={() => handleScoreChange('A', 2)} className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-[10px]">
              +2 FG
            </button>
            <button onClick={() => handleScoreChange('A', 3)} className="px-2 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-[10px]">
              +3 3PT 🔥
            </button>
          </div>
          <button onClick={() => handleFoulChange('A', 1)} className="px-2 py-1 rounded bg-zinc-800 text-rose-300 text-[10px] font-mono font-bold">
            +1 Foul
          </button>
        </div>
      </div>

      {/* TEAM B (AWAY) */}
      <div className="p-3 rounded-xl bg-[#121215] border border-blue-500/20 flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
          {(state.quarterFoulsB || 0) >= 5 && (
            <span className="text-[9px] font-mono font-bold bg-amber-500 text-black px-1.5 py-0.2 rounded font-black">
              BONUS (PENALTY)
            </span>
          )}
          <span className="text-[10px] font-mono font-bold text-blue-400 uppercase ml-auto">AWAY • TEAM [B]</span>
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
              <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                Fouls: <strong className="text-blue-400">{state.quarterFoulsB || 0}</strong> | T-Out: {state.teamB.timeouts || 0}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-row-reverse">
            <div className="w-14 h-12 rounded-xl bg-black/60 border border-blue-500/30 flex items-center justify-center font-digits font-black text-3xl text-white">
              {state.scoreB}
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleScoreChange('B', 1)}
                className="w-8 h-4 rounded bg-blue-950/80 border border-blue-800 text-blue-300 font-mono font-bold text-[10px] flex items-center justify-center"
              >
                +1
              </button>
              <button
                onClick={() => handleScoreChange('B', -1)}
                className="w-8 h-4 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-mono font-bold text-[10px] flex items-center justify-center"
              >
                -1
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-white/[0.06] flex-row-reverse">
          <div className="flex items-center gap-1 flex-row-reverse">
            <button onClick={() => handleScoreChange('B', 1)} className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-mono font-bold text-[10px]">
              +1 FT
            </button>
            <button onClick={() => handleScoreChange('B', 2)} className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-[10px]">
              +2 FG
            </button>
            <button onClick={() => handleScoreChange('B', 3)} className="px-2 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-[10px]">
              +3 3PT 🔥
            </button>
          </div>
          <button onClick={() => handleFoulChange('B', 1)} className="px-2 py-1 rounded bg-zinc-800 text-blue-300 text-[10px] font-mono font-bold">
            +1 Foul
          </button>
        </div>
      </div>
    </div>
  );

  const renderMatchClock = () => (
    <div className="space-y-4 font-sans">
      <div className="p-3 rounded-xl bg-[#121215] border border-white/[0.08] flex flex-col items-center justify-between text-center space-y-1.5">
        <div>
          <div className="text-[9px] font-mono font-bold text-zinc-400 uppercase">GAME CLOCK</div>
          <div className="font-digits font-black text-2xl text-white my-1">
            {formatTime(state.timerSeconds)}
          </div>
          <span className="text-[9px] font-mono font-bold text-orange-400 bg-orange-950/40 border border-orange-800 px-2 py-0.2 rounded-full inline-block">
            {state.currentPeriod || 'Q1'}
          </span>
        </div>

        {/* Shot Clock (24s / 14s) */}
        <div className="p-1.5 rounded-lg bg-black/60 border border-orange-500/30 w-full text-center max-w-[200px]">
          <div className="text-[8px] font-mono text-zinc-400 font-bold uppercase">SHOT CLOCK</div>
          <div className="font-digits font-black text-2xl text-orange-400">
            {state.shotClockSeconds ?? 24}s
          </div>
          <div className="grid grid-cols-2 gap-1 mt-1 font-mono text-[9px]">
            <button onClick={() => handleShotClockReset(24)} className="p-1 rounded bg-zinc-800 text-white font-bold">
              24s
            </button>
            <button onClick={() => handleShotClockReset(14)} className="p-1 rounded bg-zinc-800 text-amber-300 font-bold">
              14s
            </button>
          </div>
        </div>
      </div>

      {/* Quarters Strip */}
      <div className="p-2.5 rounded-xl bg-[#121215] border border-zinc-800 flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Period:</span>
        <div className="flex flex-wrap items-center gap-1 font-mono text-[10px]">
          {['Q1', 'Q2', 'Q3', 'Q4', 'OT 1', 'OT 2', 'Final'].map((q) => (
            <button
              key={q}
              onClick={() => {
                updateState({
                  currentPeriod: q,
                  quarterFoulsA: 0,
                  quarterFoulsB: 0,
                });
              }}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                state.currentPeriod === q
                  ? 'bg-orange-600 text-white'
                  : 'bg-[#18181b] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const cards: CardDefinition[] = [
    { type: 'SCORE_CONTROL', label: 'Score & Fouls', icon: <Flame className="w-3.5 h-3.5" />, render: renderScoreControl },
    { type: 'MATCH_CLOCK', label: 'Match Clock & Shot Clock', icon: <Clock className="w-3.5 h-3.5" />, render: renderMatchClock },
    { type: 'PROGRAM_MONITOR', label: 'Program Monitor', icon: <MonitorPlay className="w-3.5 h-3.5" />, render: renderProgramMonitor },
    { type: 'OPERATOR_HOTKEYS', label: 'Operator Hotkeys', icon: <Keyboard className="w-3.5 h-3.5" />, render: renderOperatorHotkeys },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-orange-950/30 border border-orange-800/40 text-orange-300 font-mono text-[11px]">
        <span className="font-bold flex items-center gap-1.5">
          <span>🏀 KONTROLER KHUSUS BOLA BASKET (BASKETBALL)</span>
        </span>
        <span>SHOT CLOCK 24s/14s • +1/+2/+3 PTS QUICK BUTTONS</span>
      </div>
      <BaseControllerDashboard 
        cards={cards} 
        storageKey="basketball_controller_templates" 
        defaultLayout={[
          { type: 'SCORE_CONTROL', size: 12 },
          { type: 'MATCH_CLOCK', size: 6 },
          { type: 'PROGRAM_MONITOR', size: 6 }
        ]}
      />
    </div>
  );
};
