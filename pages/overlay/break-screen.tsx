import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { Sparkles, Radio, Clock } from 'lucide-react';

export default function BreakScreenOverlay() {
  const { state } = useSocket();
  const [countdownSec, setCountdownSec] = useState(300); // 5 minutes default countdown

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!state) {
    return <div className="bg-transparent" />;
  }

  return (
    <>
      <Head>
        <title>Break Screen Overlay - BM3 Broadcast</title>
      </Head>

      <div className="w-screen h-screen bg-gradient-to-tr from-[#050811] via-[#091124] to-[#050811] p-12 flex flex-col justify-between select-none overflow-hidden font-sans text-white relative">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="font-heading font-black text-lg text-white">{state.eventName}</div>
              <div className="text-xs text-blue-400 font-mono">OFFICIAL LIVE STREAM BROADCAST</div>
            </div>
          </div>

          <div className="px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-xs font-mono font-bold text-amber-400">
            {state.currentPeriod || 'STARTING SOON'}
          </div>
        </div>

        {/* Center Big Countdown Box */}
        <div className="flex flex-col items-center justify-center my-auto z-10 text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="p-8 sm:p-12 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col items-center"
          >
            <span className="text-xs sm:text-sm font-mono font-bold tracking-widest text-blue-400 uppercase mb-2">
              STREAM RESUMING IN
            </span>
            <div className="font-digits font-black text-6xl sm:text-8xl text-white tracking-widest text-shadow-glow">
              {formatCountdown(countdownSec)}
            </div>

            {/* Matchup quick preview */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-800">
              <div className="flex items-center gap-2.5">
                <img
                  src={state.teamA.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=A'}
                  alt={state.teamA.name}
                  className="w-10 h-10 rounded-xl object-contain bg-slate-900 p-1 border border-slate-700"
                />
                <span className="font-heading font-extrabold text-sm text-white">{state.teamA.name}</span>
              </div>
              <span className="text-xs font-mono font-bold text-gray-500">VS</span>
              <div className="flex items-center gap-2.5 flex-row-reverse">
                <img
                  src={state.teamB.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=B'}
                  alt={state.teamB.name}
                  className="w-10 h-10 rounded-xl object-contain bg-slate-900 p-1 border border-slate-700"
                />
                <span className="font-heading font-extrabold text-sm text-white">{state.teamB.name}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Sponsor Carousel Bar */}
        <div className="flex items-center justify-between px-8 py-3.5 rounded-2xl bg-slate-950/90 border border-white/10 backdrop-blur-xl z-10">
          <span className="text-xs font-mono text-gray-400">DON'T FORGET TO LIKE & SUBSCRIBE</span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-gray-500 uppercase">OFFICIAL PARTNERS</span>
            <div className="flex items-center gap-2">
              {state.sponsors.map((sp) => (
                <img key={sp.id} src={sp.logoUrl} alt={sp.name} className="w-6 h-6 rounded object-contain bg-slate-900 p-0.5 border border-slate-800" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
