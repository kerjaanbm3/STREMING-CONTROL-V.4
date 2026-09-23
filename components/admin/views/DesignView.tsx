import React from 'react';
import { LiveBroadcastState, LayerVisibility, ThemeConfig } from '@/lib/types';
import { Palette, Layers as LayersIcon, Eye, EyeOff, LayoutTemplate } from 'lucide-react';

interface DesignViewProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
}

export const DesignView: React.FC<DesignViewProps> = ({ state, updateState }) => {
  const { theme, layers } = state;

  // Safeguard: Ensure theme and layers are defined
  if (!theme || !layers) {
    return <div className="text-white p-4">Loading design state...</div>;
  }

  const handleLayerToggle = (layerKey: keyof LayerVisibility) => {
    updateState({
      layers: {
        ...layers,
        [layerKey]: !layers[layerKey],
      },
    });
  };

  const handleThemeChange = (key: keyof ThemeConfig, value: string | number | boolean) => {
    updateState({
      theme: {
        ...theme,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-black text-white flex items-center gap-2">
          <Palette className="w-6 h-6 text-purple-400" />
          DESIGN & LAYERS EDITOR
        </h2>
        <span className="text-xs font-mono bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30">
          Live Sync Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LAYERS MANAGER */}
        <div className="bg-[#121215] border border-[#23232a] rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <LayersIcon className="w-4 h-4 text-zinc-400" />
            LAYERS MANAGER (VISIBILITY)
          </h3>
          <div className="space-y-2">
            {Object.keys(layers).map((key) => {
              const layerKey = key as keyof LayerVisibility;
              const isVisible = layers[layerKey];
              return (
                <div
                  key={layerKey}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    isVisible
                      ? 'bg-blue-900/20 border-blue-500/30'
                      : 'bg-[#18181b] border-zinc-800'
                  }`}
                >
                  <span className="text-sm font-mono font-bold capitalize text-white">
                    {layerKey.replace(/([A-Z])/g, ' $1').trim()} Overlay
                  </span>
                  <button
                    onClick={() => handleLayerToggle(layerKey)}
                    className={`px-3 py-1.5 flex items-center gap-2 rounded text-xs font-bold transition-all ${
                      isVisible
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {isVisible ? 'SHOWING' : 'HIDDEN'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* THEME & DESIGN CONFIG */}
        <div className="bg-[#121215] border border-[#23232a] rounded-xl p-5 shadow-lg space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-zinc-400" />
            GLOBAL THEME CONFIG
          </h3>

          <div className="space-y-4">
            {/* Color Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-400 mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                    className="bg-[#18181b] border border-zinc-800 rounded px-3 py-2 text-sm text-white w-full uppercase font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-400 mb-2">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={theme.secondaryColor}
                    onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                    className="bg-[#18181b] border border-zinc-800 rounded px-3 py-2 text-sm text-white w-full uppercase font-mono"
                  />
                </div>
              </div>
            </div>
            
            {/* Background Color */}
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 mb-2">Background Color</label>
              <div className="flex items-center gap-3 max-w-[50%]">
                <input
                  type="color"
                  value={theme.backgroundColor}
                  onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={theme.backgroundColor}
                  onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                  className="bg-[#18181b] border border-zinc-800 rounded px-3 py-2 text-sm text-white w-full uppercase font-mono"
                />
              </div>
            </div>

            {/* UI Scale Slider */}
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono font-bold text-zinc-400">Overlay Global Scale</label>
                <span className="text-white font-mono font-bold">{(theme.scale * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={theme.scale}
                onChange={(e) => handleThemeChange('scale', parseFloat(e.target.value))}
                className="w-full accent-purple-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                <span>Smaller (50%)</span>
                <span>Default (100%)</span>
                <span>Larger (150%)</span>
              </div>
            </div>

            {/* Glassmorphism Toggle */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <div>
                <label className="text-sm font-bold text-white">Glassmorphism Mode</label>
                <p className="text-xs text-zinc-500 mt-1">Enable blurred transparent background on overlays.</p>
              </div>
              <button
                onClick={() => handleThemeChange('isGlassmorphism', !theme.isGlassmorphism)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  theme.isGlassmorphism ? 'bg-purple-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme.isGlassmorphism ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
