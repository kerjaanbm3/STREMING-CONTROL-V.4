import React, { useState } from 'react';
import { LiveBroadcastState } from '@/lib/types';
import { Mic, Radio, Award, MessageSquare, Clock, MonitorPlay, Keyboard } from 'lucide-react';
import { BaseControllerDashboard, CardDefinition } from '../dashboard/BaseControllerDashboard';
import { renderProgramMonitor } from '../dashboard/cards/ProgramMonitorCard';
import { renderOperatorHotkeys } from '../dashboard/cards/OperatorHotkeysCard';

interface GeneralEventControllerProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
  triggerAlert: (alert: any) => void;
}

export const GeneralEventController: React.FC<GeneralEventControllerProps> = ({
  state,
  updateState,
  triggerAlert,
}) => {
  const [topicInput, setTopicInput] = useState(state.currentTopic || 'Opening & Keynote Presentation');
  const [speakerInput, setSpeakerInput] = useState(state.speakerName || 'Dr. Ir. H. Ahmad Fauzi');
  const [roleInput, setRoleInput] = useState(state.speakerRole || 'Keynote Speaker & Tech Expert');

  const handleUpdateSpeaker = (e: React.FormEvent) => {
    e.preventDefault();
    updateState({
      speakerName: speakerInput,
      speakerRole: roleInput,
      caster: {
        ...state.caster,
        name: speakerInput,
        role: roleInput,
      },
    });
  };

  const handleToggleSpeakerDSK = () => {
    updateState({
      caster: {
        ...state.caster,
        visible: !state.caster.visible,
      },
    });
  };

  const handleSetTopic = (topic: string) => {
    setTopicInput(topic);
    updateState({ currentTopic: topic, tickerText: `SESI SAAT INI: ${topic.toUpperCase()} • BM3 LIVE EVENT STREAM` });
    triggerAlert({
      type: 'CUSTOM',
      title: 'SESI ACARA',
      subtitle: topic,
      durationMs: 4000,
    });
  };

  const renderLowerThirds = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
      {/* 1. Speaker / Presenter Lower Third Switcher */}
      <div className="p-3.5 rounded-xl bg-[#121215] border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-heading font-bold text-xs text-white uppercase">
              Nama Pembicara / Host (Lower Third)
            </span>
          </div>
          <button
            onClick={handleToggleSpeakerDSK}
            className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
              state.caster.visible
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {state.caster.visible ? '🔴 ON AIR' : '⚪ OFF AIR'}
          </button>
        </div>

        <form onSubmit={handleUpdateSpeaker} className="space-y-2 font-mono">
          <div>
            <label className="text-[10px] text-zinc-400 block mb-0.5">Nama Lengkap Pembicara / Bintang Tamu:</label>
            <input
              type="text"
              value={speakerInput}
              onChange={(e) => setSpeakerInput(e.target.value)}
              className="w-full bg-[#18181b] border border-zinc-700 rounded px-2.5 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 block mb-0.5">Gelar / Jabatan / Institusi:</label>
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              className="w-full bg-[#18181b] border border-zinc-700 rounded px-2.5 py-1.5 text-blue-300 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] uppercase tracking-wider"
          >
            Update Lower Third Pembicara
          </button>
        </form>
      </div>

      {/* 2. Topic & Agenda Rundown Switcher */}
      <div className="p-3.5 rounded-xl bg-[#121215] border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-heading font-bold text-xs text-white uppercase">
              Topik Sesi & Rundown Acara
            </span>
          </div>
          <span className="text-[9px] font-mono text-zinc-500">LIVE DSK</span>
        </div>

        <div className="space-y-1.5 font-mono text-[10px]">
          {[
            '1. Pembukaan & Sambutan Utama',
            '2. Sesi Paparan Materi / Keynote',
            '3. Diskusi Panel & Tanya Jawab (Q&A)',
            '4. Pengumuman Pemenang & Doorprize',
            '5. Penutupan & Foto Bersama',
          ].map((topic) => (
            <button
              key={topic}
              onClick={() => handleSetTopic(topic)}
              className={`w-full p-2 rounded-lg text-left transition-all border ${
                state.currentTopic === topic
                  ? 'bg-purple-950/60 border-purple-500 text-white font-bold shadow-sm'
                  : 'bg-[#18181b] border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const cards: CardDefinition[] = [
    { type: 'LOWER_THIRDS', label: 'Lower Thirds & Topics', icon: <Mic className="w-3.5 h-3.5" />, render: renderLowerThirds },
    { type: 'PROGRAM_MONITOR', label: 'Program Monitor', icon: <MonitorPlay className="w-3.5 h-3.5" />, render: renderProgramMonitor },
    { type: 'OPERATOR_HOTKEYS', label: 'Operator Hotkeys', icon: <Keyboard className="w-3.5 h-3.5" />, render: renderOperatorHotkeys },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-purple-950/30 border border-purple-800/40 text-purple-300 font-mono text-[11px]">
        <span className="font-bold flex items-center gap-1.5">
          <span>🎙️ KONTROLER KHUSUS TALKSHOW, SEMINAR & SHOW</span>
        </span>
        <span>LOWER THIRD PEMBICARA • RUNDOWN TOPIK • LIVE TICKER</span>
      </div>
      <BaseControllerDashboard 
        cards={cards} 
        storageKey="general_event_controller_templates" 
        defaultLayout={[
          { type: 'LOWER_THIRDS', size: 12 },
          { type: 'PROGRAM_MONITOR', size: 6 }
        ]}
      />
    </div>
  );
};
