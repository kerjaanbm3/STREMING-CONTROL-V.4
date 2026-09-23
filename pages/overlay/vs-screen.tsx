import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';

export default function VsScreenOverlay() {
  const { state } = useSocket();
  const [editorSettings, setEditorSettings] = useState<any>({});

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'UPDATE_OVERLAY_SETTINGS') {
        setEditorSettings(event.data.payload);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!state) {
    return <div className="bg-transparent" />;
  }

  return (
    <>
      <Head>
        <title>VS Matchup Screen - BM3 Broadcast</title>
      </Head>

      <div className="w-screen h-screen bg-[#07090f]/95 p-12 flex flex-col justify-between select-none overflow-hidden font-sans text-white relative">
        {/* Subtle Ambient Studio Light */}
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between z-10 px-8 py-3.5 rounded-xl bg-[#0f1420]/90 border border-[#232d42] backdrop-blur-md shadow-2xl"
        >
          <div>
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest block">
              OFFICIAL BROADCAST SHOWDOWN
            </span>
            <h2 className="font-heading font-black text-lg text-white uppercase tracking-wider">{state.eventName}</h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1 bg-[#1e293b] text-slate-200 border border-[#334155] rounded uppercase">
              {state.currentPeriod || 'MATCHDAY'} • BEST OF {state.boSeries}
            </span>
          </div>
        </motion.div>

        {/* Center 1v1 Showdown Banner */}
        <div className="grid grid-cols-12 gap-8 items-center my-auto z-10 max-w-6xl mx-auto w-full">
          {/* Team A Card (5 Cols) */}
          <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="col-span-5 p-8 rounded-2xl border-2 shadow-2xl flex flex-col items-center text-center space-y-4"
            style={{ backgroundColor: editorSettings.color1 || '#0f1422', borderColor: editorSettings.p1Color || 'rgba(225, 29, 72, 0.6)' }}
          >
            <div className="w-28 h-28 rounded-2xl p-3 flex items-center justify-center shadow-inner border"
                 style={{ backgroundColor: editorSettings.p1LogoBase || '#070a12', borderColor: 'rgba(255,255,255,0.1)' }}>
              <img
                src={state.teamA.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=A'}
                alt={state.teamA.name}
                className="w-full h-full object-contain"
                style={{ objectFit: editorSettings.p1LogoFit?.toLowerCase() as any || 'contain' }}
              />
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest block" style={{ color: editorSettings.p1Color || '#fb7185' }}>HOME TEAM</span>
              <h1 className="font-heading font-black text-2xl uppercase tracking-wider mt-1" style={{ color: editorSettings.textColor1 || '#ffffff' }}>
                {editorSettings.p1Name || state.teamA.name}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">{state.teamA.institution || 'Origin'}</p>
            </div>
          </motion.div>

          {/* Center VS Emblem (2 Cols) */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="col-span-2 flex flex-col items-center justify-center text-center"
          >
            <div className="w-16 h-16 rounded-xl bg-[#1e293b] border-2 border-[#334155] flex items-center justify-center font-heading font-black text-xl shadow-2xl" style={{ color: editorSettings.textColor1 || '#ffffff' }}>
              VS
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase mt-2 tracking-widest">
              SERIES BO{state.boSeries}
            </span>
          </motion.div>

          {/* Team B Card (5 Cols) */}
          <motion.div
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="col-span-5 p-8 rounded-2xl border-2 shadow-2xl flex flex-col items-center text-center space-y-4"
            style={{ backgroundColor: editorSettings.color2 || '#0f1422', borderColor: editorSettings.p2Color || 'rgba(37, 99, 235, 0.6)' }}
          >
            <div className="w-28 h-28 rounded-2xl p-3 flex items-center justify-center shadow-inner border"
                 style={{ backgroundColor: editorSettings.p2LogoBase || '#070a12', borderColor: 'rgba(255,255,255,0.1)' }}>
              <img
                src={state.teamB.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=B'}
                alt={state.teamB.name}
                className="w-full h-full object-contain"
                style={{ objectFit: editorSettings.p2LogoFit?.toLowerCase() as any || 'contain' }}
              />
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest block" style={{ color: editorSettings.p2Color || '#60a5fa' }}>AWAY TEAM</span>
              <h1 className="font-heading font-black text-2xl uppercase tracking-wider mt-1" style={{ color: editorSettings.textColor2 || '#ffffff' }}>
                {editorSettings.p2Name || state.teamB.name}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">{state.teamB.institution || 'Origin'}</p>
            </div>
          </motion.div>
        </div>

        {/* Footer Sponsor Carousel */}
        <div className="flex items-center justify-between px-8 py-3 rounded-xl bg-[#0f1420]/90 border border-[#232d42] z-10">
          <span className="text-[11px] font-mono text-slate-400">BM3 BROADCAST SYSTEM 2026</span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase">OFFICIAL SPONSORS</span>
            <div className="flex items-center gap-2">
              {state.sponsors.map((sp) => (
                <img key={sp.id} src={sp.logoUrl} alt={sp.name} className="w-5 h-5 rounded object-contain bg-slate-900 p-0.5 border border-slate-800" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
