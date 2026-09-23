import React, { useState, useEffect } from 'react';
import {
  Swords,
  Plus,
  Edit2,
  Trash2,
  Search,
  Upload,
  X,
  Shield,
  Zap,
  Sparkles,
  RefreshCw,
  Eye,
  Check,
  Tag,
  Layers,
  Image as ImageIcon,
  FileDown,
  FileUp,
} from 'lucide-react';
import { DataImportExportModal } from '@/components/admin/DataImportExportModal';

interface HeroItem {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
}

interface RoleItem {
  id: string;
  name: string;
  imageUrl?: string | null;
}

const DEFAULT_MLBB_HEROES = [
  { name: 'Ling', role: 'Assassin', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_84.png' },
  { name: 'Fanny', role: 'Assassin', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_17.png' },
  { name: 'Hayabusa', role: 'Assassin', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_21.png' },
  { name: 'Lancelot', role: 'Assassin', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_47.png' },
  { name: 'Gusion', role: 'Assassin', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_56.png' },
  { name: 'Nolan', role: 'Assassin', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_122.png' },
  { name: 'Suyou', role: 'Assassin', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_126.png' },
  { name: 'Tigreal', role: 'Tank', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_6.png' },
  { name: 'Franco', role: 'Tank', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_10.png' },
  { name: 'Khufra', role: 'Tank', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_78.png' },
  { name: 'Atlas', role: 'Tank', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_93.png' },
  { name: 'Grock', role: 'Tank', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_44.png' },
  { name: 'Chou', role: 'Fighter', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_26.png' },
  { name: 'Paquito', role: 'Fighter', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_103.png' },
  { name: 'Yu Zhong', role: 'Fighter', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_96.png' },
  { name: 'Terizla', role: 'Fighter', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_82.png' },
  { name: 'Arlott', role: 'Fighter', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_119.png' },
  { name: 'Ruby', role: 'Fighter', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_32.png' },
  { name: 'Kagura', role: 'Mage', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_25.png' },
  { name: 'Pharsa', role: 'Mage', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_53.png' },
  { name: 'Yve', role: 'Mage', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_101.png' },
  { name: 'Valentina', role: 'Mage', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_110.png' },
  { name: 'Faramis', role: 'Mage', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_81.png' },
  { name: 'Novaria', role: 'Mage', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_120.png' },
  { name: 'Claude', role: 'Marksman', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_65.png' },
  { name: 'Beatrix', role: 'Marksman', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_105.png' },
  { name: 'Brody', role: 'Marksman', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_99.png' },
  { name: 'Wanwan', role: 'Marksman', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_89.png' },
  { name: 'Harith', role: 'Mage', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_73.png' },
  { name: 'Moskov', role: 'Marksman', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_31.png' },
  { name: 'Angela', role: 'Mage', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_55.png' },
  { name: 'Mathilda', role: 'Mage', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_100.png' },
  { name: 'Diggie', role: 'Mage', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_48.png' },
  { name: 'Floryn', role: 'Mage', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_109.png' },
  { name: 'Minotaur', role: 'Tank', avatarUrl: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/game/100_19.png' },
];

export const HeroesView: React.FC = () => {
  const [heroes, setHeroes] = useState<HeroItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  // Hero Add/Edit Modal
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [editingHero, setEditingHero] = useState<HeroItem | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('Assassin');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [uploadingHero, setUploadingHero] = useState(false);

  // Role Management Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [roleFormName, setRoleFormName] = useState('');
  const [roleFormImageUrl, setRoleFormImageUrl] = useState('');
  const [uploadingRole, setUploadingRole] = useState(false);

  const getRoleBadgeStyle = (roleName: string) => {
    switch (roleName?.toLowerCase()) {
      case 'tank':
        return 'bg-amber-950/60 text-amber-300 border-amber-700/60';
      case 'fighter':
        return 'bg-orange-950/60 text-orange-300 border-orange-700/60';
      case 'assassin':
        return 'bg-purple-950/60 text-purple-300 border-purple-700/60';
      case 'mage':
        return 'bg-blue-950/60 text-blue-300 border-blue-700/60';
      case 'marksman':
        return 'bg-yellow-950/60 text-yellow-300 border-yellow-700/60';
      case 'support':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60';
      case 'roamer':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60';
      case 'jungler':
        return 'bg-rose-950/60 text-rose-300 border-rose-700/60';
      case 'mid laner':
      case 'midlaner':
        return 'bg-indigo-950/60 text-indigo-300 border-indigo-700/60';
      case 'gold laner':
        return 'bg-yellow-950/60 text-yellow-300 border-yellow-600/60';
      case 'exp laner':
        return 'bg-lime-950/60 text-lime-300 border-lime-700/60';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const fetchHeroes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/heroes');
      const data = await res.json();
      if (data.heroes) {
        setHeroes(data.heroes);
        if (data.heroes.length === 0) {
          handleSeedDefaultHeroes();
        }
      }
    } catch (err) {
      console.error('Failed to load heroes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (data.roles) {
        setRoles(data.roles);
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  useEffect(() => {
    fetchHeroes();
    fetchRoles();
  }, []);

  const handleSeedDefaultHeroes = async () => {
    try {
      setIsSeeding(true);
      const res = await fetch('/api/heroes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulk: DEFAULT_MLBB_HEROES }),
      });
      const data = await res.json();
      if (data.heroes) {
        setHeroes(data.heroes);
      }
    } catch (err) {
      console.error('Failed to seed heroes:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Hero Actions
  const handleOpenAddHeroModal = () => {
    setEditingHero(null);
    setFormName('');
    setFormRole(roles[0]?.name || 'Assassin');
    setFormAvatarUrl('');
    setIsHeroModalOpen(true);
  };

  const handleOpenEditHeroModal = (hero: HeroItem) => {
    setEditingHero(hero);
    setFormName(hero.name);
    setFormRole(hero.role || 'Assassin');
    setFormAvatarUrl(hero.avatarUrl || '');
    setIsHeroModalOpen(true);
  };

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        setUploadingHero(true);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            dataBase64: base64String,
          }),
        });
        const data = await res.json();
        if (data.url) setFormAvatarUrl(data.url);
      } catch (err) {
        console.error('Upload failed:', err);
      } finally {
        setUploadingHero(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      if (editingHero) {
        const res = await fetch('/api/heroes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingHero.id,
            name: formName,
            role: formRole,
            avatarUrl: formAvatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${formName}`,
          }),
        });
        if (res.ok) {
          setIsHeroModalOpen(false);
          fetchHeroes();
        }
      } else {
        const res = await fetch('/api/heroes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            role: formRole,
            avatarUrl: formAvatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${formName}`,
          }),
        });
        if (res.ok) {
          setIsHeroModalOpen(false);
          fetchHeroes();
        }
      }
    } catch (err) {
      console.error('Failed to save hero:', err);
    }
  };

  const handleDeleteHero = async (id: string, name: string) => {
    if (!confirm(`Hapus hero "${name}" dari database?`)) return;

    try {
      const res = await fetch(`/api/heroes?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHeroes(heroes.filter((h) => h.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete hero:', err);
    }
  };

  // Role Actions
  const handleOpenRoleModal = () => {
    setEditingRole(null);
    setRoleFormName('');
    setRoleFormImageUrl('');
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role: RoleItem) => {
    setEditingRole(role);
    setRoleFormName(role.name);
    setRoleFormImageUrl(role.imageUrl || '');
  };

  const handleCancelEditRole = () => {
    setEditingRole(null);
    setRoleFormName('');
    setRoleFormImageUrl('');
  };

  const handleRoleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        setUploadingRole(true);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            dataBase64: base64String,
          }),
        });
        const data = await res.json();
        if (data.url) setRoleFormImageUrl(data.url);
      } catch (err) {
        console.error('Role image upload failed:', err);
      } finally {
        setUploadingRole(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormName.trim()) return;

    try {
      if (editingRole) {
        const res = await fetch('/api/roles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingRole.id,
            name: roleFormName,
            imageUrl: roleFormImageUrl,
          }),
        });
        if (res.ok) {
          handleCancelEditRole();
          fetchRoles();
        }
      } else {
        const res = await fetch('/api/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: roleFormName,
            imageUrl: roleFormImageUrl,
          }),
        });
        if (res.ok) {
          handleCancelEditRole();
          fetchRoles();
        }
      }
    } catch (err) {
      console.error('Failed to save role:', err);
    }
  };

  const handleDeleteRole = async (id: string, name: string) => {
    if (!confirm(`Hapus role "${name}"?`)) return;

    try {
      const res = await fetch(`/api/roles?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRoles(roles.filter((r) => r.id !== id));
        if (editingRole?.id === id) handleCancelEditRole();
      }
    } catch (err) {
      console.error('Failed to delete role:', err);
    }
  };

  const filteredHeroes = heroes.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      selectedRole === 'ALL' || h.role.toLowerCase() === selectedRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Header Banner with Modern Icon-First Controls */}
      <div className="min-card p-4 space-y-3.5 bg-[#0d0d11] border border-[#1e1e24]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e1e24]">
          <div>
            <h2 className="font-heading font-black text-sm text-white uppercase flex items-center gap-2">
              <Swords className="w-4 h-4 text-purple-400" />
              <span>DATABASE HERO & ROLE (ESPORTS)</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manajemen roster hero Mobile Legends / MOBA, ikon avatar resmi, dan penugasan role kustom untuk mode drafting Pick & Ban.
            </p>
          </div>

          {/* Action Icon Buttons */}
          <div className="flex items-center gap-2">
            {/* Import / Export Data Button */}
            <button
              onClick={() => setIsImportExportOpen(true)}
              className="p-2 rounded-lg text-xs font-mono font-bold bg-[#141418] hover:bg-[#1f1f26] border border-zinc-800 hover:border-zinc-700 text-zinc-300 flex items-center justify-center transition-all shadow-sm cursor-pointer"
              title="Import / Export Data Hero (Template, CSV, Excel)"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-400" />
            </button>

            {/* Kelola Role Button */}
            <button
              onClick={handleOpenRoleModal}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#141418] hover:bg-[#1f1f26] border border-zinc-800 hover:border-zinc-700 text-zinc-300 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Kelola Role & Ikon Role (CRUD)"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Role ({roles.length})</span>
            </button>

            {/* Sync MLBB Roster Icon Button */}
            <button
              onClick={handleSeedDefaultHeroes}
              disabled={isSeeding}
              className="p-2 rounded-lg text-xs font-mono font-bold bg-[#141418] hover:bg-[#1f1f26] border border-zinc-800 hover:border-zinc-700 text-zinc-300 flex items-center justify-center transition-all shadow-sm cursor-pointer"
              title="Sync MLBB Roster (Muat Roster Resmi)"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isSeeding ? 'animate-spin' : ''}`} />
            </button>

            {/* Tambah Hero Icon Button */}
            <button
              onClick={handleOpenAddHeroModal}
              className="min-btn-primary p-2 rounded-lg text-xs font-bold flex items-center justify-center shadow-sm cursor-pointer"
              title="Tambah Hero Baru"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Controls & Search & Dynamic Role Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama hero atau role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141418] border border-[#23232b] focus:border-purple-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Dynamic Role Segmented Control */}
          <div className="p-1 rounded-xl bg-[#121216] border border-[#23232b] flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setSelectedRole('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                selectedRole === 'ALL'
                  ? 'bg-purple-600 text-white shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Semua ({heroes.length})
            </button>
            {roles.map((r) => {
              const count = heroes.filter(
                (h) => h.role?.toLowerCase() === r.name.toLowerCase()
              ).length;
              const isSelected = selectedRole.toLowerCase() === r.name.toLowerCase();
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-sm font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r.imageUrl && (
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="w-3.5 h-3.5 rounded object-contain"
                    />
                  )}
                  <span>{r.name}</span>
                  <span className="text-[10px] font-mono opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Heroes Grid */}
      {loading ? (
        <div className="p-12 text-center text-zinc-500 font-mono text-xs flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
          <span>Memuat data hero...</span>
        </div>
      ) : filteredHeroes.length === 0 ? (
        <div className="min-card p-12 text-center text-zinc-500 font-mono text-xs">
          Tidak ada hero yang ditemukan. Klik ikon "+" untuk menambah atau ikon refresh untuk sync roster.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredHeroes.map((hero) => (
            <div
              key={hero.id}
              className="p-3 rounded-xl bg-[#121215] border border-[#1e1e24] hover:border-purple-500/50 flex flex-col items-center text-center justify-between space-y-2.5 transition-all group shadow-sm hover:shadow-md"
            >
              {/* Hero Avatar */}
              <div className="relative">
                <img
                  src={hero.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${hero.name}`}
                  alt={hero.name}
                  className="w-16 h-16 rounded-xl object-cover bg-[#18181e] p-0.5 border-2 border-zinc-700/60 group-hover:border-purple-400 transition-all shadow-md"
                />
              </div>

              {/* Hero Details */}
              <div className="w-full">
                <h3 className="font-heading font-black text-xs text-white truncate">
                  {hero.name}
                </h3>
                <div className="mt-1 flex items-center justify-center">
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${getRoleBadgeStyle(
                      hero.role
                    )}`}
                  >
                    {hero.role}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full pt-2 border-t border-zinc-800/80 flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEditHeroModal(hero)}
                  className="p-1.5 rounded-lg bg-[#18181e] hover:bg-[#23232b] text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                  title="Edit Hero"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteHero(hero.id, hero.name)}
                  className="p-1.5 rounded-lg bg-[#18181e] hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-700/60 transition-colors cursor-pointer"
                  title="Hapus Hero"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Add / Edit Hero Modal */}
      {isHeroModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121216] border border-[#23232b] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-heading font-black text-sm text-white uppercase flex items-center gap-2">
                <Swords className="w-4 h-4 text-purple-400" />
                <span>{editingHero ? 'Edit Data Hero' : 'Tambah Hero Baru'}</span>
              </h3>
              <button
                onClick={() => setIsHeroModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitHero} className="space-y-4">
              {/* Hero Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 font-bold uppercase">
                  Nama Hero:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ling, Fanny, Chou, Lancelot..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#18181e] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 font-bold uppercase">
                  Role Utama:
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-[#18181e] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.name} className="bg-[#18181e] text-white">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Avatar URL / Image Upload */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-400 font-bold uppercase">
                  Avatar / Foto Hero:
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={formAvatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${formName || 'new'}`}
                    alt="Preview"
                    className="w-14 h-14 rounded-xl object-cover bg-[#18181e] border border-zinc-700 shrink-0 p-0.5"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Masukkan URL foto atau upload..."
                      value={formAvatarUrl}
                      onChange={(e) => setFormAvatarUrl(e.target.value)}
                      className="w-full bg-[#18181e] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#1e1e26] hover:bg-[#282834] text-zinc-300 border border-zinc-700 transition-colors">
                      <Upload className="w-3 h-3 text-purple-400" />
                      <span>{uploadingHero ? 'Mengupload...' : 'Upload File Foto'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsHeroModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white bg-[#18181e] hover:bg-[#22222a] border border-zinc-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-btn-primary px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingHero ? 'Simpan Perubahan' : 'Tambah Hero'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Role Management Modal (CRUD) */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#121216] border border-[#23232b] rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-heading font-black text-sm text-white uppercase flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>KELOLA ROLE HERO (CRUD)</span>
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Tambah, ubah nama, atau pasang ikon/gambar untuk masing-masing role hero.
                </p>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Input Tambah / Edit Role */}
            <form onSubmit={handleSubmitRole} className="p-3.5 rounded-xl bg-[#18181e] border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                  {editingRole ? `Edit Role: ${editingRole.name}` : '+ Tambah Role Baru'}
                </span>
                {editingRole && (
                  <button
                    type="button"
                    onClick={handleCancelEditRole}
                    className="text-[10px] font-mono text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nama Role */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
                    Nama Role:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Tank, Assassin, Roamer..."
                    value={roleFormName}
                    onChange={(e) => setRoleFormName(e.target.value)}
                    className="w-full bg-[#121216] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Gambar / Icon Role */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
                    Gambar / Icon Role:
                  </label>
                  <div className="flex items-center gap-2">
                    <img
                      src={roleFormImageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${roleFormName || 'role'}`}
                      alt="Preview"
                      className="w-8 h-8 rounded-lg object-contain bg-[#121216] border border-zinc-700 p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      placeholder="URL Gambar / Icon..."
                      value={roleFormImageUrl}
                      onChange={(e) => setRoleFormImageUrl(e.target.value)}
                      className="flex-1 bg-[#121216] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                    />
                    <label className="cursor-pointer p-1.5 rounded-lg bg-[#20202a] hover:bg-[#282836] text-zinc-300 border border-zinc-700 transition-colors" title="Upload Icon">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleRoleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingRole ? 'Simpan Role' : 'Tambah Role'}</span>
                </button>
              </div>
            </form>

            {/* List Roles Grid */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
                Daftar Role Terdaftar ({roles.length})
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {roles.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded-xl bg-[#18181e] border border-zinc-800 hover:border-zinc-700 flex items-center justify-between gap-2 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={r.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${r.name}`}
                        alt={r.name}
                        className="w-7 h-7 rounded-lg object-contain bg-[#121216] border border-zinc-700 p-0.5 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-heading font-black text-xs text-white block truncate">
                          {r.name}
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${getRoleBadgeStyle(r.name)}`}>
                          {heroes.filter((h) => h.role?.toLowerCase() === r.name.toLowerCase()).length} Hero
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleEditRole(r)}
                        className="p-1 rounded-md bg-[#121216] hover:bg-[#202028] text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                        title="Edit Role"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRole(r.id, r.name)}
                        className="p-1 rounded-md bg-[#121216] hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-700/60 transition-colors cursor-pointer"
                        title="Hapus Role"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
