import React, { useState, useEffect } from 'react';
import { LiveBroadcastState } from '@/lib/types';
import { Bookmark, Plus, Check, Trash2, X, Play, Sparkles } from 'lucide-react';

interface PresetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: LiveBroadcastState;
  onLoadPreset: (presetState: Partial<LiveBroadcastState>) => void;
}

export const PresetManagerModal: React.FC<PresetManagerModalProps> = ({
  isOpen,
  onClose,
  currentState,
  onLoadPreset,
}) => {
  const [presets, setPresets] = useState<any[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchPresets = () => {
    fetch('/api/presets')
      .then((res) => res.json())
      .then((data) => {
        if (data.presets) setPresets(data.presets);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (isOpen) fetchPresets();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrentAsPreset = async () => {
    if (!newPresetName.trim()) return;

    try {
      const res = await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPresetName.trim(),
          state: {
            eventName: currentState.eventName,
            eventType: currentState.eventType,
            teamA: currentState.teamA,
            teamB: currentState.teamB,
            scoreA: currentState.scoreA,
            scoreB: currentState.scoreB,
            boSeries: currentState.boSeries,
            currentPeriod: currentState.currentPeriod,
            stats: currentState.stats,
            sponsors: currentState.sponsors,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSaving(false);
        setNewPresetName('');
        fetchPresets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePreset = async (id: string) => {
    try {
      await fetch(`/api/presets?id=${id}`, { method: 'DELETE' });
      fetchPresets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel rounded-3xl w-full max-w-2xl border border-amber-500/40 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading font-extrabold text-lg text-white">1-CLICK PRESET MANAGER</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-mono">
            Load full match configurations, roster & overlay templates with 1 click
          </span>
          <button
            onClick={() => setIsSaving(!isSaving)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold font-heading shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{isSaving ? 'Cancel' : 'Save Current State as Preset'}</span>
          </button>
        </div>

        {/* Save Current State Form */}
        {isSaving && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-3">
            <h4 className="font-heading font-bold text-xs text-amber-400 uppercase">SAVE NEW PRESET</h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Preset Name (e.g. Finals: Team A vs Team B)..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveCurrentAsPreset()}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                autoFocus
              />
              <button
                onClick={handleSaveCurrentAsPreset}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-heading shadow-md"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Preset Cards List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto p-1">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4 hover:border-amber-500/40 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${
                    preset.eventType === 'SPORT'
                      ? 'bg-blue-950 text-blue-400 border border-blue-800'
                      : preset.eventType === 'ESPORT_MOBA'
                      ? 'bg-purple-950 text-purple-400 border border-purple-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {preset.eventType}
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-white">{preset.name}</h4>
                  <div className="text-[11px] text-gray-400 font-mono">
                    {preset.teamA?.name || 'TBD'} vs {preset.teamB?.name || 'TBD'} • {preset.eventName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onLoadPreset(preset);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold font-heading shadow-md transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Apply Preset</span>
                </button>
                <button
                  onClick={() => handleDeletePreset(preset.id)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-950/40"
                  title="Delete Preset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
