import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { Users, Shield, Award } from 'lucide-react';

export default function LineupOverlay() {
  const { state } = useSocket();

  if (!state) {
    return <div className="bg-transparent" />;
  }

  // Sample Starting 11 players
  const playersA = [
    { number: 1, name: 'Andritany (GK)', role: 'Goalkeeper' },
    { number: 2, name: 'Rio Fahmi', role: 'Defender' },
    { number: 5, name: 'Ondrej Kudela', role: 'Defender' },
    { number: 23, name: 'Hansamu Yama', role: 'Defender' },
    { number: 11, name: 'Firza Andika', role: 'Defender' },
    { number: 10, name: 'Maciej Gajos', role: 'Midfielder' },
    { number: 24, name: 'Resky Fandi', role: 'Midfielder' },
    { number: 7, name: 'Ryo Matsumura', role: 'Midfielder' },
    { number: 25, name: 'Riko Simanjuntak', role: 'Forward' },
    { number: 9, name: 'Marko Simic', role: 'Forward' },
    { number: 99, name: 'Aji Kusuma', role: 'Forward' },
  ];

  return (
    <>
      <Head>
        <title>Starting Lineup Overlay - BM3 Broadcast</title>
      </Head>

      <div className="w-screen h-screen bg-gradient-to-b from-[#06080e]/95 via-[#0b101c]/90 to-[#06080e]/95 p-8 flex flex-col justify-between select-none overflow-hidden font-sans text-white">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between px-8 py-4 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <img
              src={state.teamA.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=A'}
              alt={state.teamA.name}
              className="w-12 h-12 rounded-xl object-contain bg-slate-900 p-2 border border-rose-500/40 shadow-lg"
            />
            <div>
              <span className="text-xs font-mono font-bold text-rose-400 uppercase">STARTING XI LINEUP & FORMATION (4-3-3)</span>
              <h1 className="font-heading font-black text-2xl text-white tracking-wider uppercase">{state.teamA.name}</h1>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-gray-400">
            {state.eventName} • {state.currentPeriod || 'MATCHDAY'}
          </div>
        </motion.div>

        {/* 11 Players Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 my-auto max-w-6xl mx-auto w-full">
          {playersA.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-digits font-black text-xl text-white shadow-md">
                  {p.number}
                </div>
                <div>
                  <div className="font-heading font-black text-sm text-white uppercase">{p.name}</div>
                  <div className="text-[11px] font-mono text-gray-400">{p.role}</div>
                </div>
              </div>
              <Award className="w-4 h-4 text-amber-400/60" />
            </motion.div>
          ))}
        </div>

        {/* Footer Sponsor Bar */}
        <div className="flex items-center justify-between px-8 py-3 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl">
          <span className="text-xs font-mono text-gray-400 uppercase">HEAD COACH: THOMAS DOL</span>
          <span className="text-xs font-mono text-blue-400 uppercase">BM3 BROADCAST SYSTEM 2026</span>
        </div>
      </div>
    </>
  );
}
