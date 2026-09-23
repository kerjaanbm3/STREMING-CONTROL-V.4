import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  ArrowLeft,
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
} from 'lucide-react';
import QRCode from 'react-qr-code';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type SettingsPage = 'GENERAL' | 'HOTKEYS' | 'CHANNELS' | 'REMOTE';

interface ChannelEntry {
  label: string;
  url: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  tag: string;
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
// Sub-page: General
// ─────────────────────────────────────────────
function GeneralPage() {
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
    : 'http://localhost:3001';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold text-white font-heading uppercase tracking-wide mb-1">General</h2>
        <p className="text-xs text-zinc-500">Informasi sistem dan konfigurasi koneksi broadcast.</p>
      </div>

      {/* Server Info */}
      <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-3">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs font-heading uppercase">
          <Globe className="w-4 h-4" />
          Server Info
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { label: 'Local URL',    value: baseUrl,                  color: 'text-blue-400' },
            { label: 'Admin Panel',  value: `${baseUrl}/admin`,       color: 'text-blue-400' },
            { label: 'Port',         value: '3001',                   color: 'text-zinc-300' },
            { label: 'Engine',       value: 'Next.js + Socket.io',    color: 'text-zinc-300' },
            { label: 'Database',     value: 'SQLite (Prisma)',         color: 'text-zinc-300' },
            { label: 'LAN Access',   value: '0.0.0.0 (all ifaces)',   color: 'text-emerald-400' },
          ].map((item) => (
            <div key={item.label} className="bg-zinc-950/60 rounded-lg p-2.5 border border-zinc-800">
              <div className="text-zinc-500 text-[10px] font-mono mb-0.5">{item.label}</div>
              <div className={`font-mono font-semibold text-[11px] ${item.color} truncate`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4-Channel Guide */}
      <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-heading uppercase">
          <Radio className="w-4 h-4" />
          4-Channel Integration Guide
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { ch: '1', title: 'Browser Source (OBS / vMix)', code: `${baseUrl}/overlay/scoreboard`, color: 'text-blue-400' },
            { ch: '2', title: 'vMix JSON Data Source',       code: `${baseUrl}/api/live-data`,      color: 'text-amber-400' },
            { ch: '3', title: 'Local Text Files',            code: './live_output_txt/*.txt',        color: 'text-emerald-400' },
            { ch: '4', title: 'OBS WebSocket Direct Push',   code: 'ws://127.0.0.1:4455',           color: 'text-purple-400' },
          ].map((item) => (
            <div key={item.ch} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[9px] font-mono font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">CH {item.ch}</span>
                <strong className="text-white text-xs">{item.title}</strong>
              </div>
              <code className={`text-[11px] ${item.color} break-all`}>{item.code}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Text file output */}
      <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-heading uppercase">
          <FileText className="w-4 h-4" />
          Live Text Output Files
        </div>
        <p className="text-xs text-zinc-500">
          File teks diperbarui otomatis setiap ada perubahan state — bisa dibaca oleh OBS Text Source, XSplit, atau scorebot eksternal.
        </p>
        <div className="bg-zinc-950/60 rounded-lg border border-zinc-800 p-3">
          <code className="text-[11px] font-mono text-emerald-400">./live_output_txt/*.txt</code>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-page: Hotkeys
// ─────────────────────────────────────────────
function HotkeysPage({ searchQuery = '' }: { searchQuery?: string }) {
  const [hotkeys, setHotkeys] = useState<any[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [listening, setListening] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/hotkeys')
      .then((r) => r.json())
      .then((d) => { if (d.hotkeys) setHotkeys(d.hotkeys); })
      .catch(console.error);
  }, []);

  // Capture key press when listening mode active
  useEffect(() => {
    if (!listening) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      const key = e.code; // e.g. "Numpad7", "KeyG", "Space"
      setHotkeys((prev) =>
        prev.map((hk) => (hk.actionName === listening ? { ...hk, keyCode: key } : hk))
      );
      setListening(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [listening]);

  // Capture Gamepad input when listening mode active
  useEffect(() => {
    if (!listening) return;

    let rafId: number;
    const pollGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (const gp of gamepads) {
        if (!gp) continue;
        for (let i = 0; i < gp.buttons.length; i++) {
          if (gp.buttons[i].pressed) {
            setHotkeys((prev) =>
              prev.map((hk) => (hk.actionName === listening ? { ...hk, keyCode: `Gamepad_Button${i}` } : hk))
            );
            setListening(null);
            return; // stop polling
          }
        }
      }
      rafId = requestAnimationFrame(pollGamepad);
    };

    rafId = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(rafId);
  }, [listening]);

  const q = searchQuery.toLowerCase().trim();

  // Filter hotkeys by description or actionName
  const filteredHotkeys = q
    ? hotkeys.filter(
        (hk) =>
          hk.description?.toLowerCase().includes(q) ||
          hk.actionName?.toLowerCase().includes(q) ||
          hk.keyCode?.toLowerCase().includes(q)
      )
    : hotkeys;

  // Group by category
  const categories = ['KEYBOARD', 'CONTROLLER', 'GENERAL'];
  const groupedHotkeys = categories.reduce((acc, cat) => {
    const items = filteredHotkeys.filter((hk) => hk.category === cat || (!hk.category && cat === 'GENERAL'));
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, any[]>);
  
  // Add any other categories not in the main list
  filteredHotkeys.forEach(hk => {
    const cat = hk.category || 'GENERAL';
    if (!categories.includes(cat)) {
      if (!groupedHotkeys[cat]) groupedHotkeys[cat] = [];
      if (!groupedHotkeys[cat].includes(hk)) groupedHotkeys[cat].push(hk);
    }
  });

  const handleSave = async () => {
    try {
      const res = await fetch('/api/hotkeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: hotkeys }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  return (
      <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white font-heading uppercase tracking-wide mb-1">Hotkeys</h2>
          <p className="text-xs text-zinc-500">
            Klik tombol kunci lalu tekan tombol keyboard yang diinginkan. Mendukung Numpad, Function keys, dll.
          </p>
        </div>
        <button
          id="hotkeys-save-btn"
          onClick={handleSave}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-heading shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          <Save className="w-3.5 h-3.5" />
          SIMPAN
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Hotkeys berhasil disimpan!</span>
        </div>
      )}

      {listening && (
        <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/60 text-amber-300 text-xs flex items-center gap-2 animate-pulse">
          <Keyboard className="w-4 h-4" />
          <span>Menunggu input keyboard… tekan tombol yang diinginkan</span>
          <button
            onClick={() => setListening(null)}
            className="ml-auto text-amber-500 hover:text-amber-300 underline text-[10px]"
          >
            Batal
          </button>
        </div>
      )}

      <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-4">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs font-heading uppercase">
          <Keyboard className="w-4 h-4" />
          Remap Hardware Hotkeys
        </div>
        <p className="text-[11px] text-zinc-500">
          Contoh kode: <code className="text-blue-400">Numpad7</code>, <code className="text-blue-400">Space</code>, <code className="text-blue-400">KeyG</code>, <code className="text-blue-400">F5</code>
        </p>

        {filteredHotkeys.length === 0 && q ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-600">
            <Search className="w-6 h-6 opacity-40" />
            <p className="text-xs font-mono">Tidak ada hotkey yang cocok dengan &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : filteredHotkeys.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">Memuat hotkeys dari database…</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedHotkeys).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-xs font-bold text-white font-heading tracking-wider border-b border-zinc-800 pb-2">
                  {category === 'KEYBOARD' ? '⌨ KEYBOARD HOTKEYS' : category === 'CONTROLLER' ? '🎮 CONTROLLER HOTKEYS' : category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((hk) => {
                    const isListeningThis = listening === hk.actionName;
                    return (
                      <div
                        key={hk.actionName}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                          isListeningThis
                            ? 'bg-amber-950/40 border-amber-600'
                            : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-white truncate">{hk.description}</div>
                          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{hk.actionName}</div>
                        </div>

                        <button
                          id={`hotkey-btn-${hk.actionName}`}
                          onClick={() => setListening(isListeningThis ? null : hk.actionName)}
                          className={`shrink-0 min-w-[110px] px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-center border transition-all ${
                            isListeningThis
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                              : 'bg-zinc-900 border-zinc-700 text-blue-400 hover:border-blue-500 hover:bg-zinc-800'
                          }`}
                        >
                          {isListeningThis ? '⏳ tekan…' : hk.keyCode}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-page: Channel Simulations
// ─────────────────────────────────────────────
function ChannelsPage({ searchQuery = '' }: { searchQuery?: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const q = searchQuery.toLowerCase().trim();
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
    : 'http://localhost:3001';

  const CHANNELS: ChannelEntry[] = [
    { label: 'Scoreboard Overlay',    url: '/overlay/scoreboard',   description: 'Overlay skor pertandingan utama (sports & esports)', color: 'blue',    icon: <MonitorPlay className="w-4 h-4" />, tag: 'BROWSER SOURCE' },
    { label: 'VS Matchup Screen',     url: '/overlay/vs-screen',    description: 'Layar pembuka matchup kedua tim',                    color: 'rose',    icon: <MonitorPlay className="w-4 h-4" />, tag: 'BROWSER SOURCE' },
    { label: 'Hero Draft / Pick&Ban', url: '/overlay/pick-ban',     description: 'Fase hero draft MLBB / Esports MOBA',               color: 'violet',  icon: <MonitorPlay className="w-4 h-4" />, tag: 'BROWSER SOURCE' },
    { label: 'BR Standings',          url: '/overlay/standings',    description: 'Klasemen Battle Royale real-time',                   color: 'amber',   icon: <MonitorPlay className="w-4 h-4" />, tag: 'BROWSER SOURCE' },
    { label: 'Starting XI / Lineup',  url: '/overlay/lineup',       description: 'Susunan pemain awal pertandingan',                   color: 'emerald', icon: <MonitorPlay className="w-4 h-4" />, tag: 'BROWSER SOURCE' },
    { label: 'Match Summary',         url: '/overlay/summary',      description: 'Ringkasan hasil pertandingan',                       color: 'sky',     icon: <MonitorPlay className="w-4 h-4" />, tag: 'BROWSER SOURCE' },
    { label: 'Break Screen',          url: '/overlay/break-screen', description: 'Layar jeda / commercial break',                      color: 'orange',  icon: <MonitorPlay className="w-4 h-4" />, tag: 'BROWSER SOURCE' },
    { label: 'Lower Third',           url: '/overlay/lower-third',  description: 'Teks nama caster / info bawah layar',                color: 'teal',    icon: <Layers className="w-4 h-4" />,     tag: 'BROWSER SOURCE' },
    { label: 'vMix JSON Data Source', url: '/api/live-data',        description: 'JSON endpoint real-time untuk title input vMix',     color: 'yellow',  icon: <Database className="w-4 h-4" />,   tag: 'JSON / DATA'    },
    { label: 'WebSocket Bus',         url: 'SOCKET',                description: 'Socket.io real-time sync antara semua klien',        color: 'purple',  icon: <Wifi className="w-4 h-4" />,       tag: 'WEBSOCKET'      },
  ];

  // Filter channels by label, description, tag, or URL
  const filteredChannels = q
    ? CHANNELS.filter(
        (ch) =>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold text-white font-heading uppercase tracking-wide mb-1">Channel Simulations</h2>
        <p className="text-xs text-zinc-500">
          Semua URL channel output — salin ke OBS / vMix sebagai Browser Source atau Data Source.
        </p>
      </div>

      <div className="space-y-2.5">
        {filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-600">
            <Search className="w-6 h-6 opacity-40" />
            <p className="text-xs font-mono">Tidak ada channel yang cocok dengan &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : (
          filteredChannels.map((ch) => {
          const isSocket  = ch.url === 'SOCKET';
          const fullUrl   = isSocket
            ? `ws://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`
            : `${baseUrl}${ch.url}`;
          const isCopied  = copied === ch.url;
          const colorCls  = COLOR_MAP[ch.color] ?? COLOR_MAP['blue'];

          return (
            <div
              key={ch.url}
              className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 flex items-center gap-4 hover:border-zinc-700 transition-all group"
            >
              {/* Icon */}
              <div className={`shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center ${colorCls}`}>
                {ch.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-bold text-white">{ch.label}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${colorCls}`}>
                    {ch.tag}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mb-1">{ch.description}</p>
                <code className="text-[11px] font-mono text-zinc-400 truncate block">{fullUrl}</code>
              </div>

              {/* Actions */}
              {!isSocket && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    id={`copy-${ch.url.replace(/\//g, '-')}`}
                    onClick={() => handleCopy(fullUrl, ch.url)}
                    title="Salin URL"
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                  >
                    {isCopied
                      ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                      : <Copy className="w-3.5 h-3.5" />
                    }
                  </button>

                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Buka di tab baru"
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {ch.tag === 'BROWSER SOURCE' && (
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-700 text-blue-400 text-[10px] font-mono font-bold transition-all"
                    >
                      <Play className="w-3 h-3" />
                      Preview
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        }))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-page: Remote Access
// ─────────────────────────────────────────────
function RemotePage() {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold text-white font-heading uppercase tracking-wide mb-1">Mobile Remote Access</h2>
        <p className="text-xs text-zinc-500">Pindai QR Code di bawah ini menggunakan Smartphone Anda untuk mengontrol aplikasi dari jarak jauh.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* QR Code Section */}
        <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-6 flex flex-col items-center justify-center shrink-0">
          <div className="p-3 bg-white rounded-xl shadow-lg">
            <QRCode value={remoteUrl} size={180} level="H" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-emerald-400 font-bold text-xs font-heading uppercase">
            <Smartphone className="w-4 h-4" />
            Scan to Connect
          </div>
        </div>

        {/* Info & URL Section */}
        <div className="flex-1 space-y-4">
          <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs font-heading uppercase">
              <Wifi className="w-4 h-4" />
              Direct URL
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Pastikan PC utama dan Smartphone Anda terhubung ke <strong>Jaringan Wi-Fi/Router yang sama</strong>. Buka alamat di bawah ini melalui browser smartphone Anda:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-blue-400 text-sm font-mono break-all font-bold">
                {remoteUrl}
              </code>
              <button
                onClick={handleCopy}
                className="shrink-0 p-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg"
                title="Salin URL"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-300" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-amber-950/20 border border-amber-900/40 p-4">
            <div className="text-xs font-bold text-amber-400 mb-1">⚠️ Catatan Firewall</div>
            <p className="text-[11px] text-zinc-500">
              Jika halaman gagal dimuat di smartphone, pastikan <strong>Windows Defender Firewall</strong> tidak memblokir koneksi masuk (Inbound rules) untuk Node.js pada port <strong>3001</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sidebar nav items
// ─────────────────────────────────────────────
const SIDEBAR_ITEMS: { id: SettingsPage; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'GENERAL',  label: 'General',              icon: <Settings className="w-4 h-4" />,    description: 'Info server & integrasi' },
  { id: 'HOTKEYS',  label: 'Hotkeys',              icon: <Keyboard className="w-4 h-4" />,    description: 'Remap keyboard shortcut' },
  { id: 'REMOTE',   label: 'Remote Access',        icon: <Smartphone className="w-4 h-4" />,  description: 'Akses kontrol dari HP' },
  { id: 'CHANNELS', label: 'Channel Simulations',  icon: <MonitorPlay className="w-4 h-4" />, description: 'Semua URL output overlay' },
];

// ─────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────
export default function SettingsPage() {
  const [activePage, setActivePage] = useState<SettingsPage>('GENERAL');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Head>
        <title>Settings - BM3 Broadcast Engine</title>
        <meta name="description" content="System settings, hotkeys, and channel simulations for BM3 Broadcast" />
      </Head>

      <div className="min-h-screen bg-[#07090f] text-gray-100 flex">

        {/* ── Internal Settings Sidebar ── */}
        <aside className="w-64 shrink-0 bg-[#0b0d14] border-r border-zinc-800 h-screen sticky top-0 flex flex-col p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
            <Link
              href="/admin"
              id="settings-back-btn"
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
              title="Kembali ke Admin"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="text-xs font-black text-white font-heading uppercase tracking-wide">System Settings</div>
              <div className="text-[10px] text-zinc-500 font-mono">BM3 Broadcast Engine v4.0</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-1 flex-1">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  id={`settings-nav-${item.id.toLowerCase()}`}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all group border ${
                    isActive
                      ? 'bg-blue-600/15 border-blue-700/50 text-white'
                      : 'border-transparent hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`shrink-0 ${isActive ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold leading-tight">{item.label}</div>
                      <div className="text-[10px] text-zinc-600 leading-tight truncate">{item.description}</div>
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-3 h-3 text-blue-500 shrink-0" />}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="pt-3 border-t border-zinc-800 text-[10px] font-mono text-zinc-600 text-center">
            BM3 TV Apps · Streaming Control V.4
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {/* Top bar with search */}
          <div className="sticky top-0 z-20 bg-[#07090f]/90 backdrop-blur-md border-b border-zinc-800 px-8 py-3 flex items-center justify-end gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
              <input
                id="settings-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari hotkeys, channel, URL…"
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
          </div>

          {/* Page content */}
          <div className="p-8 max-w-4xl">
            {activePage === 'GENERAL'  && <GeneralPage />}
            {activePage === 'HOTKEYS'  && <HotkeysPage  searchQuery={searchQuery} />}
            {activePage === 'REMOTE'   && <RemotePage />}
            {activePage === 'CHANNELS' && <ChannelsPage searchQuery={searchQuery} />}
          </div>
        </main>
      </div>
    </>
  );
}
