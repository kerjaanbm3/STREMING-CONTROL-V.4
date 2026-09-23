import React from 'react';
import { LiveBroadcastState } from '@/lib/types';
import {
  Trophy,
  Clock,
  Radio,
  Activity,
  Flame,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface DashboardViewProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
  triggerAlert: (alert: any) => void;
  onNavigate: (menu: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  updateState,
  triggerAlert,
  onNavigate,
}) => {
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(Math.abs(totalSec) / 60);
    const secs = Math.abs(totalSec) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Minimal Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Active Tournament Card */}
        <div className="min-card p-3.5 space-y-1">
          <div className="text-[11px] font-mono text-zinc-400 font-medium uppercase">Active Tournament</div>
          <div className="font-heading font-black text-sm text-white truncate">{state.eventName}</div>
          <div className="text-xs text-blue-400 font-medium">{state.eventType}</div>
        </div>

        {/* Live Match Clock */}
        <div className="min-card p-3.5 space-y-1">
          <div className="text-[11px] font-mono text-zinc-400 font-medium uppercase">Match Clock</div>
          <div className="font-digits font-black text-2xl text-white">{formatTime(state.timerSeconds)}</div>
          <div className="text-xs text-amber-400 font-medium">{state.currentPeriod || 'Period 1'}</div>
        </div>

        {/* Head-to-Head Score */}
        <div className="min-card p-3.5 space-y-1">
          <div className="text-[11px] font-mono text-zinc-400 font-medium uppercase">Match Score</div>
          <div className="font-digits font-black text-2xl text-white">
            {state.scoreA} <span className="text-zinc-600 font-normal">-</span> {state.scoreB}
          </div>
          <div className="text-xs text-zinc-400 truncate">
            {state.teamA.name} vs {state.teamB.name}
          </div>
        </div>

        {/* Transmission Engine */}
        <div className="min-card p-3.5 space-y-1">
          <div className="text-[11px] font-mono text-zinc-400 font-medium uppercase">Data Transmission</div>
          <div className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>4-Channel Active</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500">WS • JSON • TXT • OBS</div>
        </div>
      </div>

      {/* 2. Minimalist Matchup Desk */}
      <div className="min-card p-5 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e1e24]">
          <div>
            <h2 className="font-heading font-bold text-sm text-white uppercase tracking-wide">
              Quick Match Operations
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Control live score counters, match clock, and overlay alerts</p>
          </div>

          <button
            onClick={() => onNavigate('MATCH')}
            className="min-btn px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5"
          >
            <span>Open Match</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clean Matchup Pods */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Team A */}
          <div className="md:col-span-5 p-3.5 rounded-lg bg-[#141417] border border-[#23232a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={state.teamA.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=A'}
                alt={state.teamA.name}
                className="w-11 h-11 rounded-lg object-contain bg-black/40 p-1 border border-zinc-800"
              />
              <div>
                <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">Home</span>
                <div className="font-heading font-black text-sm text-white uppercase">{state.teamA.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="font-digits font-black text-3xl text-white w-8 text-center">{state.scoreA}</span>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => updateState({ scoreA: state.scoreA + 1 })}
                  className="min-btn w-6 h-6 flex items-center justify-center font-bold text-xs text-rose-400"
                >
                  +
                </button>
                <button
                  onClick={() => updateState({ scoreA: Math.max(0, state.scoreA - 1) })}
                  className="min-btn w-6 h-6 flex items-center justify-center font-bold text-xs text-zinc-400"
                >
                  -
                </button>
              </div>
            </div>
          </div>

          {/* Center Clock Pod */}
          <div className="md:col-span-2 flex flex-col items-center justify-center p-3 rounded-lg bg-[#141417] border border-[#23232a] text-center">
            <div className="font-digits font-black text-2xl text-white mb-1.5">{formatTime(state.timerSeconds)}</div>
            <button
              onClick={() => updateState({ isTimerRunning: !state.isTimerRunning })}
              className={`w-full py-1.5 rounded-md text-xs font-semibold ${
                state.isTimerRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {state.isTimerRunning ? 'Pause' : 'Start'}
            </button>
          </div>

          {/* Team B */}
          <div className="md:col-span-5 p-3.5 rounded-lg bg-[#141417] border border-[#23232a] flex items-center justify-between flex-row-reverse text-right">
            <div className="flex items-center gap-3 flex-row-reverse text-right">
              <img
                src={state.teamB.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=B'}
                alt={state.teamB.name}
                className="w-11 h-11 rounded-lg object-contain bg-black/40 p-1 border border-zinc-800"
              />
              <div>
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">Away</span>
                <div className="font-heading font-black text-sm text-white uppercase">{state.teamB.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-row-reverse">
              <span className="font-digits font-black text-3xl text-white w-8 text-center">{state.scoreB}</span>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => updateState({ scoreB: state.scoreB + 1 })}
                  className="min-btn w-6 h-6 flex items-center justify-center font-bold text-xs text-blue-400"
                >
                  +
                </button>
                <button
                  onClick={() => updateState({ scoreB: Math.max(0, state.scoreB - 1) })}
                  className="min-btn w-6 h-6 flex items-center justify-center font-bold text-xs text-zinc-400"
                >
                  -
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Alert Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#1e1e24]">
          <button
            onClick={() => {
              updateState({ scoreA: state.scoreA + 1 });
              triggerAlert({
                type: 'GOAL',
                teamType: 'TEAM_A',
                teamName: state.teamA.name,
                title: 'GOALLL!',
                subtitle: `${state.teamA.name} Scores!`,
                durationMs: 6000,
              });
            }}
            className="min-btn-rose px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-yellow-300" />
            <span>Goal [A]</span>
          </button>

          <button
            onClick={() => {
              updateState({ scoreB: state.scoreB + 1 });
              triggerAlert({
                type: 'GOAL',
                teamType: 'TEAM_B',
                teamName: state.teamB.name,
                title: 'GOALLL!',
                subtitle: `${state.teamB.name} Scores!`,
                durationMs: 6000,
              });
            }}
            className="min-btn-rose px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-yellow-300" />
            <span>Goal [B]</span>
          </button>

          <button
            onClick={() =>
              triggerAlert({
                type: 'CUSTOM',
                title: 'VAR CHECK IN PROGRESS',
                subtitle: 'Reviewing Infringement',
                durationMs: 5000,
              })
            }
            className="min-btn px-3 py-1.5 text-xs font-medium text-amber-300"
          >
            VAR Review
          </button>

          <button
            onClick={() =>
              updateState({
                caster: { ...state.caster, visible: !state.caster.visible },
              })
            }
            className="min-btn ml-auto px-3 py-1.5 text-xs font-medium text-indigo-300"
          >
            Toggle Caster Card
          </button>
        </div>
      </div>
    </div>
  );
};
