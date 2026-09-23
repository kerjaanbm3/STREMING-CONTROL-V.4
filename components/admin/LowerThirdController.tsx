import React from 'react';
import { LiveBroadcastState } from '@/lib/types';
import { UserCheck, Eye, EyeOff, MessageSquare, Megaphone } from 'lucide-react';

interface LowerThirdControllerProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
}

export const LowerThirdController: React.FC<LowerThirdControllerProps> = ({
  state,
  updateState,
}) => {
  const handleToggleCaster = () => {
    updateState({
      caster: {
        ...state.caster,
        visible: !state.caster.visible,
      },
    });
  };

  const handleToggleTicker = () => {
    updateState({
      tickerVisible: !state.tickerVisible,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Caster / Lower-Third Identity Card */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-sm text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>LOWER-THIRD / CASTER CARD</span>
          </h3>
          <button
            onClick={handleToggleCaster}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-heading transition-all ${
              state.caster.visible
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-gray-400 hover:text-white'
            }`}
            title="Hotkey: Key L"
          >
            {state.caster.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{state.caster.visible ? 'VISIBLE ON STREAM' : 'HIDDEN'}</span>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">Caster / Speaker Name</label>
            <input
              type="text"
              value={state.caster.name}
              onChange={(e) =>
                updateState({
                  caster: { ...state.caster, name: e.target.value },
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">Role / Subtitle</label>
              <input
                type="text"
                value={state.caster.role}
                onChange={(e) =>
                  updateState({
                    caster: { ...state.caster, role: e.target.value },
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">Social Handle / IG</label>
              <input
                type="text"
                value={state.caster.socialHandle || ''}
                onChange={(e) =>
                  updateState({
                    caster: { ...state.caster, socialHandle: e.target.value },
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                placeholder="@username"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Running Text / Ticker Traffic */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-sm text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-400" />
            <span>RUNNING TICKER / ANNOUNCEMENT</span>
          </h3>
          <button
            onClick={handleToggleTicker}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-heading transition-all ${
              state.tickerVisible
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-800 text-gray-400 hover:text-white'
            }`}
          >
            {state.tickerVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{state.tickerVisible ? 'TICKER ON' : 'TICKER OFF'}</span>
          </button>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-gray-400 mb-1">Running Broadcast Text</label>
          <textarea
            rows={3}
            value={state.tickerText}
            onChange={(e) => updateState({ tickerText: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            placeholder="Type your announcements or social media handles..."
          />
        </div>
      </div>
    </div>
  );
};
