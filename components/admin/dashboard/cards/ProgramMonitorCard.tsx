import React from 'react';
import { Grid3X3, RefreshCw, ExternalLink, MonitorPlay, Camera, Video } from 'lucide-react';

export const renderProgramMonitor = () => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        <span className="font-heading font-bold text-xs text-white uppercase tracking-wide">Program Monitor (PGM)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button className="p-1.5 rounded-md border text-xs transition-all min-btn text-zinc-400" title="Toggle Safe Margins (90% / 80%)"><Grid3X3 className="w-3.5 h-3.5" /></button>
        <button className="min-btn p-1.5 text-zinc-400 hover:text-white" title="Reload Preview Frame"><RefreshCw className="w-3.5 h-3.5" /></button>
        <a target="_blank" className="min-btn p-1.5 text-zinc-400 hover:text-white" title="Open in Fullscreen Browser Source" href="/overlay/scoreboard"><ExternalLink className="w-3.5 h-3.5" /></a>
      </div>
    </div>
    
    <div className="flex gap-1 p-1 bg-[#0d0d10] rounded-lg border border-zinc-800">
      <button className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition-all bg-blue-600 text-white shadow-lg shadow-blue-900/40"><MonitorPlay className="w-3 h-3" />OVERLAY</button>
      <button className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition-all text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"><Camera className="w-3 h-3" />CAMERA</button>
      <button className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition-all text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"><Video className="w-3 h-3" />SCREEN</button>
    </div>
    
    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-[#050507] flex items-center justify-center mt-3 mb-3">
      <iframe src="/overlay/scoreboard" title="Broadcast Monitor" className="absolute top-0 left-0 border-0 pointer-events-none select-none" style={{ width: 1920, height: 1080, transform: 'scale(0.167261)', transformOrigin: 'left top' }}></iframe>
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-zinc-800 text-[9px] font-mono font-bold text-zinc-400 z-20 max-w-[55%] truncate">SCOREBOARD</div>
    </div>

    <div className="pt-2 border-t border-[#1e1e24]">
      <div className="flex items-center justify-between mb-1.5"><div className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Channels:</div></div>
      <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
        <button className="p-1.5 rounded truncate text-center font-medium transition-colors bg-blue-600 text-white font-semibold">AUTO</button>
        <button className="p-1.5 rounded truncate text-center font-medium transition-colors min-btn text-zinc-400 hover:text-white">SCOREBOARD</button>
        <button className="p-1.5 rounded truncate text-center font-medium transition-colors min-btn text-zinc-400 hover:text-white">VS MATCHUP</button>
        <button className="p-1.5 rounded truncate text-center font-medium transition-colors min-btn text-zinc-400 hover:text-white">HERO DRAFT</button>
        <button className="p-1.5 rounded truncate text-center font-medium transition-colors min-btn text-zinc-400 hover:text-white">STANDINGS</button>
        <button className="p-1.5 rounded truncate text-center font-medium transition-colors min-btn text-zinc-400 hover:text-white">STARTING XI</button>
        <button className="p-1.5 rounded truncate text-center font-medium transition-colors min-btn text-zinc-400 hover:text-white">SUMMARY</button>
        <button className="p-1.5 rounded truncate text-center font-medium transition-colors min-btn text-zinc-400 hover:text-white">BREAK</button>
        <button className="p-1.5 rounded truncate text-center font-medium transition-colors min-btn text-zinc-400 hover:text-white">ENDING</button>
      </div>
    </div>
  </div>
);
