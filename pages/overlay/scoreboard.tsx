import React, { useRef, useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Komponen Skor dengan Animasi GSAP (Pop/Scale effect saat skor berubah)
function AnimatedScore({ score, bgClass, style }: { score: number; bgClass: string; style?: React.CSSProperties }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prevScore, setPrevScore] = useState(score);

  useGSAP(() => {
    if (score !== prevScore) {
      // Efek "Pop" menggunakan GSAP saat skor berubah
      gsap.fromTo(
        containerRef.current,
        { scale: 1.5, backgroundColor: '#ffffff', color: '#000000' },
        { scale: 1, clearProps: 'backgroundColor,color', duration: 0.5, ease: 'back.out(3)' }
      );
      setPrevScore(score);
    }
  }, [score]);

  return (
    <div
      ref={containerRef}
      className={`w-11 h-11 ${bgClass} flex items-center justify-center border-l border-r border-black/30 font-digits font-black text-2xl text-white`}
      style={style}
    >
      {score}
    </div>
  );
}

// Komponen Alert/Pop-up menggunakan animasi urutan (timeline) GSAP
function GsapCelebrationAlert({ alert }: { alert: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    // Animasi masuk (Masuk dari bawah, membesar)
    tl.fromTo(containerRef.current, 
      { scale: 0.5, opacity: 0, y: 50 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' }
    )
    // Teks judul memantul
    .fromTo(titleRef.current,
      { scale: 0, opacity: 0, rotationX: 90 },
      { scale: 1, opacity: 1, rotationX: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' },
      '-=0.2'
    );

    // Animasi subtitle jika ada
    if (alert.subtitle) {
      tl.fromTo(subtitleRef.current,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
        '-=0.4'
      );
    }

  }, []);

  return (
    <div
      ref={containerRef}
      className={`px-12 py-6 rounded-2xl shadow-2xl border-2 flex flex-col items-center justify-center text-center ${
        alert.type === 'GOAL'
          ? 'bg-[#991b1b]/95 border-red-500 shadow-red-600/50'
          : alert.type === 'YELLOW_CARD'
          ? 'bg-[#ca8a04]/95 border-yellow-300 shadow-yellow-500/50 text-black'
          : alert.type === 'RED_CARD'
          ? 'bg-[#7f1d1d]/95 border-red-400 shadow-red-700/50'
          : alert.type === 'WWCD'
          ? 'bg-[#b45309]/95 border-amber-400 shadow-amber-500/50 text-white'
          : 'bg-[#0f172a]/95 border-blue-400 shadow-blue-500/50'
      }`}
    >
      <div ref={titleRef} className="font-heading font-black text-5xl sm:text-6xl tracking-wider text-white uppercase drop-shadow-md">
        {alert.title}
      </div>
      {alert.subtitle && (
        <div ref={subtitleRef} className="font-mono font-bold text-base sm:text-xl mt-1 text-slate-100 uppercase tracking-widest drop-shadow">
          {alert.subtitle}
        </div>
      )}
    </div>
  );
}

export default function ScoreboardOverlay() {
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

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(Math.abs(totalSec) / 60);
    const secs = Math.abs(totalSec) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const alert = state.celebrationAlert;
  const { theme, layers } = state;

  return (
    <>
      <Head>
        <title>Scoreboard Overlay - BM3 Broadcast</title>
      </Head>

      <div className="w-screen h-screen bg-transparent p-8 flex flex-col justify-between pointer-events-none select-none overflow-hidden font-sans">
        {/* Top Header Scoreboard Bar */}
        <AnimatePresence>
          {layers?.scoreboard && (
            <motion.div
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -80, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex items-start justify-center"
              style={{ transform: `scale(${theme?.scale || 1})`, transformOrigin: 'top center' }}
            >
              <div 
                className={`flex items-center shadow-2xl rounded-xl overflow-hidden border border-black/40 ${theme?.isGlassmorphism ? 'bg-black/40 backdrop-blur-md' : 'bg-[#0e121b]'}`}
                style={{ backgroundColor: editorSettings.color1 || (theme?.isGlassmorphism ? undefined : theme?.backgroundColor) }}
              >
            {/* Clock & Period Container */}
            <div 
              className="px-3.5 py-2.5 border-r border-[#263148] flex flex-col items-center justify-center min-w-[75px]"
              style={{ backgroundColor: editorSettings.color2 || '#171e2e' }}
            >
              <span className="text-[9px] font-mono font-black uppercase tracking-widest leading-none mb-1" style={{ color: editorSettings.textColor2 || '#60a5fa' }}>
                {state.currentPeriod || 'LIVE'}
              </span>
              <span className="font-digits font-black text-sm tracking-widest leading-none" style={{ color: editorSettings.textColor1 || '#ffffff' }}>
                {formatTime(state.timerSeconds)}
              </span>
            </div>

            {/* TEAM A INFO */}
            <div className="flex items-center gap-3 px-4 py-2">
              <img
                src={state.teamA.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=A'}
                alt={state.teamA.name}
                className="w-7 h-7 rounded object-contain p-0.5 border border-white/10"
                style={{ backgroundColor: editorSettings.p1LogoBase || '#060910', objectFit: editorSettings.p1LogoFit?.toLowerCase() as any || 'contain' }}
              />
              <span className="font-heading font-black text-sm tracking-wide uppercase" style={{ color: editorSettings.textColor1 || '#ffffff' }}>
                {editorSettings.p1Name || state.teamA.name}
              </span>
            </div>

            {/* TEAM A SCORE (GSAP ANIMATED) */}
            <AnimatedScore score={state.scoreA} bgClass="" style={{ backgroundColor: editorSettings.p1Color || '#dc2626' }} />

            {/* SCORE DIVIDER */}
            <div className="w-5 text-center text-xs font-mono font-bold text-slate-500">
              -
            </div>

            {/* TEAM B SCORE (GSAP ANIMATED) */}
            <AnimatedScore score={state.scoreB} bgClass="" style={{ backgroundColor: editorSettings.p2Color || '#2563eb' }} />

            {/* TEAM B INFO */}
            <div className="flex items-center gap-3 px-4 py-2">
              <span className="font-heading font-black text-sm tracking-wide uppercase" style={{ color: editorSettings.textColor1 || '#ffffff' }}>
                {editorSettings.p2Name || state.teamB.name}
              </span>
              <img
                src={state.teamB.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=B'}
                alt={state.teamB.name}
                className="w-7 h-7 rounded object-contain p-0.5 border border-white/10"
                style={{ backgroundColor: editorSettings.p2LogoBase || '#060910', objectFit: editorSettings.p2LogoFit?.toLowerCase() as any || 'contain' }}
              />
            </div>

            {/* BO Indicator if Esports */}
            {state.eventType === 'ESPORT_MOBA' && state.boSeries > 1 && (
              <div className="px-3 py-2 bg-[#2e1065] border-l border-purple-800/60 flex items-center gap-1.5 font-mono text-[10px] font-bold text-purple-300">
                <span>BO{state.boSeries}</span>
              </div>
            )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Screen Celebration Pop-up */}
        <div className="flex items-center justify-center">
          <AnimatePresence>
            {alert && layers?.popups && (
              <motion.div
                key={alert.id}
                exit={{ scale: 0.8, opacity: 0, y: -30, transition: { duration: 0.3 } }}
                style={{ transform: `scale(${theme?.scale || 1})`, transformOrigin: 'center' }}
              >
                <GsapCelebrationAlert alert={alert} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Lower Third & Sponsor Display */}
        <div className="flex items-end justify-between gap-4">
          {/* Caster Lower Third */}
          <AnimatePresence>
            {state.caster.visible && (
              <motion.div
                initial={{ x: -120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -120, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#0e131f]/95 border border-[#242e44] shadow-2xl"
              >
                <div className="w-9 h-9 rounded bg-[#1e293b] border border-[#334155] flex items-center justify-center font-mono font-bold text-xs text-blue-400">
                  MIC
                </div>
                <div>
                  <div className="font-heading font-black text-sm text-white uppercase tracking-wide">
                    {state.caster.name}
                  </div>
                  <div className="text-[11px] font-mono text-blue-400 font-medium">
                    {state.caster.role} {state.caster.socialHandle ? `• ${state.caster.socialHandle}` : ''}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sponsor Carousel Floating Badge */}
          <AnimatePresence>
            {state.sponsorCarouselVisible && state.sponsors.length > 0 && (
              <motion.div
                key={state.currentSponsorIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0e131f]/95 border border-[#242e44] shadow-2xl ml-auto"
              >
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  PARTNER
                </span>
                <img
                  src={state.sponsors[state.currentSponsorIndex]?.logoUrl}
                  alt="Sponsor"
                  className="w-6 h-6 rounded object-contain bg-[#0a0d14] p-0.5 border border-white/10"
                />
                <span className="font-heading font-bold text-xs text-slate-100">
                  {state.sponsors[state.currentSponsorIndex]?.name}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
