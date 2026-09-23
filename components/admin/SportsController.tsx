import React from 'react';
import { LiveBroadcastState } from '@/lib/types';
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  Plus,
  Minus,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';

interface SportsControllerProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
  triggerAlert: (alert: any) => void;
}

export const SportsController: React.FC<SportsControllerProps> = ({
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

  const handleTimerToggle = () => {
    updateState({ isTimerRunning: !state.isTimerRunning });
  };

  const handleTimerReset = () => {
    updateState({ timerSeconds: 0, isTimerRunning: false });
  };

  const handleAddInjuryTime = (mins: number) => {
    updateState({ injuryTimeSeconds: mins * 60 });
    triggerAlert({
      type: 'CUSTOM',
      title: `+${mins} MIN INJURY TIME`,
      subtitle: 'Added by Match Official',
      durationMs: 4000,
    });
  };

  const handleGoalTrigger = (teamType: 'TEAM_A' | 'TEAM_B') => {
    const teamName = teamType === 'TEAM_A' ? state.teamA.name : state.teamB.name;
    handleScoreChange(teamType === 'TEAM_A' ? 'A' : 'B', 1);
    triggerAlert({
      type: 'GOAL',
      teamType,
      teamName,
      title: 'GOALLL!',
      subtitle: `${teamName} Scores!`,
      durationMs: 6000,
    });
  };

  const handleCardTrigger = (teamType: 'TEAM_A' | 'TEAM_B', cardType: 'YELLOW_CARD' | 'RED_CARD') => {
    const teamName = teamType === 'TEAM_A' ? state.teamA.name : state.teamB.name;
    triggerAlert({
      type: cardType,
      teamType,
      teamName,
      title: cardType === 'YELLOW_CARD' ? 'YELLOW CARD' : 'RED CARD!',
      subtitle: `Caution Issued for ${teamName}`,
      durationMs: 5000,
    });
  };

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* 1. COMPACT MASTER MATCH DESK (Home - Clock - Away) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
        {/* TEAM A (HOME) POD (5 Cols) */}
        <div className="lg:col-span-5 p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md flex flex-col justify-between space-y-2">
          {/* Top Row: Info & Hotkey */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              <span className="text-[9px] font-mono font-bold text-rose-400 uppercase tracking-widest">
                HOME • TEAM [A]
              </span>
            </div>
            <span className="text-[8px] font-mono text-zinc-600 bg-white/5 px-1.5 rounded">NUM 7</span>
          </div>

          {/* Center Row: Team & Big Score Counter */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/5 p-1 border border-white/10 shrink-0 flex items-center justify-center overflow-hidden relative">
                <img
                  src={state.teamA.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + state.teamA.name}
                  alt={state.teamA.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <input
                  type="text"
                  value={state.teamA.name}
                  onChange={(e) => updateState({ teamA: { ...state.teamA, name: e.target.value } })}
                  className="bg-transparent font-heading font-black text-sm text-white focus:outline-none focus:bg-white/5 rounded px-1 -ml-1 border-b border-transparent focus:border-rose-500/50 w-full truncate transition-all"
                />
                <div className="text-[9px] font-mono text-zinc-500 mt-0.5">
                  Fouls: <span className="text-rose-400 font-bold">{state.teamA.fouls || 0}</span>
                </div>
              </div>
            </div>

            {/* Score & Tactile +/- Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="font-digits font-black text-4xl text-white drop-shadow-md w-10 text-center">
                {state.scoreA}
              </div>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleScoreChange('A', 1)}
                  className="w-6 h-5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-bold text-[10px] flex items-center justify-center transition-colors"
                >
                  +
                </button>
                <button
                  onClick={() => handleScoreChange('A', -1)}
                  className="w-6 h-5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-500 hover:text-zinc-300 font-bold text-[10px] flex items-center justify-center transition-colors"
                >
                  -
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="flex items-center justify-between gap-1 pt-1">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleGoalTrigger('TEAM_A')}
                className="px-2 py-1 rounded bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-[9px] uppercase shadow-md flex items-center gap-1"
              >
                <Flame className="w-2.5 h-2.5 text-yellow-200" />
                GOAL
              </button>
              <button
                onClick={() => handleCardTrigger('TEAM_A', 'YELLOW_CARD')}
                className="w-6 h-4 rounded bg-yellow-400 hover:bg-yellow-300 shadow-sm border border-yellow-500/20"
                title="Kartu Kuning"
              />
              <button
                onClick={() => handleCardTrigger('TEAM_A', 'RED_CARD')}
                className="w-6 h-4 rounded bg-rose-600 hover:bg-rose-500 shadow-sm border border-rose-700/20"
                title="Kartu Merah"
              />
            </div>
            <button
              onClick={() => updateState({ teamA: { ...state.teamA, fouls: Math.max(0, (state.teamA.fouls || 0) + 1) } })}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white font-mono text-[9px] transition-colors"
            >
              +Foul
            </button>
          </div>
        </div>

        {/* MATCH CLOCK POD (2 Cols) */}
        <div className="lg:col-span-2 p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md flex flex-col items-center justify-between text-center space-y-1">
          <div className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-1">
            <Clock className="w-2.5 h-2.5 text-amber-500" />
            <span>CLOCK</span>
          </div>

          <div className="font-digits font-black text-2xl text-white tracking-widest flex items-center justify-center gap-1.5">
            <button onClick={() => updateState({ timerSeconds: Math.max(0, state.timerSeconds - 60) })} className="text-[9px] bg-white/5 hover:bg-white/10 px-1 py-0.5 rounded text-zinc-500 hover:text-white transition-colors">-</button>
            <span>{formatTime(state.timerSeconds)}</span>
            <button onClick={() => updateState({ timerSeconds: state.timerSeconds + 60 })} className="text-[9px] bg-white/5 hover:bg-white/10 px-1 py-0.5 rounded text-zinc-500 hover:text-white transition-colors">+</button>
          </div>

          <span className="text-[8px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full inline-block mb-1">
            {state.currentPeriod || 'Half 1'}
          </span>

          <div className="w-full grid grid-cols-2 gap-1">
            <button
              onClick={handleTimerToggle}
              className={`col-span-2 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm ${
                state.isTimerRunning
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
              }`}
            >
              {state.isTimerRunning ? 'PAUSE' : 'START'}
            </button>
            <button
              onClick={() => updateState({ timerDirection: state.timerDirection === 'UP' ? 'DOWN' : 'UP' })}
              className="py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-[8px] font-mono border border-white/5"
            >
              {state.timerDirection === 'DOWN' ? 'DOWN' : 'UP'}
            </button>
            <button
              onClick={handleTimerReset}
              className="py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 text-[8px] font-mono"
            >
              00:00
            </button>
          </div>
        </div>

        {/* TEAM B (AWAY) POD (5 Cols) */}
        <div className="lg:col-span-5 p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md flex flex-col justify-between space-y-2">
          {/* Top Row: Info & Hotkey */}
          <div className="flex items-center justify-between pb-1 flex-row-reverse">
            <div className="flex items-center gap-1.5 flex-row-reverse">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                TEAM [B] • AWAY
              </span>
            </div>
            <span className="text-[8px] font-mono text-zinc-600 bg-white/5 px-1.5 rounded">NUM 9</span>
          </div>

          {/* Center Row: Team & Big Score Counter */}
          <div className="flex items-center justify-between gap-3 flex-row-reverse text-right">
            <div className="flex items-center gap-2.5 flex-1 min-w-0 flex-row-reverse">
              <div className="w-10 h-10 rounded-xl bg-white/5 p-1 border border-white/10 shrink-0 flex items-center justify-center overflow-hidden relative">
                <img
                  src={state.teamB.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + state.teamB.name}
                  alt={state.teamB.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <input
                  type="text"
                  value={state.teamB.name}
                  onChange={(e) => updateState({ teamB: { ...state.teamB, name: e.target.value } })}
                  className="bg-transparent font-heading font-black text-sm text-white focus:outline-none focus:bg-white/5 rounded px-1 -mr-1 border-b border-transparent focus:border-blue-500/50 w-full text-right truncate transition-all"
                />
                <div className="text-[9px] font-mono text-zinc-500 mt-0.5">
                  Fouls: <span className="text-blue-400 font-bold">{state.teamB.fouls || 0}</span>
                </div>
              </div>
            </div>

            {/* Score & Tactile +/- Buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-row-reverse">
              <div className="font-digits font-black text-4xl text-white drop-shadow-md w-10 text-center">
                {state.scoreB}
              </div>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleScoreChange('B', 1)}
                  className="w-6 h-5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-bold text-[10px] flex items-center justify-center transition-colors"
                >
                  +
                </button>
                <button
                  onClick={() => handleScoreChange('B', -1)}
                  className="w-6 h-5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-500 hover:text-zinc-300 font-bold text-[10px] flex items-center justify-center transition-colors"
                >
                  -
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="flex items-center justify-between gap-1 pt-1 flex-row-reverse">
            <div className="flex items-center gap-1 flex-row-reverse">
              <button
                onClick={() => handleGoalTrigger('TEAM_B')}
                className="px-2 py-1 rounded bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-[9px] uppercase shadow-md flex items-center gap-1"
              >
                <Flame className="w-2.5 h-2.5 text-cyan-200" />
                GOAL
              </button>
              <button
                onClick={() => handleCardTrigger('TEAM_B', 'YELLOW_CARD')}
                className="w-6 h-4 rounded bg-yellow-400 hover:bg-yellow-300 shadow-sm border border-yellow-500/20"
                title="Kartu Kuning"
              />
              <button
                onClick={() => handleCardTrigger('TEAM_B', 'RED_CARD')}
                className="w-6 h-4 rounded bg-rose-600 hover:bg-rose-500 shadow-sm border border-rose-700/20"
                title="Kartu Merah"
              />
            </div>
            <button
              onClick={() => updateState({ teamB: { ...state.teamB, fouls: Math.max(0, (state.teamB.fouls || 0) + 1) } })}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white font-mono text-[9px] transition-colors"
            >
              +Foul
            </button>
          </div>
        </div>
      </div>

      {/* 2. COMPACT SECONDARY BAR: Match Periods, Injury Time & Ball Possession Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        {/* Match Period Selector & Injury Time (6 Cols) */}
        <div className="lg:col-span-7 p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-widest">
            <span>PERIODS</span>
            <span className="text-emerald-500 font-normal">SYNC</span>
          </div>

          {/* Period Quick Chips */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 font-mono text-[9px]">
            {['Half 1', 'Half 2', 'Extra 1', 'Extra 2', 'Penalty', 'Full Time'].map((period) => (
              <button
                key={period}
                onClick={() => updateState({ currentPeriod: period })}
                className={`py-1.5 rounded text-center font-bold transition-all truncate ${
                  state.currentPeriod === period
                    ? 'bg-blue-600/80 text-white shadow-sm border border-blue-500/50'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Injury Time Quick Chips */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
            <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold shrink-0">Added Time:</span>
            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              {[1, 2, 3, 4, 5, 6].map((m) => (
                <button
                  key={m}
                  onClick={() => handleAddInjuryTime(m)}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-white text-[9px] font-mono font-bold"
                >
                  +{m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Telemetry: Possession & Shots on Target (5 Cols) */}
        <div className="lg:col-span-5 p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-2">
          <div className="flex justify-between text-[9px] font-mono font-bold tracking-widest">
            <span className="text-rose-400">POSS {state.stats.possessionA}%</span>
            <span className="text-blue-400">{100 - state.stats.possessionA}% POSS</span>
          </div>

          <div className="relative w-full h-1.5 bg-blue-500/30 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-rose-500"
              style={{ width: `${state.stats.possessionA}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={state.stats.possessionA}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateState({
                  stats: {
                    ...state.stats,
                    possessionA: val,
                    possessionB: 100 - val,
                  },
                });
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Compact Shots on Target Bar */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] font-mono mt-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateState({ stats: { ...state.stats, shotsOnTargetA: Math.max(0, state.stats.shotsOnTargetA - 1) } })}
                className="w-4 h-4 rounded bg-white/5 hover:bg-white/10 text-zinc-400 font-bold flex items-center justify-center"
              >-</button>
              <span className="w-4 text-center font-bold text-rose-400">{state.stats.shotsOnTargetA}</span>
              <button
                onClick={() => updateState({ stats: { ...state.stats, shotsOnTargetA: state.stats.shotsOnTargetA + 1 } })}
                className="w-4 h-4 rounded bg-white/5 hover:bg-white/10 text-zinc-400 font-bold flex items-center justify-center"
              >+</button>
            </div>

            <span className="font-bold text-zinc-500 uppercase tracking-widest text-[8px]">SHOTS ON TARGET</span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => updateState({ stats: { ...state.stats, shotsOnTargetB: Math.max(0, state.stats.shotsOnTargetB - 1) } })}
                className="w-4 h-4 rounded bg-white/5 hover:bg-white/10 text-zinc-400 font-bold flex items-center justify-center"
              >-</button>
              <span className="w-4 text-center font-bold text-blue-400">{state.stats.shotsOnTargetB}</span>
              <button
                onClick={() => updateState({ stats: { ...state.stats, shotsOnTargetB: state.stats.shotsOnTargetB + 1 } })}
                className="w-4 h-4 rounded bg-white/5 hover:bg-white/10 text-zinc-400 font-bold flex items-center justify-center"
              >+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
