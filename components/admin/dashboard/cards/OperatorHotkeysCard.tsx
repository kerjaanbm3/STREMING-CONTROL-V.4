import React from 'react';
import { Keyboard } from 'lucide-react';

export const renderOperatorHotkeys = () => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1.5">
        <Keyboard className="w-3.5 h-3.5 text-blue-400" />
        <span className="font-heading font-bold text-xs text-white uppercase">Operator Hotkeys</span>
      </div>
      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-1.5 py-0.5 rounded font-bold">ARMED</span>
    </div>
    <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
      <div className="flex-1 min-w-[110px] p-1.5 rounded bg-[#141417] border border-[#23232a] flex justify-between items-center"><span className="text-zinc-400">Score A</span><kbd className="px-1 py-0.5 bg-[#1c1c21] border border-zinc-700 text-blue-400 rounded font-bold truncate">Num7/+</kbd></div>
      <div className="flex-1 min-w-[110px] p-1.5 rounded bg-[#141417] border border-[#23232a] flex justify-between items-center"><span className="text-zinc-400">Score B</span><kbd className="px-1 py-0.5 bg-[#1c1c21] border border-zinc-700 text-blue-400 rounded font-bold truncate">Num9/+</kbd></div>
      <div className="flex-1 min-w-[110px] p-1.5 rounded bg-[#141417] border border-[#23232a] flex justify-between items-center"><span className="text-zinc-400">Clock</span><kbd className="px-1 py-0.5 bg-[#1c1c21] border border-zinc-700 text-amber-400 rounded font-bold truncate">Space</kbd></div>
      <div className="flex-1 min-w-[110px] p-1.5 rounded bg-[#141417] border border-[#23232a] flex justify-between items-center"><span className="text-zinc-400">Alert</span><kbd className="px-1 py-0.5 bg-[#1c1c21] border border-zinc-700 text-rose-400 rounded font-bold truncate">Key G</kbd></div>
      <div className="flex-1 min-w-[110px] p-1.5 rounded bg-[#141417] border border-[#23232a] flex justify-between items-center"><span className="text-zinc-400">Lower 3rd</span><kbd className="px-1 py-0.5 bg-[#1c1c21] border border-zinc-700 text-indigo-400 rounded font-bold truncate">Key L</kbd></div>
      <div className="flex-1 min-w-[110px] p-1.5 rounded bg-[#141417] border border-[#23232a] flex justify-between items-center"><span className="text-zinc-400">Sponsor</span><kbd className="px-1 py-0.5 bg-[#1c1c21] border border-zinc-700 text-emerald-400 rounded font-bold truncate">Key S</kbd></div>
    </div>
  </div>
);
