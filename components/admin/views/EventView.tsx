import React, { useState, useEffect } from 'react';
import { LiveBroadcastState, EventCategory, EventSubType } from '@/lib/types';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Search,
  Radio,
  X,
  Trophy,
  Gamepad2,
  Tv,
  Layers,
  ChevronDown,
  Download,
} from 'lucide-react';
import { EventImportExportModal } from '../EventImportExportModal';

interface EventViewProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
}

interface EventItem {
  id: string;
  name: string;
  category?: string;
  subType?: string;
  eventType: string;
  location?: string | null;
  startDate: string;
  bracketFormat?: string;
  bracketSize?: number;
  hasThirdPlace?: boolean;
  matches?: any[];
}

export const CATEGORY_OPTIONS: { value: EventCategory; label: string; icon: any }[] = [
  { value: 'SPORT', label: '🏆 Single Sport (Olahraga Tunggal)', icon: Trophy },
  { value: 'ESPORT', label: '🎮 Single Esport (Game Esports Tunggal)', icon: Gamepad2 },
  { value: 'GENERAL', label: '🎙️ General Event / Show (Acara Umum)', icon: Tv },
  { value: 'MULTI_EVENT', label: '🌐 Multi Event (Multi Cabang & Game Bebas)', icon: Layers },
];

export const SUBTYPE_BY_CATEGORY: Record<EventCategory, { value: EventSubType; label: string }[]> = {
  SPORT: [
    { value: 'FOOTBALL', label: '⚽ Sepak Bola (Football / Soccer)' },
    { value: 'FUTSAL', label: '🥅 Futsal' },
    { value: 'VOLLEYBALL', label: '🏐 Bola Voli (Volleyball)' },
    { value: 'BADMINTON', label: '🏸 Bulutangkis (Badminton)' },
    { value: 'BASKETBALL', label: '🏀 Bola Basket (Basketball)' },
  ],
  ESPORT: [
    { value: 'MLBB', label: '⚔️ Mobile Legends: Bang Bang (MLBB)' },
    { value: 'PUBG_MOBILE', label: '🪂 PUBG Mobile (Battle Royale)' },
    { value: 'FREE_FIRE', label: '🔥 Free Fire (Battle Royale)' },
    { value: 'VALORANT', label: '🎯 Valorant (Tactical FPS)' },
    { value: 'EFOOTBALL', label: '🎮 eFootball / EA FC (FIFA)' },
  ],
  GENERAL: [
    { value: 'TALKSHOW', label: '🎙️ Talkshow & Seminar' },
    { value: 'AWARD_SHOW', label: '🏆 Award Show & Penganugerahan' },
    { value: 'MUSIC_CONCERT', label: '🎵 Konser Musik / Performance' },
    { value: 'GENERAL', label: '📋 Acara Umum Standar' },
  ],
  MULTI_EVENT: [
    { value: 'FOOTBALL', label: '⚽ Sepak Bola' },
    { value: 'FUTSAL', label: '🥅 Futsal' },
    { value: 'VOLLEYBALL', label: '🏐 Bola Voli' },
    { value: 'BADMINTON', label: '🏸 Bulutangkis' },
    { value: 'BASKETBALL', label: '🏀 Bola Basket' },
    { value: 'MLBB', label: '⚔️ Mobile Legends (MLBB)' },
    { value: 'PUBG_MOBILE', label: '🪂 PUBG Mobile' },
    { value: 'FREE_FIRE', label: '🔥 Free Fire' },
    { value: 'TALKSHOW', label: '🎙️ Talkshow & Seminar' },
  ],
};

export const EventView: React.FC<EventViewProps> = ({ state, updateState }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Teams & Bracket Setup
  const [teams, setTeams] = useState<any[]>([]);
  const [isBracketSetupOpen, setIsBracketSetupOpen] = useState(false);
  const [bracketSetupEventId, setBracketSetupEventId] = useState<string | null>(null);
  const [bracketSetupSize, setBracketSetupSize] = useState<number>(8);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<EventCategory>('SPORT');
  const [formSubType, setFormSubType] = useState<EventSubType>('FOOTBALL');
  const [formBracketFormat, setFormBracketFormat] = useState('SINGLE_ELIMINATION');
  const [formBracketSize, setFormBracketSize] = useState<number>(8);
  const [formHasThirdPlace, setFormHasThirdPlace] = useState(false);
  const [formLocation, setFormLocation] = useState('');
  const [formDateTime, setFormDateTime] = useState('');

  const fetchEvents = () => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) setEvents(data.events);
      })
      .catch((err) => console.error(err));
  };

  const fetchTeams = () => {
    fetch('/api/teams')
      .then((res) => res.json())
      .then((data) => {
        if (data.teams) setTeams(data.teams);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchEvents();
    fetchTeams();
  }, []);

  const handleCategoryChange = (cat: EventCategory) => {
    setFormCategory(cat);
    const subOptions = SUBTYPE_BY_CATEGORY[cat];
    if (subOptions && subOptions.length > 0) {
      setFormSubType(subOptions[0].value);
    }
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormName('');
    setFormCategory('SPORT');
    setFormSubType('FOOTBALL');
    setFormBracketFormat('SINGLE_ELIMINATION');
    setFormBracketSize(8);
    setFormHasThirdPlace(false);
    setFormLocation('');
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setFormDateTime(localIso);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: EventItem) => {
    setEditingEvent(ev);
    setFormName(ev.name);
    const cat = (ev.category as EventCategory) || 'SPORT';
    setFormCategory(cat);
    setFormSubType((ev.subType as EventSubType) || (cat === 'ESPORT' ? 'MLBB' : 'FOOTBALL'));
    setFormBracketFormat(ev.bracketFormat || 'SINGLE_ELIMINATION');
    setFormBracketSize(ev.bracketSize || 8);
    setFormHasThirdPlace(ev.hasThirdPlace || false);
    setFormLocation(ev.location || '');
    try {
      const dt = new Date(ev.startDate);
      const localIso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setFormDateTime(localIso);
    } catch {
      setFormDateTime('');
    }
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      if (editingEvent) {
        // UPDATE
        const res = await fetch('/api/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingEvent.id,
            name: formName,
            category: formCategory,
            subType: formSubType,
            bracketFormat: formBracketFormat,
            bracketSize: formBracketSize,
            hasThirdPlace: formHasThirdPlace,
            location: formLocation,
            startDate: formDateTime ? new Date(formDateTime).toISOString() : undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          fetchEvents();
        }
      } else {
        // CREATE
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            category: formCategory,
            subType: formSubType,
            bracketFormat: formBracketFormat,
            bracketSize: formBracketSize,
            hasThirdPlace: formHasThirdPlace,
            location: formLocation,
            startDate: formDateTime ? new Date(formDateTime).toISOString() : new Date().toISOString(),
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          fetchEvents();
        }
      }
    } catch (err) {
      console.error('Error saving event:', err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus acara ini?')) return;
    try {
      const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchEvents();
      }
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const handleSetActiveEvent = async (ev: EventItem) => {
    let derivedEventType = ev.eventType as any;
    if (!derivedEventType) {
      if (ev.category === 'ESPORT' || ev.category === 'MULTI_EVENT') {
        if (ev.subType === 'MLBB') derivedEventType = 'ESPORT_MOBA';
        else if (ev.subType === 'PUBG_MOBILE' || ev.subType === 'FREE_FIRE') derivedEventType = 'ESPORT_BR';
        else derivedEventType = 'SPORT';
      } else if (ev.category === 'GENERAL') {
        derivedEventType = 'GENERAL';
      } else {
        derivedEventType = 'SPORT';
      }
    }

    const payload: Partial<LiveBroadcastState> = {
      eventName: ev.name,
      eventCategory: (ev.category as EventCategory) || 'SPORT',
      eventSubType: (ev.subType as EventSubType) || 'FOOTBALL',
      eventType: derivedEventType,
    };

    updateState(payload);

    try {
      await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ev.id,
          setActive: true,
        }),
      });
    } catch (err) {
      console.error('Failed to set active event:', err);
    }
  };

  const handleOpenBracketSetup = (id: string, bracketSize?: number) => {
    if (!bracketSize || bracketSize < 4) {
      alert('Ukuran bracket minimal 4 tim. Silakan edit acara ini terlebih dahulu.');
      return;
    }
    setBracketSetupEventId(id);
    setBracketSetupSize(bracketSize);
    setSelectedTeamIds([]);
    setIsBracketSetupOpen(true);
  };

  const handleToggleTeamSelection = (teamId: string) => {
    setSelectedTeamIds(prev => {
      if (prev.includes(teamId)) return prev.filter(id => id !== teamId);
      if (prev.length >= bracketSetupSize) {
        alert(`Maksimal ${bracketSetupSize} tim untuk bracket ini.`);
        return prev;
      }
      return [...prev, teamId];
    });
  };

  const handleGenerateBracket = async () => {
    if (!bracketSetupEventId) return;
    
    if (!confirm(`Apakah Anda yakin ingin men-generate bracket dengan ${selectedTeamIds.length} tim? Peringatan: Ini akan MENGHAPUS seluruh jadwal pertandingan yang sudah ada di dalam acara ini!`)) return;

    try {
      const res = await fetch('/api/events/bracket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventId: bracketSetupEventId,
          teamIds: selectedTeamIds
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setIsBracketSetupOpen(false);
        fetchEvents();
      } else {
        alert('Gagal: ' + data.error);
      }
    } catch (err) {
      console.error('Error generating bracket:', err);
      alert('Gagal men-generate bracket. Periksa console.');
    }
  };

  const getSubtypeLabel = (sub?: string) => {
    if (!sub) return '-';
    for (const cat of Object.keys(SUBTYPE_BY_CATEGORY) as EventCategory[]) {
      const found = SUBTYPE_BY_CATEGORY[cat].find((s) => s.value === sub);
      if (found) return found.label;
    }
    return sub;
  };

  const formatEventDateTime = (isoDateString: string) => {
    try {
      const d = new Date(isoDateString);
      return d.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoDateString;
    }
  };

  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (e.category && e.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (e.subType && e.subType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4 font-sans">
      {/* Header Bar */}
      <div className="min-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121215] border border-[#1e1e24]">
        <div>
          <h2 className="font-heading font-bold text-sm text-white uppercase flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Manajemen Acara & Kategori Disiplin (CRUD)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Pilih kategori (Single Sport, Single Esport, General Event, atau Multi Event) & jenis acara
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="min-btn px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
          >
            <Download className="w-4 h-4" />
            <span>Import Event</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="min-btn-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Acara Baru</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari nama acara, jenis game, atau lokasi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#141417] border border-[#23232a] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
        />
      </div>

      {/* Vertical Card Stack List (1 Acara per Baris ke Bawah) */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="min-card p-8 text-center text-zinc-500 text-xs font-mono">
            Belum ada acara terdaftar. Klik "+ Tambah Acara Baru" untuk membuat jadwal acara.
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const isActive = state.eventName === ev.name;

            return (
              <div
                key={ev.id}
                className={`min-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isActive
                    ? 'border-blue-500/50 bg-[#121624] shadow-md shadow-blue-500/5'
                    : 'bg-[#121215] hover:border-zinc-700'
                }`}
              >
                {/* Event Left Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Category & Subtype Badges */}
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {ev.category === 'MULTI_EVENT' ? '🌐 MULTI EVENT' : ev.category || 'SPORT'}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {getSubtypeLabel(ev.subType)}
                    </span>

                    {isActive && (
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>ACTIVE ON CONTROLLER</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-black text-sm text-white uppercase tracking-wide">
                    {ev.name}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-zinc-400 font-mono flex-wrap">
                    <div className="flex items-center gap-1 text-zinc-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{formatEventDateTime(ev.startDate)}</span>
                    </div>

                    {ev.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{ev.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Right Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleSetActiveEvent(ev)}
                    disabled={isActive}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{isActive ? 'Sedang Aktif' : 'Aktifkan ke Controller'}</span>
                  </button>

                  {(ev.bracketSize || 0) >= 4 && (
                    <button
                      onClick={() => handleOpenBracketSetup(ev.id, ev.bracketSize)}
                      className="p-1.5 rounded-md bg-[#18181b] hover:bg-purple-900/40 text-zinc-400 hover:text-purple-400 border border-zinc-700 transition-colors"
                      title="Setup Bracket & Tim"
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEdit(ev)}
                    className="p-1.5 rounded-md bg-[#18181b] hover:bg-[#202026] text-zinc-400 hover:text-white border border-zinc-700 transition-colors"
                    title="Edit Acara"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="p-1.5 rounded-md bg-[#18181b] hover:bg-rose-900/40 text-zinc-400 hover:text-rose-400 border border-zinc-700 transition-colors"
                    title="Hapus Acara"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Dialog Form (Create / Edit with Kategori & Jenis Acara) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="min-card w-full max-w-lg p-5 bg-[#121215] border border-zinc-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e1e24]">
              <h3 className="font-heading font-bold text-sm text-white uppercase">
                {editingEvent ? 'Edit Acara & Kategori' : 'Tambah Acara Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Nama Acara / Turnamen *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PIALA KEMENPORA 2026 atau MPL SEASON 14"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 1. Kategori Event Form (Dropdown Select) */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Kategori Event *</label>
                <div className="relative">
                  <select
                    value={formCategory}
                    onChange={(e) => handleCategoryChange(e.target.value as EventCategory)}
                    className="w-full bg-[#18181b] border border-[#27272a] focus:border-blue-500 rounded-lg px-3 py-2 text-white font-bold appearance-none cursor-pointer focus:outline-none"
                  >
                    <option value="SPORT">🏆 Single Sport (Olahraga Tunggal)</option>
                    <option value="ESPORT">🎮 Single Esport (Game Esports Tunggal)</option>
                    <option value="GENERAL">🎙️ General Event / Show (Acara Umum)</option>
                    <option value="MULTI_EVENT">🌐 Multi Event (Multi Cabang Olahraga / Game Bebas)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formCategory === 'MULTI_EVENT' && (
                  <p className="text-[11px] text-blue-400 mt-1 font-mono">
                    * Multi Event: Operator dapat bebas mengganti jenis olahraga/game kapan saja langsung dari Controller.
                  </p>
                )}
              </div>

              {/* 2. Jenis Acara / Game Form (Dynamic based on Category) */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1">
                  Jenis Acara / Game Default *
                </label>
                <div className="relative">
                  <select
                    value={formSubType}
                    onChange={(e) => setFormSubType(e.target.value as EventSubType)}
                    className="w-full bg-[#18181b] border border-[#27272a] focus:border-blue-500 rounded-lg px-3 py-2 text-white font-medium appearance-none cursor-pointer focus:outline-none"
                  >
                    {SUBTYPE_BY_CATEGORY[formCategory]?.map((sub) => (
                      <option key={sub.value} value={sub.value}>
                        {sub.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 3. Format Bracket */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">
                    Sistem Turnamen *
                  </label>
                  <div className="relative">
                    <select
                      value={formBracketFormat}
                      onChange={(e) => setFormBracketFormat(e.target.value)}
                      className="w-full bg-[#18181b] border border-[#27272a] focus:border-blue-500 rounded-lg px-3 py-2 text-white font-medium appearance-none cursor-pointer focus:outline-none"
                    >
                      <option value="SINGLE_ELIMINATION">Single Elimination Bracket (Gugur Sekali)</option>
                      <option value="DOUBLE_ELIMINATION">Double Elimination Bracket</option>
                      <option value="GROUP_STAGE">Group Stage Bracket (Fase Grup)</option>
                      <option value="PLAYOFF">Playoff Bracket (Playoff)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">
                    Ukuran Bracket *
                  </label>
                  <div className="relative">
                    <select
                      value={formBracketSize}
                      onChange={(e) => setFormBracketSize(parseInt(e.target.value, 10))}
                      className="w-full bg-[#18181b] border border-[#27272a] focus:border-blue-500 rounded-lg px-3 py-2 text-white font-medium appearance-none cursor-pointer focus:outline-none"
                    >
                      <option value={0}>Tidak Menggunakan Bracket</option>
                      <option value={4}>4 Tim (Semi Final - Final)</option>
                      <option value={8}>8 Tim (Quarter Final - Final)</option>
                      <option value={16}>16 Tim (16 Besar - Final)</option>
                      <option value={32}>32 Tim (32 Besar - Final)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-[#18181b] border border-[#27272a] hover:border-zinc-600 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formHasThirdPlace}
                    onChange={(e) => setFormHasThirdPlace(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-blue-500 focus:ring-blue-500/20 cursor-pointer"
                  />
                  <span className="text-zinc-300 font-medium select-none">Tampilkan Pertandingan Perebutan Juara 3</span>
                </label>
              </div>

              {/* 4. Waktu Pelaksanaan */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Waktu Pelaksanaan (Tanggal & Jam) *</label>
                <input
                  type="datetime-local"
                  required
                  value={formDateTime}
                  onChange={(e) => setFormDateTime(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 4. Lokasi */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Lokasi / Venue (Opsional)</label>
                <input
                  type="text"
                  placeholder="e.g. Istora Senayan Jakarta / Online Stage"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1e1e24]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-btn px-4 py-2 text-xs font-semibold"
                >
                  Batal
                </button>
                <button type="submit" className="min-btn-primary px-4 py-2 text-xs font-semibold">
                  {editingEvent ? 'Simpan Perubahan' : 'Buat Acara'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Bracket Setup Modal */}
      {isBracketSetupOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="min-card w-full max-w-2xl p-5 bg-[#121215] border border-zinc-700 shadow-2xl space-y-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e1e24] shrink-0">
              <div>
                <h3 className="font-heading font-bold text-sm text-white uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Setup Tim Bracket</span>
                </h3>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">
                  Pilih tim yang akan bermain. Tim pertama yang dipilih akan menjadi Seed 1, dst. Sisa slot akan menjadi BYE.
                </p>
              </div>
              <button onClick={() => setIsBracketSetupOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teams.map((t) => {
                  const isSelected = selectedTeamIds.includes(t.id);
                  const seedIndex = selectedTeamIds.indexOf(t.id) + 1;
                  return (
                    <div 
                      key={t.id} 
                      onClick={() => handleToggleTeamSelection(t.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                        ? 'bg-purple-900/20 border-purple-500/50' 
                        : 'bg-[#18181b] border-[#27272a] hover:border-zinc-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={t.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${t.name}`} alt={t.name} className="w-6 h-6 object-contain" />
                        <span className={`text-xs font-bold font-heading truncate w-32 ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{t.name}</span>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-mono font-bold bg-purple-500 text-white px-2 py-0.5 rounded">
                          Seed {seedIndex}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 pt-4 border-t border-[#1e1e24] flex items-center justify-between">
              <div className="text-xs font-mono text-zinc-400">
                Terpilih: <span className="text-white font-bold">{selectedTeamIds.length}</span> / {bracketSetupSize} Tim 
                (BYE: <span className="text-amber-400 font-bold">{bracketSetupSize - selectedTeamIds.length}</span>)
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsBracketSetupOpen(false)}
                  className="min-btn px-4 py-2 text-xs font-semibold text-zinc-400"
                >
                  Batal
                </button>
                <button 
                  onClick={handleGenerateBracket}
                  className="min-btn-primary bg-purple-600 hover:bg-purple-500 border-purple-500/50 px-4 py-2 text-xs font-semibold"
                >
                  Generate {bracketSetupSize} Bracket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <EventImportExportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={fetchEvents}
      />
    </div>
  );
};
