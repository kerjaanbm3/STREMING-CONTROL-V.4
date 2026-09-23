import React from 'react';
import { LiveBroadcastState } from '@/lib/types';
import { BarChart3, Activity, PieChart, Shield, Flame, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface StatsViewProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ state, updateState }) => {
  return (
    <div className="space-y-4 font-sans">
      <div className="studio-box p-5 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#232a3b]">
          <div>
            <h2 className="font-mono font-bold text-sm text-slate-100 uppercase flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>LIVE MATCH STATISTICS & TELEMETRY</span>
            </h2>
            <p className="text-xs text-slate-400">Head-to-head match comparison metrics distributed to overlays and vMix Data Sources</p>
          </div>

          <Link
            href="/overlay/summary"
            target="_blank"
            className="btn-primary px-3.5 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>SUMMARY OVERLAY</span>
          </Link>
        </div>

        {/* Head-to-Head Banner */}
        <div className="grid grid-cols-12 gap-3 items-center p-4 rounded bg-[#0a0d14] border border-[#1e2535]">
          <div className="col-span-5 flex items-center gap-3">
            <img
              src={state.teamA.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=A'}
              alt={state.teamA.name}
              className="w-10 h-10 rounded object-contain bg-[#121620] p-1 border border-[#242e44]"
            />
            <div>
              <span className="text-[10px] font-mono text-rose-400 font-bold">HOME TEAM</span>
              <div className="font-heading font-black text-sm text-white uppercase">{state.teamA.name}</div>
            </div>
          </div>

          <div className="col-span-2 text-center font-digits font-black text-2xl text-slate-200">
            {state.scoreA} - {state.scoreB}
          </div>

          <div className="col-span-5 flex items-center gap-3 flex-row-reverse text-right">
            <img
              src={state.teamB.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=B'}
              alt={state.teamB.name}
              className="w-10 h-10 rounded object-contain bg-[#121620] p-1 border border-[#242e44]"
            />
            <div>
              <span className="text-[10px] font-mono text-blue-400 font-bold">AWAY TEAM</span>
              <div className="font-heading font-black text-sm text-white uppercase">{state.teamB.name}</div>
            </div>
          </div>
        </div>

        {/* Sliders & Numerical Metrics */}
        <div className="space-y-4 pt-2">
          {/* Ball Possession */}
          <div className="p-3 rounded bg-[#0a0d14] border border-[#1e2535]">
            <div className="flex justify-between text-xs font-mono font-bold mb-2">
              <span className="text-rose-400">{state.stats.possessionA}% POSSESSION</span>
              <span className="text-slate-400 uppercase">BALL POSSESSION</span>
              <span className="text-blue-400">{100 - state.stats.possessionA}%</span>
            </div>
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
              className="w-full h-2 bg-[#121622] rounded appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Detailed Metric Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            {/* Shots on Target */}
            <div className="p-3 rounded bg-[#0a0d14] border border-[#1e2535] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateState({ stats: { ...state.stats, shotsOnTargetA: Math.max(0, state.stats.shotsOnTargetA - 1) } })}
                  className="btn-broadcast w-6 h-6 rounded font-bold"
                >-</button>
                <span className="font-bold text-white w-6 text-center">{state.stats.shotsOnTargetA}</span>
                <button
                  onClick={() => updateState({ stats: { ...state.stats, shotsOnTargetA: state.stats.shotsOnTargetA + 1 } })}
                  className="btn-broadcast w-6 h-6 rounded font-bold"
                >+</button>
              </div>

              <span className="font-bold text-slate-300">SHOTS ON TARGET</span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateState({ stats: { ...state.stats, shotsOnTargetB: Math.max(0, state.stats.shotsOnTargetB - 1) } })}
                  className="btn-broadcast w-6 h-6 rounded font-bold"
                >-</button>
                <span className="font-bold text-white w-6 text-center">{state.stats.shotsOnTargetB}</span>
                <button
                  onClick={() => updateState({ stats: { ...state.stats, shotsOnTargetB: state.stats.shotsOnTargetB + 1 } })}
                  className="btn-broadcast w-6 h-6 rounded font-bold"
                >+</button>
              </div>
            </div>

            {/* Corner Kicks */}
            <div className="p-3 rounded bg-[#0a0d14] border border-[#1e2535] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateState({ stats: { ...state.stats, cornersA: Math.max(0, state.stats.cornersA - 1) } })}
                  className="btn-broadcast w-6 h-6 rounded font-bold"
                >-</button>
                <span className="font-bold text-white w-6 text-center">{state.stats.cornersA}</span>
                <button
                  onClick={() => updateState({ stats: { ...state.stats, cornersA: state.stats.cornersA + 1 } })}
                  className="btn-broadcast w-6 h-6 rounded font-bold"
                >+</button>
              </div>

              <span className="font-bold text-slate-300">CORNER KICKS</span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateState({ stats: { ...state.stats, cornersB: Math.max(0, state.stats.cornersB - 1) } })}
                  className="btn-broadcast w-6 h-6 rounded font-bold"
                >-</button>
                <span className="font-bold text-white w-6 text-center">{state.stats.cornersB}</span>
                <button
                  onClick={() => updateState({ stats: { ...state.stats, cornersB: state.stats.cornersB + 1 } })}
                  className="btn-broadcast w-6 h-6 rounded font-bold"
                >+</button>
              </div>
            </div>

            {/* Fouls */}
            <div className="p-3 rounded bg-[#0a0d14] border border-[#1e2535] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateState({ stats: { ...state.stats, foulsA: Math.max(0, state.stats.foulsA - 1) } })}
                  className="btn-broadcast w-6 h-6 rounded font-bold"
                >-</button>
                <span className="font-bold text-white w-6 text-center">{state.stats.foulsA}</span>
                <button
                  onClick={() => updateState({ stats: { ...state.stats, foulsA: state.stats.foulsA + 1 } })}
                  className="btn-broadcast w-6 h-6 rounded font-bold"
                >+</button>
              </div>

              <span className="font-bold text-slate-300">FOULS COMMITTED</span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateState({ stats: { ...state.stats, foulsB: Math.max(0, state.stats.foulsB - 1) } })}
                  className="btn-broadcast w-6 h-6 rounded font-bold"
                >-</button>
                <span className="font-bold text-white w-6 text-center">{state.stats.foulsB}</span>
                <button
                  onClick={() => updateState({ stats: { ...state.stats, foulsB: state.stats.foulsB + 1 } })}
                  className="btn-broadcast w-6 h-6 rounded font-bold"
                >+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
