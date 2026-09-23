import React, { useState } from 'react';
import Head from 'next/head';
import { useSocket } from '@/hooks/useSocket';
import { useHotkeys } from '@/hooks/useHotkeys';
import { HeaderBar } from '@/components/admin/HeaderBar';
import { Sidebar, SidebarMenu } from '@/components/admin/Sidebar';
import { DashboardView } from '@/components/admin/views/DashboardView';
import { EventView } from '@/components/admin/views/EventView';
import { ControllerView } from '@/components/admin/views/ControllerView';
import { MatchView } from '@/components/admin/views/MatchView';
import { TeamsView } from '@/components/admin/views/TeamsView';
import { PlayersView } from '@/components/admin/views/PlayersView';
import { HeroesView } from '@/components/admin/views/HeroesView';
import { GraphicsView } from '@/components/admin/views/GraphicsView';
import { StatsView } from '@/components/admin/views/StatsView';
import { OverlaysView } from '@/components/admin/views/OverlaysView';
import { DesignView } from '@/components/admin/views/DesignView';
import { OCRView } from '@/components/admin/views/OCRView';
import { ObsStatusModal } from '@/components/admin/ObsStatusModal';
import { TeamManagerModal } from '@/components/admin/TeamManagerModal';
import { PresetManagerModal } from '@/components/admin/PresetManagerModal';
import { SettingsModal } from '@/components/admin/SettingsModal';

export default function AdminDashboard() {
  const { state, connected, updateState, triggerAlert } = useSocket();
  const [activeMenu, setActiveMenu] = useState<SidebarMenu>('DASHBOARD');
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Hardware Hotkey Handlers
  useHotkeys({
    SCORE_A_PLUS: () => {
      if (state) updateState({ scoreA: state.scoreA + 1 });
    },
    SCORE_A_MINUS: () => {
      if (state) updateState({ scoreA: Math.max(0, state.scoreA - 1) });
    },
    SCORE_B_PLUS: () => {
      if (state) updateState({ scoreB: state.scoreB + 1 });
    },
    SCORE_B_MINUS: () => {
      if (state) updateState({ scoreB: Math.max(0, state.scoreB - 1) });
    },
    TIMER_TOGGLE: () => {
      if (state) updateState({ isTimerRunning: !state.isTimerRunning });
    },
    TRIGGER_CELEBRATION: () => {
      if (state) {
        triggerAlert({
          type: 'GOAL',
          teamName: state.teamA.name,
          title: 'GOALLL!',
          subtitle: 'Goal Scored!',
          durationMs: 6000,
        });
      }
    },
    TOGGLE_LOWER_THIRD: () => {
      if (state) {
        updateState({
          caster: { ...state.caster, visible: !state.caster.visible },
        });
      }
    },
    TOGGLE_SPONSOR: () => {
      if (state) {
        updateState({
          sponsorCarouselVisible: !state.sponsorCarouselVisible,
        });
      }
    },
  });

  if (!state) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center font-mono font-bold text-blue-400 animate-pulse mb-3">
          BM3
        </div>
        <div className="font-mono font-bold text-xs tracking-wider text-zinc-300">
          INITIALIZING BROADCAST ENGINE
        </div>
        <p className="text-[11px] text-zinc-500 font-mono mt-1">Connecting to Local WebSocket Bus</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>BM3 Broadcast Control Master v4.0</title>
        <meta name="description" content="Professional Hybrid Broadcast Overlay Control System" />
      </Head>

      <div className="min-h-screen flex bg-[#09090b] text-zinc-100 antialiased overflow-hidden font-sans relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
        )}

        {/* Left Navigation Sidebar */}
        <Sidebar
          activeMenu={activeMenu}
          onSelectMenu={(menu) => {
            setActiveMenu(menu);
            setIsMobileMenuOpen(false); // Auto close on mobile
          }}
          obsConnected={state.obsConnected}
          onOpenObsModal={() => {
            setIsObsModalOpen(true);
            setIsMobileMenuOpen(false);
          }}
          onOpenPresetManager={() => {
            setIsPresetModalOpen(true);
            setIsMobileMenuOpen(false);
          }}
          onOpenSettingsModal={() => {
            setIsSettingsModalOpen(true);
            setIsMobileMenuOpen(false);
          }}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Right Main Body Content */}
        <div className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden">
          {/* Top Command Bar */}
          <HeaderBar
            state={state}
            socketConnected={connected}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onEventTypeChange={(type) => updateState({ eventType: type })}
            onOpenObsModal={() => setIsObsModalOpen(true)}
            onOpenTeamManager={() => setIsTeamModalOpen(true)}
            onOpenPresetManager={() => setIsPresetModalOpen(true)}
          />

          {/* Main Full-Width Content Workspace Layout */}
          <main className="flex-1 p-4 max-w-[1750px] w-full">
            {/* 1. Dashboard View */}
            {activeMenu === 'DASHBOARD' && (
              <DashboardView
                state={state}
                updateState={updateState}
                triggerAlert={triggerAlert}
                onNavigate={(menu) => setActiveMenu(menu as SidebarMenu)}
              />
            )}

            {/* 2. Acara / Event View (Full Width) */}
            {activeMenu === 'EVENT' && (
              <EventView state={state} updateState={updateState} />
            )}

            {/* 3. Dedicated Live Controller & PGM Monitor View */}
            {activeMenu === 'CONTROLLER' && (
              <ControllerView
                state={state}
                updateState={updateState}
                triggerAlert={triggerAlert}
              />
            )}

            {/* 4. Match Schedules & CRUD View (Full Width) */}
            {activeMenu === 'MATCH' && (
              <MatchView
                state={state}
                updateState={updateState}
                triggerAlert={triggerAlert}
                onNavigateToController={() => setActiveMenu('CONTROLLER')}
              />
            )}

            {/* 5. Teams View (Full Width - Clean without PGM Clutter) */}
            {activeMenu === 'TEAMS' && (
              <TeamsView state={state} updateState={updateState} />
            )}

            {/* 6. Players View (Full Width) */}
            {activeMenu === 'PLAYERS' && (
              <PlayersView state={state} />
            )}

            {/* 7. Hero & Role View (Full Width) */}
            {activeMenu === 'HEROES' && (
              <HeroesView />
            )}

            {/* 8. Graphics View (Full Width) */}
            {activeMenu === 'GRAPHICS' && (
              <GraphicsView state={state} updateState={updateState} />
            )}

            {/* 9. Design & Layers View (Full Width) */}
            {activeMenu === 'DESIGN' && (
              <DesignView state={state} updateState={updateState} />
            )}

            {/* 10. Stats / Statistik View (Full Width) */}
            {activeMenu === 'STATS' && (
              <StatsView state={state} updateState={updateState} />
            )}

            {/* 11. Overlays View (Full Width) */}
            {activeMenu === 'OVERLAYS' && (
              <OverlaysView />
            )}

            {/* 12. OCR View (Full Width) */}
            {activeMenu === 'OCR' && (
              <OCRView state={state} updateState={updateState} />
            )}
          </main>
        </div>

        {/* OBS WebSocket Settings Modal */}
        <ObsStatusModal
          isOpen={isObsModalOpen}
          onClose={() => setIsObsModalOpen(false)}
          obsConnected={state.obsConnected}
        />

        {/* Team Database & Roster Modal */}
        <TeamManagerModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          onSelectTeam={(team, slot) => {
            if (slot === 'A') {
              updateState({ teamA: { ...team } });
            } else {
              updateState({ teamB: { ...team } });
            }
          }}
        />

        {/* 1-Click Preset Manager Modal */}
        <PresetManagerModal
          isOpen={isPresetModalOpen}
          onClose={() => setIsPresetModalOpen(false)}
          currentState={state}
          onLoadPreset={(presetState) => {
            updateState(presetState);
          }}
        />

        {/* System Settings Modal */}
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      </div>
    </>
  );
}
