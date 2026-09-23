import React, { useState, useEffect } from 'react';
import { X, Save, Layers, PlayCircle } from 'lucide-react';

interface OverlayItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  description: string;
  path: string;
  resolution: string;
  badgeColor: string;
  icon: string;
  testAlertPayload?: any;
}

interface OverlayFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (overlay: Partial<OverlayItem>) => void;
  overlayData?: OverlayItem | null;
}

export const OverlayFormModal: React.FC<OverlayFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  overlayData,
}) => {
  const [formData, setFormData] = useState<Partial<OverlayItem>>({
    title: '',
    category: 'HUD',
    categoryLabel: '',
    description: '',
    path: '',
    resolution: '',
    badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-950/40',
    icon: 'Monitor',
    testAlertPayload: '',
  });

  useEffect(() => {
    if (overlayData) {
      setFormData({
        ...overlayData,
        testAlertPayload: overlayData.testAlertPayload
          ? typeof overlayData.testAlertPayload === 'string'
            ? overlayData.testAlertPayload
            : JSON.stringify(overlayData.testAlertPayload, null, 2)
          : '',
      });
    } else {
      setFormData({
        title: '',
        category: 'HUD',
        categoryLabel: '',
        description: '',
        path: '',
        resolution: '',
        badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-950/40',
        icon: 'Monitor',
        testAlertPayload: '',
      });
    }
  }, [overlayData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let payload = formData.testAlertPayload;
    if (payload && typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (err) {
        alert('Invalid JSON in Test Alert Payload');
        return;
      }
    }
    onSave({ ...formData, testAlertPayload: payload });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f0f13] border border-[#23232b] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1e1e24] sticky top-0 bg-[#0f0f13]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/40 border border-blue-900/60 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-black text-white uppercase tracking-wide">
                {overlayData ? 'Edit Overlay' : 'Add New Overlay'}
              </h2>
              <p className="text-xs text-zinc-400">Konfigurasi channel overlay grafis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#1e1e24] text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Title / Name</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-[#18181e] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. Scoreboard HUD"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full bg-[#18181e] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
              >
                <option value="HUD">Scoreboards & HUD</option>
                <option value="ALERTS">In-Game Alerts & Popups</option>
                <option value="ESPORTS">Esports Screens</option>
                <option value="BROADCAST_SCREENS">Production Screens</option>
                <option value="DATA">Data Feed (vMix/OBS)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Category Label</label>
              <input
                type="text"
                name="categoryLabel"
                value={formData.categoryLabel}
                onChange={handleChange}
                className="w-full bg-[#18181e] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. HUD Utama Pertandingan"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Icon Name (Lucide)</label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="w-full bg-[#18181e] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. Trophy, Monitor, Zap"
              />
            </div>

          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full bg-[#18181e] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="Deskripsi fungsi overlay..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Browser Path</label>
              <input
                type="text"
                name="path"
                value={formData.path}
                onChange={handleChange}
                required
                className="w-full font-mono bg-[#18181e] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-blue-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. /overlay/scoreboard"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Resolution</label>
              <input
                type="text"
                name="resolution"
                value={formData.resolution}
                onChange={handleChange}
                className="w-full font-mono bg-[#18181e] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. 1920 x 1080 Alpha"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Badge CSS Classes</label>
            <input
              type="text"
              name="badgeColor"
              value={formData.badgeColor}
              onChange={handleChange}
              className="w-full font-mono bg-[#18181e] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. border-blue-500/30 text-blue-400 bg-blue-950/40"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <PlayCircle className="w-3.5 h-3.5" />
                Test Alert Payload (JSON)
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">Optional</span>
            </div>
            <textarea
              name="testAlertPayload"
              value={formData.testAlertPayload as string}
              onChange={handleChange}
              rows={5}
              className="w-full font-mono bg-[#121215] border border-amber-900/40 rounded-xl px-4 py-3 text-xs text-amber-100 focus:outline-none focus:border-amber-500 transition-colors resize-none"
              placeholder={`{\n  "type": "GOAL",\n  "title": "GOOOOOAL!"\n}`}
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#1e1e24] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-400 hover:text-white bg-[#18181e] hover:bg-[#23232b] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Overlay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
