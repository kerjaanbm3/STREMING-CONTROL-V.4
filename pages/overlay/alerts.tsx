import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import {
  AlertCircle,
  ShieldAlert,
  Clock,
  Flame,
  Swords,
  Trophy,
  PauseCircle,
  Megaphone,
} from 'lucide-react';

export default function StandaloneAlertsOverlay() {
  const { state } = useSocket();
  const router = useRouter();
  const { preview, title, subtitle, filter } = router.query;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (router.isReady) setIsReady(true);
  }, [router.isReady]);

  const isPreview = !!preview;
  
  if (!isReady || (!isPreview && !state)) {
    return <div className="bg-transparent" />;
  }

  const alert = isPreview 
    ? {
        id: 'preview_alert',
        type: preview as string,
        title: (title as string) || (preview as string).replace('_', ' '),
        subtitle: subtitle as string,
      }
    : state?.celebrationAlert;

  // Filter specific alert types if query parameter '?filter=TYPE' is present
  if (alert && filter && alert.type !== filter) {
    return <div className="bg-transparent" />;
  }

  const getAlertVisuals = (type?: string) => {
    switch (type) {
      case 'YELLOW_CARD':
        return {
          bgGradient: 'from-amber-600/95 via-yellow-600/95 to-amber-700/95',
          border: 'border-yellow-400',
          shadow: 'shadow-yellow-500/50',
          icon: AlertCircle,
          iconBg: 'bg-yellow-400 text-black',
          glowColor: 'bg-yellow-500/20',
          cardColor: 'bg-yellow-400 text-black',
          titleColor: 'text-white',
        };
      case 'RED_CARD':
        return {
          bgGradient: 'from-red-900/95 via-rose-800/95 to-red-950/95',
          border: 'border-red-500',
          shadow: 'shadow-red-600/60',
          icon: ShieldAlert,
          iconBg: 'bg-red-600 text-white',
          glowColor: 'bg-red-500/30',
          cardColor: 'bg-red-600 text-white',
          titleColor: 'text-white',
        };
      case 'TIME':
      case 'EXTRA_TIME':
        return {
          bgGradient: 'from-slate-900/95 via-emerald-950/95 to-slate-900/95',
          border: 'border-emerald-400',
          shadow: 'shadow-emerald-500/40',
          icon: Clock,
          iconBg: 'bg-emerald-500 text-black',
          glowColor: 'bg-emerald-500/20',
          cardColor: 'bg-emerald-500 text-black',
          titleColor: 'text-emerald-300',
        };
      case 'GOAL':
        return {
          bgGradient: 'from-red-700/95 via-orange-600/95 to-red-800/95',
          border: 'border-amber-300',
          shadow: 'shadow-orange-500/60',
          icon: Flame,
          iconBg: 'bg-amber-400 text-black',
          glowColor: 'bg-orange-500/40',
          cardColor: 'bg-amber-400 text-black',
          titleColor: 'text-white',
        };
      case 'FIRST_BLOOD':
        return {
          bgGradient: 'from-purple-950/95 via-purple-900/95 to-indigo-950/95',
          border: 'border-purple-400',
          shadow: 'shadow-purple-600/60',
          icon: Swords,
          iconBg: 'bg-purple-600 text-white',
          glowColor: 'bg-purple-500/30',
          cardColor: 'bg-purple-600 text-white',
          titleColor: 'text-purple-200',
        };
      case 'OBJECTIVE':
      case 'TURTLE':
      case 'LORD':
        return {
          bgGradient: 'from-teal-950/95 via-cyan-900/95 to-slate-950/95',
          border: 'border-cyan-400',
          shadow: 'shadow-cyan-500/50',
          icon: ShieldAlert,
          iconBg: 'bg-cyan-500 text-black',
          glowColor: 'bg-cyan-500/30',
          cardColor: 'bg-cyan-500 text-black',
          titleColor: 'text-cyan-200',
        };
      case 'WWCD':
      case 'VICTORY':
        return {
          bgGradient: 'from-amber-800/95 via-yellow-700/95 to-amber-900/95',
          border: 'border-yellow-300',
          shadow: 'shadow-yellow-500/60',
          icon: Trophy,
          iconBg: 'bg-yellow-400 text-black',
          glowColor: 'bg-yellow-500/40',
          cardColor: 'bg-yellow-400 text-black',
          titleColor: 'text-white',
        };
      case 'TIMEOUT':
      case 'PAUSE':
        return {
          bgGradient: 'from-slate-900/95 via-zinc-800/95 to-slate-900/95',
          border: 'border-blue-400',
          shadow: 'shadow-blue-500/40',
          icon: PauseCircle,
          iconBg: 'bg-blue-500 text-white',
          glowColor: 'bg-blue-500/20',
          cardColor: 'bg-blue-500 text-white',
          titleColor: 'text-blue-300',
        };
      default:
        return {
          bgGradient: 'from-blue-950/95 via-indigo-900/95 to-slate-950/95',
          border: 'border-blue-400',
          shadow: 'shadow-blue-500/50',
          icon: Megaphone,
          iconBg: 'bg-blue-500 text-white',
          glowColor: 'bg-blue-500/30',
          cardColor: 'bg-blue-500 text-white',
          titleColor: 'text-white',
        };
    }
  };

  const visuals = getAlertVisuals(alert?.type);
  const AlertIcon = visuals.icon;

  return (
    <>
      <Head>
        <title>Standalone In-Game DSK Alerts Overlay - BM3 Broadcast</title>
        <meta name="description" content="Dedicated 1080p Alpha Transparent In-Game Graphic Alert Layer for OBS/vMix" />
      </Head>

      {/* 100% Transparent Fullscreen Canvas for OBS / vMix DSK Layer */}
      <div className="w-screen h-screen bg-transparent flex items-center justify-center pointer-events-none select-none overflow-hidden font-sans p-6">
        <AnimatePresence>
          {alert && (
            <motion.div
              key={alert.id}
              initial={{ scale: 0.6, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -40 }}
              transition={{ type: 'spring', damping: 20, stiffness: 240 }}
              className="relative flex flex-col items-center justify-center"
            >
              {/* Radial Glow Ambient Effect */}
              <div
                className={`absolute -inset-10 rounded-full blur-3xl opacity-60 pointer-events-none ${visuals.glowColor}`}
              />

              {/* Main DSK Alert Capsule Card */}
              <div
                className={`relative px-12 py-7 rounded-3xl shadow-2xl border-2 backdrop-blur-xl flex flex-col items-center justify-center text-center bg-gradient-to-r ${visuals.bgGradient} ${visuals.border} ${visuals.shadow} min-w-[460px] max-w-[800px]`}
              >
                {/* Visual Icon / Card Badge */}
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-lg ${visuals.iconBg}`}
                  >
                    <AlertIcon className="w-6 h-6" />
                  </div>

                  {alert.type === 'YELLOW_CARD' && (
                    <div className="w-6 h-9 rounded bg-yellow-400 border border-yellow-200 shadow-md transform rotate-6" />
                  )}

                  {alert.type === 'RED_CARD' && (
                    <div className="w-6 h-9 rounded bg-red-600 border border-red-300 shadow-md transform rotate-6" />
                  )}
                </div>

                {/* Main Alert Title */}
                <div
                  className={`font-heading font-black text-5xl sm:text-6xl tracking-wider uppercase drop-shadow-xl ${visuals.titleColor}`}
                >
                  {alert.title}
                </div>

                {/* Subtitle / Player / Action Detail */}
                {alert.subtitle && (
                  <div className="font-mono font-bold text-base sm:text-xl mt-2 text-white/95 uppercase tracking-widest drop-shadow-md bg-black/30 px-5 py-1.5 rounded-full border border-white/15">
                    {alert.subtitle}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
