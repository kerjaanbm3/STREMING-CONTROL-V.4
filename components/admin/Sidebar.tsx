import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Sliders,
  Swords,
  Users,
  User,
  Gamepad2,
  Image as ImageIcon,
  BarChart3,
  Layers,
  Settings,
  Radio,
  Bookmark,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export type SidebarMenu =
  | 'DASHBOARD'
  | 'EVENT'
  | 'CONTROLLER'
  | 'MATCH'
  | 'TEAMS'
  | 'PLAYERS'
  | 'HEROES'
  | 'GRAPHICS'
  | 'DESIGN'
  | 'STATS'
  | 'OVERLAYS'
  | 'OCR';

interface SidebarProps {
  activeMenu: SidebarMenu;
  onSelectMenu: (menu: SidebarMenu) => void;
  obsConnected: boolean;
  onOpenObsModal: () => void;
  onOpenPresetManager: () => void;
  onOpenSettingsModal: () => void;
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  onSelectMenu,
  obsConnected,
  onOpenObsModal,
  onOpenPresetManager,
  onOpenSettingsModal,
  isMobileMenuOpen,
  onCloseMobileMenu,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const menuItems: { id: SidebarMenu; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'DASHBOARD',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'EVENT',
      label: 'Acara / Event',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'CONTROLLER',
      label: 'Controller',
      icon: <Sliders className="w-4 h-4" />,
      badge: 'LIVE',
    },
    {
      id: 'MATCH',
      label: 'Match',
      icon: <Swords className="w-4 h-4" />,
    },
    {
      id: 'TEAMS',
      label: 'Teams',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'PLAYERS',
      label: 'Players',
      icon: <User className="w-4 h-4" />,
    },
    {
      id: 'HEROES',
      label: 'Hero & Role',
      icon: <Gamepad2 className="w-4 h-4" />,
      badge: 'MLBB',
    },
    {
      id: 'GRAPHICS',
      label: 'Graphics',
      icon: <ImageIcon className="w-4 h-4" />,
    },
    {
      id: 'DESIGN',
      label: 'Design & Layers',
      icon: <Layers className="w-4 h-4 text-purple-400" />,
      badge: 'NEW',
    },
    {
      id: 'STATS',
      label: 'Stats / Statistik',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'OVERLAYS',
      label: 'Overlays',
      icon: <Layers className="w-4 h-4" />,
      badge: '8',
    },
    {
      id: 'OCR',
      label: 'OCR',
      icon: <Radio className="w-4 h-4" />,
      badge: 'NEW',
    },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-60'} bg-[#0c0c0e] border-r border-[#1e1e24] flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto overflow-x-hidden select-none p-2.5 transition-all duration-300`}>
      <div className="space-y-4">
        {/* Header / Logo */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-2'} py-2 mb-1`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="shrink-0 w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-mono font-bold text-xs shadow-sm">
                B
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-xs tracking-wide text-white uppercase whitespace-nowrap leading-tight">
                  BM3 STUDIO
                </span>
                <span className="text-[9px] font-mono text-zinc-500 font-semibold leading-tight">v4.0</span>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`shrink-0 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-[#18181b] transition-all ${isCollapsed ? 'w-8 h-8 flex items-center justify-center bg-blue-600/10 text-blue-400' : ''}`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menu List */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectMenu(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-2.5 py-2'} rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-[#18181b] text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141417]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`shrink-0 ${isActive ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      item.badge === 'LIVE'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Minimal Footer */}
      <div className={`pt-3 border-t border-[#1e1e24] flex flex-col gap-1.5 ${isCollapsed ? 'items-center' : ''}`}>
        {!isCollapsed ? (
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono mb-1">
            <button
              onClick={onOpenPresetManager}
              className="p-1.5 rounded-lg bg-[#141417] hover:bg-[#1c1c21] text-zinc-300 border border-[#23232a] flex items-center justify-center gap-1.5 transition-all"
            >
              <Bookmark className="w-3 h-3 text-amber-400" />
              <span>Presets</span>
            </button>

            <button
              onClick={onOpenObsModal}
              className={`p-1.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                obsConnected
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
                  : 'bg-[#141417] hover:bg-[#1c1c21] text-zinc-400 border-[#23232a]'
              }`}
            >
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>{obsConnected ? 'Linked' : 'OBS'}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 mb-1 w-full">
             <button
              onClick={onOpenPresetManager}
              title="Presets"
              className="w-full p-2.5 rounded-lg bg-[#141417] hover:bg-[#1c1c21] text-zinc-300 border border-[#23232a] flex justify-center transition-all"
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
            </button>
             <button
              onClick={onOpenObsModal}
              title={obsConnected ? 'OBS Linked' : 'OBS Disconnected'}
              className={`w-full p-2.5 rounded-lg border flex justify-center transition-all ${
                obsConnected
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
                  : 'bg-[#141417] hover:bg-[#1c1c21] text-zinc-400 border-[#23232a]'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        )}

        <button
          id="sidebar-settings-btn"
          title={isCollapsed ? 'Settings' : undefined}
          onClick={onOpenSettingsModal}
          className={`w-full ${isCollapsed ? 'p-2.5 justify-center' : 'px-2.5 py-2 justify-between'} rounded-lg hover:bg-[#141417] text-zinc-400 hover:text-white flex items-center text-[11px] font-medium transition-colors`}
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4" />
            {!isCollapsed && <span>System Settings</span>}
          </div>
          {!isCollapsed && <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />}
        </button>
      </div>
    </aside>
  );
};
