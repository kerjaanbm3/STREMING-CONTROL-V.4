import React, { useState } from 'react';
import { LiveBroadcastState, BRStandingItem } from '@/lib/types';
import { Trophy, Plus, Minus, Trash2, Crown, Flame, ArrowUpDown } from 'lucide-react';

interface BRStandingsControllerProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
  triggerAlert: (alert: any) => void;
}

// Standard PUBG / Free Fire Placement point table
const DEFAULT_PLACEMENT_POINTS: Record<number, number> = {
  1: 10,
  2: 6,
  3: 5,
  4: 4,
  5: 3,
  6: 2,
  7: 1,
  8: 1,
};

export const BRStandingsController: React.FC<BRStandingsControllerProps> = ({
  state,
  updateState,
  triggerAlert,
}) => {
  const [newTeamName, setNewTeamName] = useState('');

  const calculateTotal = (placementRank: number, killPoints: number) => {
    const placementPts = DEFAULT_PLACEMENT_POINTS[placementRank] || 0;
    return placementPts + killPoints;
  };

  const handleRankChange = (index: number, newRank: number) => {
    const standings = [...state.brStandings];
    standings[index].placementRank = newRank;
    standings[index].totalPoints = calculateTotal(newRank, standings[index].killPoints);
    updateState({ brStandings: standings });
  };

  const handleKillChange = (index: number, delta: number) => {
    const standings = [...state.brStandings];
    const newKills = Math.max(0, standings[index].killPoints + delta);
    standings[index].killPoints = newKills;
    standings[index].totalPoints = calculateTotal(standings[index].placementRank, newKills);
    updateState({ brStandings: standings });
  };

  const handleAutoSort = () => {
    const sorted = [...state.brStandings].sort((a, b) => b.totalPoints - a.totalPoints);
    updateState({ brStandings: sorted });
  };

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    const newItem: BRStandingItem = {
      teamId: 'team_' + Date.now(),
      teamName: newTeamName.trim().toUpperCase(),
      placementRank: state.brStandings.length + 1,
      killPoints: 0,
      totalPoints: calculateTotal(state.brStandings.length + 1, 0),
      logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(newTeamName)}`,
    };
    updateState({ brStandings: [...state.brStandings, newItem] });
    setNewTeamName('');
  };

  const handleRemoveTeam = (index: number) => {
    const standings = state.brStandings.filter((_, i) => i !== index);
    updateState({ brStandings: standings });
  };

  const handleWinnerCelebration = (team: BRStandingItem) => {
    triggerAlert({
      type: 'WWCD',
      teamName: team.teamName,
      title: 'WINNER WINNER CHICKEN DINNER!',
      subtitle: `${team.teamName} TAKES THE VICTORY!`,
      durationMs: 8000,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. BR Controls Header */}
      <div className="glass-panel rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>BATTLE ROYALE MATCH LEADERBOARD</span>
          </h2>
          <p className="text-xs text-gray-400">
            Real-time automated calculation of Placement Points + Elimination Points
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoSort}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-gray-200 border border-slate-700 transition-all active:scale-95"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
            <span>Auto-Sort by Points</span>
          </button>
        </div>
      </div>

      {/* 2. Standings Table Editor */}
      <div className="glass-panel rounded-2xl p-5 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-gray-400 font-mono">
              <th className="pb-3 px-2">RANK</th>
              <th className="pb-3 px-2">TEAM</th>
              <th className="pb-3 px-2 text-center">PLACEMENT PTS</th>
              <th className="pb-3 px-2 text-center">KILLS</th>
              <th className="pb-3 px-2 text-center">TOTAL PTS</th>
              <th className="pb-3 px-2 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {state.brStandings.map((team, idx) => (
              <tr key={team.teamId} className="hover:bg-slate-900/40 transition-colors">
                {/* Placement Rank */}
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1.5">
                    {idx === 0 ? (
                      <Crown className="w-4 h-4 text-amber-400" />
                    ) : (
                      <span className="w-5 text-center font-mono font-bold text-gray-400">#{idx + 1}</span>
                    )}
                  </div>
                </td>

                {/* Team Info */}
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={team.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=BR'}
                      alt={team.teamName}
                      className="w-8 h-8 rounded-lg object-contain bg-slate-900 border border-slate-700 p-1"
                    />
                    <span className="font-heading font-extrabold text-sm text-white">{team.teamName}</span>
                  </div>
                </td>

                {/* Placement Rank Selector */}
                <td className="py-3 px-2 text-center">
                  <select
                    value={team.placementRank}
                    onChange={(e) => handleRankChange(idx, parseInt(e.target.value, 10))}
                    className="bg-slate-900 text-white font-mono font-semibold px-2 py-1 rounded border border-slate-700 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((r) => (
                      <option key={r} value={r}>
                        #{r} ({DEFAULT_PLACEMENT_POINTS[r] || 0} pts)
                      </option>
                    ))}
                  </select>
                </td>

                {/* Kills Counter */}
                <td className="py-3 px-2 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleKillChange(idx, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-gray-300 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-digits font-bold text-base text-rose-400 w-8 text-center">
                      {team.killPoints}
                    </span>
                    <button
                      onClick={() => handleKillChange(idx, 1)}
                      className="w-6 h-6 rounded bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </td>

                {/* Total Points */}
                <td className="py-3 px-2 text-center">
                  <span className="font-digits font-extrabold text-lg text-amber-400 bg-amber-950/40 border border-amber-500/30 px-3 py-0.5 rounded-lg">
                    {team.totalPoints} PTS
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 px-2 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleWinnerCelebration(team)}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-[11px] font-bold shadow-md hover:brightness-110"
                      title="Trigger WWCD / Winner Screen"
                    >
                      🏆 WWCD!
                    </button>
                    <button
                      onClick={() => handleRemoveTeam(idx)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-gray-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add Team Input */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Add new squad / team name..."
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={handleAddTeam}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold font-heading shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Team</span>
          </button>
        </div>
      </div>
    </div>
  );
};
