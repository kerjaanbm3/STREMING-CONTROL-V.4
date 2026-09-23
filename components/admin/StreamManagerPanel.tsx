import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Radio, Youtube, Instagram, Tv2, Settings2, Eye, EyeOff,
  Play, Square, AlertCircle, CheckCircle2, Loader2, Wifi,
  Clock, Zap, ChevronDown,
} from 'lucide-react';

// ─────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────
type Platform = 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'CUSTOM';
type QualityKey = '720p30' | '1080p30' | '1080p60';

interface PlatformConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  rtmpUrl: string;
  keyPlaceholder: string;
  keyHint: string;
}

const PLATFORMS: Record<Platform, PlatformConfig> = {
  YOUTUBE: {
    label: 'YouTube',
    icon: <Youtube className="w-4 h-4" />,
    color: 'rose',
    rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
    keyPlaceholder: 'xxxx-xxxx-xxxx-xxxx-xxxx',
    keyHint: 'YouTube Studio → Go Live → Stream → Stream Key',
  },
  INSTAGRAM: {
    label: 'Instagram',
    icon: <Instagram className="w-4 h-4" />,
    color: 'pink',
    rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/',
    keyPlaceholder: 'Stream key from Meta Pro Dashboard',
    keyHint: 'Meta Business Suite → Live → Stream Key',
  },
  TIKTOK: {
    label: 'TikTok',
    icon: <Tv2 className="w-4 h-4" />,
    color: 'cyan',
    rtmpUrl: 'rtmp://push.tiktokcdn.com/live/',
    keyPlaceholder: 'TikTok stream key',
    keyHint: 'TikTok Live Studio → Settings → Stream Key',
  },
  CUSTOM: {
    label: 'Custom RTMP',
    icon: <Settings2 className="w-4 h-4" />,
    color: 'violet',
    rtmpUrl: '',
    keyPlaceholder: 'Stream key / path',
    keyHint: 'Nginx RTMP, Restream.io, atau server RTMP apapun',
  },
};

const QUALITY_OPTIONS: { key: QualityKey; label: string; sub: string }[] = [
  { key: '720p30',  label: '720p',  sub: '30fps · 2.5 Mbps' },
  { key: '1080p30', label: '1080p', sub: '30fps · 4.5 Mbps' },
  { key: '1080p60', label: '1080p', sub: '60fps · 6.0 Mbps' },
];

// ─────────────────────────────────────────────────────
// Helper: format uptime
// ─────────────────────────────────────────────────────
function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────
export const StreamManagerPanel: React.FC = () => {
  // Config
  const [platform, setPlatform] = useState<Platform>('YOUTUBE');
  const [streamKey, setStreamKey] = useState('');
  const [customRtmpUrl, setCustomRtmpUrl] = useState('rtmp://');
  const [qualityKey, setQualityKey] = useState<QualityKey>('1080p30');
  const [useHwEncoding, setUseHwEncoding] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Stream state
  const [isLive, setIsLive] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ffmpegOk, setFfmpegOk] = useState<boolean | null>(null);

  const uptimeRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef   = useRef<NodeJS.Timeout | null>(null);

  const cfg = PLATFORMS[platform];

  // ── Poll server status every 3s ──
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/stream');
      if (!res.ok) return;
      const data = await res.json();
      const s = data.status;
      setIsLive(s.isLive);
      if (s.isLive && s.uptimeSeconds !== undefined) setUptime(s.uptimeSeconds);
      if (!s.isLive) setUptime(0);
      if (s.lastError) setLastError(s.lastError);
      setFfmpegOk(s.ffmpegAvailable);
    } catch {/* network err */}
  }, []);

  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchStatus]);

  // ── Uptime ticker ──
  useEffect(() => {
    if (isLive) {
      uptimeRef.current = setInterval(() => setUptime((p) => p + 1), 1000);
    } else {
      if (uptimeRef.current) clearInterval(uptimeRef.current);
      setUptime(0);
    }
    return () => { if (uptimeRef.current) clearInterval(uptimeRef.current); };
  }, [isLive]);

  // ── Check FFmpeg on mount ──
  useEffect(() => {
    fetch('/api/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check_ffmpeg' }),
    })
      .then((r) => r.json())
      .then((d) => setFfmpegOk(d.available))
      .catch(() => setFfmpegOk(false));
  }, []);

  // ── Start stream ──
  const handleStart = async () => {
    if (!streamKey.trim()) { setLastError('Stream Key tidak boleh kosong.'); return; }
    setIsLoading(true);
    setLastError(null);
    try {
      const res = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          platform,
          streamKey: streamKey.trim(),
          customRtmpUrl: customRtmpUrl.trim(),
          qualityKey,
          useHardwareEncoding: useHwEncoding,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsLive(true);
        setLastError(null);
      } else {
        setLastError(data.error || 'Gagal memulai stream.');
      }
    } catch (e: any) {
      setLastError(e.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Stop stream ──
  const handleStop = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });
      setIsLive(false);
      setUptime(0);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────
  return (
    <div className="glass-panel rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${isLive ? 'text-rose-400 animate-pulse' : 'text-zinc-500'}`} />
          <span className="font-heading font-bold text-sm text-white uppercase tracking-wide">
            Live Streaming
          </span>
        </div>

        {/* FFmpeg status badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
          ffmpegOk === null
            ? 'border-zinc-700 text-zinc-500'
            : ffmpegOk
            ? 'border-emerald-700 bg-emerald-900/30 text-emerald-400'
            : 'border-rose-700 bg-rose-900/30 text-rose-400'
        }`}>
          {ffmpegOk === null ? <Loader2 className="w-3 h-3 animate-spin" /> : ffmpegOk ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {ffmpegOk === null ? 'Checking...' : ffmpegOk ? 'FFmpeg v9.0 Ready' : 'FFmpeg Not Found'}
        </div>
      </div>

      {/* ── Live Status Bar ── */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
        isLive
          ? 'bg-rose-950/40 border-rose-700 shadow-lg shadow-rose-900/20'
          : 'bg-zinc-900/40 border-zinc-800'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-rose-500 animate-pulse shadow-lg shadow-rose-500/50' : 'bg-zinc-600'}`} />
          <span className={`font-mono font-bold text-sm ${isLive ? 'text-rose-300' : 'text-zinc-500'}`}>
            {isLive ? '● ON AIR' : '○ OFFLINE'}
          </span>
          {isLive && (
            <span className="ml-2 flex items-center gap-1 text-[11px] font-mono text-rose-400">
              <Clock className="w-3 h-3" /> {formatUptime(uptime)}
            </span>
          )}
        </div>
        {isLive && (
          <div className="text-[10px] font-mono text-zinc-400">
            {cfg.label} · {QUALITY_OPTIONS.find(q => q.key === qualityKey)?.label} {QUALITY_OPTIONS.find(q => q.key === qualityKey)?.sub}
          </div>
        )}
      </div>

      {/* ── Platform Selector ── */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Platform</label>
        <div className="grid grid-cols-4 gap-1.5">
          {(Object.keys(PLATFORMS) as Platform[]).map((p) => {
            const pc = PLATFORMS[p];
            const isActive = platform === p;
            return (
              <button
                key={p}
                id={`stream-platform-${p.toLowerCase()}`}
                onClick={() => { setPlatform(p); setLastError(null); }}
                disabled={isLive}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-[10px] font-mono font-bold uppercase tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isActive
                    ? p === 'YOUTUBE'   ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                    : p === 'INSTAGRAM' ? 'bg-pink-600/20 border-pink-500 text-pink-300'
                    : p === 'TIKTOK'    ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
                    :                     'bg-violet-600/20 border-violet-500 text-violet-300'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                }`}
              >
                {pc.icon}
                {pc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Custom RTMP URL (only for CUSTOM) ── */}
      {platform === 'CUSTOM' && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">RTMP URL</label>
          <input
            type="text"
            value={customRtmpUrl}
            onChange={(e) => setCustomRtmpUrl(e.target.value)}
            placeholder="rtmp://your-server.com/live"
            disabled={isLive}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-violet-300 focus:outline-none focus:border-violet-500 disabled:opacity-40"
          />
        </div>
      )}

      {/* ── Stream Key ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Stream Key</label>
          <span className="text-[9px] font-mono text-zinc-600">{cfg.keyHint}</span>
        </div>
        <div className="relative">
          <input
            id="stream-key-input"
            type={showKey ? 'text' : 'password'}
            value={streamKey}
            onChange={(e) => setStreamKey(e.target.value)}
            placeholder={cfg.keyPlaceholder}
            disabled={isLive}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 pr-10 text-xs font-mono text-white focus:outline-none focus:border-blue-500 disabled:opacity-40"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Quality ── */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Kualitas Output</label>
        <div className="grid grid-cols-3 gap-1.5">
          {QUALITY_OPTIONS.map((q) => (
            <button
              key={q.key}
              id={`stream-quality-${q.key}`}
              onClick={() => setQualityKey(q.key)}
              disabled={isLive}
              className={`flex flex-col items-center py-2.5 rounded-xl border text-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                qualityKey === q.key
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              <span className="font-mono font-bold text-xs">{q.label}</span>
              <span className="font-mono text-[9px] opacity-70">{q.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── HW Encoding toggle ── */}
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <div>
            <span className="text-xs font-mono text-zinc-300 font-bold">NVENC Hardware Encoding</span>
            <p className="text-[9px] font-mono text-zinc-600">NVIDIA GPU — lebih ringan di CPU (fallback ke x264 jika tidak tersedia)</p>
          </div>
        </div>
        <button
          id="stream-hw-toggle"
          onClick={() => setUseHwEncoding(!useHwEncoding)}
          disabled={isLive}
          className={`relative w-9 h-5 rounded-full transition-all disabled:opacity-40 ${
            useHwEncoding ? 'bg-amber-500' : 'bg-zinc-700'
          }`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
            useHwEncoding ? 'left-4.5' : 'left-0.5'
          }`} />
        </button>
      </div>

      {/* ── RTMP URL preview ── */}
      <div className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800">
        <span className="text-[9px] font-mono text-zinc-600 block mb-0.5">RTMP Destination:</span>
        <span className="text-[10px] font-mono text-zinc-400 break-all">
          {platform === 'CUSTOM' ? customRtmpUrl : PLATFORMS[platform].rtmpUrl}/{streamKey ? '••••••••' : '<stream-key>'}
        </span>
      </div>

      {/* ── Error message ── */}
      {lastError && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/50 border border-rose-700/50 text-rose-300 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{lastError}</span>
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          id="stream-start-btn"
          onClick={handleStart}
          disabled={isLive || isLoading || !ffmpegOk}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-heading font-bold text-xs uppercase tracking-wide transition-all shadow-lg shadow-rose-900/30 disabled:shadow-none active:scale-95"
        >
          {isLoading && !isLive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          MULAI LIVE
        </button>

        <button
          id="stream-stop-btn"
          onClick={handleStop}
          disabled={!isLive || isLoading}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 font-heading font-bold text-xs uppercase tracking-wide transition-all active:scale-95"
        >
          {isLoading && isLive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
          STOP
        </button>
      </div>

      {/* ── Note ── */}
      <p className="text-[9px] font-mono text-zinc-600 text-center leading-relaxed">
        Pastikan input video/kamera sudah aktif di PGM Monitor sebelum memulai live.
        FFmpeg akan encode dan kirim ke {cfg.label}.
      </p>
    </div>
  );
};
