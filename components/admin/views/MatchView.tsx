import React, { useState, useEffect } from 'react';
import { LiveBroadcastState } from '@/lib/types';
import {
  Swords,
  Plus,
  Edit2,
  Trash2,
  Radio,
  Search,
  X,
  CheckCircle2,
  Calendar,
  FileDown,
  FileUp,
  Network,
} from 'lucide-react';
import { DataImportExportModal } from '@/components/admin/DataImportExportModal';
import { BracketModal } from '@/components/admin/BracketModal';

interface MatchViewProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
  triggerAlert: (alert: any) => void;
  onNavigateToController?: () => void;
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
  currentPeriod?: string | null;
  scheduledTime: string;
  matchNumber?: number;
  round?: string | null;
  event?: { name: string; eventType: string };
  winnerNextId?: string | null;
  loserNextId?: string | null;
}

export const MatchView: React.FC<MatchViewProps> = ({ state, updateState, onNavigateToController }) => {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedEventFilter, setSelectedEventFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENYISIHAN' | 'LANJUTAN'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isBracketModalOpen, setIsBracketModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchItem | null>(null);

  // Form State
  const [formEventId, setFormEventId] = useState('');
  const [formTeamAId, setFormTeamAId] = useState('');
  const [formTeamBId, setFormTeamBId] = useState('');
  const [formBoSeries, setFormBoSeries] = useState(1);
  const [formPeriod, setFormPeriod] = useState('Half 1');
  const [formScoreA, setFormScoreA] = useState(0);
  const [formScoreB, setFormScoreB] = useState(0);
  const [formStatus, setFormStatus] = useState('UPCOMING');
  const [formMatchNumber, setFormMatchNumber] = useState(1);
  const [formScheduledTime, setFormScheduledTime] = useState('');
  const [formRound, setFormRound] = useState('');

  const fetchMatches = () => {
    fetch('/api/matches')
      .then((res) => res.json())
      .then((data) => {
        if (data.matches) setMatches(data.matches);
      })
      .catch((err) => console.error(err));
  };

  const fetchEventsAndTeams = () => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
          if (data.events.length > 0 && !formEventId) setFormEventId(data.events[0].id);
        }
      })
      .catch((err) => console.error(err));

    fetch('/api/teams')
      .then((res) => res.json())
      .then((data) => {
        if (data.teams) {
          setTeams(data.teams);
          if (data.teams.length >= 2 && !formTeamAId) {
            setFormTeamAId(data.teams[0].id);
            setFormTeamBId(data.teams[1].id);
          }
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchMatches();
    fetchEventsAndTeams();
  }, []);

  const handleOpenCreate = () => {
    setEditingMatch(null);
    setFormBoSeries(state.boSeries || 1);
    setFormPeriod('Half 1');
    setFormScoreA(0);
    setFormScoreB(0);
    setFormStatus('UPCOMING');
    setFormMatchNumber(matches.length + 1);
    const now = new Date();
    setFormScheduledTime(new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setFormRound('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: MatchItem) => {
    setEditingMatch(m);
    setFormEventId(m.eventId);
    setFormTeamAId(m.teamA?.id || '');
    setFormTeamBId(m.teamB?.id || '');
    setFormBoSeries(m.boSeries || 1);
    setFormPeriod(m.currentPeriod || 'Half 1');
    setFormScoreA(m.scoreA);
    setFormScoreB(m.scoreB);
    setFormStatus(m.status);
    setFormMatchNumber(m.matchNumber || 1);
    setFormRound(m.round || '');
    try {
      const dt = new Date(m.scheduledTime);
      setFormScheduledTime(new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    } catch {
      setFormScheduledTime('');
    }
    setIsModalOpen(true);
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEventId) return;

    try {
      if (editingMatch) {
        // UPDATE
        const res = await fetch('/api/matches', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingMatch.id,
            teamAId: formTeamAId || undefined,
            teamBId: formTeamBId || undefined,
            boSeries: formBoSeries,
            currentPeriod: formPeriod,
            scoreA: formScoreA,
            scoreB: formScoreB,
            status: formStatus,
            matchNumber: formMatchNumber,
            round: formRound,
            scheduledTime: formScheduledTime ? new Date(formScheduledTime).toISOString() : undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          fetchMatches();
        }
      } else {
        // CREATE
        const res = await fetch('/api/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: formEventId || events[0]?.id,
            teamAId: formTeamAId || undefined,
            teamBId: formTeamBId || undefined,
            boSeries: formBoSeries,
            currentPeriod: formPeriod,
            matchNumber: formMatchNumber,
            round: formRound,
            scheduledTime: formScheduledTime ? new Date(formScheduledTime).toISOString() : undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          fetchMatches();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return;
    try {
      const res = await fetch(`/api/matches?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchMatches();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivateMatchOnStream = async (m: MatchItem) => {
    try {
      await fetch('/api/matches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: m.id,
          setActive: true,
          status: 'LIVE',
        }),
      });
      fetchMatches();
      if (onNavigateToController) {
        onNavigateToController();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const lanjutanIds = new Set<string>();
  matches.forEach(m => {
    if (m.winnerNextId) lanjutanIds.add(m.winnerNextId);
    if (m.loserNextId) lanjutanIds.add(m.loserNextId);
  });

  const filteredMatches = matches.filter((m) => {
    const matchEvent =
      selectedEventFilter === 'ALL' ||
      m.eventId === selectedEventFilter ||
      (m.event && m.event.name.toLowerCase() === selectedEventFilter.toLowerCase());

    const matchStatus =
      statusFilter === 'ALL' ||
      m.status === statusFilter ||
      (statusFilter === 'FINISH' && m.status === 'FINISHED');
      
    const matchTab = 
      activeTab === 'ALL' ||
      (activeTab === 'LANJUTAN' && lanjutanIds.has(m.id)) ||
      (activeTab === 'PENYISIHAN' && !lanjutanIds.has(m.id));

    return matchEvent && matchStatus && matchTab;
  }).sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));

  return (
    <div className="space-y-4 font-sans">
      {/* Match Schedule & Database Header */}
      <div className="min-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e1e24]">
          <div>
            <h2 className="font-heading font-bold text-sm text-white uppercase flex items-center gap-2">
              <Swords className="w-4 h-4 text-blue-400" />
              <span>Daftar Pertandingan & Jadwal (Match CRUD)</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Kelola seluruh match pertandingan dan muat instan ke tayangan siaran</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportExportOpen(true)}
              className="p-2 rounded-lg text-xs font-mono font-bold bg-[#141418] hover:bg-[#1f1f26] border border-zinc-800 hover:border-zinc-700 text-zinc-300 flex items-center justify-center transition-all shadow-sm cursor-pointer"
              title="Import / Export Data Match (Template, CSV, Excel)"
            >
              <FileDown className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={() => setIsBracketModalOpen(true)}
              className="p-2 rounded-lg text-xs font-mono font-bold bg-[#141418] hover:bg-[#1f1f26] border border-zinc-800 hover:border-zinc-700 text-zinc-300 flex items-center justify-center transition-all shadow-sm cursor-pointer"
              title="Tampilkan Bracket"
            >
              <Network className="w-4 h-4 text-purple-400" />
            </button>

            <button
              onClick={handleOpenCreate}
              className="p-2 rounded-lg text-xs font-mono font-bold bg-[#141418] hover:bg-[#1f1f26] border border-zinc-800 hover:border-zinc-700 text-zinc-300 flex items-center justify-center transition-all shadow-sm cursor-pointer"
              title="Tambah Match Baru"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* 2 Form Filter Bar: Berdasarkan Nama Event & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Form Filter 1: Nama Event */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Filter Berdasarkan Acara / Event:</span>
            </label>
            <select
              value={selectedEventFilter}
              onChange={(e) => setSelectedEventFilter(e.target.value)}
              className="w-full bg-[#141417] border border-[#23232a] hover:border-zinc-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 cursor-pointer font-medium transition-colors"
            >
              <option value="ALL">🌐 Semua Event / Turnamen</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.subType || ev.category})
                </option>
              ))}
            </select>
          </div>

          {/* Form Filter 2: Status (ALL, LIVE, UPCOMING, FINISH) */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              <span>Filter Berdasarkan Status Match:</span>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#141417] border border-[#23232a] hover:border-zinc-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 cursor-pointer font-medium transition-colors"
            >
              <option value="ALL">📋 Semua Status (ALL)</option>
              <option value="LIVE">🔴 LIVE (Sedang Bertanding)</option>
              <option value="UPCOMING">⏳ UPCOMING (Akan Datang)</option>
              <option value="FINISHED">🏁 FINISH (Selesai)</option>
            </select>
          </div>
        </div>

        {/* 3 Tabs: Penyisihan, Lanjutan, Semua */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#1e1e24] overflow-x-auto custom-scrollbar pb-1">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono whitespace-nowrap transition-all ${
              activeTab === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white hover:border-zinc-500'
            }`}
          >
            Semua Match
          </button>
          <button
            onClick={() => setActiveTab('PENYISIHAN')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono whitespace-nowrap transition-all ${
              activeTab === 'PENYISIHAN'
                ? 'bg-blue-600 text-white'
                : 'bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white hover:border-zinc-500'
            }`}
          >
            Babak Penyisihan (Round 1)
          </button>
          <button
            onClick={() => setActiveTab('LANJUTAN')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono whitespace-nowrap transition-all ${
              activeTab === 'LANJUTAN'
                ? 'bg-blue-600 text-white'
                : 'bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white hover:border-zinc-500'
            }`}
          >
            Babak Lanjutan (Winner Bracket)
          </button>
        </div>
      </div>

      {/* Vertical Match Card Stack (Card ke Bawah) */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="min-card p-8 text-center text-zinc-500 text-xs font-mono">
            Belum ada pertandingan terdaftar. Klik "+ Tambah Match Baru" untuk membuat jadwal laga baru.
          </div>
        ) : (
          filteredMatches.map((m) => {
            const isMatchActive = Boolean(state.matchId && m.id === state.matchId);

            return (
              <div
                key={m.id}
                className={`min-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  isMatchActive
                    ? 'border-blue-500/50 bg-[#121624]'
                    : 'bg-[#121215] hover:border-zinc-700'
                }`}
              >
                {/* Match Number on far left */}
                <div className="hidden md:flex flex-col items-center justify-center w-14 h-14 bg-zinc-900/80 border border-zinc-800/80 rounded-xl flex-shrink-0">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest font-bold">Match</span>
                  <span className="text-xl font-heading font-black text-white">{m.matchNumber || '-'}</span>
                </div>

                {/* Left Matchup Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                    <span className="text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded">
                      {m.event?.name || 'Tournament'}
                    </span>
                    {/* Mobile Match Number */}
                    <span className="md:hidden text-blue-400 bg-blue-950/40 border border-blue-800 px-2 py-0.5 rounded font-bold">
                      Match #{m.matchNumber || '-'}
                    </span>
                    <span className="text-purple-400 bg-purple-950/40 border border-purple-800 px-2 py-0.5 rounded font-bold">
                      BO{m.boSeries}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        m.status === 'LIVE'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                          : m.status === 'FINISHED'
                          ? 'bg-zinc-800 text-zinc-400'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {m.status}
                    </span>
                    {m.scheduledTime && (
                      <span className="text-zinc-300 bg-zinc-800/80 border border-zinc-700 px-2 py-0.5 rounded flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(m.scheduledTime).toLocaleString('id-ID', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>

                  {/* Team A vs Team B Display */}
                  <div className="flex items-center gap-4">
                    {/* Team A */}
                    <div className="flex items-center gap-2 flex-1 justify-end text-right">
                      <span className="font-heading font-black text-sm text-white uppercase truncate">
                        {m.teamA ? m.teamA.name : m.placeholderA || 'TBD'}
                      </span>
                      {m.teamA && (
                        <img
                          src={m.teamA.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + m.teamA.name}
                          alt={m.teamA.name}
                          className="w-7 h-7 rounded object-contain bg-black/40 p-0.5 border border-zinc-800"
                        />
                      )}
                    </div>

                    {/* Score / VS Center */}
                    <div className="px-3 py-1 bg-[#18181b] rounded-lg border border-zinc-800 font-digits font-black text-base text-white min-w-[60px] text-center">
                      {m.status === 'UPCOMING' && !isMatchActive
                        ? 'VS'
                        : `${isMatchActive ? state.scoreA : m.scoreA} - ${isMatchActive ? state.scoreB : m.scoreB}`}
                    </div>

                    {/* Team B */}
                    <div className="flex items-center gap-2 flex-1">
                      {m.teamB && (
                        <img
                          src={m.teamB.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + m.teamB.name}
                          alt={m.teamB.name}
                          className="w-7 h-7 rounded object-contain bg-black/40 p-0.5 border border-zinc-800"
                        />
                      )}
                      <span className="font-heading font-black text-sm text-white uppercase truncate">
                        {m.teamB ? m.teamB.name : m.placeholderB || 'TBD'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {!isMatchActive ? (
                    <button
                      onClick={() => handleActivateMatchOnStream(m)}
                      className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                      title="Muat ke Stream"
                    >
                      <Radio className="w-4 h-4" />
                    </button>
                  ) : (
                    <span 
                      className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-800 text-emerald-400"
                      title="Sedang Aktif di Layar"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}

                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="min-btn p-1.5 text-zinc-400 hover:text-white"
                    title="Edit Match"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteMatch(m.id)}
                    className="min-btn p-1.5 text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
                    title="Hapus Match"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Dialog (Create / Edit Match) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="min-card w-full max-w-md p-5 bg-[#121215] border border-zinc-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e1e24]">
              <h3 className="font-heading font-bold text-sm text-white uppercase">
                {editingMatch ? 'Edit Jadwal Match' : 'Tambah Match Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMatch} className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Acara / Turnamen *</label>
                <select
                  value={formEventId}
                  onChange={(e) => setFormEventId(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.eventType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Urutan Pertandingan (No. Match)</label>
                  <input
                    type="number"
                    min="1"
                    value={formMatchNumber}
                    onChange={(e) => setFormMatchNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Babak Bracket</label>
                  <select
                    value={formRound}
                    onChange={(e) => setFormRound(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Pilih Babak --</option>
                    <option value="Group Stage">Babak Penyisihan</option>
                    <option value="32 Besar">32 Besar</option>
                    <option value="16 Besar">16 Besar</option>
                    <option value="Quarter Final">Quarter Final</option>
                    <option value="Semi Final">Semi Final</option>
                    <option value="3rd Place">Perebutan Juara 3</option>
                    <option value="Grand Final">Grand Final</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Jadwal Pertandingan</label>
                <input
                  type="datetime-local"
                  value={formScheduledTime}
                  onChange={(e) => setFormScheduledTime(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Tim A (Home) *</label>
                  <select
                    value={formTeamAId}
                    onChange={(e) => setFormTeamAId(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Kosong (TBD) --</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Tim B (Away) *</label>
                  <select
                    value={formTeamBId}
                    onChange={(e) => setFormTeamBId(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Kosong (TBD) --</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Best of Series (BO)</label>
                  <select
                    value={formBoSeries}
                    onChange={(e) => setFormBoSeries(parseInt(e.target.value, 10))}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value={1}>BO1 (Single Match)</option>
                    <option value={3}>BO3 (Best of 3)</option>
                    <option value={5}>BO5 (Best of 5)</option>
                    <option value={7}>BO7 (Grand Finals)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Status Pertandingan</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="LIVE">LIVE</option>
                    <option value="FINISHED">FINISHED</option>
                  </select>
                </div>
              </div>

              {editingMatch && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1e1e24]">
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Skor Tim A</label>
                    <input
                      type="number"
                      value={formScoreA}
                      onChange={(e) => setFormScoreA(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Skor Tim B</label>
                    <input
                      type="number"
                      value={formScoreB}
                      onChange={(e) => setFormScoreB(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-btn px-4 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-btn-primary px-4 py-2 text-xs font-semibold"
                >
                  {editingMatch ? 'Simpan Perubahan' : 'Buat Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Data Import & Export Modal */}
      <DataImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
      />

      {/* Bracket Modal */}
      <BracketModal
        isOpen={isBracketModalOpen}
        onClose={() => setIsBracketModalOpen(false)}
        matches={matches}
        events={events}
      />
    </div>
  );
};
