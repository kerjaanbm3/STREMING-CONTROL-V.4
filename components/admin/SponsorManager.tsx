import React, { useState } from 'react';
import { LiveBroadcastState, SponsorItem } from '@/lib/types';
import { Sparkles, Plus, Trash2, Eye, EyeOff, RotateCw } from 'lucide-react';

interface SponsorManagerProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
}

export const SponsorManager: React.FC<SponsorManagerProps> = ({
  state,
  updateState,
}) => {
  const [newSponsorName, setNewSponsorName] = useState('');

  const handleToggleCarousel = () => {
    updateState({
      sponsorCarouselVisible: !state.sponsorCarouselVisible,
    });
  };

  const handleNextSponsor = () => {
    if (state.sponsors.length === 0) return;
    const next = (state.currentSponsorIndex + 1) % state.sponsors.length;
    updateState({ currentSponsorIndex: next });
  };

  const handleAddSponsor = () => {
    if (!newSponsorName.trim()) return;
    const newSp: SponsorItem = {
      id: 'sp_' + Date.now(),
      name: newSponsorName.trim(),
      logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(newSponsorName)}`,
    };
    updateState({
      sponsors: [...state.sponsors, newSp],
    });
    setNewSponsorName('');
  };

  const handleRemoveSponsor = (index: number) => {
    const list = state.sponsors.filter((_, i) => i !== index);
    updateState({ sponsors: list, currentSponsorIndex: 0 });
  };

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-heading font-extrabold text-sm text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>SPONSOR LOGO CAROUSEL MANAGER</span>
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNextSponsor}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-semibold"
            title="Force Next Sponsor Logo"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Next Logo</span>
          </button>
          <button
            onClick={handleToggleCarousel}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-heading transition-all ${
              state.sponsorCarouselVisible
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-800 text-gray-400 hover:text-white'
            }`}
            title="Hotkey: Key S"
          >
            {state.sponsorCarouselVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{state.sponsorCarouselVisible ? 'CAROUSEL ON' : 'CAROUSEL OFF'}</span>
          </button>
        </div>
      </div>

      {/* Active Sponsor Highlight */}
      {state.sponsors.length > 0 && (
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded">
              CURRENT ON-SCREEN
            </span>
            <img
              src={state.sponsors[state.currentSponsorIndex]?.logoUrl}
              alt="Sponsor"
              className="w-7 h-7 rounded object-contain bg-slate-800 p-1 border border-slate-700"
            />
            <span className="font-heading font-extrabold text-xs text-white">
              {state.sponsors[state.currentSponsorIndex]?.name}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            {state.currentSponsorIndex + 1} of {state.sponsors.length}
          </span>
        </div>
      )}

      {/* Sponsor Items List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {state.sponsors.map((sp, idx) => (
          <div
            key={sp.id}
            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
              idx === state.currentSponsorIndex
                ? 'bg-amber-950/30 border-amber-500/50'
                : 'bg-slate-900/40 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <img
                src={sp.logoUrl}
                alt={sp.name}
                className="w-8 h-8 rounded-lg object-contain bg-slate-800 p-1 border border-slate-700"
              />
              <span className="text-xs font-bold text-white truncate max-w-[120px]">{sp.name}</span>
            </div>
            <button
              onClick={() => handleRemoveSponsor(idx)}
              className="p-1 text-gray-500 hover:text-rose-400 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Sponsor Input */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          placeholder="New sponsor / brand name..."
          value={newSponsorName}
          onChange={(e) => setNewSponsorName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddSponsor()}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={handleAddSponsor}
          className="flex items-center gap-1 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold font-heading shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Sponsor</span>
        </button>
      </div>
    </div>
  );
};
