import React, { useState, useEffect } from 'react';
import { LiveBroadcastState } from '@/lib/types';
import { Radio, Menu } from 'lucide-react';

interface HeaderBarProps {
  state: LiveBroadcastState | null;
  socketConnected: boolean;
  onToggleMobileMenu?: () => void;
  onEventTypeChange?: (type: any) => void;
  onOpenObsModal?: () => void;
  onOpenTeamManager?: () => void;
  onOpenPresetManager?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  state,
  socketConnected,
  onToggleMobileMenu,
}) => {
  const [timecode, setTimecode] = useState('00:00:00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const f = String(Math.floor((now.getMilliseconds() / 1000) * 30)).padStart(2, '0');
      setTimecode(`${h}:${m}:${s}:${f}`);
    }, 33);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#0c0c0e] border-b border-[#1e1e24] px-4 md:px-5 py-2 z-30 flex items-center justify-between gap-4 select-none shrink-0">
      {/* Studio Master Time & Live Status */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Toggle */}
        <button 
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 -ml-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 bg-[#141417] px-3 py-1 rounded-lg border border-[#23232a]">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-rose-400 tracking-wider">
            PGM LIVE
          </span>
          <div className="h-3 w-[1px] bg-zinc-700" />
          <span className="text-xs font-mono font-bold text-zinc-200">
            {timecode}
          </span>
        </div>

        <span className="text-xs text-zinc-400 font-medium hidden md:inline truncate max-w-sm">
          {state?.eventName ? `Acara: ${state.eventName}` : 'Broadcast Control Desk'}
        </span>
      </div>

      {/* Clean Connection Status Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border ${
            socketConnected
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
              : 'bg-rose-950/40 text-rose-300 border-rose-800'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          <span>{socketConnected ? 'Live Sync' : 'Offline'}</span>
        </div>
      </div>
    </header>
  );
};
