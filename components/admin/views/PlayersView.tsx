import React, { useState, useEffect } from 'react';
import { LiveBroadcastState } from '@/lib/types';
import {
  User,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Upload,
  X,
  Image as ImageIcon,
  Shield,
  Award,
  ExternalLink,
  FileDown,
  FileUp,
} from 'lucide-react';
import { DataImportExportModal } from '@/components/admin/DataImportExportModal';

interface PlayersViewProps {
  state: LiveBroadcastState;
}

export const PlayersView: React.FC<PlayersViewProps> = ({ state }) => {
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any | null>(null);

  // Player Details Pop-up Modal State
  const [viewingPlayer, setViewingPlayer] = useState<any | null>(null);

  // Form State
  const [formTeamId, setFormTeamId] = useState('');
  const [formName, setFormName] = useState('');
  const [formIgn, setFormIgn] = useState('');
  const [formRole, setFormRole] = useState('Player');
  const [formPositionType, setFormPositionType] = useState('PLAYER');
  const [formJersey, setFormJersey] = useState('');

  // 3 Images State
  const [photoProfile, setPhotoProfile] = useState('');
  const [photoPose2, setPhotoPose2] = useState('');
  const [photoPose3, setPhotoPose3] = useState('');
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  const fetchPlayers = () => {
    fetch('/api/players')
      .then((res) => res.json())
      .then((data) => {
        if (data.players) {
          setPlayers(data.players);
          if (viewingPlayer) {
            const updated = data.players.find((p: any) => p.id === viewingPlayer.id);
            if (updated) setViewingPlayer(updated);
          }
        }
      })
      .catch((err) => console.error(err));
  };

  const fetchTeams = () => {
    fetch('/api/teams')
      .then((res) => res.json())
      .then((data) => {
        if (data.teams) {
          setTeams(data.teams);
          if (data.teams.length > 0 && !formTeamId) setFormTeamId(data.teams[0].id);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlayer(null);
    setFormName('');
    setFormIgn('');
    setFormRole('Player');
    setFormPositionType('PLAYER');
    setFormJersey('');
    setPhotoProfile('');
    setPhotoPose2('');
    setPhotoPose3('');
    if (teams.length > 0) setFormTeamId(teams[0].id);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingPlayer(p);
    setFormTeamId(p.teamId);
    setFormName(p.name);
    setFormIgn(p.inGameName || '');
    setFormRole(p.role || 'Player');
    setFormPositionType(p.positionType || 'PLAYER');
    setFormJersey(p.jerseyNumber !== null && p.jerseyNumber !== undefined ? String(p.jerseyNumber) : '');
    setPhotoProfile(p.photoProfile || '');
    setPhotoPose2(p.photoPose2 || '');
    setPhotoPose3(p.photoPose3 || '');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2 | 3) => {
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
            fileName: `player_${slot}_${Date.now()}_${file.name}`,
          }),
        });
        const data = await res.json();
        if (data.success) {
          if (slot === 1) setPhotoProfile(data.url);
          if (slot === 2) setPhotoPose2(data.url);
          if (slot === 3) setPhotoPose3(data.url);
        }
      } catch (err) {
        console.error('Upload failed:', err);
      } finally {
        setUploadingSlot(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTeamId) return;

    try {
      if (editingPlayer) {
        // UPDATE
        const res = await fetch('/api/players', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingPlayer.id,
            teamId: formTeamId,
            name: formName.trim(),
            inGameName: formIgn.trim(),
            role: formRole.trim(),
            positionType: formPositionType,
            jerseyNumber: formJersey ? parseInt(formJersey, 10) : null,
            photoProfile: photoProfile || null,
            photoPose2: photoPose2 || null,
            photoPose3: photoPose3 || null,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          fetchPlayers();
        }
      } else {
        // CREATE
        const res = await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamId: formTeamId,
            name: formName.trim(),
            inGameName: formIgn.trim(),
            role: formRole.trim(),
            positionType: formPositionType,
            jerseyNumber: formJersey ? parseInt(formJersey, 10) : null,
            photoProfile: photoProfile || null,
            photoPose2: photoPose2 || null,
            photoPose3: photoPose3 || null,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          fetchPlayers();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm('Hapus profil atlet ini?')) return;
    try {
      const res = await fetch(`/api/players?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (viewingPlayer?.id === id) setViewingPlayer(null);
        fetchPlayers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter and Search Logic
  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.inGameName && p.inGameName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.role && p.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.team?.name && p.team.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedTeamFilter === 'ALL') return matchesSearch;
    return matchesSearch && p.teamId === selectedTeamFilter;
  });

  // Group players by Team
  const groupedByTeam = teams
    .map((t) => ({
      team: t,
      roster: filteredPlayers.filter((p) => p.teamId === t.id),
    }))
    .filter((group) => (selectedTeamFilter === 'ALL' ? group.roster.length > 0 : group.team.id === selectedTeamFilter));

  return (
    <div className="space-y-4 font-sans">
      {/* Header Bar with Search & Filter Icons */}
      <div className="min-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e1e24]">
          <div>
            <h2 className="font-heading font-bold text-sm text-white uppercase flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>Database Pemain & Atlet Roster (3 Foto & CRUD)</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Klik nama atau foto pemain untuk melihat pop-up identitas lengkap & edit data atlet
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportExportOpen(true)}
              className="p-2 rounded-lg text-xs font-mono font-bold bg-[#141418] hover:bg-[#1f1f26] border border-zinc-800 hover:border-zinc-700 text-zinc-300 flex items-center justify-center transition-all shadow-sm cursor-pointer"
              title="Import / Export Data Players (Template, CSV, Excel)"
            >
              <FileDown className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={handleOpenCreate}
              className="min-btn-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pemain Baru</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar with Icons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input with Search Icon */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari atlet, IGN, posisi, atau nama tim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141417] border border-[#23232a] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Team Filter with Filter Icon */}
          <div className="flex items-center gap-2 bg-[#141417] border border-[#23232a] rounded-lg px-3 py-1.5 min-w-[200px]">
            <Filter className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none w-full font-medium"
            >
              <option value="ALL" className="bg-[#18181b]">Semua Tim ({players.length} Pemain)</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#18181b]">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Players Grouped per Team in Vertical Stack */}
      <div className="space-y-4">
        {groupedByTeam.length === 0 ? (
          <div className="min-card p-8 text-center text-zinc-500 text-xs font-mono">
            Tidak ada pemain yang sesuai dengan kriteria pencarian / filter tim.
          </div>
        ) : (
          groupedByTeam.map(({ team, roster }) => (
            <div key={team.id} className="min-card p-4 space-y-3 bg-[#121215] border border-[#1e1e24]">
              {/* Team Group Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#1e1e24]">
                <div className="flex items-center gap-2.5">
                  <img
                    src={team.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + team.name}
                    alt={team.name}
                    className="w-6 h-6 object-contain bg-black/40 rounded p-0.5 border border-zinc-800"
                  />
                  <h3 className="font-heading font-black text-xs text-white uppercase tracking-wider">
                    {team.name}
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-500">
                    ({roster.length} Atlet)
                  </span>
                </div>
              </div>

              {/* Roster Vertical Card List */}
              <div className="space-y-2.5">
                {roster.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
                  >
                    {/* Left: Player Profile & 3 Uploaded Photos (Clickable to open Detail Identity Modal) */}
                    <div
                      onClick={() => setViewingPlayer(p)}
                      className="flex items-center gap-4 flex-1 cursor-pointer group"
                      title="Klik untuk melihat identitas lengkap atlet"
                    >
                      {/* Jersey Number */}
                      <div className="w-9 h-9 rounded-lg bg-[#09090b] border border-zinc-800 flex items-center justify-center font-digits font-black text-sm text-blue-400 shrink-0 group-hover:border-blue-500 transition-colors">
                        {p.jerseyNumber !== null && p.jerseyNumber !== undefined ? p.jerseyNumber : '#'}
                      </div>

                      {/* 3 Uploaded Photos Gallery */}
                      <div className="flex items-center gap-2">
                        {/* Gambar 1: Utama */}
                        <div className="relative group/pic">
                          {p.photoProfile ? (
                            <img
                              src={p.photoProfile}
                              alt="Gambar 1 (Utama)"
                              className="w-12 h-12 rounded-lg object-cover bg-black/50 border-2 border-blue-500 shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-[#09090b] border border-dashed border-zinc-700 flex flex-col items-center justify-center text-[8px] font-mono text-zinc-500">
                              <ImageIcon className="w-4 h-4 mb-0.5 text-zinc-600" />
                              Foto 1
                            </div>
                          )}
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold bg-blue-600 text-white px-1 rounded shadow">
                            UTAMA
                          </span>
                        </div>

                        {/* Gambar 2: Pose 2 */}
                        <div className="relative group/pic">
                          {p.photoPose2 ? (
                            <img
                              src={p.photoPose2}
                              alt="Gambar 2 (Pose 2)"
                              className="w-12 h-12 rounded-lg object-cover bg-black/50 border border-zinc-700 shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-[#09090b] border border-dashed border-zinc-800 flex flex-col items-center justify-center text-[8px] font-mono text-zinc-600">
                              <ImageIcon className="w-4 h-4 mb-0.5 text-zinc-700" />
                              Foto 2
                            </div>
                          )}
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold bg-zinc-800 text-zinc-300 px-1 rounded">
                            POSE 2
                          </span>
                        </div>

                        {/* Gambar 3: Pose 3 */}
                        <div className="relative group/pic">
                          {p.photoPose3 ? (
                            <img
                              src={p.photoPose3}
                              alt="Gambar 3 (Pose 3)"
                              className="w-12 h-12 rounded-lg object-cover bg-black/50 border border-zinc-700 shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-[#09090b] border border-dashed border-zinc-800 flex flex-col items-center justify-center text-[8px] font-mono text-zinc-600">
                              <ImageIcon className="w-4 h-4 mb-0.5 text-zinc-700" />
                              Foto 3
                            </div>
                          )}
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold bg-zinc-800 text-zinc-300 px-1 rounded">
                            POSE 3
                          </span>
                        </div>
                      </div>

                      {/* Player Info Text */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                            {p.name}
                          </span>
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
                          {p.positionType === 'COACH' && (
                            <span className="text-[9px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.2 rounded">
                              COACH
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-zinc-400">
                          Posisi/Role: <strong className="text-zinc-200">{p.role || 'Player'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 self-end md:self-center">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="min-btn p-1.5 text-zinc-400 hover:text-white"
                        title="Edit Atlet & Foto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(p.id)}
                        className="min-btn p-1.5 text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
                        title="Hapus Atlet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 1. Modal Pop-up: Identitas Lengkap Pemain & Aksi CRUD */}
      {viewingPlayer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="min-card w-full max-w-lg p-5 bg-[#121215] border border-zinc-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e1e24]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider">
                  IDENTITAS PROFIL ATLET
                </h3>
              </div>

              <button onClick={() => setViewingPlayer(null)} className="text-zinc-500 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Athlete Full Header */}
            <div className="flex items-center justify-between p-4 bg-[#18181b] rounded-xl border border-[#27272a]">
              <div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase">
                  {viewingPlayer.team?.name || 'Club'}
                </div>
                <h2 className="font-heading font-black text-lg text-white mt-0.5">
                  {viewingPlayer.name}
                </h2>
                {viewingPlayer.inGameName && (
                  <div className="text-xs font-mono text-blue-400 font-bold mt-0.5">
                    IGN: "{viewingPlayer.inGameName}"
                  </div>
                )}
              </div>

              <div className="text-right space-y-1">
                <div className="w-12 h-12 rounded-xl bg-black/60 border border-zinc-700 flex items-center justify-center font-digits font-black text-2xl text-blue-400 ml-auto">
                  {viewingPlayer.jerseyNumber !== null && viewingPlayer.jerseyNumber !== undefined ? viewingPlayer.jerseyNumber : '#'}
                </div>
                <span className="text-[9px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded-full inline-block">
                  {viewingPlayer.positionType}
                </span>
              </div>
            </div>

            {/* 3 High-Resolution Photos Showcase */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-zinc-400 uppercase font-bold">
                Galeri 3 Foto Terdaftar
              </div>
              <div className="grid grid-cols-3 gap-3">
                {/* Foto 1 */}
                <div className="space-y-1.5 text-center">
                  <div className="aspect-square rounded-xl bg-black/60 border-2 border-blue-500 overflow-hidden flex items-center justify-center">
                    {viewingPlayer.photoProfile ? (
                      <img src={viewingPlayer.photoProfile} alt="Utama" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-zinc-600" />
                    )}
                  </div>
                  <span className="text-[9px] font-mono font-bold text-blue-400">1. FOTO UTAMA</span>
                </div>

                {/* Foto 2 */}
                <div className="space-y-1.5 text-center">
                  <div className="aspect-square rounded-xl bg-black/60 border border-zinc-700 overflow-hidden flex items-center justify-center">
                    {viewingPlayer.photoPose2 ? (
                      <img src={viewingPlayer.photoPose2} alt="Pose 2" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-zinc-700" />
                    )}
                  </div>
                  <span className="text-[9px] font-mono font-bold text-zinc-400">2. POSE AKSI 2</span>
                </div>

                {/* Foto 3 */}
                <div className="space-y-1.5 text-center">
                  <div className="aspect-square rounded-xl bg-black/60 border border-zinc-700 overflow-hidden flex items-center justify-center">
                    {viewingPlayer.photoPose3 ? (
                      <img src={viewingPlayer.photoPose3} alt="Pose 3" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-zinc-700" />
                    )}
                  </div>
                  <span className="text-[9px] font-mono font-bold text-zinc-400">3. POSE AKSI 3</span>
                </div>
              </div>
            </div>

            {/* Metadata Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#18181b] border border-[#27272a]">
                <span className="text-zinc-500 block text-[10px]">Posisi / Peran</span>
                <span className="text-white font-bold">{viewingPlayer.role || 'Player'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#18181b] border border-[#27272a]">
                {viewingPlayer.team?.event?.eventType?.includes('ESPORT') ? (
                  <>
                    <span className="text-zinc-500 block text-[10px]">In-Game Name</span>
                    <span className="text-blue-400 font-bold">{viewingPlayer.inGameName || 'N/A'}</span>
                  </>
                ) : (
                  <>
                    <span className="text-zinc-500 block text-[10px]">Nomor Punggung</span>
                    <span className="text-blue-400 font-bold">#{viewingPlayer.jerseyNumber ?? 'N/A'}</span>
                  </>
                )}
              </div>
            </div>

            {/* Modal Actions (CRUD) */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1e1e24]">
              <button
                onClick={() => handleDeletePlayer(viewingPlayer.id)}
                className="min-btn px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:border-rose-500/40 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Atlet</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingPlayer(null)}
                  className="min-btn px-4 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    const p = viewingPlayer;
                    setViewingPlayer(null);
                    handleOpenEdit(p);
                  }}
                  className="min-btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Data & Foto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Dialog Form: Tambah / Edit Pemain */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="min-card w-full max-w-lg p-5 bg-[#121215] border border-zinc-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e1e24]">
              <h3 className="font-heading font-bold text-sm text-white uppercase">
                {editingPlayer ? 'Edit Data Atlet & 3 Foto' : 'Tambah Pemain Baru (3 Foto)'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Pilih Tim *</label>
                <select
                  value={formTeamId}
                  onChange={(e) => setFormTeamId(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Nama Lengkap Atlet *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marc Klok atau Muhammad Ikhsan"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              {(() => {
                const selectedTeam = teams.find(t => t.id === formTeamId);
                const isEsport = selectedTeam?.event?.eventType?.includes('ESPORT');
                return (
                  <div className="grid grid-cols-2 gap-3">
                    {isEsport ? (
                      <>
                        <div>
                          <label className="block text-zinc-400 font-medium mb-1">In-Game Name (IGN)</label>
                          <input
                            type="text"
                            placeholder="e.g. LEMON"
                            value={formIgn}
                            onChange={(e) => setFormIgn(e.target.value)}
                            className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 font-medium mb-1">Posisi / Role</label>
                          {selectedTeam?.event?.subType === 'MLBB' ? (
                            <select
                              value={formRole}
                              onChange={(e) => setFormRole(e.target.value)}
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
                              value={formRole}
                              onChange={(e) => setFormRole(e.target.value)}
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
                            placeholder="e.g. 10"
                            value={formJersey}
                            onChange={(e) => setFormJersey(e.target.value)}
                            className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 font-medium mb-1">Posisi Olahraga</label>
                          <input
                            type="text"
                            placeholder="e.g. Striker / Defender"
                            value={formRole}
                            onChange={(e) => setFormRole(e.target.value)}
                            className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Tipe Posisi (Status)</label>
                <select
                  value={formPositionType}
                  onChange={(e) => setFormPositionType(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="PLAYER">PLAYER</option>
                  <option value="CAPTAIN">CAPTAIN</option>
                  <option value="COACH">COACH</option>
                </select>
              </div>

              {/* 3 Upload Slots for Photos */}
              <div className="pt-2 border-t border-[#1e1e24] space-y-2.5">
                <label className="block text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
                  Unggah 3 Foto Atlet (Tampil Sesuai Unggahan)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Slot 1: Foto Profil Utama */}
                  <div className="p-2.5 rounded-lg bg-[#18181b] border border-[#27272a] space-y-2 text-center">
                    <div className="text-[10px] font-mono font-bold text-blue-400 uppercase">
                      Gambar 1 (Utama Profile)
                    </div>
                    {photoProfile ? (
                      <div className="relative w-full aspect-square rounded bg-black/40 overflow-hidden border border-blue-500">
                        <img src={photoProfile} alt="Utama" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoProfile('')}
                          className="absolute top-1 right-1 p-0.5 rounded bg-black/70 text-rose-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full aspect-square rounded border border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors p-2">
                        <Upload className="w-5 h-5 text-blue-400 mb-1" />
                        <span className="text-[10px] font-mono text-zinc-400">
                          {uploadingSlot === 1 ? 'Mengunggah...' : 'Upload Foto 1'}
                        </span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 1)} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Slot 2: Pose 2 */}
                  <div className="p-2.5 rounded-lg bg-[#18181b] border border-[#27272a] space-y-2 text-center">
                    <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      Gambar 2 (Pose 2)
                    </div>
                    {photoPose2 ? (
                      <div className="relative w-full aspect-square rounded bg-black/40 overflow-hidden border border-zinc-700">
                        <img src={photoPose2} alt="Pose 2" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoPose2('')}
                          className="absolute top-1 right-1 p-0.5 rounded bg-black/70 text-rose-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full aspect-square rounded border border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors p-2">
                        <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                        <span className="text-[10px] font-mono text-zinc-400">
                          {uploadingSlot === 2 ? 'Mengunggah...' : 'Upload Foto 2'}
                        </span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 2)} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Slot 3: Pose 3 */}
                  <div className="p-2.5 rounded-lg bg-[#18181b] border border-[#27272a] space-y-2 text-center">
                    <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      Gambar 3 (Pose 3)
                    </div>
                    {photoPose3 ? (
                      <div className="relative w-full aspect-square rounded bg-black/40 overflow-hidden border border-zinc-700">
                        <img src={photoPose3} alt="Pose 3" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoPose3('')}
                          className="absolute top-1 right-1 p-0.5 rounded bg-black/70 text-rose-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full aspect-square rounded border border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors p-2">
                        <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                        <span className="text-[10px] font-mono text-zinc-400">
                          {uploadingSlot === 3 ? 'Mengunggah...' : 'Upload Foto 3'}
                        </span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 3)} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>

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
                  {editingPlayer ? 'Simpan Perubahan' : 'Tambah Pemain'}
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
