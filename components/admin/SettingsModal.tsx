import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Save,
  Keyboard,
  Radio,
  CheckCircle2,
  Settings,
  MonitorPlay,
  Copy,
  ExternalLink,
  Check,
  Wifi,
  Globe,
  FileText,
  Database,
  Layers,
  Play,
  ChevronRight,
  Search,
  X,
  Smartphone,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import QRCode from 'react-qr-code';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type SettingsTab = 'GENERAL' | 'HOTKEYS' | 'CHANNELS' | 'REMOTE';

interface ChannelEntry {
  label: string;
  url: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  tag: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─────────────────────────────────────────────
// Color map
// ─────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  blue:    'bg-blue-950/50 border-blue-800 text-blue-400',
  rose:    'bg-rose-950/50 border-rose-800 text-rose-400',
  violet:  'bg-violet-950/50 border-violet-800 text-violet-400',
  amber:   'bg-amber-950/50 border-amber-800 text-amber-400',
  emerald: 'bg-emerald-950/50 border-emerald-800 text-emerald-400',
  sky:     'bg-sky-950/50 border-sky-800 text-sky-400',
  orange:  'bg-orange-950/50 border-orange-800 text-orange-400',
  teal:    'bg-teal-950/50 border-teal-800 text-teal-400',
  yellow:  'bg-yellow-950/50 border-yellow-800 text-yellow-400',
  purple:  'bg-purple-950/50 border-purple-800 text-purple-400',
};

// ─────────────────────────────────────────────
// Sub-tab: General
// ─────────────────────────────────────────────
function GeneralTab() {
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
    : 'http://localhost:3001';

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wide mb-1">General</h3>
        <p className="text-xs text-zinc-500">Informasi sistem dan konfigurasi koneksi broadcast.</p>
      </div>

      {/* Server Info */}
      <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-3">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs font-heading uppercase">
          <Globe className="w-3.5 h-3.5" /> Server Info
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: 'Local URL',   value: baseUrl,                color: 'text-blue-400' },
            { label: 'Admin Panel', value: `${baseUrl}/admin`,    color: 'text-blue-400' },
            { label: 'Port',        value: '3001',                 color: 'text-zinc-300' },
            { label: 'Engine',      value: 'Next.js + Socket.io', color: 'text-zinc-300' },
            { label: 'Database',    value: 'SQLite (Prisma)',      color: 'text-zinc-300' },
            { label: 'LAN Access',  value: '0.0.0.0 (all ifaces)',color: 'text-emerald-400' },
          ].map((item) => (
            <div key={item.label} className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800">
              <div className="text-zinc-500 text-[10px] font-mono mb-0.5">{item.label}</div>
              <div className={`font-mono font-semibold text-[11px] ${item.color} truncate`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4-Channel Guide */}
      <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-heading uppercase">
          <Radio className="w-3.5 h-3.5" /> 4-Channel Integration Guide
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { ch: '1', title: 'Browser Source (OBS / vMix)', code: `${baseUrl}/overlay/scoreboard`, color: 'text-blue-400' },
            { ch: '2', title: 'vMix JSON Data Source',       code: `${baseUrl}/api/live-data`,      color: 'text-amber-400' },
            { ch: '3', title: 'Local Text Files',            code: './live_output_txt/*.txt',        color: 'text-emerald-400' },
            { ch: '4', title: 'OBS WebSocket Direct Push',   code: 'ws://127.0.0.1:4455',           color: 'text-purple-400' },
          ].map((item) => (
            <div key={item.ch} className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] font-mono font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">CH {item.ch}</span>
                <strong className="text-white text-[11px] truncate">{item.title}</strong>
              </div>
              <code className={`text-[10px] ${item.color} break-all`}>{item.code}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Live text files */}
      <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-heading uppercase">
          <FileText className="w-3.5 h-3.5" /> Live Text Output Files
        </div>
        <p className="text-xs text-zinc-500">File teks diperbarui otomatis — bisa dibaca OBS Text Source, XSplit, atau scorebot eksternal.</p>
        <div className="bg-zinc-950/60 rounded-lg border border-zinc-800 p-2.5">
          <code className="text-[11px] font-mono text-emerald-400">./live_output_txt/*.txt</code>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-tab: Hotkeys (exposes saveHotkeys via ref)
// ─────────────────────────────────────────────
interface HotkeysTabProps {
  searchQuery?: string;
  saveRef: React.MutableRefObject<(() => Promise<boolean>) | null>;
}

function HotkeysTab({ searchQuery = '', saveRef }: HotkeysTabProps) {
  const [hotkeys, setHotkeys] = useState<any[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [listening, setListening] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/hotkeys')
      .then((r) => r.json())
      .then((d) => { if (d.hotkeys) setHotkeys(d.hotkeys); })
      .catch(console.error);
  }, []);

  // Capture key when listening
  useEffect(() => {
    if (!listening) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      const key = e.code;
      setHotkeys((prev) => prev.map((hk) => (hk.actionName === listening ? { ...hk, keyCode: key } : hk)));
      setListening(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [listening]);

  // Register save fn to ref so parent footer can call it
  const doSave = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/hotkeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: hotkeys }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [hotkeys]);

  useEffect(() => {
    saveRef.current = doSave;
  }, [doSave, saveRef]);

  const q = searchQuery.toLowerCase().trim();
  const filtered = q
    ? hotkeys.filter((hk) =>
        hk.description?.toLowerCase().includes(q) ||
        hk.actionName?.toLowerCase().includes(q) ||
        hk.keyCode?.toLowerCase().includes(q)
      )
    : hotkeys;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wide mb-1">Hotkeys</h3>
        <p className="text-xs text-zinc-500">Klik tombol kunci lalu tekan tombol keyboard. Mendukung Numpad, F-keys, dll.</p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Hotkeys berhasil disimpan!</span>
        </div>
      )}

      {listening && (
        <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-600/60 text-amber-300 text-xs flex items-center gap-2 animate-pulse">
          <Keyboard className="w-4 h-4" />
          <span>Menunggu input keyboard… tekan tombol yang diinginkan</span>
          <button onClick={() => setListening(null)} className="ml-auto text-amber-500 hover:text-amber-300 underline text-[10px]">
            Batal
          </button>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-[11px] text-zinc-500">
          Contoh kode: <code className="text-blue-400">Numpad7</code>, <code className="text-blue-400">Space</code>, <code className="text-blue-400">KeyG</code>, <code className="text-blue-400">F5</code>
        </p>

        {filtered.length === 0 && q ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-zinc-600">
            <Search className="w-6 h-6 opacity-40" />
            <p className="text-xs font-mono">Tidak ada hotkey untuk &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">Memuat hotkeys…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filtered.map((hk) => {
              const isThis = listening === hk.actionName;
              return (
                <div
                  key={hk.actionName}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isThis ? 'bg-amber-950/40 border-amber-600' : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-white truncate">{hk.description}</div>
                    <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{hk.actionName}</div>
                  </div>
                  <button
                    id={`hotkey-btn-${hk.actionName}`}
                    onClick={() => setListening(isThis ? null : hk.actionName)}
                    className={`shrink-0 min-w-[100px] px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-center border transition-all ${
                      isThis
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                        : 'bg-zinc-900 border-zinc-700 text-blue-400 hover:border-blue-500 hover:bg-zinc-800'
                    }`}
                  >
                    {isThis ? '⌨ tekan…' : hk.keyCode}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-tab: Channel Simulations
// ─────────────────────────────────────────────
function ChannelsTab({ searchQuery = '' }: { searchQuery?: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
    : 'http://localhost:3001';
  const q = searchQuery.toLowerCase().trim();

  const CHANNELS: ChannelEntry[] = [
    { label: 'Scoreboard Overlay',    url: '/overlay/scoreboard',   description: 'Overlay skor pertandingan utama', color: 'blue',    icon: <MonitorPlay className="w-4 h-4" />, tag: 'BROWSER SOURCE' },
    { label: 'VS Matchup Screen',     url: '/overlay/vs-screen',    description: 'Layar pembuka matchup kedua tim', color: 'rose',    icon: <MonitorPlay className="w-4 h-4" />, tag: 'BROWSER SOURCE' },
    { label: 'Hero Draft / Pick&Ban', url: '/overlay/pick-ban',     description: 'Fase hero draft MLBB / MOBA',    color: 'violet',  icon: <MonitorPlay className="w-4 h-4" />, tag: 'BROWSER SOURCE' },
    { label: 'BR Standings',          url: '/overlay/standings',    description: 'Klasemen Battle Royale real-time',color: 'amber',   icon: <MonitorPlay className="w-4 h-4" />, tag: 'BROWSER SOURCE' },
    { label: 'Starting XI / Lineup',  url: '/overlay/lineup',       description: 'Susunan pemain awal',            color: 'emerald', icon: <MonitorPlay className="w-4 h-4" />, tag: 'BROWSER SOURCE' },
    { label: 'Match Summary',         url: '/overlay/summary',      description: 'Ringkasan hasil pertandingan',   color: 'sky',     icon: <MonitorPlay className="w-4 h-4" />, tag: 'BROWSER SOURCE' },
    { label: 'Break Screen',          url: '/overlay/break-screen', description: 'Layar jeda / commercial break',  color: 'orange',  icon: <MonitorPlay className="w-4 h-4" />, tag: 'BROWSER SOURCE' },
    { label: 'Lower Third',           url: '/overlay/lower-third',  description: 'Teks nama caster / info bawah', color: 'teal',    icon: <Layers className="w-4 h-4" />,     tag: 'BROWSER SOURCE' },
    { label: 'vMix JSON Data Source', url: '/api/live-data',        description: 'JSON endpoint untuk vMix',      color: 'yellow',  icon: <Database className="w-4 h-4" />,   tag: 'JSON / DATA'    },
    { label: 'WebSocket Bus',         url: 'SOCKET',                description: 'Socket.io real-time sync',      color: 'purple',  icon: <Wifi className="w-4 h-4" />,       tag: 'WEBSOCKET'      },
  ];

  const filtered = q
    ? CHANNELS.filter((ch) =>
        ch.label.toLowerCase().includes(q) ||
        ch.description.toLowerCase().includes(q) ||
        ch.tag.toLowerCase().includes(q) ||
        ch.url.toLowerCase().includes(q)
      )
    : CHANNELS;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wide mb-1">Channel Simulations</h3>
        <p className="text-xs text-zinc-500">Semua URL channel output — salin ke OBS / vMix sebagai Browser Source atau Data Source.</p>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-600">
            <Search className="w-6 h-6 opacity-40" />
            <p className="text-xs font-mono">Tidak ada channel untuk &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : filtered.map((ch) => {
          const isSocket = ch.url === 'SOCKET';
          const fullUrl  = isSocket
            ? `ws://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`
            : `${baseUrl}${ch.url}`;
          const isCopied = copied === ch.url;
          const colorCls = COLOR_MAP[ch.color] ?? COLOR_MAP['blue'];

          return (
            <div
              key={ch.url}
              className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3.5 flex items-center gap-3 hover:border-zinc-700 transition-all"
            >
              <div className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center ${colorCls}`}>
                {ch.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-bold text-white">{ch.label}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${colorCls}`}>{ch.tag}</span>
                </div>
                <p className="text-[11px] text-zinc-500 mb-0.5">{ch.description}</p>
                <code className="text-[10px] font-mono text-zinc-400 truncate block">{fullUrl}</code>
              </div>
              {!isSocket && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    id={`copy-${ch.url.replace(/\//g, '-')}`}
                    onClick={() => handleCopy(fullUrl, ch.url)}
                    title="Salin URL"
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a href={fullUrl} target="_blank" rel="noreferrer" title="Buka tab baru"
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  {ch.tag === 'BROWSER SOURCE' && (
                    <a href={fullUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-700 text-blue-400 text-[10px] font-mono font-bold transition-all">
                      <Play className="w-3 h-3" /> Preview
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-tab: Remote Access
// ─────────────────────────────────────────────
function RemoteTab() {
  const [localIp, setLocalIp] = useState<string>('127.0.0.1');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/ip')
      .then(res => res.json())
      .then(data => {
        if (data.ip) setLocalIp(data.ip);
      })
      .catch(console.error);
  }, []);

  const remoteUrl = `http://${localIp}:3001/admin`;

  const handleCopy = () => {
    navigator.clipboard.writeText(remoteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wide mb-1">Mobile Remote Access</h3>
        <p className="text-xs text-zinc-500">Pindai QR Code di bawah ini menggunakan Smartphone Anda untuk mengontrol aplikasi dari jarak jauh.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        {/* QR Code Section */}
        <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5 flex flex-col items-center justify-center shrink-0">
          <div className="p-2.5 bg-white rounded-xl shadow-lg">
            <QRCode value={remoteUrl} size={150} level="H" />
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] font-heading uppercase">
            <Smartphone className="w-3.5 h-3.5" />
            Scan to Connect
          </div>
        </div>

        {/* Info & URL Section */}
        <div className="flex-1 space-y-3">
          <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs font-heading uppercase">
              <Wifi className="w-3.5 h-3.5" />
              Direct URL
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Pastikan PC dan Smartphone Anda terhubung ke <strong>Jaringan Wi-Fi/Router yang sama</strong>. Buka alamat di bawah ini:
            </p>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-blue-400 text-xs font-mono break-all font-bold">
                {remoteUrl}
              </code>
              <button
                onClick={handleCopy}
                className="shrink-0 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md"
                title="Salin URL"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-amber-950/20 border border-amber-900/40 p-3">
            <div className="text-[11px] font-bold text-amber-400 mb-0.5">⚠️ Catatan Firewall</div>
            <p className="text-[10px] text-zinc-500">
              Jika halaman gagal dimuat di smartphone, pastikan <strong>Windows Defender Firewall</strong> mengizinkan koneksi masuk untuk port <strong>3001</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sidebar tab definitions
// ─────────────────────────────────────────────
const TABS: { id: SettingsTab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'GENERAL',  label: 'General',             icon: <Settings className="w-4 h-4" />,    desc: 'Info server & integrasi' },
  { id: 'HOTKEYS',  label: 'Hotkeys',             icon: <Keyboard className="w-4 h-4" />,    desc: 'Remap keyboard shortcut' },
  { id: 'REMOTE',   label: 'Remote Access',       icon: <Smartphone className="w-4 h-4" />,  desc: 'Akses kontrol dari HP' },
  { id: 'CHANNELS', label: 'Channel Simulations', icon: <MonitorPlay className="w-4 h-4" />, desc: 'Semua URL output overlay' },
];

// ─────────────────────────────────────────────
// Main Modal Component
// ─────────────────────────────────────────────
export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('GENERAL');
  const [searchQuery, setSearchQuery]  = useState('');
  const [isSaving, setIsSaving]        = useState(false);
  const [saveOk, setSaveOk]            = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const saveRef = useRef<(() => Promise<boolean>) | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('GENERAL');
      setSearchQuery('');
      setSaveOk(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (activeTab === 'HOTKEYS' && saveRef.current) {
      setIsSaving(true);
      const ok = await saveRef.current();
      setIsSaving(false);
      if (ok) {
        setSaveOk(true);
        setTimeout(() => { setSaveOk(false); onClose(); }, 1200);
      }
    } else {
      // General / Channels: nothing to save, just close
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    // ── Backdrop ──
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Modal Box ── */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#0c0e15] border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden">

        {/* ━━━ HEADER ━━━ */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          {/* Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-700/50 flex items-center justify-center">
              <Settings className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <div className="text-xs font-black text-white font-heading uppercase tracking-wide">System Settings</div>
              <div className="text-[10px] text-zinc-500 font-mono">BM3 Broadcast Engine v4.0</div>
            </div>
          </div>

          {/* Search + Close */}
          <div className="flex items-center gap-3">
            {/* Search bar */}
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
              <input
                id="settings-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari hotkeys, channel…"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Close button */}
            <button
              id="settings-close-btn"
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all border border-zinc-700"
              title="Tutup (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ━━━ BODY (sidebar + content) ━━━ */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

          {/* Sidebar */}
          <aside className={`shrink-0 bg-[#090b11] border-b md:border-b-0 md:border-r border-zinc-800 flex flex-row md:flex-col overflow-x-auto overflow-y-hidden md:overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'md:w-16' : 'md:w-56'} p-2 md:p-3 space-x-2 md:space-x-0 md:space-y-1`}>
            
            {/* Desktop Collapse Toggle */}
            <div className="hidden md:flex justify-end mb-2">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all ${isSidebarCollapsed ? 'w-full flex justify-center bg-blue-600/10 text-blue-400' : ''}`}
                title={isSidebarCollapsed ? "Perluas Menu" : "Lipat Menu"}
              >
                {isSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            </div>

            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`settings-tab-${tab.id.toLowerCase()}`}
                  onClick={() => setActiveTab(tab.id)}
                  title={isSidebarCollapsed ? tab.label : undefined}
                  className={`shrink-0 md:w-full flex items-center ${isSidebarCollapsed ? 'md:justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-lg transition-all group border ${
                    isActive
                      ? 'bg-blue-600/15 border-blue-700/50 text-white'
                      : 'border-transparent hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`shrink-0 ${isActive ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                      {tab.icon}
                    </span>
                    {/* Hide text on mobile AND when collapsed on desktop */}
                    <div className={`min-w-0 flex-col text-left ${isSidebarCollapsed ? 'hidden' : 'hidden md:flex'}`}>
                      <div className="text-xs font-semibold leading-tight">{tab.label}</div>
                      <div className="text-[10px] text-zinc-600 leading-tight truncate">{tab.desc}</div>
                    </div>
                    {/* Show simple text on mobile */}
                    <span className="md:hidden text-xs font-semibold whitespace-nowrap">{tab.label}</span>
                  </div>
                  {!isSidebarCollapsed && <ChevronRight className="hidden md:block w-3 h-3 text-blue-500 shrink-0" />}
                </button>
              );
            })}

            {/* Spacer + version (Desktop only) */}
            <div className="hidden md:block flex-1" />
            <div className={`hidden md:block pt-2 border-t border-zinc-800 text-[10px] font-mono text-zinc-700 text-center ${isSidebarCollapsed ? 'hidden md:hidden' : ''}`}>
              BM3 TV Apps · V.4
            </div>
          </aside>

          {/* Content area */}
          <main className="flex-1 overflow-y-auto p-5">
            {activeTab === 'GENERAL'  && <GeneralTab />}
            {activeTab === 'HOTKEYS'  && <HotkeysTab searchQuery={searchQuery} saveRef={saveRef} />}
            {activeTab === 'REMOTE'   && <RemoteTab />}
            {activeTab === 'CHANNELS' && <ChannelsTab searchQuery={searchQuery} />}
          </main>
        </div>

        {/* ━━━ FOOTER ━━━ */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-zinc-800 bg-[#090b11] shrink-0">
          {saveOk && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono mr-auto">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tersimpan!</span>
            </div>
          )}

          {/* Cancel */}
          <button
            id="settings-cancel-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all"
          >
            Cancel
          </button>

          {/* Save */}
          <button
            id="settings-save-btn"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-wait text-white text-xs font-bold font-heading shadow-lg shadow-blue-700/30 transition-all active:scale-95"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan…
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
