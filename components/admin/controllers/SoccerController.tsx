import React from 'react';
import { LiveBroadcastState } from '@/lib/types';
import { Flame, Zap, Activity, Keyboard, MonitorPlay } from 'lucide-react';
import { BaseControllerDashboard, CardDefinition } from '../dashboard/BaseControllerDashboard';
import { renderProgramMonitor } from '../dashboard/cards/ProgramMonitorCard';
import { renderOperatorHotkeys } from '../dashboard/cards/OperatorHotkeysCard';

interface SoccerControllerProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
  triggerAlert: (alert: any) => void;
}

export const SoccerController: React.FC<SoccerControllerProps> = ({
  state,
  updateState,
  triggerAlert,
}) => {
  // --- ACTIONS ---
  const handleScoreChange = (team: 'A' | 'B', delta: number) => {
    if (team === 'A') {
      updateState({ scoreA: Math.max(0, state.scoreA + delta) });
    } else {
      updateState({ scoreB: Math.max(0, state.scoreB + delta) });
    }
  };

  const handleGoalTrigger = (teamType: 'TEAM_A' | 'TEAM_B') => {
    handleScoreChange(teamType === 'TEAM_A' ? 'A' : 'B', 1);
    triggerAlert({
      type: 'GOAL', teamType, teamName: teamType === 'TEAM_A' ? state.teamA.name : state.teamB.name,
      title: 'GOOOOOAL!', subtitle: 'Mencetak Gol!', durationMs: 5000,
    });
  };

  const handleCardTrigger = (teamType: 'TEAM_A' | 'TEAM_B', cardType: 'YELLOW_CARD' | 'RED_CARD') => {
    triggerAlert({
      type: cardType, teamType, teamName: teamType === 'TEAM_A' ? state.teamA.name : state.teamB.name,
      title: cardType.replace('_', ' '), subtitle: `Peringatan!`, durationMs: 4000,
    });
  };

  const updateStat = (field: keyof typeof state.stats, value: number) => {
    updateState({ stats: { ...state.stats, [field]: value } });
  };

  // --- RENDERERS ---
  const renderScoreAlerts = () => (
    <div className="flex flex-wrap gap-3">
      {/* Team A */}
      <div className="flex-1 min-w-[130px] p-2 bg-[#0a0d14] border border-[#1e2535] rounded-lg text-center space-y-2">
        <div className="font-bold text-xs text-slate-300 truncate px-1" title={state.teamA.name || 'Team A'}>{state.teamA.name || 'Team A'}</div>
        <div className="text-3xl font-black text-white leading-none">{state.scoreA}</div>
        <div className="flex justify-center gap-1.5">
          <button onClick={() => handleScoreChange('A', -1)} className="btn-broadcast px-2 py-1 text-xs font-bold">-1</button>
          <button onClick={() => handleScoreChange('A', 1)} className="btn-primary px-2 py-1 text-xs font-bold">+1</button>
        </div>
        <button onClick={() => handleGoalTrigger('TEAM_A')} className="w-full btn-primary bg-emerald-600 hover:bg-emerald-500 py-1.5 text-[10px] font-bold mt-1 flex justify-center items-center gap-1">
          <Flame className="w-3 h-3" /> GOAL
        </button>
        <div className="flex gap-1.5">
          <button onClick={() => handleCardTrigger('TEAM_A', 'YELLOW_CARD')} className="flex-1 bg-yellow-600/20 text-yellow-500 border border-yellow-600 hover:bg-yellow-600/40 py-1 text-[9px] font-bold rounded truncate">YC</button>
          <button onClick={() => handleCardTrigger('TEAM_A', 'RED_CARD')} className="flex-1 bg-red-600/20 text-red-500 border border-red-600 hover:bg-red-600/40 py-1 text-[9px] font-bold rounded truncate">RC</button>
        </div>
      </div>
      {/* Team B */}
      <div className="flex-1 min-w-[130px] p-2 bg-[#0a0d14] border border-[#1e2535] rounded-lg text-center space-y-2">
        <div className="font-bold text-xs text-slate-300 truncate px-1" title={state.teamB.name || 'Team B'}>{state.teamB.name || 'Team B'}</div>
        <div className="text-3xl font-black text-white leading-none">{state.scoreB}</div>
        <div className="flex justify-center gap-1.5">
          <button onClick={() => handleScoreChange('B', -1)} className="btn-broadcast px-2 py-1 text-xs font-bold">-1</button>
          <button onClick={() => handleScoreChange('B', 1)} className="btn-primary px-2 py-1 text-xs font-bold">+1</button>
        </div>
        <button onClick={() => handleGoalTrigger('TEAM_B')} className="w-full btn-primary bg-emerald-600 hover:bg-emerald-500 py-1.5 text-[10px] font-bold mt-1 flex justify-center items-center gap-1">
          <Flame className="w-3 h-3" /> GOAL
        </button>
        <div className="flex gap-1.5">
          <button onClick={() => handleCardTrigger('TEAM_B', 'YELLOW_CARD')} className="flex-1 bg-yellow-600/20 text-yellow-500 border border-yellow-600 hover:bg-yellow-600/40 py-1 text-[9px] font-bold rounded truncate">YC</button>
          <button onClick={() => handleCardTrigger('TEAM_B', 'RED_CARD')} className="flex-1 bg-red-600/20 text-red-500 border border-red-600 hover:bg-red-600/40 py-1 text-[9px] font-bold rounded truncate">RC</button>
        </div>
      </div>
    </div>
  );

  const renderMatchStats = () => (
    <div className="space-y-4">
      <div className="p-3 rounded bg-[#0a0d14] border border-[#1e2535]">
        <div className="flex justify-between text-xs font-mono font-bold mb-2">
          <span className="text-blue-400">{state.stats.possessionA}%</span>
          <span className="text-slate-400 uppercase">BALL POSSESSION</span>
          <span className="text-rose-400">{100 - state.stats.possessionA}%</span>
        </div>
        <input type="range" min="0" max="100" value={state.stats.possessionA}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            updateStat('possessionA', val); updateStat('possessionB', 100 - val);
          }}
          className="w-full h-2 bg-[#121622] rounded appearance-none cursor-pointer accent-blue-500"
        />
      </div>
      <div className="space-y-2 text-xs font-mono">
        <div className="p-2 rounded bg-[#0a0d14] border border-[#1e2535] flex flex-col gap-1.5">
          <div className="text-center text-slate-400 font-bold uppercase text-[9px] leading-none">Shots on Target</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button onClick={() => updateStat('shotsOnTargetA', Math.max(0, state.stats.shotsOnTargetA - 1))} className="btn-broadcast w-5 h-5 flex items-center justify-center rounded font-bold">-</button>
              <span className="w-5 text-center font-bold text-white text-[11px]">{state.stats.shotsOnTargetA}</span>
              <button onClick={() => updateStat('shotsOnTargetA', state.stats.shotsOnTargetA + 1)} className="btn-primary w-5 h-5 flex items-center justify-center rounded font-bold">+</button>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => updateStat('shotsOnTargetB', Math.max(0, state.stats.shotsOnTargetB - 1))} className="btn-broadcast w-5 h-5 flex items-center justify-center rounded font-bold">-</button>
              <span className="w-5 text-center font-bold text-white text-[11px]">{state.stats.shotsOnTargetB}</span>
              <button onClick={() => updateStat('shotsOnTargetB', state.stats.shotsOnTargetB + 1)} className="btn-primary w-5 h-5 flex items-center justify-center rounded font-bold">+</button>
            </div>
          </div>
        </div>
        <div className="p-2 rounded bg-[#0a0d14] border border-[#1e2535] flex flex-col gap-1.5">
          <div className="text-center text-slate-400 font-bold uppercase text-[9px] leading-none">Corners</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button onClick={() => updateStat('cornersA', Math.max(0, state.stats.cornersA - 1))} className="btn-broadcast w-5 h-5 flex items-center justify-center rounded font-bold">-</button>
              <span className="w-5 text-center font-bold text-white text-[11px]">{state.stats.cornersA}</span>
              <button onClick={() => updateStat('cornersA', state.stats.cornersA + 1)} className="btn-primary w-5 h-5 flex items-center justify-center rounded font-bold">+</button>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => updateStat('cornersB', Math.max(0, state.stats.cornersB - 1))} className="btn-broadcast w-5 h-5 flex items-center justify-center rounded font-bold">-</button>
              <span className="w-5 text-center font-bold text-white text-[11px]">{state.stats.cornersB}</span>
              <button onClick={() => updateStat('cornersB', state.stats.cornersB + 1)} className="btn-primary w-5 h-5 flex items-center justify-center rounded font-bold">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const cards: CardDefinition[] = [
    { type: 'SCORE_ALERTS', label: 'Score & Alerts', icon: <Zap className="w-3.5 h-3.5" />, render: renderScoreAlerts },
    { type: 'MATCH_STATS', label: 'Match Statistics', icon: <Activity className="w-3.5 h-3.5" />, render: renderMatchStats },
    { type: 'PROGRAM_MONITOR', label: 'Program Monitor', icon: <MonitorPlay className="w-3.5 h-3.5" />, render: renderProgramMonitor },
    { type: 'OPERATOR_HOTKEYS', label: 'Operator Hotkeys', icon: <Keyboard className="w-3.5 h-3.5" />, render: renderOperatorHotkeys },
  ];

  return (
    <BaseControllerDashboard 
      cards={cards} 
      storageKey="soccer_controller_templates" 
      defaultLayout={[
        { type: 'SCORE_ALERTS', size: 12 },
        { type: 'MATCH_STATS', size: 12 }
      ]}
    />
  );
};
