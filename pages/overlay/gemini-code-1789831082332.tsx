import React from 'react';
import { useSocket } from '@/hooks/useSocket';

// Interface untuk data statistik pertandingan
export interface StatItem {
  label: string;
  leftValue: string | number;
  rightValue: string | number;
}

export const SoccerScoreboard: React.FC = () => {
  const { state } = useSocket();

  // Helper untuk format timer
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const tournamentTitle = state.eventName || 'SOCCER CHAMPIONSHIP';
  const teamLeftName = state.teamA.name || 'TEAM A';
  const teamRightName = state.teamB.name || 'TEAM B';
  const scoreLeft = state.scoreA;
  const scoreRight = state.scoreB;
  const matchTime = formatTime(state.timerSeconds);
  
  const stats: StatItem[] = [
    { label: 'Possession %', leftValue: state.stats.possessionA, rightValue: state.stats.possessionB },
    { label: 'Shots on Target', leftValue: state.stats.shotsOnTargetA, rightValue: state.stats.shotsOnTargetB },
    { label: 'Corners', leftValue: state.stats.cornersA, rightValue: state.stats.cornersB },
    { label: 'Fouls', leftValue: state.stats.foulsA, rightValue: state.stats.foulsB },
  ];

  if (!state.layers.scoreboard) return null;

  return (
    <div className="flex justify-center items-center min-h-screen bg-transparent p-4">
      <div className="relative w-full max-w-[800px] flex flex-col items-center font-sans">
        
        {/* Banner Turnamen Atas */}
        <div 
          className="z-20 bg-gradient-to-b from-red-600 to-red-900 text-white px-8 py-1.5 font-extrabold text-base tracking-widest rounded-t-md shadow-md"
          style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)' }}
        >
          {tournamentTitle}
        </div>

        {/* Header Nama Tim & Banner Tengah */}
        <div className="relative z-10 w-full h-[52px] bg-white border-[3px] border-slate-300 rounded-full flex justify-between items-center px-4 shadow-lg">
          {/* Bendera Kiri (Italia) */}
          <div className="w-10 h-10 rounded-full border-2 border-white shadow-md bg-[linear-gradient(90deg,#009246_33%,#ffffff_33%,#ffffff_66%,#ce2b37_66%)]" />

          <div className="w-48 text-center text-indigo-950 font-bold text-lg uppercase tracking-wide">
            {teamLeftName}
          </div>

          {/* Badge Match Facts */}
          <div 
            className="bg-gradient-to-b from-sky-600 to-sky-900 text-white px-6 py-2 font-bold text-sm tracking-wide -mt-2"
            style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)' }}
          >
            MATCH FACTS
          </div>

          <div className="w-48 text-center text-indigo-950 font-bold text-lg uppercase tracking-wide">
            {teamRightName}
          </div>

          {/* Bendera Kanan (Polandia) */}
          <div className="w-10 h-10 rounded-full border-2 border-white shadow-md bg-[linear-gradient(180deg,#ffffff_50%,#dc143c_50%)]" />
        </div>

        {/* Panel Utama Statistik */}
        <div className="w-[96%] bg-gradient-to-b from-slate-800 via-indigo-900 to-blue-950 border-[4px] border-slate-300 rounded-[24px] -mt-5 pt-8 pb-5 px-6 text-white shadow-2xl">
          
          {/* Skor & Waktu */}
          <div className="flex justify-center items-center gap-3 mb-4">
            <span className="text-emerald-400 text-sm font-bold">▲</span>
            <div className="bg-white text-black font-black text-xl px-3 py-0.5 rounded shadow">
              {scoreLeft}
            </div>
            <div className="bg-black text-white font-bold text-lg px-4 py-1 rounded-xl tracking-wider shadow">
              {matchTime}
            </div>
            <div className="bg-white text-black font-black text-xl px-3 py-0.5 rounded shadow">
              {scoreRight}
            </div>
            <span className="text-rose-500 text-sm font-bold">▼</span>
          </div>

          {/* Konten Grid: Logo Kiri - Tabel - Logo Kanan */}
          <div className="flex justify-between items-center gap-4">
            
            {/* Logo Tim Kiri */}
            <div className="w-24 h-28 rounded-xl border-2 border-white/80 shadow-lg flex flex-col justify-center items-center bg-[linear-gradient(90deg,#009246_33%,#ffffff_33%,#ffffff_66%,#ce2b37_66%)]">
              <div className="w-11 h-11 rounded-full border-2 border-black bg-radial from-white to-gray-400 flex justify-center items-center font-bold text-xl shadow">
                ⚽
              </div>
              <span className="text-[10px] font-black text-black bg-white/90 px-1.5 py-0.5 rounded mt-1.5 shadow">
                LOGO
              </span>
            </div>

            {/* Tabel Statistik */}
            <div className="flex-1 px-2">
              {stats.map((item, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center py-1 border-b border-white/10 text-sm"
                >
                  <span className="w-10 text-right font-extrabold text-base">
                    {item.leftValue}
                  </span>
                  <span className="flex-1 text-center font-semibold text-gray-200 text-xs sm:text-sm">
                    {item.label}
                  </span>
                  <span className="w-10 text-left font-extrabold text-base">
                    {item.rightValue}
                  </span>
                </div>
              ))}
            </div>

            {/* Logo Tim Kanan */}
            <div className="w-24 h-28 rounded-xl border-2 border-white/80 shadow-lg flex flex-col justify-center items-center bg-rose-600">
              <div className="w-11 h-11 rounded-full border-2 border-black bg-radial from-white to-gray-400 flex justify-center items-center font-bold text-xl shadow">
                ⚽
              </div>
              <span className="text-[10px] font-black text-red-600 bg-white/90 px-1.5 py-0.5 rounded mt-1.5 shadow">
                LOGO
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default SoccerScoreboard;