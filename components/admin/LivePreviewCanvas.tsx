import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { RefreshCw, ExternalLink, Grid, Camera, MonitorPlay, AlertCircle, StopCircle, Video, Layers } from 'lucide-react';
import Link from 'next/link';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type MonitorMode = 'OVERLAY' | 'CAMERA' | 'SCREEN';

interface LivePreviewCanvasProps {
  currentMode: string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export const LivePreviewCanvas: React.FC<LivePreviewCanvasProps> = memo(({ currentMode }) => {
  // Overlay state
  const [selectedOverlay, setSelectedOverlay] = useState<string>('AUTO');
  const [showSafeAreas, setShowSafeAreas] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Monitor mode & media state
  const [monitorMode, setMonitorMode] = useState<MonitorMode>('OVERLAY');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [deviceLabel, setDeviceLabel] = useState<string>('');
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Composite mode — overlay iframe di atas video background
  const [isCompositeOverlay, setIsCompositeOverlay] = useState(false);
  const [compositeRefreshKey, setCompositeRefreshKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Iframe scaling — render 1920×1080 asli lalu scale down ke container
  const [iframeScale, setIframeScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Derived ──
  const getOverlayUrl = () => {
    if (selectedOverlay !== 'AUTO') return selectedOverlay;
    switch (currentMode) {
      case 'ESPORT_MOBA': return '/overlay/pick-ban';
      case 'ESPORT_BR':   return '/overlay/standings';
      default:            return '/overlay/scoreboard';
    }
  };
  const overlayUrl = getOverlayUrl();

  // ── Stream management ──
  const stopCurrentStream = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
      setDeviceLabel('');
    }
  }, [mediaStream]);

  // ── ResizeObserver: hitung skala iframe berdasarkan lebar container aktual ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width;
        setIframeScale(containerWidth / 1920);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Attach stream to <video> element whenever stream changes
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  // ── Inject transparent background ke iframe (same-origin) ──
  const injectTransparentBg = useCallback(() => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return;
      // Hapus background di html & body agar video tembus
      doc.documentElement.style.setProperty('background', 'transparent', 'important');
      doc.documentElement.style.setProperty('background-color', 'transparent', 'important');
      doc.body.style.setProperty('background', 'transparent', 'important');
      doc.body.style.setProperty('background-color', 'transparent', 'important');
      // Inject style tag untuk override semua bg di root wrapper
      if (!doc.getElementById('composite-bg-override')) {
        const style = doc.createElement('style');
        style.id = 'composite-bg-override';
        style.textContent = `
          html, body { background: transparent !important; background-color: transparent !important; }
          body > div:first-child { background: transparent !important; background-color: transparent !important; }
        `;
        doc.head.appendChild(style);
      }
    } catch {
      // Cross-origin guard — tidak akan terjadi karena same-origin
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mode switching ──
  const handleSwitchMode = useCallback(async (newMode: MonitorMode) => {
    // Always stop existing stream first
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      setMediaStream(null);
      setDeviceLabel('');
    }
    setCameraError(null);
    setIsCompositeOverlay(false); // reset composite saat ganti mode
    setMonitorMode(newMode);

    if (newMode === 'CAMERA') {
      setIsLoadingMedia(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        const track = stream.getVideoTracks()[0];
        setDeviceLabel(track?.label || 'Camera');
        setMediaStream(stream);
      } catch (err: any) {
        const msg = err?.name === 'NotAllowedError'
          ? 'Akses kamera ditolak. Izinkan kamera di browser.'
          : err?.name === 'NotFoundError'
          ? 'Tidak ada kamera ditemukan. Pastikan OBS Virtual Camera aktif.'
          : `Gagal membuka kamera: ${err?.message}`;
        setCameraError(msg);
      } finally {
        setIsLoadingMedia(false);
      }
    }

    if (newMode === 'SCREEN') {
      setIsLoadingMedia(true);
      try {
        const stream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        const track = stream.getVideoTracks()[0];
        setDeviceLabel(track?.label || 'Screen');
        setMediaStream(stream);
        // Auto-stop when user ends share via browser UI
        track.addEventListener('ended', () => {
          setMediaStream(null);
          setDeviceLabel('');
          setCameraError('Berbagi layar dihentikan.');
        });
      } catch (err: any) {
        const msg = err?.name === 'NotAllowedError'
          ? 'Dibatalkan. Pilih window/layar untuk mulai berbagi.'
          : `Gagal tangkap layar: ${err?.message}`;
        setCameraError(msg);
      } finally {
        setIsLoadingMedia(false);
      }
    }
  }, [mediaStream]);

  // ── UI helpers ──
  const modeTabs: { id: MonitorMode; label: string; icon: React.ReactNode }[] = [
    { id: 'OVERLAY', label: 'OVERLAY', icon: <MonitorPlay className="w-3 h-3" /> },
    { id: 'CAMERA',  label: 'CAMERA',  icon: <Camera className="w-3 h-3" /> },
    { id: 'SCREEN',  label: 'SCREEN',  icon: <Video className="w-3 h-3" /> },
  ];

  return (
    <div className="min-card p-3.5 space-y-3">
      {/* ── Monitor Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-heading font-bold text-xs text-white uppercase tracking-wide">
            Program Monitor (PGM)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Safe area toggle — only useful in OVERLAY mode */}
          {monitorMode === 'OVERLAY' && (
            <>
              <button
                onClick={() => setShowSafeAreas(!showSafeAreas)}
                className={`p-1.5 rounded-md border text-xs transition-all ${
                  showSafeAreas ? 'bg-blue-600 text-white border-blue-500' : 'min-btn text-zinc-400'
                }`}
                title="Toggle Safe Margins (90% / 80%)"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setRefreshKey((prev) => prev + 1)}
                className="min-btn p-1.5 text-zinc-400 hover:text-white"
                title="Reload Preview Frame"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <Link
                href={overlayUrl}
                target="_blank"
                className="min-btn p-1.5 text-zinc-400 hover:text-white"
                title="Open in Fullscreen Browser Source"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </>
          )}

          {/* Composite overlay toggle — muncul saat stream aktif */}
          {(monitorMode === 'CAMERA' || monitorMode === 'SCREEN') && mediaStream && (
            <button
              id="pgm-composite-toggle"
              onClick={() => {
                setIsCompositeOverlay((prev) => !prev);
                setCompositeRefreshKey((k) => k + 1);
              }}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                isCompositeOverlay
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-900/30'
                  : 'min-btn border-zinc-700 text-zinc-400 hover:text-amber-300 hover:border-amber-600'
              }`}
              title={isCompositeOverlay ? 'Nonaktifkan Composite Overlay' : 'Aktifkan Composite Overlay (kamera + grafis)'}
            >
              <Layers className="w-3 h-3" />
              + OVERLAY
            </button>
          )}

          {/* Stop stream button for CAMERA/SCREEN */}
          {(monitorMode === 'CAMERA' || monitorMode === 'SCREEN') && mediaStream && (
            <button
              onClick={() => { stopCurrentStream(); setCameraError(null); setIsCompositeOverlay(false); }}
              className="p-1.5 rounded-md border border-rose-700 bg-rose-900/30 text-rose-400 hover:bg-rose-800/40 transition-all"
              title="Hentikan stream"
            >
              <StopCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Mode Tab Switcher ── */}
      <div className="flex gap-1 p-1 bg-[#0d0d10] rounded-lg border border-zinc-800">
        {modeTabs.map((tab) => (
          <button
            key={tab.id}
            id={`pgm-mode-${tab.id.toLowerCase()}`}
            onClick={() => handleSwitchMode(tab.id)}
            disabled={isLoadingMedia}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
              monitorMode === tab.id
                ? tab.id === 'CAMERA'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : tab.id === 'SCREEN'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                  : 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            } disabled:opacity-50 disabled:cursor-wait`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 16:9 Monitor Frame ── */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-[#050507] flex items-center justify-center"
      >

        {/* Safe area guides (OVERLAY mode only) */}
        {monitorMode === 'OVERLAY' && showSafeAreas && (
          <div className="absolute inset-0 pointer-events-none z-30">
            <div className="absolute inset-[5%] border border-cyan-400/40 border-dashed flex items-start justify-start p-1">
              <span className="text-[8px] font-mono text-cyan-300 bg-black/80 px-1 rounded">90% ACTION SAFE</span>
            </div>
            <div className="absolute inset-[10%] border border-yellow-400/40 border-dashed flex items-end justify-end p-1">
              <span className="text-[8px] font-mono text-yellow-300 bg-black/80 px-1 rounded">80% TITLE SAFE</span>
            </div>
          </div>
        )}

        {/* ── OVERLAY mode: iframe di resolusi 1920×1080 asli, di-scale down ── */}
        {monitorMode === 'OVERLAY' && (
          <iframe
            key={refreshKey}
            src={overlayUrl}
            title="Broadcast Monitor"
            className="absolute top-0 left-0 border-0 pointer-events-none select-none"
            style={{
              width: '1920px',
              height: '1080px',
              transform: `scale(${iframeScale})`,
              transformOrigin: 'top left',
            }}
          />
        )}

        {/* ── COMPOSITE: iframe overlay transparan di atas video, juga di-scale ── */}
        {(monitorMode === 'CAMERA' || monitorMode === 'SCREEN') && isCompositeOverlay && (
          <iframe
            ref={iframeRef}
            key={`composite-${compositeRefreshKey}`}
            src={overlayUrl}
            title="Composite Overlay"
            onLoad={injectTransparentBg}
            className="absolute top-0 left-0 border-0 pointer-events-none select-none z-10"
            style={{
              width: '1920px',
              height: '1080px',
              transform: `scale(${iframeScale})`,
              transformOrigin: 'top left',
              background: 'transparent',
            }}
          />
        )}

        {/* ── CAMERA / SCREEN mode: video ── */}
        {(monitorMode === 'CAMERA' || monitorMode === 'SCREEN') && (
          <>
            {/* Loading state */}
            {isLoadingMedia && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-400 z-10">
                <div className="w-6 h-6 border-2 border-zinc-600 border-t-blue-400 rounded-full animate-spin" />
                <span className="text-[10px] font-mono">
                  {monitorMode === 'CAMERA' ? 'Membuka kamera...' : 'Memilih layar...'}
                </span>
              </div>
            )}

            {/* Error state */}
            {cameraError && !isLoadingMedia && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center z-10">
                <AlertCircle className="w-7 h-7 text-rose-400" />
                <p className="text-[11px] font-mono text-rose-300 leading-relaxed">{cameraError}</p>
                <button
                  onClick={() => handleSwitchMode(monitorMode)}
                  className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-300 hover:bg-zinc-700 transition-all"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Idle state (no stream yet, no error) */}
            {!mediaStream && !cameraError && !isLoadingMedia && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-600 z-10">
                {monitorMode === 'CAMERA'
                  ? <Camera className="w-8 h-8 opacity-30" />
                  : <Video className="w-8 h-8 opacity-30" />
                }
                <span className="text-[10px] font-mono text-zinc-500">
                  {monitorMode === 'CAMERA'
                    ? 'Klik CAMERA untuk memulai'
                    : 'Klik SCREEN untuk memilih layar'}
                </span>
              </div>
            )}

            {/* Video element — always mounted so ref is ready */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                mediaStream && !isLoadingMedia ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        )}

        {/* ── Corner label ── */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-zinc-800 text-[9px] font-mono font-bold text-zinc-400 z-20 max-w-[55%] truncate">
          {monitorMode === 'OVERLAY'
            ? overlayUrl.replace('/overlay/', '').toUpperCase()
            : deviceLabel
            ? deviceLabel
            : monitorMode}
        </div>

        {/* ── Live dot for CAMERA/SCREEN with active stream ── */}
        {(monitorMode === 'CAMERA' || monitorMode === 'SCREEN') && mediaStream && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/80 border border-rose-800 z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[8px] font-mono font-bold text-rose-400">LIVE</span>
          </div>
        )}
      </div>

      {/* ── Channel Router (OVERLAY mode + Composite mode) ── */}
      {(monitorMode === 'OVERLAY' || isCompositeOverlay) && (
        <div className="pt-2 border-t border-[#1e1e24]">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
              {isCompositeOverlay ? (
                <span className="flex items-center gap-1 text-amber-400">
                  <Layers className="w-3 h-3" /> Composite Channel:
                </span>
              ) : 'Channels:'}
            </div>
            {isCompositeOverlay && (
              <button
                onClick={() => setCompositeRefreshKey((k) => k + 1)}
                className="min-btn p-1 text-zinc-500 hover:text-amber-300"
                title="Reload overlay"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
            {[
              { label: 'AUTO',        url: 'AUTO' },
              { label: 'SCOREBOARD',  url: '/overlay/scoreboard' },
              { label: 'VS MATCHUP',  url: '/overlay/vs-screen' },
              { label: 'HERO DRAFT',  url: '/overlay/pick-ban' },
              { label: 'STANDINGS',   url: '/overlay/standings' },
              { label: 'STARTING XI', url: '/overlay/lineup' },
              { label: 'SUMMARY',     url: '/overlay/summary' },
              { label: 'BREAK',       url: '/overlay/break-screen' },
              { label: 'LOWER THIRD', url: '/overlay/lower-third' },
            ].map((ch) => (
              <button
                key={ch.url}
                onClick={() => {
                  setSelectedOverlay(ch.url);
                  // Refresh composite iframe jika aktif
                  if (isCompositeOverlay) setCompositeRefreshKey((k) => k + 1);
                }}
                className={`p-1.5 rounded truncate text-center font-medium transition-colors ${
                  selectedOverlay === ch.url
                    ? isCompositeOverlay
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-600 font-semibold'
                      : 'bg-blue-600 text-white font-semibold'
                    : 'min-btn text-zinc-400 hover:text-white'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Camera info bar (CAMERA/SCREEN mode) ── */}
      {(monitorMode === 'CAMERA' || monitorMode === 'SCREEN') && (
        <div className="pt-2 border-t border-[#1e1e24]">
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
            {monitorMode === 'CAMERA' ? (
              <>
                <Camera className="w-3 h-3 text-emerald-500" />
                <span className="text-zinc-400 font-semibold">OBS Virtual Camera</span>
                <span className="text-zinc-600">·</span>
                <span>Pastikan Virtual Camera aktif di OBS → Tools → Start Virtual Camera</span>
              </>
            ) : (
              <>
                <Video className="w-3 h-3 text-violet-400" />
                <span className="text-zinc-400 font-semibold">Screen Capture</span>
                <span className="text-zinc-600">·</span>
                <span>Pilih window, tab, atau seluruh layar dari dialog browser</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
