import React from 'react';
import { LiveBroadcastState } from '@/lib/types';
import {
  Flame,
  Clock,
  AlertOctagon,
  Shield,
  Zap,
  MonitorPlay,
  Keyboard,
} from 'lucide-react';
import { BaseControllerDashboard, CardDefinition } from '../dashboard/BaseControllerDashboard';
import { renderProgramMonitor } from '../dashboard/cards/ProgramMonitorCard';
import { renderOperatorHotkeys } from '../dashboard/cards/OperatorHotkeysCard';

interface FutsalControllerProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
  triggerAlert: (alert: any) => void;
}

export const FutsalController: React.FC<FutsalControllerProps> = ({
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

  const handleFoulChange = (team: 'A' | 'B', delta: number) => {
    if (team === 'A') {
      const fouls = Math.max(0, (state.teamA.fouls || 0) + delta);
      const isSecondPenalty = fouls >= 5;
      updateState({
        teamA: { ...state.teamA, fouls },
        secondPenaltyA: isSecondPenalty,
      });
      if (fouls === 5) {
        triggerAlert({
          type: 'FOUL',
          teamType: 'TEAM_A',
          teamName: state.teamA.name,
          title: '5TH ACCUMULATED FOUL!',
          subtitle: 'Next foul results in 10m Second Penalty',
          durationMs: 5000,
        });
      }
    } else {
      const fouls = Math.max(0, (state.teamB.fouls || 0) + delta);
      const isSecondPenalty = fouls >= 5;
      updateState({
        teamB: { ...state.teamB, fouls },
        secondPenaltyB: isSecondPenalty,
      });
      if (fouls === 5) {
        triggerAlert({
          type: 'FOUL',
          teamType: 'TEAM_B',
          teamName: state.teamB.name,
          title: '5TH ACCUMULATED FOUL!',
          subtitle: 'Next foul results in 10m Second Penalty',
          durationMs: 5000,
        });
      }
    }
  };

  const handleTimeoutTrigger = (teamType: 'TEAM_A' | 'TEAM_B') => {
    const teamName = teamType === 'TEAM_A' ? state.teamA.name : state.teamB.name;
    const current = teamType === 'TEAM_A' ? (state.teamA.timeouts || 0) : (state.teamB.timeouts || 0);
    if (teamType === 'TEAM_A') {
      updateState({ teamA: { ...state.teamA, timeouts: current + 1 } });
    } else {
      updateState({ teamB: { ...state.teamB, timeouts: current + 1 } });
    }
    triggerAlert({
      type: 'TIMEOUT',
      teamType,
      teamName,
      title: 'TIMEOUT CALLED',
      subtitle: `${teamName} 1-Minute Tactical Timeout`,
      durationMs: 5000,
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

  const renderScoreAlerts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch font-sans text-xs">
      {/* TEAM A (HOME) */}
      <div className="p-3 rounded-xl bg-[#121215] border border-rose-500/20 flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">HOME • TEAM [A]</span>
          </div>
          {state.secondPenaltyA && (
            <span className="text-[9px] font-mono font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded animate-pulse">
              2ND PENALTY ACTIVE
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
              {/* Cumulative Fouls Badges (1 - 5) */}
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] font-mono text-zinc-400">Fouls:</span>
                {[1, 2, 3, 4, 5].map((f) => (
                  <span
                    key={f}
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-mono font-bold ${
                      (state.teamA.fouls || 0) >= f
                        ? f === 5
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-amber-500 text-black'
                        : 'bg-zinc-800 text-zinc-600'
                    }`}
                  >
                    {f}
                  </span>
                ))}
                <div className="flex items-center gap-0.5 ml-1">
                  <button onClick={() => handleFoulChange('A', 1)} className="px-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[9px] font-bold">
                    +
                  </button>
                  <button onClick={() => handleFoulChange('A', -1)} className="px-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[9px] font-bold">
                    -
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-black/60 border border-rose-500/30 flex items-center justify-center font-digits font-black text-2xl text-white">
              {state.scoreA}
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleScoreChange('A', 1)}
                className="w-7 h-5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-mono font-bold text-[11px] flex items-center justify-center"
              >
                +
              </button>
              <button
                onClick={() => handleScoreChange('A', -1)}
                className="w-7 h-5 rounded bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-mono font-bold text-[11px] flex items-center justify-center"
              >
                -
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-white/[0.06]">
          <div className="flex items-center gap-1">
            <button onClick={() => handleGoalTrigger('TEAM_A')} className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-[10px] uppercase flex items-center gap-1">
              <Flame className="w-3 h-3 text-yellow-300" />
              <span>GOAL</span>
            </button>
            <button onClick={() => handleCardTrigger('TEAM_A', 'YELLOW_CARD')} className="px-1.5 py-1 rounded bg-yellow-950/40 border border-yellow-700 text-yellow-300 font-mono text-[10px]">
              Y
            </button>
            <button onClick={() => handleCardTrigger('TEAM_A', 'RED_CARD')} className="px-1.5 py-1 rounded bg-rose-950/40 border border-rose-700 text-rose-300 font-mono text-[10px]">
              R
            </button>
          </div>

          <button onClick={() => handleTimeoutTrigger('TEAM_A')} className="px-2 py-1 rounded bg-amber-950/50 hover:bg-amber-900 border border-amber-800 text-amber-300 font-mono text-[10px] font-bold">
            ⏱️ T-OUT (1m)
          </button>
        </div>
      </div>

      {/* TEAM B (AWAY) */}
      <div className="p-3 rounded-xl bg-[#121215] border border-blue-500/20 flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
          {state.secondPenaltyB && (
            <span className="text-[9px] font-mono font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded animate-pulse">
              2ND PENALTY ACTIVE
            </span>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">AWAY • TEAM [B]</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
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
              <div className="flex items-center gap-1 mt-1 justify-end">
                <div className="flex items-center gap-0.5 mr-1">
                  <button onClick={() => handleFoulChange('B', 1)} className="px-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[9px] font-bold">
                    +
                  </button>
                  <button onClick={() => handleFoulChange('B', -1)} className="px-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[9px] font-bold">
                    -
                  </button>
                </div>
                {[1, 2, 3, 4, 5].map((f) => (
                  <span
                    key={f}
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-mono font-bold ${
                      (state.teamB.fouls || 0) >= f
                        ? f === 5
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-amber-500 text-black'
                        : 'bg-zinc-800 text-zinc-600'
                    }`}
                  >
                    {f}
                  </span>
                ))}
                <span className="text-[9px] font-mono text-zinc-400 ml-1">:Fouls</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-row-reverse">
            <div className="w-12 h-12 rounded-xl bg-black/60 border border-blue-500/30 flex items-center justify-center font-digits font-black text-2xl text-white">
              {state.scoreB}
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleScoreChange('B', 1)}
                className="w-7 h-5 rounded bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300 font-mono font-bold text-[11px] flex items-center justify-center"
              >
                +
              </button>
              <button
                onClick={() => handleScoreChange('B', -1)}
                className="w-7 h-5 rounded bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-mono font-bold text-[11px] flex items-center justify-center"
              >
                -
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-white/[0.06] flex-row-reverse">
          <div className="flex items-center gap-1 flex-row-reverse">
            <button onClick={() => handleGoalTrigger('TEAM_B')} className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-[10px] uppercase flex items-center gap-1">
              <Flame className="w-3 h-3 text-yellow-300" />
              <span>GOAL</span>
            </button>
            <button onClick={() => handleCardTrigger('TEAM_B', 'YELLOW_CARD')} className="px-1.5 py-1 rounded bg-yellow-950/40 border border-yellow-700 text-yellow-300 font-mono text-[10px]">
              Y
            </button>
            <button onClick={() => handleCardTrigger('TEAM_B', 'RED_CARD')} className="px-1.5 py-1 rounded bg-rose-950/40 border border-rose-700 text-rose-300 font-mono text-[10px]">
              R
            </button>
          </div>

          <button onClick={() => handleTimeoutTrigger('TEAM_B')} className="px-2 py-1 rounded bg-amber-950/50 hover:bg-amber-900 border border-amber-800 text-amber-300 font-mono text-[10px] font-bold">
            ⏱️ T-OUT (1m)
          </button>
        </div>
      </div>
    </div>
  );

  const renderMatchClock = () => (
    <div className="space-y-4 font-sans">
      <div className="p-3 rounded-xl bg-[#121215] border border-white/[0.08] flex flex-col items-center justify-between text-center space-y-1.5">
        <div>
          <div className="text-[9px] font-mono font-bold text-zinc-400 uppercase flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>FUTSAL CLOCK</span>
          </div>
          <div className="font-digits font-black text-2xl text-white tracking-wider my-1">
            {formatTime(state.timerSeconds)}
          </div>
          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.2 rounded-full inline-block">
            {state.currentPeriod || 'Babak 1'}
          </span>
        </div>

        <div className="w-full space-y-1 max-w-[200px]">
          <button
            onClick={() => updateState({ isTimerRunning: !state.isTimerRunning })}
            className={`w-full py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
              state.isTimerRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {state.isTimerRunning ? 'PAUSE CLOCK' : 'START CLOCK'}
          </button>
          <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
            <button onClick={() => updateState({ timerSeconds: 1200, timerDirection: 'DOWN', isTimerRunning: false })} className="p-1 rounded bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-white">
              20:00 CD
            </button>
            <button onClick={() => updateState({ timerSeconds: 0, timerDirection: 'UP', isTimerRunning: false })} className="p-1 rounded bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-white">
              00:00 UP
            </button>
          </div>
        </div>
      </div>

      {/* Futsal Periods Selector Strip */}
      <div className="p-2.5 rounded-xl bg-[#121215] border border-zinc-800 flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Babak Futsal:</span>
        <div className="flex flex-wrap items-center gap-1 font-mono text-[10px]">
          {['Babak 1', 'Babak 2', 'Extra Time 1', 'Extra Time 2', 'Adu Penalti', 'Full Time'].map((period) => (
            <button
              key={period}
              onClick={() => {
                updateState({
                  currentPeriod: period,
                  teamA: { ...state.teamA, fouls: 0, timeouts: 0 },
                  teamB: { ...state.teamB, fouls: 0, timeouts: 0 },
                  secondPenaltyA: false,
                  secondPenaltyB: false,
                });
              }}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                state.currentPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#18181b] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const cards: CardDefinition[] = [
    { type: 'SCORE_ALERTS', label: 'Score & Alerts', icon: <Zap className="w-3.5 h-3.5" />, render: renderScoreAlerts },
    { type: 'MATCH_CLOCK', label: 'Match Clock', icon: <Clock className="w-3.5 h-3.5" />, render: renderMatchClock },
    { type: 'PROGRAM_MONITOR', label: 'Program Monitor', icon: <MonitorPlay className="w-3.5 h-3.5" />, render: renderProgramMonitor },
    { type: 'OPERATOR_HOTKEYS', label: 'Operator Hotkeys', icon: <Keyboard className="w-3.5 h-3.5" />, render: renderOperatorHotkeys },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 font-mono text-[11px]">
        <span className="font-bold flex items-center gap-1.5">
          <span>🥅 KONTROLER KHUSUS FUTSAL RESMI</span>
        </span>
        <span>20 MENIT WAKTU BERSIH • 5 FOUL SECOND PENALTY</span>
      </div>
      <BaseControllerDashboard 
        cards={cards} 
        storageKey="futsal_controller_templates" 
        defaultLayout={[
          { type: 'SCORE_ALERTS', size: 12 },
          { type: 'MATCH_CLOCK', size: 6 },
          { type: 'PROGRAM_MONITOR', size: 6 }
        ]}
      />
    </div>
  );
};
