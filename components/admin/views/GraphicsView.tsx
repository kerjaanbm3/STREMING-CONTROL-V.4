import React from 'react';
import { LiveBroadcastState } from '@/lib/types';
import { LowerThirdController } from '@/components/admin/LowerThirdController';
import { SponsorManager } from '@/components/admin/SponsorManager';
import { Image as ImageIcon } from 'lucide-react';

interface GraphicsViewProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
}

export const GraphicsView: React.FC<GraphicsViewProps> = ({ state, updateState }) => {
  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between pb-1 border-b border-[#232a3b]">
        <h2 className="font-mono font-bold text-sm text-slate-100 uppercase flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-400" />
          <span>BROADCAST GRAPHICS & ON-SCREEN DSK CHANNELS</span>
        </h2>
        <span className="text-[10px] font-mono text-slate-400">DOWNSTREAM KEYER BUS</span>
      </div>

      {/* Lower Thirds */}
      <LowerThirdController state={state} updateState={updateState} />

      {/* Sponsor Carousel */}
      <SponsorManager state={state} updateState={updateState} />
    </div>
  );
};
