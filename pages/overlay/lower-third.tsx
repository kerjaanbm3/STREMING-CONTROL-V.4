import React from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';

export default function LowerThirdOverlayPage() {
  const { state } = useSocket();

  if (!state) {
    return <div className="bg-transparent" />;
  }

  const { theme, layers } = state;

  return (
    <>
      <Head>
        <title>Lower Third Overlay - BM3 Broadcast</title>
      </Head>

      <div className="w-screen h-screen bg-transparent p-12 flex flex-col justify-end select-none overflow-hidden font-sans">
        {/* Caster Card Lower-Third */}
        <AnimatePresence>
          {state.caster.visible && layers?.lowerThird && (
            <motion.div
              initial={{ x: -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -200, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`flex items-center gap-4 p-4 rounded-3xl border border-white/20 shadow-2xl max-w-lg mb-4 ${theme?.isGlassmorphism ? 'bg-slate-950/90 backdrop-blur-2xl' : 'bg-slate-950'}`}
              style={{ transform: `scale(${theme?.scale || 1})`, transformOrigin: 'bottom left', backgroundColor: theme?.isGlassmorphism ? undefined : theme?.backgroundColor }}
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-black text-2xl text-white shadow-lg shadow-black/30"
                style={{ backgroundColor: theme?.primaryColor || '#2563eb' }}
              >
                🎙️
              </div>
              <div>
                <div className="font-heading font-black text-xl text-white tracking-wide uppercase">
                  {state.caster.name}
                </div>
                <div className="text-xs text-blue-400 font-semibold flex items-center gap-2">
                  <span>{state.caster.role}</span>
                  {state.caster.socialHandle && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-purple-300">{state.caster.socialHandle}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Running Ticker Bar at Bottom */}
        <AnimatePresence>
          {state.tickerVisible && state.tickerText && layers?.ticker && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className={`w-full border border-white/10 rounded-2xl py-2.5 px-6 shadow-2xl flex items-center gap-4 overflow-hidden ${theme?.isGlassmorphism ? 'bg-slate-900/90 backdrop-blur-xl' : 'bg-slate-900'}`}
              style={{ transform: `scale(${theme?.scale || 1})`, transformOrigin: 'bottom center', backgroundColor: theme?.isGlassmorphism ? undefined : theme?.backgroundColor }}
            >
              <span 
                className="text-[10px] font-mono font-black text-white px-2 py-0.5 rounded uppercase flex-shrink-0"
                style={{ backgroundColor: theme?.primaryColor || '#3b82f6' }}
              >
                NEWS & UPDATES
              </span>
              <div className="font-heading font-bold text-xs text-white uppercase tracking-wider truncate">
                {state.tickerText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
