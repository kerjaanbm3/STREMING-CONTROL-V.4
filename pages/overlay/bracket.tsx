import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSocket } from '@/hooks/useSocket';
import { Trophy, Medal } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface MatchItem {
  id: string;
  eventId: string;
  teamA?: { id: string; name: string; logoUrl?: string | null };
  teamB?: { id: string; name: string; logoUrl?: string | null };
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

export default function BracketOverlay() {
  const { state } = useSocket();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [targetBracketSize, setTargetBracketSize] = useState<number>(0);
  const [targetHasThirdPlace, setTargetHasThirdPlace] = useState<boolean>(false);

  useEffect(() => {
    // Fetch matches and events
    Promise.all([
      fetch('/api/matches').then((res) => res.json()),
      fetch('/api/events').then((res) => res.json())
    ]).then(([matchesData, eventsData]) => {
      if (matchesData.matches) setMatches(matchesData.matches);
      
      if (eventsData.events && state?.eventName) {
        const activeEvent = eventsData.events.find((e: any) => e.name === state.eventName);
        if (activeEvent) {
          setTargetBracketSize(activeEvent.bracketSize || 0);
          setTargetHasThirdPlace(activeEvent.hasThirdPlace || false);
        }
      }
    }).catch(err => console.error(err));
  }, [state?.eventName]);

  if (!state) {
    return <div className="bg-transparent" />;
  }

  // Bracket Sorting & Mapping
  const sortedMatches = [...matches].sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));
  
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
    }
  });

  const hasR32 = targetBracketSize >= 32 || leftR32.length > 0 || rightR32.length > 0;
  const hasR16 = targetBracketSize >= 16 || leftR16.length > 0 || rightR16.length > 0;
  const hasQF = targetBracketSize >= 8 || leftQF.length > 0 || rightQF.length > 0;
  const hasSF = targetBracketSize >= 4 || leftSF.length > 0 || rightSF.length > 0;
  const showThirdPlace = targetHasThirdPlace || thirdPlace !== null || hasSF;

  // Determine scaling factor to fit 1080p height
  // Max columns for R32 is 8 matches. 8 * 100px = 800px. It fits in 1080p easily.
  // We can just use standard fixed sizing.

  const renderMatchNode = (match: MatchItem, roundName: string, is3rdPlace: boolean = false) => {
    const isWinnerA = match.scoreA > match.scoreB;
    const isWinnerB = match.scoreB > match.scoreA;

    return (
      <div className={cn(
        "w-48 bg-slate-900/90 border rounded-lg p-2 shadow-xl flex flex-col gap-1.5 backdrop-blur-md relative z-10",
        is3rdPlace ? "border-amber-600" : "border-white/10"
      )}>
        <div className={cn(
          "text-[9px] font-mono font-bold text-center uppercase tracking-widest flex justify-between px-1",
          is3rdPlace ? "text-amber-500" : "text-gray-400"
        )}>
          <span>{match.matchCode || ''}</span>
          <span>{roundName}</span>
          <span className="opacity-0">{match.matchCode || ''}</span>
        </div>
        
        {/* Team A */}
        <div className={cn("flex items-center justify-between px-2 py-1 rounded", isWinnerA ? 'bg-amber-900/40' : 'bg-black/40')}>
          <div className="flex items-center gap-1.5 overflow-hidden">
            {match.teamA ? (
              <span className={cn("text-[11px] font-bold font-heading truncate w-24", isWinnerA ? 'text-white' : 'text-gray-400')}>{match.teamA.name}</span>
            ) : (
              <span className="text-[9px] font-mono italic text-zinc-500 truncate w-24">{match.placeholderA || 'TBD'}</span>
            )}
          </div>
          {match.teamA && <span className={cn("text-[11px] font-digits font-black", isWinnerA ? 'text-amber-400' : 'text-gray-500')}>{match.scoreA}</span>}
        </div>
        
        {/* Team B */}
        <div className={cn("flex items-center justify-between px-2 py-1 rounded", isWinnerB ? 'bg-amber-900/40' : 'bg-black/40')}>
          <div className="flex items-center gap-1.5 overflow-hidden">
            {match.teamB ? (
              <span className={cn("text-[11px] font-bold font-heading truncate w-24", isWinnerB ? 'text-white' : 'text-gray-400')}>{match.teamB.name}</span>
            ) : (
              <span className="text-[9px] font-mono italic text-zinc-500 truncate w-24">{match.placeholderB || 'TBD'}</span>
            )}
          </div>
          {match.teamB && <span className={cn("text-[11px] font-digits font-black", isWinnerB ? 'text-amber-400' : 'text-gray-500')}>{match.scoreB}</span>}
        </div>
      </div>
    );
  };

  const MatchColumn = ({ matches, title, count }: { matches: MatchItem[], title: string, count: number }) => (
    <div className="flex flex-col justify-around h-full w-48 flex-shrink-0 z-10 relative">
      {Array.from({ length: count }).map((_, i) => {
        const m = matches[i];
        return (
          <div key={i} className="flex justify-center">
            {m ? renderMatchNode(m, m.round || title) : <div className="w-48 h-20 border border-dashed border-white/20 rounded-lg flex items-center justify-center text-white/30 font-mono text-[10px] italic">TBD</div>}
          </div>
        );
      })}
    </div>
  );

  const ConnectorColumn = ({ count, direction }: { count: number, direction: 'left' | 'right' }) => (
    <div className="flex flex-col justify-around h-full w-8 flex-shrink-0 relative">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-full relative flex items-center" style={{ height: `${100 / count}%` }}>
          <div className={cn(
            "w-1/2 h-1/2 border-t border-b border-white/20 absolute top-1/4",
            direction === 'left' ? "border-r rounded-r-lg right-1/2" : "border-l rounded-l-lg left-1/2"
          )} />
          <div className={cn(
            "w-1/2 h-0 border-t border-white/20 absolute top-1/2",
            direction === 'left' ? "right-0" : "left-0"
          )} />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Head>
        <title>Dynamic Bracket Overlay</title>
      </Head>
      <div className="w-screen h-screen bg-transparent p-8 flex flex-col justify-center items-center overflow-hidden font-sans text-white">
        <div className="w-[1800px] h-[950px] bg-slate-950/80 border border-white/10 shadow-2xl rounded-3xl p-10 flex flex-col relative backdrop-blur-md">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
             <div className="flex items-center gap-3">
               <Trophy className="w-8 h-8 text-amber-400" />
               <div>
                 <h1 className="font-heading font-black text-2xl uppercase text-white tracking-wider">{state.eventName || 'Tournament Bracket'}</h1>
                 <p className="text-amber-400 text-sm font-mono tracking-widest">OFFICIAL PLAYOFFS</p>
               </div>
             </div>
          </div>
          
          {/* Bracket Area */}
          <div className="flex-1 w-full flex justify-center py-4 relative z-10">
              {/* LEFT WING */}
              {hasR32 && <MatchColumn matches={leftR32} title="32 Besar" count={8} />}
              {hasR32 && <ConnectorColumn count={4} direction="left" />}
              
              {hasR16 && <MatchColumn matches={leftR16} title="16 Besar" count={4} />}
              {hasR16 && <ConnectorColumn count={2} direction="left" />}

              {hasQF && <MatchColumn matches={leftQF} title="Quarter Final" count={2} />}
              {hasQF && <ConnectorColumn count={1} direction="left" />}

              {hasSF && <MatchColumn matches={leftSF} title="Semi Final" count={1} />}
              {hasSF && (
                <div className="flex flex-col justify-around h-full w-8 flex-shrink-0 relative">
                  <div className="w-1/2 h-0 border-t border-white/20 absolute top-1/2 right-0" />
                </div>
              )}

              {/* CENTER - GRAND FINAL & 3RD PLACE */}
              <div className="flex flex-col justify-around h-full w-56 flex-shrink-0 z-10 relative px-4">
                <div className="flex flex-col items-center justify-center h-full gap-12">
                  <div className="flex flex-col items-center relative">
                    <Trophy className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)] mb-2" />
                    {grandFinal ? renderMatchNode(grandFinal, grandFinal.round || 'Grand Final') : <div className="w-48 h-20 border border-dashed border-white/20 rounded-lg flex items-center justify-center text-white/30 font-mono text-[10px] italic">GF TBD</div>}
                  </div>

                  {showThirdPlace && (
                    <div className="flex flex-col items-center relative mt-8">
                      <Medal className="w-8 h-8 text-amber-600 drop-shadow-[0_0_15px_rgba(217,119,6,0.4)] mb-2" />
                      {thirdPlace ? renderMatchNode(thirdPlace, thirdPlace.round || 'Perebutan Juara 3', true) : <div className="w-48 h-20 border border-dashed border-white/20 rounded-lg flex items-center justify-center text-white/30 font-mono text-[10px] italic">3rd Place TBD</div>}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT WING */}
              {hasSF && (
                <div className="flex flex-col justify-around h-full w-8 flex-shrink-0 relative">
                  <div className="w-1/2 h-0 border-t border-white/20 absolute top-1/2 left-0" />
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
        </div>
      </div>
    </>
  );
}
