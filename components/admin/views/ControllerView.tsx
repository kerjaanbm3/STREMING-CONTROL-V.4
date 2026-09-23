import React, { useState, useEffect } from 'react';
import { LiveBroadcastState, EventSubType, EventCategory } from '@/lib/types';
import { SportsController } from '@/components/admin/SportsController';
import { FutsalController } from '@/components/admin/controllers/FutsalController';
import { VolleyballController } from '@/components/admin/controllers/VolleyballController';
import { BadmintonController } from '@/components/admin/controllers/BadmintonController';
import { BasketballController } from '@/components/admin/controllers/BasketballController';
import { SoccerController } from '@/components/admin/controllers/SoccerController';
import { GeneralEventController } from '@/components/admin/controllers/GeneralEventController';
import { MobaDraftController } from '@/components/admin/MobaDraftController';
import { BRStandingsController } from '@/components/admin/BRStandingsController';
import { LivePreviewCanvas } from '@/components/admin/LivePreviewCanvas';
import {
  Sliders,
  Keyboard,
  Trophy,
  Gamepad2,
  Tv,
  Flame,
  ChevronDown,
  Layers,
  Swords,
  Power,
  Check,
  Plus,
  Minus,
  Settings,
  X,
  ArrowLeftRight
} from 'lucide-react';

interface ControllerViewProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
  triggerAlert: (alert: any) => void;
}

interface ThemeConfig {
  accentColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: any;
  disciplineLabel: string;
}

export const ControllerView: React.FC<ControllerViewProps> = ({
  state,
  updateState,
  triggerAlert,
}) => {
  const currentSubType: EventSubType = state.eventSubType || 'FOOTBALL';
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [matchesList, setMatchesList] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const currentActiveEvent = eventsList.find(
    (ev) => ev.name.toLowerCase() === state.eventName.toLowerCase()
  );

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setEventsList(data.events);
          const active = data.events.find(
            (ev: any) => ev.name.toLowerCase() === state.eventName.toLowerCase()
          );
          if (active) setSelectedEventId(active.id);
          else if (data.events.length > 0 && !selectedEventId) setSelectedEventId(data.events[0].id);
        }
      })
      .catch((err) => console.error('Failed to load events:', err));

    fetch('/api/matches')
      .then((res) => res.json())
      .then((data) => {
        if (data.matches) setMatchesList(data.matches);
      })
      .catch((err) => console.error('Failed to load matches:', err));
  }, []);

  const isSelectedEventActive = Boolean(
    selectedEventId &&
      currentActiveEvent &&
      selectedEventId === currentActiveEvent.id &&
      state.eventName !== 'STANDBY' &&
      state.eventName !== 'STANDBY / NO EVENT'
  );

  const handleToggleEventActivation = async () => {
    if (isSelectedEventActive) {
      // 1. NONAKTIFKAN EVENT (Set to Standby)
      updateState({
        eventName: 'STANDBY / NO EVENT',
        eventCategory: 'SPORT',
        eventSubType: 'FOOTBALL',
        eventType: 'SPORT',
      });
      try {
        await fetch('/api/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedEventId, setActive: false }),
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      // 2. AKTIFKAN EVENT TERPILIH
      const ev = eventsList.find((item) => item.id === selectedEventId);
      if (!ev) return;

      let derivedType = ev.eventType as any;
      if (!derivedType) {
        if (ev.category === 'ESPORT' || ev.category === 'MULTI_EVENT') {
          if (ev.subType === 'MLBB') derivedType = 'ESPORT_MOBA';
          else if (ev.subType === 'PUBG_MOBILE' || ev.subType === 'FREE_FIRE') derivedType = 'ESPORT_BR';
          else if (ev.subType === 'TALKSHOW' || ev.subType === 'AWARD_SHOW' || ev.subType === 'MUSIC_CONCERT') derivedType = 'GENERAL';
          else derivedType = 'SPORT';
        } else if (ev.category === 'GENERAL') {
          derivedType = 'GENERAL';
        } else {
          derivedType = 'SPORT';
        }
      }

      updateState({
        eventName: ev.name,
        eventCategory: ev.category || 'SPORT',
        eventSubType: ev.subType || 'FOOTBALL',
        eventType: derivedType,
      });

      try {
        await fetch('/api/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: ev.id, setActive: true }),
        });
      } catch (e) {
        console.error('Failed to set active event:', e);
      }
    }
  };

  const handleMatchChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const matchId = e.target.value;
    if (!matchId) return;

    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      if (data.matches) {
        setMatchesList(data.matches);
        const match = data.matches.find((m: any) => m.id === matchId);
        if (!match) return;

        updateState({
          matchId: match.id,
          teamA: {
            id: match.teamA?.id || 'ta',
            name: match.teamA?.name || 'TEAM A',
            logoUrl: match.teamA?.logoUrl || '',
            brandColor: match.teamA?.brandColor || '#3b82f6',
          },
          teamB: {
            id: match.teamB?.id || 'tb',
            name: match.teamB?.name || 'TEAM B',
            logoUrl: match.teamB?.logoUrl || '',
            brandColor: match.teamB?.brandColor || '#ef4444',
          },
          scoreA: match.scoreA || 0,
          scoreB: match.scoreB || 0,
          boSeries: match.boSeries || 1,
          currentPeriod: match.currentPeriod || 'Game 1',
        });
      }
    } catch (err) {
      console.error('Failed to fetch fresh match data', err);
    }
  };

  // Dynamic Theme configuration based on Sub-discipline
  const getThemeConfig = (sub: EventSubType): ThemeConfig => {
    switch (sub) {
      case 'FUTSAL':
        return {
          accentColor: '#10b981',
          borderColor: 'border-emerald-500/30',
          badgeBg: 'bg-emerald-950/50',
          badgeText: 'text-emerald-300',
          badgeBorder: 'border-emerald-700/60',
          icon: Trophy,
          disciplineLabel: '🥅 FUTSAL',
        };
      case 'VOLLEYBALL':
        return {
          accentColor: '#6366f1',
          borderColor: 'border-indigo-500/30',
          badgeBg: 'bg-indigo-950/50',
          badgeText: 'text-indigo-300',
          badgeBorder: 'border-indigo-700/60',
          icon: Trophy,
          disciplineLabel: '🏐 BOLA VOLI',
        };
      case 'BADMINTON':
        return {
          accentColor: '#14b8a6',
          borderColor: 'border-teal-500/30',
          badgeBg: 'bg-teal-950/50',
          badgeText: 'text-teal-300',
          badgeBorder: 'border-teal-700/60',
          icon: Trophy,
          disciplineLabel: '🏸 BULUTANGKIS',
        };
      case 'BASKETBALL':
        return {
          accentColor: '#f97316',
          borderColor: 'border-orange-500/30',
          badgeBg: 'bg-orange-950/50',
          badgeText: 'text-orange-300',
          badgeBorder: 'border-orange-700/60',
          icon: Trophy,
          disciplineLabel: '🏀 BOLA BASKET',
        };
      case 'MLBB':
        return {
          accentColor: '#a855f7',
          borderColor: 'border-purple-500/30',
          badgeBg: 'bg-purple-950/50',
          badgeText: 'text-purple-300',
          badgeBorder: 'border-purple-700/60',
          icon: Gamepad2,
          disciplineLabel: '⚔️ MLBB',
        };
      case 'PUBG_MOBILE':
        return {
          accentColor: '#eab308',
          borderColor: 'border-amber-500/30',
          badgeBg: 'bg-amber-950/50',
          badgeText: 'text-amber-300',
          badgeBorder: 'border-amber-700/60',
          icon: Gamepad2,
          disciplineLabel: '🪂 PUBG MOBILE',
        };
      case 'FREE_FIRE':
        return {
          accentColor: '#f43f5e',
          borderColor: 'border-rose-500/30',
          badgeBg: 'bg-rose-950/50',
          badgeText: 'text-rose-300',
          badgeBorder: 'border-rose-700/60',
          icon: Flame,
          disciplineLabel: '🔥 FREE FIRE',
        };
      case 'VALORANT':
        return {
          accentColor: '#ef4444',
          borderColor: 'border-red-500/30',
          badgeBg: 'bg-red-950/50',
          badgeText: 'text-red-300',
          badgeBorder: 'border-red-700/60',
          icon: Gamepad2,
          disciplineLabel: '🎯 VALORANT',
        };
      case 'TALKSHOW':
      case 'AWARD_SHOW':
      case 'MUSIC_CONCERT':
      case 'GENERAL':
        return {
          accentColor: '#8b5cf6',
          borderColor: 'border-violet-500/30',
          badgeBg: 'bg-violet-950/50',
          badgeText: 'text-violet-300',
          badgeBorder: 'border-violet-700/60',
          icon: Tv,
          disciplineLabel: '🎙️ TALKSHOW',
        };
      case 'FOOTBALL':
      default:
        return {
          accentColor: '#3b82f6',
          borderColor: 'border-blue-500/30',
          badgeBg: 'bg-blue-950/50',
          badgeText: 'text-blue-300',
          badgeBorder: 'border-blue-700/60',
          icon: Trophy,
          disciplineLabel: '⚽ SEPAK BOLA',
        };
    }
  };

  const handleSwapTeams = () => {
    updateState({
      teamA: state.teamB,
      teamB: state.teamA,
      scoreA: state.scoreB,
      scoreB: state.scoreA,
      setsScoreA: state.setsScoreB,
      setsScoreB: state.setsScoreA,
      stats: {
        ...state.stats,
        possessionA: state.stats.possessionB,
        possessionB: state.stats.possessionA,
        shotsOnTargetA: state.stats.shotsOnTargetB,
        shotsOnTargetB: state.stats.shotsOnTargetA,
        cornersA: state.stats.cornersB,
        cornersB: state.stats.cornersA,
        foulsA: state.stats.foulsB,
        foulsB: state.stats.foulsA,
      },
    });
  };

  const theme = getThemeConfig(currentSubType);
  const ThemeIcon = theme.icon;

  const handleDisciplineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as EventSubType;
    let evType: any = 'SPORT';

    if (mode === 'MLBB') {
      evType = 'ESPORT_MOBA';
    } else if (mode === 'PUBG_MOBILE' || mode === 'FREE_FIRE') {
      evType = 'ESPORT_BR';
    } else if (mode === 'TALKSHOW' || mode === 'AWARD_SHOW' || mode === 'MUSIC_CONCERT' || mode === 'GENERAL') {
      evType = 'GENERAL';
    }

    updateState({
      eventSubType: mode,
      eventType: evType,
    });
  };

  const renderActiveController = () => {
    switch (currentSubType) {
      case 'FOOTBALL':
        return (
          <SoccerController
            state={state}
            updateState={updateState}
            triggerAlert={triggerAlert}
          />
        );
      case 'FUTSAL':
        return (
          <FutsalController
            state={state}
            updateState={updateState}
            triggerAlert={triggerAlert}
          />
        );
      case 'VOLLEYBALL':
        return (
          <VolleyballController
            state={state}
            updateState={updateState}
            triggerAlert={triggerAlert}
          />
        );
      case 'BADMINTON':
        return (
          <BadmintonController
            state={state}
            updateState={updateState}
            triggerAlert={triggerAlert}
          />
        );
      case 'BASKETBALL':
        return (
          <BasketballController
            state={state}
            updateState={updateState}
            triggerAlert={triggerAlert}
          />
        );
      case 'MLBB':
        return (
          <MobaDraftController
            state={state}
            updateState={updateState}
            triggerAlert={triggerAlert}
          />
        );
      case 'PUBG_MOBILE':
      case 'FREE_FIRE':
        return (
          <BRStandingsController
            state={state}
            updateState={updateState}
            triggerAlert={triggerAlert}
          />
        );
      case 'TALKSHOW':
      case 'AWARD_SHOW':
      case 'MUSIC_CONCERT':
      case 'GENERAL':
        return (
          <GeneralEventController
            state={state}
            updateState={updateState}
            triggerAlert={triggerAlert}
          />
        );
      case 'FOOTBALL':
      default:
        // Fallback checks
        if (state.eventType === 'ESPORT_MOBA') {
          return <MobaDraftController state={state} updateState={updateState} triggerAlert={triggerAlert} />;
        }
        if (state.eventType === 'ESPORT_BR') {
          return <BRStandingsController state={state} updateState={updateState} triggerAlert={triggerAlert} />;
        }
        if (state.eventType === 'GENERAL') {
          return <GeneralEventController state={state} updateState={updateState} triggerAlert={triggerAlert} />;
        }
        return (
          <SportsController
            state={state}
            updateState={updateState}
            triggerAlert={triggerAlert}
          />
        );
    }
  };

  const isMultiEvent = state.eventCategory === 'MULTI_EVENT';
  const totalBO = state.boSeries || 1;

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Header Banner (Glassmorphic) */}
      <div
        className={`px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl bg-white/[0.02] border backdrop-blur-xl shadow-lg transition-all ${theme.borderColor}`}
      >
        {/* Left Side: Thematic Icon & Live Match Info */}
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: `${theme.accentColor}18`,
              borderColor: `${theme.accentColor}40`,
              color: theme.accentColor,
            }}
          >
            <ThemeIcon className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="font-heading font-black text-xs text-white uppercase tracking-wider hidden sm:block">
              CONTROLLER
            </h2>
            <span className="text-[9px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span>ON AIR</span>
            </span>
            <div className="w-[1px] h-4 bg-white/10 hidden sm:block"></div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="font-bold text-zinc-400">Acara:</span>
              <div className="relative inline-flex items-center">
                <select
                  value={selectedEventId || ''}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold text-[10px] rounded pl-2 pr-5 py-1 cursor-pointer focus:outline-none transition-colors max-w-[150px] truncate"
                >
                  {eventsList.length > 0 ? (
                    eventsList.map((ev) => (
                      <option key={ev.id} value={ev.id} className="bg-[#18181b] text-white">
                        {ev.name}
                      </option>
                    ))
                  ) : (
                    <option value="" className="bg-[#18181b] text-white">{state.eventName}</option>
                  )}
                </select>
                <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-1 pointer-events-none" />
              </div>

              {/* Toggle Switch ON (AKTIF) / OFF (NONAKTIF) */}
              <button
                onClick={handleToggleEventActivation}
                className={`px-2 py-1 rounded text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isSelectedEventActive
                    ? 'bg-emerald-500/10 hover:bg-rose-500/10 text-emerald-400 hover:text-rose-400 border border-emerald-500/20 hover:border-rose-500/20 group'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
                title={
                  isSelectedEventActive
                    ? 'Klik untuk MENONAKTIFKAN acara ini (Switch OFF / Standby)'
                    : 'Klik untuk MENGAKTIFKAN acara ini (Switch ON)'
                }
              >
                {isSelectedEventActive ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse group-hover:bg-rose-400" />
                    <span className="group-hover:hidden">AKTIF</span>
                    <span className="hidden group-hover:inline">NONAKTIFKAN</span>
                  </>
                ) : (
                  <>
                    <Power className="w-2.5 h-2.5" />
                    <span>AKTIFKAN</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Match Selector Dropdown + BO Selector + Pertandingan P1/P2/P3 Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* If Multi Event: Show Mode Switcher Dropdown */}
          {isMultiEvent && (
            <div className="relative flex items-center">
              <select
                value={currentSubType}
                onChange={handleDisciplineChange}
                className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-mono font-bold rounded pl-2.5 pr-6 py-1 cursor-pointer focus:outline-none transition-colors"
                style={{
                  borderColor: `${theme.accentColor}40`,
                }}
              >
                <optgroup label="⚽ Sports">
                  <option value="FOOTBALL">⚽ Sepak Bola</option>
                  <option value="FUTSAL">🥅 Futsal</option>
                  <option value="VOLLEYBALL">🏐 Bola Voli</option>
                  <option value="BADMINTON">🏸 Badminton</option>
                  <option value="BASKETBALL">🏀 Basket</option>
                </optgroup>
                <optgroup label="🎮 Esports">
                  <option value="MLBB">⚔️ MLBB</option>
                  <option value="PUBG_MOBILE">🪂 PUBG</option>
                  <option value="FREE_FIRE">🔥 Free Fire</option>
                  <option value="VALORANT">🎯 Valorant</option>
                </optgroup>
                <optgroup label="🎙️ Show">
                  <option value="TALKSHOW">🎙️ Talkshow</option>
                </optgroup>
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-1.5 pointer-events-none" />
            </div>
          )}

          {/* 1. MATCH SELECTOR DROPDOWN (Pilih Match Aktif) */}
          <div className="flex items-center gap-1">
            <div className="relative flex items-center">
              <select
                value={state.matchId || ''}
                onChange={handleMatchChange}
                className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-mono font-bold rounded pl-2.5 pr-6 py-1 cursor-pointer focus:outline-none transition-colors max-w-[150px] truncate"
                style={{
                  borderColor: `${theme.accentColor}40`,
                }}
              >
                {matchesList.length > 0 ? (
                  matchesList.map((m, idx) => (
                    <option key={m.id} value={m.id} className="bg-[#18181b] text-white">
                      M{idx + 1}: {m.teamA?.name} vs {m.teamB?.name}
                    </option>
                  ))
                ) : (
                  <option value="" className="bg-[#18181b] text-white">
                    {state.teamA.name} vs {state.teamB.name}
                  </option>
                )}
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-1.5 pointer-events-none" />
            </div>

            <button
              onClick={handleSwapTeams}
              className="px-1.5 py-1 rounded bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/40 text-zinc-300 hover:text-white transition-all flex items-center justify-center group cursor-pointer"
              title="Tukar Posisi Team A & Team B"
            >
              <ArrowLeftRight className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* 2. MATCH STATUS TOGGLE */}
          <div className="relative flex items-center">
            <select
              value={matchesList.find(m => m.id === state.matchId)?.status || 'UPCOMING'}
              onChange={async (e) => {
                const newStatus = e.target.value;
                if (!state.matchId) return;
                
                try {
                  await fetch('/api/matches', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: state.matchId, status: newStatus }),
                  });
                  // Update local matches list state so the dropdown reflects the change instantly
                  setMatchesList(prev => prev.map(m => m.id === state.matchId ? { ...m, status: newStatus } : m));
                  
                  if (newStatus === 'FINISHED') {
                    triggerAlert({
                      type: 'CUSTOM',
                      title: 'MATCH FINISHED',
                      subtitle: 'Status Pertandingan Selesai',
                      durationMs: 4000
                    });
                  }
                } catch (err) {
                  console.error('Failed to update match status:', err);
                }
              }}
              className={`appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono font-bold rounded pl-2.5 pr-6 py-1 cursor-pointer focus:outline-none transition-colors ${
                (matchesList.find(m => m.id === state.matchId)?.status === 'FINISHED') ? 'text-emerald-400' :
                (matchesList.find(m => m.id === state.matchId)?.status === 'LIVE') ? 'text-blue-400' : 'text-zinc-400'
              }`}
              style={{
                borderColor: `${theme.accentColor}40`,
              }}
            >
              <option value="UPCOMING" className="bg-[#18181b] text-zinc-400">UPCOMING</option>
              <option value="LIVE" className="bg-[#18181b] text-blue-400">LIVE</option>
              <option value="FINISHED" className="bg-[#18181b] text-emerald-400">FINISHED</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 pointer-events-none" />
          </div>



          {/* 3. PERTANDINGAN / BABAK SELECTOR (P1, P2, P3 ... Sesuai Jumlah Babak/BO) */}
          {/* 3. PERTANDINGAN / BABAK SELECTOR (P1, P2, P3 ... Sesuai Jumlah Babak/BO) */}
          <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded border border-white/10 font-mono text-[9px]">
            {Array.from({ length: Math.min(15, totalBO) }, (_, i) => {
              const pLabel = `P${i + 1}`;
              const gameName = `Game ${i + 1}`;
              const isSelected =
                state.currentPeriod === gameName ||
                (i === 0 && (!state.currentPeriod || state.currentPeriod === 'Half 1'));

              return (
                <button
                  key={pLabel}
                  onClick={() => updateState({ currentPeriod: gameName })}
                  className={`px-2 py-0.5 rounded transition-all ${
                    isSelected
                      ? 'text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                  style={{
                    backgroundColor: isSelected ? theme.accentColor : undefined,
                  }}
                  title={`Pilih Pertandingan / Babak ${i + 1} (${gameName})`}
                >
                  {pLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Single-Column Layout: Dedicated Controller Surface (now handles its own layout/cards) */}
      <div className="w-full space-y-3">
        <div className={`min-card p-3 bg-[#09090b]/90 border transition-all ${theme.borderColor}`}>
          {renderActiveController()}
        </div>
      </div>
    </div>
  );
};
