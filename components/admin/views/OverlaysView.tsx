import React, { useState, useRef, useEffect } from 'react';
import {
  Layers, ExternalLink, Copy, Check, Monitor, Trophy, Swords, Tv, Flame, Zap, Clock, AlertCircle, ShieldAlert, PlayCircle, Database, Plus, Edit2, Trash2, DownloadCloud
} from 'lucide-react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { OverlayFormModal } from '../OverlayFormModal';
import { DataImportExportModal } from '../DataImportExportModal';

interface OverlayItem {
  id: string;
  title: string;
  category: 'HUD' | 'ALERTS' | 'ESPORTS' | 'BROADCAST_SCREENS' | 'DATA';
  categoryLabel: string;
  description: string;
  path: string;
  resolution: string;
  badgeColor: string;
  icon: string;
  testAlertPayload?: any;
}

// 16:9 Live Scaled Preview Cover Component
const LiveOverlayThumbnail: React.FC<{ path: string; title: string }> = ({ path, title }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.18);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setScale(width / 1920);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  if (path.startsWith('/api')) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#09090c] border border-zinc-800/80 shadow-inner flex flex-col items-center justify-center text-zinc-500 font-mono text-[10px] gap-1.5 p-3 text-center my-2">
        <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/50">
          <Database className="w-4 h-4" />
        </div>
        <span className="text-zinc-200 font-bold text-xs">vMix Real-Time JSON Feed</span>
        <span className="text-[10px] text-zinc-400">Auto Data Source for vMix Title GT & OBS</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#070709] border border-zinc-800/80 shadow-inner flex items-center justify-center my-2 group"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(45deg, #18181f 25%, transparent 25%), linear-gradient(-45deg, #18181f 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181f 75%), linear-gradient(-45deg, transparent 75%, #18181f 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
        }}
      />
      <iframe
        src={path}
        title={title}
        onLoad={() => setIsLoaded(true)}
        className="pointer-events-none select-none absolute top-0 left-0 border-0 transition-opacity duration-300"
        style={{
          width: '1920px',
          height: '1080px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          opacity: isLoaded ? 1 : 0,
        }}
        loading="lazy"
      />
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[9px] font-mono font-bold text-zinc-300 border border-white/10 pointer-events-none shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>LIVE PREVIEW</span>
      </div>
    </div>
  );
};

import { OverlayFilterSidebar } from './OverlayFilterSidebar';

export const OverlaysView: React.FC = () => {
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [alertTriggered, setAlertTriggered] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOverlay, setEditingOverlay] = useState<OverlayItem | null>(null);
  
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const handleWindowClick = () => setOpenDropdownId(null);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  useEffect(() => {
    fetchOverlays();
  }, []);

  const fetchOverlays = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/overlays');
      const data = await res.json();
      if (data.success) {
        setOverlays(data.overlays.map((o: any) => ({
          ...o,
          testAlertPayload: o.testAlertPayload ? JSON.parse(o.testAlertPayload) : undefined
        })));
      }
    } catch (error) {
      console.error('Error fetching overlays:', error);
    } finally {
      setLoading(false);
    }
  };

  const overlayGroups: {
    key: string;
    label: string;
    icon: any;
    color: string;
    activeGradient: string;
    count: number;
  }[] = [
    {
      key: 'ALL',
      label: 'Semua Channel',
      icon: Layers,
      color: 'text-blue-400',
      activeGradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-blue-400/40',
      count: overlays.length,
    },
    {
      key: 'HUD',
      label: 'Scoreboards & HUD',
      icon: Trophy,
      color: 'text-blue-400',
      activeGradient: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 border-blue-400/40',
      count: overlays.filter((o) => o.category === 'HUD').length,
    },
    {
      key: 'ALERTS',
      label: 'In-Game Alerts & Popups',
      icon: Zap,
      color: 'text-amber-400',
      activeGradient: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/25 border-amber-400/40',
      count: overlays.filter((o) => o.category === 'ALERTS').length,
    },
    {
      key: 'ESPORTS',
      label: 'Esports Screens',
      icon: Swords,
      color: 'text-purple-400',
      activeGradient: 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/25 border-purple-400/40',
      count: overlays.filter((o) => o.category === 'ESPORTS').length,
    },
    {
      key: 'BROADCAST_SCREENS',
      label: 'Production Screens',
      icon: Tv,
      color: 'text-rose-400',
      activeGradient: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/25 border-rose-400/40',
      count: overlays.filter((o) => o.category === 'BROADCAST_SCREENS').length,
    },
    {
      key: 'DATA',
      label: 'Data Feed (vMix / OBS)',
      icon: Database,
      color: 'text-emerald-400',
      activeGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 border-emerald-400/40',
      count: overlays.filter((o) => o.category === 'DATA').length,
    },
  ];

  const handleOpenEditor = (id: string) => {
    window.location.href = `/admin/editor/${id}`;
  };

  const handlePreview = (path: string) => {
    window.open(path, '_blank');
  };

  const handleCopyControlUrl = (id: string) => {
    const controlUrl = `${window.location.origin}/admin/control?id=${id}`;
    navigator.clipboard.writeText(controlUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyOutputUrl = (path: string, id: string) => {
    const outputUrl = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(outputUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDuplicate = async (ov: OverlayItem) => {
    if (!confirm(`Are you sure you want to duplicate "${ov.title}"?`)) return;
    try {
      const res = await fetch('/api/overlays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ov,
          id: undefined,
          title: `${ov.title} (Copy)`,
        }),
      });
      if (res.ok) {
        fetchOverlays();
      } else {
        alert('Failed to duplicate overlay');
      }
    } catch (err) {
      console.error('Error duplicating overlay:', err);
    }
  };

  const handleCopy = (path: string, id: string) => {
    handleCopyOutputUrl(path, id);
  };

  const handleTestTrigger = async (payload: any, id: string) => {
    try {
      setAlertTriggered(id);
      await fetch('/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setTimeout(() => setAlertTriggered(null), 3000);
    } catch (err) {
      console.error('Failed to trigger test alert:', err);
      setAlertTriggered(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this overlay?')) return;
    try {
      const res = await fetch(`/api/overlays?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchOverlays();
      } else {
        alert('Failed to delete overlay');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveOverlay = async (overlay: Partial<OverlayItem>) => {
    try {
      const method = editingOverlay ? 'PUT' : 'POST';
      const payload = editingOverlay ? { ...overlay, id: editingOverlay.id } : overlay;
      
      const res = await fetch('/api/overlays', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchOverlays();
      } else {
        alert('Failed to save overlay');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getLucideIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? IconComponent : Monitor;
  };

  const filteredOverlays = overlays.filter((ov) => {
    const matchCategory = selectedCategory === 'ALL' || ov.category === selectedCategory;
    const matchSearch = ov.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const formatResolution = (res: string) => {
    if (!res) return '';
    const match = res.match(/(\d+)\s*[xX]\s*(\d+)/);
    if (match) {
      let result = `${match[1]} x ${match[2]}`;
      const lower = res.toLowerCase();
      if (lower.includes('alpha') || lower.includes('transparent') || lower.includes('alfa')) {
        result += ' Alpha';
      }
      return result;
    }
    return res;
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-4 font-sans items-start">
      {isFilterSidebarOpen && <OverlayFilterSidebar />}
      <div className="flex-1 space-y-4 min-w-0 h-full overflow-y-auto pr-2 custom-scrollbar">
      {/* New Header Layout */}
      <div className="flex flex-col gap-4 shrink-0 pb-4 border-b border-zinc-800/60 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-zinc-400 text-sm font-normal">My Overlays</p>
            <h1 className="text-white text-2xl font-semibold">Root folder</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:w-[300px] h-10 bg-[#18181e] border border-zinc-800 rounded-full flex items-center px-4 focus-within:border-zinc-600 transition-colors">
              <input 
                type="text" 
                placeholder="Search my overlays"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-zinc-500"
              />
              <LucideIcons.Search className="w-4 h-4 text-zinc-500" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
              className={`h-10 px-4 rounded-full font-bold text-sm flex items-center gap-2 transition-all shrink-0 border ${isFilterSidebarOpen ? 'bg-blue-600 text-white border-blue-500' : 'text-zinc-300 bg-[#18181e] border-zinc-800 hover:bg-[#202028] hover:text-white'}`}
            >
              <LucideIcons.Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            
            {/* Import Data */}
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="h-10 px-4 rounded-full font-bold text-sm flex items-center gap-2 text-zinc-300 bg-[#18181e] border border-zinc-800 hover:bg-[#202028] hover:text-white transition-all shrink-0"
            >
              <LucideIcons.FileUp className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>

            {/* Add Overlay */}
            <button
              onClick={() => { setEditingOverlay(null); setIsModalOpen(true); }}
              className="h-10 px-6 rounded-full font-bold text-sm flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-500 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Overlay</span>
            </button>
          </div>
        </div>

        {/* Second Row: View Controls & Results */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between mt-2">
          <div className="flex items-center gap-2">
            <button className="h-8 px-4 rounded-full text-xs font-bold flex items-center gap-1.5 bg-zinc-800 text-white border border-zinc-700">
              <LucideIcons.Clock className="w-3.5 h-3.5" /> Recent
            </button>
            <button className="h-8 px-4 rounded-full text-xs font-bold flex items-center gap-1.5 bg-transparent text-zinc-300 hover:bg-zinc-800/50 border border-zinc-800">
              <LucideIcons.ArrowDownAZ className="w-3.5 h-3.5" /> A-Z
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-zinc-800 bg-[#18181e]">
              <button onClick={() => setViewMode('grid')} className={`transition-opacity ${viewMode === 'grid' ? 'text-yellow-400 opacity-100' : 'text-zinc-500 opacity-60 hover:opacity-100'}`}>
                <LucideIcons.LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`transition-opacity ${viewMode === 'list' ? 'text-yellow-400 opacity-100' : 'text-zinc-500 opacity-60 hover:opacity-100'}`}>
                <LucideIcons.List className="w-4 h-4" />
              </button>
            </div>
            
            <span className="text-white text-sm font-bold">{filteredOverlays.length} Results</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-zinc-500">Loading overlays...</div>
      ) : (
        /* Categorized Overlays Grid or List */
        <div className={`w-full pb-12 ${viewMode === 'grid' ? 'grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col gap-4'}`}>
          {filteredOverlays.map((ov) => {
            const DropdownMenu = () => (
              <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg bg-[#1a1a24] border border-zinc-800 shadow-xl overflow-hidden text-zinc-300">
                <button onClick={(e) => { e.stopPropagation(); handleOpenEditor(ov.id); setOpenDropdownId(null); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold hover:bg-zinc-800/80 hover:text-white border-b border-zinc-800/60">
                  <LucideIcons.ExternalLink className="w-3.5 h-3.5" /> Open
                </button>
                <button onClick={(e) => { e.stopPropagation(); handlePreview(ov.path); setOpenDropdownId(null); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold hover:bg-zinc-800/80 hover:text-white border-b border-zinc-800/60">
                  <LucideIcons.Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleCopyControlUrl(ov.id); setOpenDropdownId(null); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold hover:bg-zinc-800/80 hover:text-white border-b border-zinc-800/60">
                  <LucideIcons.Link className="w-3.5 h-3.5" /> Copy control URL
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleCopyOutputUrl(ov.path, ov.id); setOpenDropdownId(null); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold hover:bg-zinc-800/80 hover:text-white border-b border-zinc-800/60">
                  <LucideIcons.Copy className="w-3.5 h-3.5" /> Copy output URL
                </button>
                <button onClick={(e) => { e.stopPropagation(); setEditingOverlay(ov); setIsModalOpen(true); setOpenDropdownId(null); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold hover:bg-zinc-800/80 hover:text-white border-b border-zinc-800/60">
                  <LucideIcons.Edit2 className="w-3.5 h-3.5" /> Rename
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDuplicate(ov); setOpenDropdownId(null); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold hover:bg-zinc-800/80 hover:text-white border-b border-zinc-800/60">
                  <LucideIcons.CopyPlus className="w-3.5 h-3.5" /> Duplicate
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(ov.id); setOpenDropdownId(null); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-950/30 hover:text-red-300">
                  <LucideIcons.Trash2 className="w-3.5 h-3.5" /> Move to trash
                </button>
              </div>
            );

            if (viewMode === 'list') {
              return (
                <div key={ov.id} className={`group bg-[#121216] hover:bg-[#18181e] relative flex w-full cursor-pointer flex-col rounded-2xl shadow-lg transition-colors border border-zinc-800/60 ${openDropdownId === ov.id ? 'z-50' : 'z-10'}`}>
                  <div className="flex w-full min-w-0 items-center gap-3 pr-3 lg:gap-5 lg:pr-5">
                    <div className="relative m-2 mr-0 aspect-video w-[176px] shrink-0 overflow-hidden rounded-lg bg-black/50">
                      <LiveOverlayThumbnail 
                        path={ov.testAlertPayload ? `${ov.path}${ov.path.includes('?') ? '&' : '?'}preview=${ov.testAlertPayload.type}&title=${encodeURIComponent(ov.testAlertPayload.title)}&subtitle=${encodeURIComponent(ov.testAlertPayload.subtitle || '')}` : ov.path} 
                        title={ov.title} 
                      />
                      <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setEditingOverlay(ov); setIsModalOpen(true); }} className="w-8 h-8 rounded-md bg-black/60 hover:bg-black/80 flex items-center justify-center text-white backdrop-blur-sm border border-white/10" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mr-auto flex min-w-0 flex-col items-start gap-1 self-stretch py-3 lg:justify-center">
                      <div className="flex h-9 w-full min-w-0 items-center gap-1.5">
                        <div className="text-white min-w-0 flex-1 truncate text-base font-bold" title={ov.title}>{ov.title}</div>
                      </div>
                      <div className="inline-flex">
                        <button className="flex h-4 items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white">
                           <LucideIcons.FolderOpen className="w-4 h-4" />
                           <span className="truncate">Move to folder</span>
                        </button>
                      </div>
                    </div>

                    <div className="hidden lg:flex min-w-[140px]">
                      <div className="flex w-full flex-wrap gap-2">
                        <span className="inline-flex shrink-0 items-center rounded-lg bg-zinc-800/80 text-zinc-300 px-2 py-1 text-xs border border-zinc-700/50">{ov.categoryLabel}</span>
                        {ov.resolution && <span className="inline-flex shrink-0 items-center rounded-lg bg-zinc-800/80 text-zinc-300 px-2 py-1 text-xs border border-zinc-700/50">{formatResolution(ov.resolution)}</span>}
                      </div>
                    </div>

                    <div className="hidden lg:flex min-w-[120px]">
                      <div className="text-zinc-500 text-xs truncate max-w-[150px]">Path: {ov.path}</div>
                    </div>

                    <div className="hidden items-center gap-4 lg:flex">
                      <div className="group/action flex cursor-pointer flex-col items-center">
                         <button onClick={(e) => { e.stopPropagation(); window.open(ov.path, '_blank'); }} className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                            <LucideIcons.ExternalLink className="w-4 h-4" />
                         </button>
                         <span className="text-[10px] font-semibold text-zinc-500">Open</span>
                      </div>
                      <div className="group/action flex cursor-pointer flex-col items-center">
                         <button onClick={(e) => { e.stopPropagation(); handleCopy(ov.path, ov.id); }} className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                            {copiedId === ov.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                         </button>
                         <span className="text-[10px] font-semibold text-zinc-500">Copy</span>
                      </div>
                      {ov.testAlertPayload && (
                        <div className="group/action flex cursor-pointer flex-col items-center">
                           <button onClick={(e) => { e.stopPropagation(); handleTestTrigger(ov.testAlertPayload, ov.id); }} className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${alertTriggered === ov.id ? 'bg-amber-500 text-black' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}>
                              <PlayCircle className="w-4 h-4" />
                           </button>
                           <span className="text-[10px] font-semibold text-zinc-500">Test</span>
                        </div>
                      )}
                    </div>

                    <div className="border-zinc-800/60 hidden h-[68px] border-r border-dashed lg:block ml-2"></div>

                    <div className="shrink-0 relative ml-2">
                      <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === ov.id ? null : ov.id); }} className="text-zinc-400 inline-flex h-9 w-9 items-center justify-center hover:text-white hover:bg-zinc-800/50 rounded-full transition-colors">
                        <LucideIcons.MoreHorizontal className="w-5 h-5" />
                      </button>
                      {openDropdownId === ov.id && <DropdownMenu />}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={ov.id}
                className={`group bg-[#121216] hover:bg-[#18181e] relative flex cursor-pointer flex-col rounded-xl shadow-lg transition-colors border border-zinc-800/60 ${openDropdownId === ov.id ? 'z-50' : 'z-10'}`}
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-[164/92] overflow-hidden bg-black/50 rounded-t-xl">
                  <LiveOverlayThumbnail 
                    path={ov.testAlertPayload ? `${ov.path}${ov.path.includes('?') ? '&' : '?'}preview=${ov.testAlertPayload.type}&title=${encodeURIComponent(ov.testAlertPayload.title)}&subtitle=${encodeURIComponent(ov.testAlertPayload.subtitle || '')}` : ov.path} 
                    title={ov.title} 
                  />
                  {/* Overlay buttons on thumbnail */}
                  <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleCopy(ov.path, ov.id); }} className="w-8 h-8 rounded-md bg-black/60 hover:bg-black/80 flex items-center justify-center text-white backdrop-blur-sm border border-white/10" title="Copy URL">
                      {copiedId === ov.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setEditingOverlay(ov); setIsModalOpen(true); }} className="w-8 h-8 rounded-md bg-black/60 hover:bg-black/80 flex items-center justify-center text-white backdrop-blur-sm border border-white/10" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(ov.id); }} className="w-8 h-8 rounded-md bg-black/60 hover:bg-red-500/80 flex items-center justify-center text-white backdrop-blur-sm border border-white/10" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-col p-4 gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-white text-base font-bold truncate leading-tight flex-1" title={ov.title}>
                      {ov.title}
                    </h3>
                    <div className="relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === ov.id ? null : ov.id); }}
                        className="text-zinc-400 hover:text-white shrink-0"
                      >
                        <LucideIcons.MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {openDropdownId === ov.id && <DropdownMenu />}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
                    <LucideIcons.FolderOpen className="w-4 h-4" />
                    <span className="truncate">Move to folder</span>
                  </div>

                  <div className="flex w-full flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-lg bg-zinc-800/80 text-zinc-300 px-2.5 py-1 text-xs font-normal border border-zinc-700/50">
                      {ov.categoryLabel}
                    </span>
                    {ov.resolution && (
                      <span className="inline-flex items-center rounded-lg bg-zinc-800/80 text-zinc-300 px-2.5 py-1 text-xs font-normal border border-zinc-700/50">
                        {formatResolution(ov.resolution)}
                      </span>
                    )}
                  </div>

                  <div className="text-zinc-500 mt-1 flex items-center gap-1 border-b border-zinc-800/60 pb-3">
                    <span className="text-[10px] leading-none truncate">Path: {ov.path}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-1">
                    {ov.testAlertPayload && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTestTrigger(ov.testAlertPayload, ov.id); }}
                        className={`px-3 py-2 rounded-md text-xs font-bold transition-all flex flex-1 items-center justify-center gap-1.5 ${
                          alertTriggered === ov.id
                            ? 'bg-amber-500 text-black'
                            : 'bg-amber-950/40 text-amber-400 border border-amber-900/60 hover:bg-amber-900/60'
                        }`}
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        {alertTriggered === ov.id ? 'TRIGGERED!' : 'TEST DSK'}
                      </button>
                    )}
                    <Link
                      href={ov.path}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-2 rounded-md text-xs font-bold transition-all flex flex-1 items-center justify-center gap-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      LAUNCH
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <OverlayFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveOverlay}
        overlayData={editingOverlay}
      />

      <DataImportExportModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />
      </div>
    </div>
  );
};
