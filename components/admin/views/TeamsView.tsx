import React, { useState, useEffect } from 'react';
import { LiveBroadcastState, TeamData } from '@/lib/types';
import {
  Users,
  Plus,
  Upload,
  Edit2,
  Trash2,
  Search,
  X,
  CheckCircle2,
  Shield,
  User,
  Image as ImageIcon,
  FileDown,
  FileUp,
} from 'lucide-react';
import { DataImportExportModal } from '@/components/admin/DataImportExportModal';

interface TeamsViewProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({ state, updateState }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any | null>(null);

  const [teamName, setTeamName] = useState('');
  const [teamOrigin, setTeamOrigin] = useState('');
  const [teamColor, setTeamColor] = useState('#2563eb');
  const [logoUrl, setLogoUrl] = useState('');
  const [teamEventId, setTeamEventId] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Personnel Modal State
  const [activePersonnelTeam, setActivePersonnelTeam] = useState<any | null>(null);
  const [isPersonnelFormOpen, setIsPersonnelFormOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<any | null>(null);

  // Personnel Form State
  const [pName, setPName] = useState('');
  const [pIgn, setPIgn] = useState('');
  const [pRole, setPRole] = useState('Player');
  const [pPositionType, setPPositionType] = useState('PLAYER');
  const [pJersey, setPJersey] = useState('');
  const [pPhotoProfile, setPPhotoProfile] = useState('');
  const [pPhotoPose2, setPPhotoPose2] = useState('');
  const [pPhotoPose3, setPPhotoPose3] = useState('');
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  const fetchTeams = () => {
    fetch('/api/teams')
      .then((res) => res.json())
      .then((data) => {
        if (data.teams) {
          setTeams(data.teams);
          // Also update activePersonnelTeam if open
          if (activePersonnelTeam) {
            const updatedActive = data.teams.find((t: any) => t.id === activePersonnelTeam.id);
            if (updatedActive) setActivePersonnelTeam(updatedActive);
          }
        }
      })
      .catch((err) => console.error(err));
  };

  const fetchEvents = () => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTeams();
    fetchEvents();
  }, []);

  const handleOpenCreateTeam = () => {
    setEditingTeam(null);
    setTeamName('');
    setTeamOrigin('');
    setTeamColor('#2563eb');
    setLogoUrl('');
    setTeamEventId(events.length > 0 ? events[0].id : '');
    setIsModalOpen(true);
  };

  const handleOpenEditTeam = (t: any) => {
    setEditingTeam(t);
    setTeamName(t.name);
    setTeamOrigin(t.institution || '');
    setTeamColor(t.brandColor || '#2563eb');
    setLogoUrl(t.logoUrl || '');
    setTeamEventId(t.eventId || (events.length > 0 ? events[0].id : ''));
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataBase64: reader.result as string,
            fileName: file.name,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setLogoUrl(data.url);
        }
      } catch (err) {
        console.error('Upload failed:', err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    const finalLogo =
      logoUrl ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(teamName.trim())}`;

    try {
      if (editingTeam) {
        // UPDATE
        const res = await fetch('/api/teams', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingTeam.id,
            name: teamName.trim().toUpperCase(),
            institution: teamOrigin.trim(),
            brandColor: teamColor,
            logoUrl: finalLogo,
            eventId: teamEventId || undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          fetchTeams();
        }
      } else {
        // CREATE
        const res = await fetch('/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: teamName.trim().toUpperCase(),
            institution: teamOrigin.trim(),
            brandColor: teamColor,
            logoUrl: finalLogo,
            eventId: teamEventId || undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          fetchTeams();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    try {
      const res = await fetch(`/api/teams?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (activePersonnelTeam?.id === id) setActivePersonnelTeam(null);
        fetchTeams();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Personnel CRUD handlers
  const handleOpenCreatePersonnel = () => {
    setEditingPersonnel(null);
    setPName('');
    setPIgn('');
    setPRole('Player');
    setPPositionType('PLAYER');
    setPJersey('');
    setPPhotoProfile('');
    setPPhotoPose2('');
    setPPhotoPose3('');
    setIsPersonnelFormOpen(true);
  };

  const handleOpenEditPersonnel = (p: any) => {
    setEditingPersonnel(p);
    setPName(p.name);
    setPIgn(p.inGameName || '');
    setPRole(p.role || 'Player');
    setPPositionType(p.positionType || 'PLAYER');
    setPJersey(p.jerseyNumber !== null && p.jerseyNumber !== undefined ? String(p.jerseyNumber) : '');
    setPPhotoProfile(p.photoProfile || '');
    setPPhotoPose2(p.photoPose2 || '');
    setPPhotoPose3(p.photoPose3 || '');
    setIsPersonnelFormOpen(true);
  };

  const handlePersonnelFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2 | 3) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlot(slot);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataBase64: reader.result as string,
            fileName: `personnel_${slot}_${Date.now()}_${file.name}`,
          }),
        });
        const data = await res.json();
        if (data.success) {
          if (slot === 1) setPPhotoProfile(data.url);
          if (slot === 2) setPPhotoPose2(data.url);
          if (slot === 3) setPPhotoPose3(data.url);
        }
      } catch (err) {
        console.error('Personnel upload failed:', err);
      } finally {
        setUploadingSlot(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !activePersonnelTeam) return;

    try {
      if (editingPersonnel) {
        const res = await fetch('/api/players', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingPersonnel.id,
            teamId: activePersonnelTeam.id,
            name: pName.trim(),
            inGameName: pIgn.trim(),
            role: pRole.trim(),
            positionType: pPositionType,
            jerseyNumber: pJersey ? parseInt(pJersey, 10) : null,
            photoProfile: pPhotoProfile || null,
            photoPose2: pPhotoPose2 || null,
            photoPose3: pPhotoPose3 || null,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsPersonnelFormOpen(false);
          fetchTeams();
        }
      } else {
        const res = await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamId: activePersonnelTeam.id,
            name: pName.trim(),
            inGameName: pIgn.trim(),
            role: pRole.trim(),
            positionType: pPositionType,
            jerseyNumber: pJersey ? parseInt(pJersey, 10) : null,
            photoProfile: pPhotoProfile || null,
            photoPose2: pPhotoPose2 || null,
            photoPose3: pPhotoPose3 || null,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsPersonnelFormOpen(false);
          fetchTeams();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePersonnel = async (id: string) => {
    if (!confirm('Hapus personil ini dari tim?')) return;
    try {
      const res = await fetch(`/api/players?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchTeams();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.institution && t.institution.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4 font-sans">
      {/* Top Header & Search */}
      <div className="min-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e1e24]">
          <div>
            <h2 className="font-heading font-bold text-sm text-white uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Database Tim & Klub (Teams CRUD)</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Klik nama tim untuk melihat & mengelola seluruh personil tim (CRUD Atlet)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportExportOpen(true)}
              className="p-2 rounded-lg text-xs font-mono font-bold bg-[#141418] hover:bg-[#1f1f26] border border-zinc-800 hover:border-zinc-700 text-zinc-300 flex items-center justify-center transition-all shadow-sm cursor-pointer"
              title="Import / Export Data Teams (Template, CSV, Excel)"
            >
              <FileDown className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={handleOpenCreateTeam}
              className="min-btn-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Team</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama tim atau asal kota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141417] border border-[#23232a] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Vertical Card Stack List (1 Tim per Baris ke Bawah) */}
      <div className="space-y-3">
        {filteredTeams.length === 0 ? (
          <div className="min-card p-8 text-center text-zinc-500 text-xs font-mono">
            Belum ada tim terdaftar. Klik "+ Tambah Team" untuk mendaftarkan tim baru.
          </div>
        ) : (
          filteredTeams.map((t) => {
            const isTeamA = state.teamA.name === t.name;
            const isTeamB = state.teamB.name === t.name;

            return (
              <div
                key={t.id}
                className={`min-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isTeamA
                    ? 'border-rose-500/50 bg-[#1f1214]'
                    : isTeamB
                    ? 'border-blue-500/50 bg-[#121624]'
                    : 'bg-[#121215] hover:border-zinc-700'
                }`}
              >
                {/* Team Info with Large Clickable Logo & Name to view Personnel */}
                <div
                  onClick={() => setActivePersonnelTeam(t)}
                  className="flex items-center gap-4 flex-1 cursor-pointer group"
                  title="Klik untuk melihat seluruh personil tim & CRUD atlet"
                >
                  {/* Uploaded Team Logo */}
                  <div className="relative w-14 h-14 rounded-xl bg-black/60 p-1.5 border border-zinc-800 shrink-0 flex items-center justify-center overflow-hidden group-hover:border-blue-500 transition-colors">
                    <img
                      src={t.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + t.name}
                      alt={t.name}
                      className="w-full h-full object-contain"
                    />
                    <span
                      className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-black"
                      style={{ backgroundColor: t.brandColor || '#2563eb' }}
                      title={`Brand Color: ${t.brandColor}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-black text-sm text-white uppercase tracking-wide group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <span>{t.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500 font-normal">
                          (Lihat Personil)
                        </span>
                      </h3>

                      {isTeamA && (
                        <span className="text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full">
                          ACTIVE TEAM [A]
                        </span>
                      )}

                      {isTeamB && (
                        <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                          ACTIVE TEAM [B]
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-400 font-mono">
                      <span>{t.institution || 'Independent Club'}</span>
                      <span>
                        Personil:{' '}
                        <strong className="text-blue-400 font-bold">
                          {t.players?.length || t._count?.players || 0} Atlet
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Quick Assign & CRUD Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => updateState({ teamA: { ...t } })}
                    className="min-btn px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-rose-400 hover:text-white hover:border-rose-500/50"
                    title="Pasang ke Slot Tim A (Home)"
                  >
                    SET [A]
                  </button>

                  <button
                    onClick={() => updateState({ teamB: { ...t } })}
                    className="min-btn px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-blue-400 hover:text-white hover:border-blue-500/50"
                    title="Pasang ke Slot Tim B (Away)"
                  >
                    SET [B]
                  </button>

                  <button
                    onClick={() => handleOpenEditTeam(t)}
                    className="min-btn p-1.5 text-zinc-400 hover:text-white"
                    title="Edit Profil Tim"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteTeam(t.id)}
                    className="min-btn p-1.5 text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
                    title="Hapus Tim"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 1. Modal Pop-up: Seluruh Personil Tim & CRUD Atlet */}
      {activePersonnelTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="min-card w-full max-w-2xl p-5 bg-[#121215] border border-zinc-700 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header with Team Info */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1e1e24] shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={activePersonnelTeam.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + activePersonnelTeam.name}
                  alt={activePersonnelTeam.name}
                  className="w-10 h-10 rounded-lg object-contain bg-black/50 p-1 border border-zinc-700"
                />
                <div>
                  <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <span>{activePersonnelTeam.name}</span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-950/40 border border-blue-800 px-1.5 py-0.2 rounded font-bold">
                      ROSTER PERSONIL
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    {activePersonnelTeam.institution || 'Club'} • {activePersonnelTeam.players?.length || 0} Atlet Terdaftar
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenCreatePersonnel}
                  className="min-btn-primary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Personil</span>
                </button>
                <button
                  onClick={() => setActivePersonnelTeam(null)}
                  className="text-zinc-500 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Personnel Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {(!activePersonnelTeam.players || activePersonnelTeam.players.length === 0) ? (
                <div className="p-8 text-center text-zinc-500 text-xs font-mono border border-dashed border-zinc-800 rounded-lg">
                  Belum ada personil di tim ini. Klik "+ Tambah Personil" untuk menambahkan atlet baru.
                </div>
              ) : (
                activePersonnelTeam.players.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Jersey Number or Photo */}
                      {p.photoProfile ? (
                        <img
                          src={p.photoProfile}
                          alt={p.name}
                          className="w-11 h-11 rounded-lg object-cover bg-black/50 border border-blue-500/50 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-[#09090b] border border-zinc-800 flex items-center justify-center font-digits font-black text-sm text-blue-400 shrink-0">
                          {p.jerseyNumber !== null && p.jerseyNumber !== undefined ? p.jerseyNumber : '#'}
                        </div>
                      )}

                      {/* 3 Photos Thumbnail Row */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {p.photoPose2 && (
                          <img
                            src={p.photoPose2}
                            alt="Pose 2"
                            className="w-8 h-8 rounded object-cover bg-black border border-zinc-700"
                            title="Pose 2"
                          />
                        )}
                        {p.photoPose3 && (
                          <img
                            src={p.photoPose3}
                            alt="Pose 3"
                            className="w-8 h-8 rounded object-cover bg-black border border-zinc-700"
                            title="Pose 3"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-bold text-xs text-white">{p.name}</span>
                          {p.inGameName && (
                            <span className="text-[10px] font-mono text-blue-400 bg-blue-950/40 border border-blue-800 px-1.5 py-0.2 rounded font-bold">
                              "{p.inGameName}"
                            </span>
                          )}
                          {p.positionType === 'CAPTAIN' && (
                            <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded">
                              CAPTAIN
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400">
                          {activePersonnelTeam?.event?.eventType?.includes('ESPORT') 
                            ? <span>Role: <strong className="text-zinc-200">{p.role || 'Player'}</strong></span>
                            : <span>No: #{p.jerseyNumber ?? '-'} • <strong className="text-zinc-200">{p.role || 'Player'}</strong></span>
                          }
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenEditPersonnel(p)}
                        className="min-btn p-1.5 text-zinc-400 hover:text-white"
                        title="Edit Personil"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePersonnel(p.id)}
                        className="min-btn p-1.5 text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
                        title="Hapus Personil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Sub-Modal Form: Tambah / Edit Personil Tim */}
      {isPersonnelFormOpen && activePersonnelTeam && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="min-card w-full max-w-md p-5 bg-[#141418] border border-zinc-600 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e1e24]">
              <h3 className="font-heading font-bold text-sm text-white uppercase">
                {editingPersonnel ? `Edit Personil (${activePersonnelTeam.name})` : `Tambah Personil ke ${activePersonnelTeam.name}`}
              </h3>
              <button onClick={() => setIsPersonnelFormOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePersonnel} className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Nama Lengkap Atlet *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marc Klok"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {activePersonnelTeam?.event?.eventType?.includes('ESPORT') ? (
                  <>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">In-Game Name (IGN)</label>
                      <input
                        type="text"
                        placeholder="e.g. KLOK"
                        value={pIgn}
                        onChange={(e) => setPIgn(e.target.value)}
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Posisi / Role</label>
                      {activePersonnelTeam?.event?.subType === 'MLBB' ? (
                        <select
                          value={pRole}
                          onChange={(e) => setPRole(e.target.value)}
                          className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="Player">-- Pilih Role --</option>
                          <option value="EXP Lane">EXP Lane</option>
                          <option value="Jungler">Jungler</option>
                          <option value="Mid Lane">Mid Lane</option>
                          <option value="Gold Lane">Gold Lane</option>
                          <option value="Roamer">Roamer</option>
                          <option value="Coach">Coach</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="e.g. Midlaner / Jungler"
                          value={pRole}
                          onChange={(e) => setPRole(e.target.value)}
                          className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Nomor Punggung</label>
                      <input
                        type="number"
                        placeholder="e.g. 23"
                        value={pJersey}
                        onChange={(e) => setPJersey(e.target.value)}
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Posisi Olahraga</label>
                      <input
                        type="text"
                        placeholder="e.g. Striker / Defender"
                        value={pRole}
                        onChange={(e) => setPRole(e.target.value)}
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Tipe Posisi (Status)</label>
                <select
                  value={pPositionType}
                  onChange={(e) => setPPositionType(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="PLAYER">PLAYER</option>
                  <option value="CAPTAIN">CAPTAIN</option>
                  <option value="COACH">COACH</option>
                </select>
              </div>

              {/* 3 Photo Upload Slots */}
              <div className="pt-2 border-t border-[#1e1e24] space-y-2.5">
                <label className="block text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
                  Foto Atlet (3 Gambar)
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {/* Slot 1: Foto Utama */}
                  <div className="p-2 rounded bg-[#18181b] border border-[#27272a] text-center space-y-1.5">
                    <div className="text-[9px] font-mono font-bold text-blue-400">1. UTAMA</div>
                    {pPhotoProfile ? (
                      <div className="relative aspect-square rounded bg-black/40 overflow-hidden border border-blue-500">
                        <img src={pPhotoProfile} alt="Foto 1" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPPhotoProfile('')}
                          className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/80 text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="aspect-square rounded border border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 p-1">
                        <Upload className="w-4 h-4 text-blue-400" />
                        <span className="text-[9px] text-zinc-400 mt-1">Upload</span>
                        <input type="file" accept="image/*" onChange={(e) => handlePersonnelFileUpload(e, 1)} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Slot 2: Pose 2 */}
                  <div className="p-2 rounded bg-[#18181b] border border-[#27272a] text-center space-y-1.5">
                    <div className="text-[9px] font-mono font-bold text-zinc-400">2. POSE 2</div>
                    {pPhotoPose2 ? (
                      <div className="relative aspect-square rounded bg-black/40 overflow-hidden border border-zinc-700">
                        <img src={pPhotoPose2} alt="Foto 2" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPPhotoPose2('')}
                          className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/80 text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="aspect-square rounded border border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 p-1">
                        <Upload className="w-4 h-4 text-zinc-400" />
                        <span className="text-[9px] text-zinc-400 mt-1">Upload</span>
                        <input type="file" accept="image/*" onChange={(e) => handlePersonnelFileUpload(e, 2)} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Slot 3: Pose 3 */}
                  <div className="p-2 rounded bg-[#18181b] border border-[#27272a] text-center space-y-1.5">
                    <div className="text-[9px] font-mono font-bold text-zinc-400">3. POSE 3</div>
                    {pPhotoPose3 ? (
                      <div className="relative aspect-square rounded bg-black/40 overflow-hidden border border-zinc-700">
                        <img src={pPhotoPose3} alt="Foto 3" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPPhotoPose3('')}
                          className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/80 text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="aspect-square rounded border border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 p-1">
                        <Upload className="w-4 h-4 text-zinc-400" />
                        <span className="text-[9px] text-zinc-400 mt-1">Upload</span>
                        <input type="file" accept="image/*" onChange={(e) => handlePersonnelFileUpload(e, 3)} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e1e24]">
                <button
                  type="button"
                  onClick={() => setIsPersonnelFormOpen(false)}
                  className="min-btn px-4 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-btn-primary px-4 py-2 text-xs font-semibold"
                >
                  {editingPersonnel ? 'Simpan Perubahan' : 'Tambah Personil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Form: Tambah Team / Edit Team Profile */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="min-card w-full max-w-md p-5 bg-[#121215] border border-zinc-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e1e24]">
              <h3 className="font-heading font-bold text-sm text-white uppercase">
                {editingTeam ? 'Edit Profil Tim' : 'Tambah Team'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Target Event / Kompetisi *</label>
                <select
                  required
                  value={teamEventId}
                  onChange={(e) => setTeamEventId(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Pilih Event / Kompetisi --</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.eventType === 'SPORT' ? 'Olahraga' : 'Esports'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Nama Tim Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PERSIJA FC atau EVOS LEGENDS"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Kota / Instansi Asal</label>
                <input
                  type="text"
                  placeholder="e.g. Jakarta, Indonesia"
                  value={teamOrigin}
                  onChange={(e) => setTeamOrigin(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Warna Brand / Jersey</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={teamColor}
                      onChange={(e) => setTeamColor(e.target.value)}
                      className="w-10 h-8 rounded bg-transparent cursor-pointer border border-[#27272a]"
                    />
                    <span className="text-white font-mono font-bold">{teamColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Logo Tim (Upload)</label>
                  <label className="flex items-center gap-2 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-zinc-300 truncate text-[11px]">
                      {isUploading ? 'Mengunggah...' : logoUrl ? 'Logo Terunggah ✓' : 'Upload PNG'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Logo Preview */}
              {logoUrl && (
                <div className="flex items-center gap-3 p-2 bg-[#18181b] rounded-lg border border-[#27272a]">
                  <img src={logoUrl} alt="Preview Logo" className="w-10 h-10 object-contain bg-black/40 rounded p-1" />
                  <span className="text-[11px] font-mono text-zinc-400 truncate">{logoUrl}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e1e24]">
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
                  {editingTeam ? 'Simpan Perubahan' : 'Tambah Team'}
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
    </div>
  );
};
