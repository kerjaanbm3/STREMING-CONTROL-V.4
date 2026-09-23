import React, { useState } from 'react';
import { X, Network, Trophy, Medal } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface MatchItem {
  id: string;
  eventId: string;
  teamA?: { id: string; name: string; logoUrl?: string | null; brandColor?: string | null };
  teamB?: { id: string; name: string; logoUrl?: string | null; brandColor?: string | null };
  placeholderA?: string | null;
  placeholderB?: string | null;
  scoreA: number;
  scoreB: number;
  boSeries: number;
  status: string;
  matchNumber?: number;
  matchCode?: string | null;
  round?: string | null;
}

interface EventItem {
  id: string;
  name: string;
  bracketSize?: number;
  hasThirdPlace?: boolean;
}

interface BracketModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: MatchItem[];
  events: EventItem[];
}

export const BracketModal: React.FC<BracketModalProps> = ({ isOpen, onClose, matches, events }) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('ALL');

  if (!isOpen) return null;

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const targetBracketSize = selectedEvent?.bracketSize || 0;
  const targetHasThirdPlace = selectedEvent?.hasThirdPlace || false;

  const eventMatches = matches.filter(
    (m) => selectedEventId === 'ALL' || m.eventId === selectedEventId
  );

  const renderMatchNode = (
    match: MatchItem,
    roundName: string,
    is3rdPlace: boolean = false
  ) => {
    const isWinnerA = match.scoreA > match.scoreB;
    const isWinnerB = match.scoreB > match.scoreA;

    return (
      <div key={match.id} className={cn(
        "w-56 bg-[#18181e] border rounded-lg p-2.5 shadow-lg flex flex-col gap-2 relative z-10 transition-transform hover:scale-105 cursor-default",
        is3rdPlace ? "border-amber-700/50 hover:border-amber-500" : "border-zinc-800 hover:border-zinc-500"
      )}>
        <div className={cn(
          "text-[10px] font-mono font-bold text-center uppercase tracking-widest mb-1 flex justify-between px-1",
          is3rdPlace ? "text-amber-600" : "text-zinc-500"
        )}>
          <span>{match.matchCode || ''}</span>
          <span>{roundName}</span>
          <span className="opacity-0">{match.matchCode || ''}</span>
        </div>
        
        {/* Team A */}
        <div className={cn("flex items-center justify-between px-2 py-1.5 rounded-md", isWinnerA ? 'bg-blue-950/30' : 'bg-[#121215]')}>
          <div className="flex items-center gap-2">
            {match.teamA ? (
              <>
                <img src={match.teamA.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${match.teamA.name}`} alt="" className="w-5 h-5 object-contain" />
                <span className={cn("text-xs font-bold font-heading truncate w-24", isWinnerA ? 'text-white' : 'text-zinc-400')}>{match.teamA.name}</span>
              </>
            ) : (
              <span className="text-[10px] font-mono italic text-zinc-600 truncate w-32">{match.placeholderA || 'TBD'}</span>
            )}
          </div>
          {match.teamA && <span className={cn("text-xs font-digits font-black", isWinnerA ? 'text-blue-400' : 'text-zinc-500')}>{match.scoreA}</span>}
        </div>

        {/* Team B */}
        <div className={cn("flex items-center justify-between px-2 py-1.5 rounded-md", isWinnerB ? 'bg-blue-950/30' : 'bg-[#121215]')}>
          <div className="flex items-center gap-2">
            {match.teamB ? (
              <>
                <img src={match.teamB.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${match.teamB.name}`} alt="" className="w-5 h-5 object-contain" />
                <span className={cn("text-xs font-bold font-heading truncate w-24", isWinnerB ? 'text-white' : 'text-zinc-400')}>{match.teamB.name}</span>
              </>
            ) : (
              <span className="text-[10px] font-mono italic text-zinc-600 truncate w-32">{match.placeholderB || 'TBD'}</span>
            )}
          </div>
          {match.teamB && <span className={cn("text-xs font-digits font-black", isWinnerB ? 'text-blue-400' : 'text-zinc-500')}>{match.scoreB}</span>}
        </div>
      </div>
    );
  };

  const sortedMatches = [...eventMatches].sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));
  
  const leftR32: MatchItem[] = [];
  const rightR32: MatchItem[] = [];
  const leftR16: MatchItem[] = [];
  const rightR16: MatchItem[] = [];
  const leftQF: MatchItem[] = [];
  const rightQF: MatchItem[] = [];
  const leftSF: MatchItem[] = [];
  const rightSF: MatchItem[] = [];
  let grandFinal: MatchItem | null = null;
  let thirdPlace: MatchItem | null = null;

  sortedMatches.forEach(m => {
    switch (m.round) {
      case '32 Besar':
        if (leftR32.length < 8) leftR32.push(m);
        else rightR32.push(m);
        break;
      case '16 Besar':
        if (leftR16.length < 4) leftR16.push(m);
        else rightR16.push(m);
        break;
      case 'Quarter Final':
        if (leftQF.length < 2) leftQF.push(m);
        else rightQF.push(m);
        break;
      case 'Semi Final':
        if (leftSF.length < 1) leftSF.push(m);
        else rightSF.push(m);
        break;
      case '3rd Place':
        thirdPlace = m;
        break;
      case 'Grand Final':
        grandFinal = m;
        break;
      default:
        // Fallback or ignore for unmapped rounds
        break;
    }
  });

  const hasR32 = targetBracketSize >= 32 || leftR32.length > 0 || rightR32.length > 0;
  const hasR16 = targetBracketSize >= 16 || leftR16.length > 0 || rightR16.length > 0;
  const hasQF = targetBracketSize >= 8 || leftQF.length > 0 || rightQF.length > 0;
  const hasSF = targetBracketSize >= 4 || leftSF.length > 0 || rightSF.length > 0;
  const showThirdPlace = targetHasThirdPlace || thirdPlace !== null || hasSF;

  // Helper components for layout
  const MatchColumn = ({ matches, title, count }: { matches: MatchItem[], title: string, count: number }) => (
    <div className="flex flex-col justify-around h-full w-56 flex-shrink-0 z-10 relative py-8">
      {Array.from({ length: count }).map((_, i) => {
        const m = matches[i];
        return (
          <div key={i} className="flex justify-center">
            {m ? renderMatchNode(m, m.round || title) : <div className="w-56 h-28 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center text-zinc-700 font-mono text-xs italic">TBD</div>}
          </div>
        );
      })}
    </div>
  );

  const ConnectorColumn = ({ count, direction }: { count: number, direction: 'left' | 'right' }) => (
    <div className="flex flex-col justify-around h-full w-12 flex-shrink-0 relative py-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-full relative flex items-center" style={{ height: `${100 / count}%` }}>
          {/* Main Bracket ']' or '[' shape */}
          <div className={cn(
            "w-1/2 h-1/2 border-t-2 border-b-2 border-zinc-700/60 absolute top-1/4",
            direction === 'left' ? "border-r-2 rounded-r-xl right-1/2" : "border-l-2 rounded-l-xl left-1/2"
          )} />
          {/* Horizontal line pointing to the next round */}
          <div className={cn(
            "w-1/2 h-0 border-t-2 border-zinc-700/60 absolute top-1/2",
            direction === 'left' ? "right-0" : "left-0"
          )} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f0f13] border border-[#23232b] rounded-2xl w-full max-w-[95vw] h-[90vh] shadow-2xl flex flex-col font-sans overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1e1e24] bg-[#0f0f13]/95 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-900/60 flex items-center justify-center text-purple-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-black text-white uppercase tracking-wide">
                Tournament Bracket
              </h2>
              <p className="text-xs text-zinc-400">Visualisasi Bagan Pertandingan</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-[#18181e] border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">🌐 Semua Event</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#1e1e24] text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bracket Workspace Area - Scrollable/Draggable */}
        <div className="flex-1 overflow-auto bg-[#0a0a0c] relative custom-scrollbar">
          
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {eventMatches.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-500 font-mono text-sm relative z-10">
              Tidak ada data pertandingan untuk event ini.
            </div>
          ) : (
            <div className="min-w-max h-full min-h-[800px] flex justify-center p-12 relative z-10">
              
              {/* LEFT WING */}
              {hasR32 && <MatchColumn matches={leftR32} title="32 Besar" count={8} />}
              {hasR32 && <ConnectorColumn count={4} direction="left" />}
              
              {hasR16 && <MatchColumn matches={leftR16} title="16 Besar" count={4} />}
              {hasR16 && <ConnectorColumn count={2} direction="left" />}

              {hasQF && <MatchColumn matches={leftQF} title="Quarter Final" count={2} />}
              {hasQF && <ConnectorColumn count={1} direction="left" />}

              {hasSF && <MatchColumn matches={leftSF} title="Semi Final" count={1} />}
              {hasSF && (
                <div className="flex flex-col justify-around h-full w-12 flex-shrink-0 relative py-8">
                  <div className="w-1/2 h-0 border-t-2 border-zinc-700/60 absolute top-1/2 right-0" />
                </div>
              )}

              {/* CENTER - GRAND FINAL & 3RD PLACE */}
              <div className="flex flex-col justify-around h-full w-64 flex-shrink-0 z-10 relative py-8 px-4">
                <div className="flex flex-col items-center justify-center h-full gap-16">
                  {/* Grand Final Block */}
                  <div className="flex flex-col items-center relative">
                    <div className="absolute -top-16 flex flex-col items-center gap-2">
                      <Trophy className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]" />
                    </div>
                    {grandFinal ? renderMatchNode(grandFinal, grandFinal.round || 'Grand Final') : <div className="w-56 h-28 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center text-zinc-700 font-mono text-xs italic">GF TBD</div>}
                  </div>

                  {/* 3rd Place Match Block */}
                  {showThirdPlace && (
                    <div className="flex flex-col items-center relative mt-12">
                      <div className="absolute -top-12 flex flex-col items-center gap-2">
                        <Medal className="w-8 h-8 text-amber-600 drop-shadow-[0_0_15px_rgba(217,119,6,0.4)]" />
                      </div>
                      {thirdPlace ? renderMatchNode(thirdPlace, thirdPlace.round || 'Perebutan Juara 3', true) : <div className="w-56 h-28 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center text-zinc-700 font-mono text-xs italic">3rd Place TBD</div>}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT WING */}
              {hasSF && (
                <div className="flex flex-col justify-around h-full w-12 flex-shrink-0 relative py-8">
                  <div className="w-1/2 h-0 border-t-2 border-zinc-700/60 absolute top-1/2 left-0" />
                </div>
              )}
              {hasSF && <MatchColumn matches={rightSF} title="Semi Final" count={1} />}

              {hasQF && <ConnectorColumn count={1} direction="right" />}
              {hasQF && <MatchColumn matches={rightQF} title="Quarter Final" count={2} />}

              {hasR16 && <ConnectorColumn count={2} direction="right" />}
              {hasR16 && <MatchColumn matches={rightR16} title="16 Besar" count={4} />}

              {hasR32 && <ConnectorColumn count={4} direction="right" />}
              {hasR32 && <MatchColumn matches={rightR32} title="32 Besar" count={8} />}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
