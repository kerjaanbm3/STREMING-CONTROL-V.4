import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { Trophy, Flame, Shield, Award } from 'lucide-react';

export default function SummaryOverlay() {
  const { state } = useSocket();

  if (!state) {
    return <div className="bg-transparent" />;
  }

  const isTeamAWinner = state.scoreA > state.scoreB;
  const isDraw = state.scoreA === state.scoreB;

  return (
    <>
      <Head>
        <title>Match Summary Overlay - BM3 Broadcast</title>
      </Head>

      <div className="w-screen h-screen bg-gradient-to-tr from-[#050811] via-[#091124] to-[#050811] p-10 flex flex-col justify-between select-none overflow-hidden font-sans text-white">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between px-8 py-4 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <h1 className="font-heading font-black text-xl text-white uppercase">{state.eventName}</h1>
              <p className="text-xs text-amber-400 font-mono">POST-MATCH FINAL SUMMARY & STATISTICS</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded-full uppercase">
            FULL TIME • {state.currentPeriod || 'FINAL SCORE'}
          </span>
        </motion.div>

        {/* Center Comparison Card & Big Score */}
        <div className="max-w-4xl mx-auto w-full my-auto space-y-6">
          {/* Big Score Header */}
          <div className="grid grid-cols-12 gap-4 items-center bg-slate-950/80 p-6 rounded-3xl border border-white/15 backdrop-blur-2xl shadow-2xl">
            {/* Team A */}
            <div className="col-span-5 flex items-center gap-4">
              <img
                src={state.teamA.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=A'}
                alt={state.teamA.name}
                className="w-16 h-16 rounded-2xl object-contain bg-slate-900 p-2 border border-rose-500/40 shadow-lg"
              />
              <div>
                <h2 className="font-heading font-black text-xl text-white uppercase">{state.teamA.name}</h2>
                {isTeamAWinner && (
                  <span className="text-[10px] font-mono font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                    WINNER
                  </span>
                )}
              </div>
            </div>

            {/* Score Big Display */}
            <div className="col-span-2 flex items-center justify-center gap-2">
              <span className="font-digits font-black text-5xl text-white">{state.scoreA}</span>
              <span className="font-mono text-2xl text-gray-500">-</span>
              <span className="font-digits font-black text-5xl text-white">{state.scoreB}</span>
            </div>

            {/* Team B */}
            <div className="col-span-5 flex items-center gap-4 flex-row-reverse text-right">
              <img
                src={state.teamB.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=B'}
                alt={state.teamB.name}
                className="w-16 h-16 rounded-2xl object-contain bg-slate-900 p-2 border border-blue-500/40 shadow-lg"
              />
              <div>
                <h2 className="font-heading font-black text-xl text-white uppercase">{state.teamB.name}</h2>
                {!isTeamAWinner && !isDraw && (
                  <span className="text-[10px] font-mono font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                    WINNER
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Breakdown Card */}
          <div className="bg-slate-950/80 p-6 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-xl space-y-4">
            <h3 className="text-xs font-mono font-bold text-gray-400 text-center uppercase tracking-widest">
              OVERALL MATCH STATS
            </h3>

            {/* Possession */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-rose-400">{state.stats.possessionA}%</span>
                <span className="text-gray-300">Ball Possession</span>
                <span className="text-blue-400">{state.stats.possessionB}%</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-slate-800 flex">
                <div style={{ width: `${state.stats.possessionA}%` }} className="bg-rose-500 h-full" />
                <div style={{ width: `${state.stats.possessionB}%` }} className="bg-blue-500 h-full" />
              </div>
            </div>

            {/* Shots on Target */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
              <span className="font-digits font-black text-lg text-white w-12 text-left">{state.stats.shotsOnTargetA}</span>
              <span className="text-gray-400 font-medium">Shots on Target</span>
              <span className="font-digits font-black text-lg text-white w-12 text-right">{state.stats.shotsOnTargetB}</span>
            </div>

            {/* Corner Kicks */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
              <span className="font-digits font-black text-lg text-white w-12 text-left">{state.stats.cornersA}</span>
              <span className="text-gray-400 font-medium">Corner Kicks</span>
              <span className="font-digits font-black text-lg text-white w-12 text-right">{state.stats.cornersB}</span>
            </div>

            {/* Fouls */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
              <span className="font-digits font-black text-lg text-white w-12 text-left">{state.stats.foulsA}</span>
              <span className="text-gray-400 font-medium">Fouls Committed</span>
              <span className="font-digits font-black text-lg text-white w-12 text-right">{state.stats.foulsB}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-3 rounded-2xl bg-slate-950/90 border border-white/10 backdrop-blur-xl">
          <span className="text-xs font-mono text-gray-400">BM3 HYBRID BROADCAST SYSTEM</span>
          <span className="text-xs font-mono text-amber-400">THANK YOU FOR WATCHING</span>
        </div>
      </div>
    </>
  );
}
