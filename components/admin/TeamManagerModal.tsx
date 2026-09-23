import React, { useState, useEffect } from 'react';
import { TeamData } from '@/lib/types';
import { Users, Plus, Upload, Check, X, Shield, Sparkles } from 'lucide-react';

interface TeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTeam: (team: TeamData, slot: 'A' | 'B') => void;
}

export const TeamManagerModal: React.FC<TeamManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectTeam,
}) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamOrigin, setNewTeamOrigin] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#3b82f6');
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchTeams = () => {
    fetch('/api/teams')
      .then((res) => res.json())
      .then((data) => {
        if (data.teams) setTeams(data.teams);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (isOpen) fetchTeams();
  }, [isOpen]);

  if (!isOpen) return null;

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
          setNewLogoUrl(data.url);
        }
      } catch (err) {
        console.error('Upload failed:', err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      const logo =
        newLogoUrl ||
        `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(newTeamName)}`;

      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeamName.trim().toUpperCase(),
          institution: newTeamOrigin.trim(),
          brandColor: newTeamColor,
          logoUrl: logo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreating(false);
        setNewTeamName('');
        setNewTeamOrigin('');
        setNewLogoUrl('');
        fetchTeams();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel rounded-3xl w-full max-w-2xl border border-blue-500/40 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="font-heading font-extrabold text-lg text-white">TEAMS & ROSTER DATABASE</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-mono">
            {teams.length} Registered Teams in Offline Database
          </span>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-heading shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreating ? 'Cancel' : 'Create New Team'}</span>
          </button>
        </div>

        {/* Create Team Form Drawer */}
        {isCreating && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/40 space-y-3">
            <h4 className="font-heading font-bold text-xs text-blue-400 uppercase">ADD NEW BROADCAST TEAM</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Team Name</label>
                <input
                  type="text"
                  placeholder="e.g. EVOS LEGENDS"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Origin / City / School</label>
                <input
                  type="text"
                  placeholder="e.g. Jakarta, Indonesia"
                  value={newTeamOrigin}
                  onChange={(e) => setNewTeamOrigin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Brand Theme Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newTeamColor}
                    onChange={(e) => setNewTeamColor(e.target.value)}
                    className="w-10 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
                  />
                  <span className="text-xs font-mono text-gray-300">{newTeamColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Team Logo (Offline File)</label>
                <label className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-300 truncate">
                    {isUploading ? 'Uploading...' : newLogoUrl ? 'Logo Uploaded ✓' : 'Upload PNG/SVG'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveTeam}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-heading shadow-md"
              >
                Save Team to Database
              </button>
            </div>
          </div>
        )}

        {/* Teams List Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
          {teams.map((t) => (
            <div
              key={t.id}
              className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={t.logoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + t.name}
                  alt={t.name}
                  className="w-10 h-10 rounded-xl object-contain bg-slate-950 p-1.5 border border-slate-700"
                />
                <div>
                  <div className="font-heading font-extrabold text-xs text-white">{t.name}</div>
                  <div className="text-[10px] text-gray-400">{t.institution || 'Club'}</div>
                </div>
              </div>

              {/* Set as Team A or Team B Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    onSelectTeam(t, 'A');
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300 text-[10px] font-bold font-mono"
                  title="Set as Home Team A"
                >
                  Set [A]
                </button>
                <button
                  onClick={() => {
                    onSelectTeam(t, 'B');
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-700 text-blue-300 text-[10px] font-bold font-mono"
                  title="Set as Away Team B"
                >
                  Set [B]
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
