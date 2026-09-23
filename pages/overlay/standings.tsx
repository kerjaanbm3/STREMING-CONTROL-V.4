import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { Crown, Trophy, Skull } from 'lucide-react';

export default function StandingsOverlay() {
  const { state } = useSocket();

  if (!state) {
    return <div className="bg-transparent" />;
  }

  // Sorted standings
  const standings = [...state.brStandings].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <>
      <Head>
        <title>Battle Royale Standings Overlay - BM3 Broadcast</title>
      </Head>

      <div className="w-screen h-screen bg-transparent p-8 flex flex-col justify-center items-center select-none overflow-hidden font-sans text-white">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl rounded-3xl bg-[#080d1a]/95 border border-white/15 backdrop-blur-2xl shadow-2xl p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-heading font-black text-2xl text-white tracking-wide uppercase">
                  MATCH OVERALL STANDINGS
                </h1>
                <p className="text-xs text-amber-400 font-mono font-semibold">
                  {state.eventName} • {state.currentPeriod || 'ROUND 1'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-700/60 px-3 py-1 rounded-full uppercase">
                PLACEMENT + ELIMINATION PTS
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="space-y-2">
            {standings.slice(0, 10).map((team, idx) => (
              <motion.div
                key={team.teamId}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  idx === 0
                    ? 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-amber-400 shadow-lg shadow-amber-500/20'
                    : idx === 1
                    ? 'bg-slate-900/80 border-slate-600'
                    : idx === 2
                    ? 'bg-slate-900/70 border-amber-900/60'
                    : 'bg-slate-950/60 border-white/5'
                }`}
              >
                {/* Rank & Team Name */}
                <div className="flex items-center gap-4">
                  <div className="w-8 text-center flex items-center justify-center">
                    {idx === 0 ? (
                      <Crown className="w-6 h-6 text-amber-400 animate-bounce" />
                    ) : (
                      <span className="font-digits font-extrabold text-xl text-gray-300">#{idx + 1}</span>
                    )}
                  </div>
                  <img
                    src={team.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=BR'}
                    alt={team.teamName}
                    className="w-9 h-9 rounded-xl object-contain bg-slate-900 p-1 border border-white/10"
                  />
                  <span className="font-heading font-extrabold text-base text-white tracking-wide">
                    {team.teamName}
                  </span>
                </div>

                {/* Score breakdown */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                    <Skull className="w-4 h-4 text-rose-400" />
                    <span className="font-bold text-white text-sm">{team.killPoints}</span>
                    <span>kills</span>
                  </div>

                  <div className="min-w-[100px] text-right">
                    <span className="font-digits font-black text-2xl text-amber-400">
                      {team.totalPoints} <span className="text-xs font-mono font-bold text-amber-300">PTS</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
