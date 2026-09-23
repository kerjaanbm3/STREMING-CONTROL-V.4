import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { Lock } from 'lucide-react';

export default function PickBanOverlay() {
  const { state } = useSocket();

  if (!state) {
    return <div className="bg-transparent" />;
  }

  const slotsA = state.mobaSlots.filter((s) => s.teamType === 'TEAM_A');
  const slotsB = state.mobaSlots.filter((s) => s.teamType === 'TEAM_B');

  const picksA = slotsA.filter((s) => s.action === 'PICK');
  const bansA = slotsA.filter((s) => s.action === 'BAN');

  const picksB = slotsB.filter((s) => s.action === 'PICK');
  const bansB = slotsB.filter((s) => s.action === 'BAN');

  return (
    <>
      <Head>
        <title>Draft Pick & Ban Overlay - BM3 Broadcast</title>
      </Head>

      <div className="w-screen h-screen bg-[#07090f]/95 p-6 flex flex-col justify-between select-none overflow-hidden font-sans text-white">
        {/* Top Header Match Banner */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between px-8 py-3 rounded-xl bg-[#0f1422]/95 border border-[#232e44] shadow-2xl"
        >
          {/* Team A Header */}
          <div className="flex items-center gap-3.5">
            <img
              src={state.teamA.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=A'}
              alt={state.teamA.name}
              className="w-10 h-10 rounded-lg object-contain bg-[#070a12] p-1.5 border border-amber-500/40"
            />
            <div>
              <h2 className="font-heading font-black text-lg text-white uppercase">{state.teamA.name}</h2>
              <div className="flex gap-1 mt-0.5">
                {Array.from({ length: Math.ceil(state.boSeries / 2) }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-sm border ${
                      idx < state.scoreA
                        ? 'bg-amber-400 border-amber-300 shadow-sm'
                        : 'bg-[#151b28] border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Center Info */}
          <div className="flex flex-col items-center">
            <div className="text-[10px] font-mono font-bold tracking-widest text-purple-300 uppercase bg-[#2e1065] px-3 py-0.5 rounded border border-purple-700 mb-0.5">
              HERO DRAFT PHASE • BEST OF {state.boSeries}
            </div>
            <div className="font-heading font-black text-base text-white">
              {state.currentPeriod || 'GAME 1'}
            </div>
          </div>

          {/* Team B Header */}
          <div className="flex items-center gap-3.5 flex-row-reverse text-right">
            <img
              src={state.teamB.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=B'}
              alt={state.teamB.name}
              className="w-10 h-10 rounded-lg object-contain bg-[#070a12] p-1.5 border border-blue-500/40"
            />
            <div>
              <h2 className="font-heading font-black text-lg text-white uppercase">{state.teamB.name}</h2>
              <div className="flex gap-1 mt-0.5 justify-end">
                {Array.from({ length: Math.ceil(state.boSeries / 2) }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-sm border ${
                      idx < state.scoreB
                        ? 'bg-blue-400 border-blue-300 shadow-sm'
                        : 'bg-[#151b28] border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Center 5 vs 5 Hero Card Grid */}
        <div className="grid grid-cols-12 gap-5 items-center my-auto">
          {/* Team A 5 Picks (5 Cols) */}
          <div className="col-span-5 grid grid-cols-5 gap-2.5">
            {picksA.map((slot, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`relative h-64 rounded-xl overflow-hidden border flex flex-col justify-end p-2.5 ${
                  slot.isLocked
                    ? 'border-amber-500/60 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent'
                    : 'border-slate-800 bg-[#0c1018]'
                }`}
              >
                {slot.hero ? (
                  <>
                    <img
                      src={slot.hero.avatarUrl}
                      alt={slot.hero.name}
                      className="absolute inset-0 w-full h-full object-cover -z-10"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent -z-10" />
                    {slot.isLocked && (
                      <div className="absolute top-2 right-2 p-1 rounded bg-amber-500 text-slate-950 font-bold text-[10px]">
                        LOCKED
                      </div>
                    )}
                    <div className="font-heading font-black text-xs text-white uppercase truncate">
                      {slot.hero.name}
                    </div>
                    <div className="text-[10px] font-mono text-amber-300 font-bold">{slot.roleName || 'Pick'}</div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 text-[11px] font-mono">
                    PICKING...
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Center VS Visual Divider (2 Cols) */}
          <div className="col-span-2 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-xl bg-[#171e2e] border border-[#2b354c] flex items-center justify-center font-heading font-black text-lg text-white shadow-xl">
              VS
            </div>
          </div>

          {/* Team B 5 Picks (5 Cols) */}
          <div className="col-span-5 grid grid-cols-5 gap-2.5">
            {picksB.map((slot, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`relative h-64 rounded-xl overflow-hidden border flex flex-col justify-end p-2.5 ${
                  slot.isLocked
                    ? 'border-blue-500/60 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent'
                    : 'border-slate-800 bg-[#0c1018]'
                }`}
              >
                {slot.hero ? (
                  <>
                    <img
                      src={slot.hero.avatarUrl}
                      alt={slot.hero.name}
                      className="absolute inset-0 w-full h-full object-cover -z-10"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent -z-10" />
                    {slot.isLocked && (
                      <div className="absolute top-2 right-2 p-1 rounded bg-blue-500 text-white font-bold text-[10px]">
                        LOCKED
                      </div>
                    )}
                    <div className="font-heading font-black text-xs text-white uppercase truncate">
                      {slot.hero.name}
                    </div>
                    <div className="text-[10px] font-mono text-blue-300 font-bold">{slot.roleName || 'Pick'}</div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 text-[11px] font-mono">
                    PICKING...
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Bans Row */}
        <div className="flex items-center justify-between px-8 py-2.5 rounded-xl bg-[#0f1422]/95 border border-[#232e44]">
          {/* Bans Team A */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">TEAM A BANS:</span>
            <div className="flex gap-1.5">
              {bansA.map((slot, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded bg-slate-900 border border-rose-800/80 overflow-hidden relative"
                >
                  {slot.hero ? (
                    <>
                      <img src={slot.hero.avatarUrl} alt={slot.hero.name} className="w-full h-full object-cover grayscale opacity-60" />
                      <div className="absolute inset-0 bg-rose-950/40 flex items-center justify-center">
                        <span className="text-rose-500 font-bold text-[10px]">✕</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 text-[10px] font-mono">-</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bans Team B */}
          <div className="flex items-center gap-3 flex-row-reverse">
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">TEAM B BANS:</span>
            <div className="flex gap-1.5">
              {bansB.map((slot, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded bg-slate-900 border border-rose-800/80 overflow-hidden relative"
                >
                  {slot.hero ? (
                    <>
                      <img src={slot.hero.avatarUrl} alt={slot.hero.name} className="w-full h-full object-cover grayscale opacity-60" />
                      <div className="absolute inset-0 bg-rose-950/40 flex items-center justify-center">
                        <span className="text-rose-500 font-bold text-[10px]">✕</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 text-[10px] font-mono">-</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
