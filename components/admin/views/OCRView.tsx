import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LiveBroadcastState } from '@/lib/types';
import { Monitor, Camera, Square, Crop, Zap, Trash2, CheckCircle2, AlertTriangle, RefreshCw, Send, PlayCircle, PauseCircle, ChevronDown, ChevronUp, BookOpen, X, Settings } from 'lucide-react';
import { ocrEngine, OCRResult, OCRFilterOptions, DEFAULT_FILTER } from '@/lib/ocr-engine';
import ocrService from '@/lib/ocr-service';

export type OCRRegionType = 
  | 'TEXT'        // Teks umum / nama pemain
  | 'NUMBER'      // Angka / skor 
  | 'TIMER'       // Format waktu mm:ss
  | 'KDA'         // Kill/Death/Assist: 10/2/5
  | 'PERCENTAGE'  // Persentase: 67%
  | 'SCORE_COMBO' // Kombinasi +/- angka: +34
  | 'HERO_NAME'   // Nama hero (huruf campur)
  | 'TEAM_NAME';  // Nama tim
export type OCRPageSegmentationMode = 'SINGLE_LINE' | 'SINGLE_BLOCK' | 'SINGLE_WORD' | 'SINGLE_CHAR' | 'AUTO';

export interface OCRRegion {
  id: string;
  name: string;
  type: OCRRegionType;
  psm: OCRPageSegmentationMode;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OCRViewProps {
  state: LiveBroadcastState;
  updateState: (partial: Partial<LiveBroadcastState>) => void;
}

export const OCRView: React.FC<OCRViewProps> = ({ state, updateState }) => {
  const [activeSource, setActiveSource] = useState<'SCREEN' | 'CAMERA' | null>(ocrService.activeStream ? 'SCREEN' : null);
  const [isCapturing, setIsCapturing] = useState(!!ocrService.activeStream);
  const [regions, setRegions] = useState<OCRRegion[]>(ocrService.regions);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number, y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  
  // Interaction State
  const [interactionMode, setInteractionMode] = useState<'DRAW' | 'DRAG' | 'RESIZE' | null>(null);
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [collapsedRegions, setCollapsedRegions] = useState<Set<string>>(new Set());
  const [showGuide, setShowGuide] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoScanning, setIsAutoScanning] = useState(false);
  const [globalOcrEnabled, setGlobalOcrEnabled] = useState(ocrService.isGlobalEnabled);
  const [scanFps, setScanFps] = useState(ocrService.scanFps);
  const [results, setResults] = useState<Record<string, OCRResult>>(ocrService.lastResults);
  const [filter, setFilter] = useState<OCRFilterOptions>(ocrService.filter);
  const [showFilter, setShowFilter] = useState(false);
  
  // Stability Tracking
  const stabilityRef = useRef<Record<string, { value: string, count: number }>>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null); // For drawing UI
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null); // For capturing frame for OCR

  // Sync results from ocrService when component mounts/unmounts
  useEffect(() => {
    const onResults = (r: Record<string, OCRResult>) => setResults(r);
    ocrService.subscribe(onResults);
    return () => ocrService.unsubscribe(onResults);
  }, []);

  // Keep service in sync with regions + filter + fps
  useEffect(() => { ocrService.setRegions(regions); }, [regions]);
  useEffect(() => { ocrService.setFilter(filter); }, [filter]);
  useEffect(() => { ocrService.setFps(scanFps); }, [scanFps]);

  // Subscribe to MediaStream changes from service
  useEffect(() => {
    const onStream = (stream: MediaStream | null) => {
      setIsCapturing(!!stream);
      setActiveSource(stream ? 'SCREEN' : null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        if (stream) {
          videoRef.current.play().catch(e => console.warn('Play error:', e));
          
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current && overlayCanvasRef.current) {
              overlayCanvasRef.current.width = videoRef.current.videoWidth;
              overlayCanvasRef.current.height = videoRef.current.videoHeight;
            }
          };
        }
      }
    };
    ocrService.subscribeStream(onStream);
    return () => ocrService.unsubscribeStream(onStream);
  }, []);

  // Stop capturing stream
  const stopCapture = useCallback(() => {
    ocrService.stopCapture();
  }, []);

  // Start Screen Capture
  const startScreenCapture = async () => {
    const success = await ocrService.startScreenCapture();
    if (success) {
      setActiveSource('SCREEN');
      setIsCapturing(true);
    }
  };

  // Canvas Drawing Logic — fixed for object-contain letterboxing
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const canvasW = canvas.width || video.videoWidth || rect.width;
    const canvasH = canvas.height || video.videoHeight || rect.height;

    // Calculate aspect ratio to account for object-contain letterboxing
    const canvasAR = canvasW / canvasH;
    const elemAR = rect.width / rect.height;

    let renderW = rect.width;
    let renderH = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasAR > elemAR) {
      // Pillarbox: black bars top/bottom
      renderH = rect.width / canvasAR;
      offsetY = (rect.height - renderH) / 2;
    } else {
      // Letterbox: black bars left/right
      renderW = rect.height * canvasAR;
      offsetX = (rect.width - renderW) / 2;
    }

    const scaleX = canvasW / renderW;
    const scaleY = canvasH / renderH;

    return {
      x: (e.clientX - rect.left - offsetX) * scaleX,
      y: (e.clientY - rect.top - offsetY) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    
    // Check if we clicked on an existing region's resize handle or body
    for (let i = regions.length - 1; i >= 0; i--) {
      const r = regions[i];
      // Resize handle check (bottom-right 12x12 corner + padding)
      if (
        pos.x >= r.x + r.width - 15 && pos.x <= r.x + r.width + 10 &&
        pos.y >= r.y + r.height - 15 && pos.y <= r.y + r.height + 10
      ) {
        setActiveRegionId(r.id);
        setInteractionMode('RESIZE');
        setDrawStart(pos);
        return;
      }
      
      // Drag body check
      if (pos.x >= r.x && pos.x <= r.x + r.width && pos.y >= r.y && pos.y <= r.y + r.height) {
        setActiveRegionId(r.id);
        setInteractionMode('DRAG');
        setDrawStart(pos);
        return;
      }
    }

    setInteractionMode('DRAW');
    setIsDrawing(true);
    setDrawStart(pos);
    setCurrentRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    
    // Change cursor based on hover if not interacting
    if (!interactionMode) {
      let cursor = 'crosshair';
      for (let i = regions.length - 1; i >= 0; i--) {
        const r = regions[i];
        if (pos.x >= r.x + r.width - 15 && pos.x <= r.x + r.width + 10 && pos.y >= r.y + r.height - 15 && pos.y <= r.y + r.height + 10) {
          cursor = 'nwse-resize';
          break;
        } else if (pos.x >= r.x && pos.x <= r.x + r.width && pos.y >= r.y && pos.y <= r.y + r.height) {
          cursor = 'move';
          break;
        }
      }
      if (overlayCanvasRef.current) overlayCanvasRef.current.style.cursor = cursor;
    }

    if (!drawStart) return;

    if (interactionMode === 'DRAW') {
      setCurrentRect({
        x: Math.min(drawStart.x, pos.x),
        y: Math.min(drawStart.y, pos.y),
        w: Math.abs(pos.x - drawStart.x),
        h: Math.abs(pos.y - drawStart.y)
      });
    } else if (interactionMode === 'DRAG' && activeRegionId) {
      const dx = pos.x - drawStart.x;
      const dy = pos.y - drawStart.y;
      setRegions(regions.map(r => r.id === activeRegionId ? { ...r, x: r.x + dx, y: r.y + dy } : r));
      setDrawStart(pos);
    } else if (interactionMode === 'RESIZE' && activeRegionId) {
      const dx = pos.x - drawStart.x;
      const dy = pos.y - drawStart.y;
      setRegions(regions.map(r => r.id === activeRegionId ? { ...r, width: Math.max(10, r.width + dx), height: Math.max(10, r.height + dy) } : r));
      setDrawStart(pos);
    }
  };

  const handleMouseUp = () => {
    if (interactionMode === 'DRAW' && currentRect && currentRect.w > 10 && currentRect.h > 10) {
      // Add new region
      const newRegion: OCRRegion = {
        id: `region-${Date.now()}`,
        name: `Region ${regions.length + 1}`,
        type: 'TEXT',
        psm: 'SINGLE_LINE',
        x: currentRect.x,
        y: currentRect.y,
        width: currentRect.w,
        height: currentRect.h
      };
      setRegions([...regions, newRegion]);
    }
    
    setInteractionMode(null);
    setActiveRegionId(null);
    setIsDrawing(false);
    setDrawStart(null);
    setCurrentRect(null);
  };

  // Draw regions to canvas
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing regions
    regions.forEach((r) => {
      // Outline
      ctx.strokeStyle = activeRegionId === r.id ? '#f59e0b' : '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(r.x, r.y, r.width, r.height);
      
      // Fill
      ctx.fillStyle = activeRegionId === r.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)';
      ctx.fillRect(r.x, r.y, r.width, r.height);
      
      // Resize Handle (Bottom Right)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = activeRegionId === r.id ? '#f59e0b' : '#3b82f6';
      ctx.lineWidth = 2;
      ctx.fillRect(r.x + r.width - 6, r.y + r.height - 6, 12, 12);
      ctx.strokeRect(r.x + r.width - 6, r.y + r.height - 6, 12, 12);
      
      // Label
      ctx.fillStyle = activeRegionId === r.id ? '#f59e0b' : '#3b82f6';
      ctx.font = 'bold 14px monospace';
      
      // Draw label background for better readability
      const labelText = `${r.name}`;
      const textWidth = ctx.measureText(labelText).width;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(r.x, r.y > 20 ? r.y - 20 : r.y + r.height, textWidth + 8, 18);
      
      ctx.fillStyle = activeRegionId === r.id ? '#f59e0b' : '#3b82f6';
      ctx.fillText(labelText, r.x + 4, r.y > 20 ? r.y - 6 : r.y + r.height + 14);
    });

    // Draw current rect (DRAW mode only)
    if (interactionMode === 'DRAW' && currentRect) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.fillRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
    }
  }, [regions, interactionMode, currentRect, activeRegionId]);

  const toggleCollapse = (id: string) => {
    setCollapsedRegions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const TYPE_OPTIONS: { value: OCRRegionType; label: string; color: string }[] = [
    { value: 'TEXT',        label: 'Text',        color: 'text-blue-400' },
    { value: 'NUMBER',      label: 'Number',      color: 'text-emerald-400' },
    { value: 'TIMER',       label: 'Timer',       color: 'text-yellow-400' },
    { value: 'KDA',         label: 'KDA',         color: 'text-purple-400' },
    { value: 'PERCENTAGE',  label: 'Percentage',  color: 'text-orange-400' },
    { value: 'SCORE_COMBO', label: 'Score+/-',    color: 'text-rose-400' },
    { value: 'HERO_NAME',   label: 'Hero Name',   color: 'text-cyan-400' },
    { value: 'TEAM_NAME',   label: 'Team Name',   color: 'text-pink-400' },
  ];

  const getTypeColor = (type: OCRRegionType) => TYPE_OPTIONS.find(t => t.value === type)?.color ?? 'text-zinc-400';

  const deleteRegion = (id: string) => {
    setRegions(regions.filter(r => r.id !== id));
  };

  const updateRegionType = (id: string, type: OCRRegionType) => {
    setRegions(regions.map(r => r.id === id ? { ...r, type } : r));
  };

  const updateRegionPSM = (id: string, psm: OCRPageSegmentationMode) => {
    setRegions(regions.map(r => r.id === id ? { ...r, psm } : r));
  };

  const updateRegionName = (id: string, name: string) => {
    setRegions(regions.map(r => r.id === id ? { ...r, name } : r));
  };

  // Delegate OCR to the global service (keeps running even when navigating away)
  const runOCR = async (isSilent: boolean = false) => {
    if (!isSilent) setIsProcessing(true);
    await ocrService.runOCR(isSilent);
    if (!isSilent) setIsProcessing(false);
  };

  // Auto Scan toggle: delegate to global service
  const toggleAutoScan = () => {
    const next = !isAutoScanning;
    setIsAutoScanning(next);
    if (next) {
      ocrService.setGlobalEnabled(true);
      setGlobalOcrEnabled(true);
    } else {
      // Only stop service loop if global toggle is off
      if (!globalOcrEnabled) {
        ocrService.setGlobalEnabled(false);
      }
    }
  };

  const toggleGlobalOcr = () => {
    const next = !globalOcrEnabled;
    setGlobalOcrEnabled(next);
    ocrService.setGlobalEnabled(next);
    if (next) setIsAutoScanning(true);
    else setIsAutoScanning(false);
  };

  const updateResultText = (regionId: string, text: string) => {
    ocrService.updateResultManually(regionId, text);
    setResults(prev => ({
      ...prev,
      [regionId]: { ...prev[regionId], text }
    }));
  };

  const applyToOverlay = () => {
    const partialState: Partial<LiveBroadcastState> = {};
    let hasUpdates = false;

    // A simple mapping heuristic for now. (Smart Mapping can be added in Phase 2/P2)
    regions.forEach((r) => {
      const res = results[r.id];
      if (!res) return;
      
      const lowerName = r.name.toLowerCase();
      if (lowerName.includes('score a') || lowerName.includes('score 1')) {
        partialState.scoreA = parseInt(res.text) || 0;
        hasUpdates = true;
      } else if (lowerName.includes('score b') || lowerName.includes('score 2')) {
        partialState.scoreB = parseInt(res.text) || 0;
        hasUpdates = true;
      } else if (lowerName.includes('team a') || lowerName.includes('team 1')) {
        if (!partialState.teamA) partialState.teamA = { ...state.teamA };
        partialState.teamA.name = res.text;
        hasUpdates = true;
      } else if (lowerName.includes('team b') || lowerName.includes('team 2')) {
        if (!partialState.teamB) partialState.teamB = { ...state.teamB };
        partialState.teamB.name = res.text;
        hasUpdates = true;
      } else if (lowerName.includes('game') || lowerName.includes('match')) {
        partialState.boSeries = parseInt(res.text) || state.boSeries;
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      updateState(partialState);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
      {/* HEADER */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-heading font-black text-2xl text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            OCR ENGINE
          </h2>
          <p className="text-xs font-mono text-zinc-400">Computer Vision Scoreboard Extraction</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Guide Toggle */}
          <button
            onClick={() => setShowGuide(g => !g)}
            title="Panduan Penggunaan OCR"
            className={`p-2 rounded-lg border transition-all ${
              showGuide 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
            }`}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Global OCR Toggle */}
          <button
            onClick={toggleGlobalOcr}
            title={globalOcrEnabled ? 'OCR Global Aktif \u2014 klik untuk matikan' : 'Aktifkan OCR terus berjalan meski pindah halaman'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
              globalOcrEnabled
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-900/20'
                : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-white'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${globalOcrEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
            {globalOcrEnabled ? 'OCR ON' : 'OCR OFF'}
          </button>

          {/* Source Controls - icon only */}
          <div className="flex bg-[#121215] border border-zinc-800 rounded-lg p-1 gap-1">
            <button
              onClick={startScreenCapture}
              disabled={isCapturing}
              title="Capture Screen"
              className={`p-2 rounded transition-all ${
                activeSource === 'SCREEN' 
                  ? 'bg-blue-600/20 text-blue-400' 
                  : 'hover:bg-zinc-800 text-zinc-400 disabled:opacity-50'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            
            <button disabled title="Camera (Coming Soon)" className="p-2 rounded text-zinc-600 cursor-not-allowed">
              <Camera className="w-4 h-4" />
            </button>

            {isCapturing && (
              <button
                onClick={stopCapture}
                title="Stop Capture"
                className="p-2 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/40"
              >
                <Square className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Global OCR Active Banner */}
      {globalOcrEnabled && !isCapturing && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-[10px] font-mono shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          OCR GLOBAL AKTIF — scan berjalan di background. Buka ulang halaman ini untuk melihat hasil.
          <button onClick={toggleGlobalOcr} className="ml-auto text-rose-400 hover:text-rose-300 font-bold">Matikan</button>
        </div>
      )}

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* LEFT PANEL: Canvas & Preview */}
        <div className="flex-1 flex flex-col min-w-0 gap-4">

          {/* Guide Panel (collapsible) */}
          {showGuide && (
            <div className="bg-[#0f0f12] border border-amber-900/40 rounded-xl p-4 shadow-xl overflow-y-auto max-h-[50%] shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-amber-400 font-heading font-bold text-xs uppercase flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" /> Panduan Teknis OCR
                </h3>
                <button onClick={() => setShowGuide(false)} className="text-zinc-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
              </div>
              
              <div className="space-y-4 text-[10px] font-mono text-zinc-300">
                {/* Steps */}
                <div>
                  <p className="text-amber-400 font-bold mb-1.5 uppercase tracking-wider">📋 Langkah Penggunaan</p>
                  <ol className="space-y-1 list-decimal list-inside text-zinc-400">
                    <li>Klik ikon <span className="text-blue-400">Monitor</span> untuk mulai berbagi layar (Screen Capture)</li>
                    <li>Pilih jendela atau tab yang menampilkan scoreboard MLBB</li>
                    <li>Gambar kotak (drag) di area angka/teks yang ingin dibaca — setiap kotak = satu Region</li>
                    <li>Beri nama region yang deskriptif, misal: <span className="text-emerald-400">"Score A"</span>, <span className="text-purple-400">"KDA Player 1"</span></li>
                    <li>Pilih Tipe dan PSM yang sesuai untuk setiap region</li>
                    <li>Klik <span className="text-blue-400">Manual Scan</span> (sekali) atau <span className="text-emerald-400">Auto Scan</span> (realtime) untuk mulai deteksi</li>
                    <li>Koreksi hasil jika perlu, lalu tekan <span className="text-emerald-400">PUSH ALL</span> untuk kirim ke overlay</li>
                  </ol>
                </div>

                {/* Tips */}
                <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-3">
                  <p className="text-blue-400 font-bold mb-1 uppercase tracking-wider">💡 Tips Akurasi</p>
                  <ul className="space-y-1 text-zinc-400 list-disc list-inside">
                    <li>Buat kotak region sekecil mungkin — hanya seluas teks targetnya saja</li>
                    <li>Jangan gabungkan beberapa angka dalam satu region (buat terpisah)</li>
                    <li>Pastikan teks di layar cukup besar (minimal tinggi font 20px)</li>
                    <li>Gunakan <span className="text-yellow-400">Manual Scan</span> dulu untuk verifikasi sebelum Auto Scan</li>
                    <li>Koreksi manual tetap memungkinkan sebelum Push ke Overlay</li>
                  </ul>
                </div>

                {/* Type Guide */}
                <div>
                  <p className="text-purple-400 font-bold mb-1.5 uppercase tracking-wider">🏷️ Panduan Tipe Region</p>
                  <div className="space-y-1.5">
                    {[
                      { color: 'text-blue-400',   label: 'TEXT',         desc: 'Teks bebas. Gunakan untuk nama pemain, label umum. Tidak ada filter karakter.' },
                      { color: 'text-emerald-400', label: 'NUMBER',       desc: 'Angka plus simbol umum (/ - + . , %). Gunakan untuk skor total, gold, damage.' },
                      { color: 'text-yellow-400',  label: 'TIMER',        desc: 'Format waktu mm:ss. Hanya baca angka dan titik dua. Untuk jam permainan.' },
                      { color: 'text-purple-400',  label: 'KDA',          desc: 'Format Kill/Death/Assist: 10/2/5. Hanya baca angka dan garis miring.' },
                      { color: 'text-orange-400',  label: 'PERCENTAGE',   desc: 'Format persentase: 67%. Baca angka, titik, dan simbol persen.' },
                      { color: 'text-rose-400',    label: 'SCORE_COMBO',  desc: 'Angka dengan tanda +/-: +34 atau -100. Untuk selisih skor, gold advantage.' },
                      { color: 'text-cyan-400',    label: 'HERO NAME',    desc: 'Nama hero MLBB. Membaca semua karakter tanpa filter. Cocok untuk teks campuran.' },
                      { color: 'text-pink-400',    label: 'TEAM NAME',    desc: 'Nama tim. Membaca semua karakter bebas. Cocok jika nama tim mengandung simbol.' },
                    ].map(t => (
                      <div key={t.label} className="flex gap-2">
                        <span className={`shrink-0 w-20 font-bold ${t.color}`}>{t.label}</span>
                        <span className="text-zinc-500">{t.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PSM Guide */}
                <div>
                  <p className="text-cyan-400 font-bold mb-1.5 uppercase tracking-wider">⚙️ Panduan Mode PSM (Page Segmentation)</p>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Auto',    desc: 'Biarkan Tesseract menentukan sendiri. Gunakan jika tidak yakin. Cocok untuk region yang berisi campuran teks/angka.' },
                      { label: '1 Line',  desc: 'Satu baris teks. PALING SERING DIPAKAI. Gunakan untuk angka skor, timer, KDA — apapun yang satu baris.' },
                      { label: '1 Block', desc: 'Satu blok teks (bisa multi-baris). Gunakan jika region berisi lebih dari satu baris teks.' },
                      { label: '1 Word',  desc: 'Satu kata saja. Gunakan untuk nama hero pendek atau label singkat. Lebih cepat dari 1 Line.' },
                      { label: '1 Char',  desc: 'Satu karakter saja. Gunakan untuk skor satu digit (0-9). Sangat akurat untuk satu angka.' },
                    ].map(p => (
                      <div key={p.label} className="flex gap-2">
                        <span className="shrink-0 w-16 font-bold text-cyan-500">{p.label}</span>
                        <span className="text-zinc-500">{p.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Common Combos */}
                <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3">
                  <p className="text-emerald-400 font-bold mb-1.5 uppercase tracking-wider">🎯 Kombinasi yang Direkomendasikan</p>
                  <div className="space-y-1 text-zinc-400">
                    <div className="flex gap-3"><span className="w-28 text-zinc-300">Skor pertandingan</span><span>→ <span className="text-emerald-400">NUMBER</span> + <span className="text-cyan-400">1 Char</span> (jika 1 digit) atau <span className="text-cyan-400">1 Word</span></span></div>
                    <div className="flex gap-3"><span className="w-28 text-zinc-300">Timer game</span><span>→ <span className="text-yellow-400">TIMER</span> + <span className="text-cyan-400">1 Line</span></span></div>
                    <div className="flex gap-3"><span className="w-28 text-zinc-300">KDA pemain</span><span>→ <span className="text-purple-400">KDA</span> + <span className="text-cyan-400">1 Word</span></span></div>
                    <div className="flex gap-3"><span className="w-28 text-zinc-300">Nama tim</span><span>→ <span className="text-pink-400">TEAM NAME</span> + <span className="text-cyan-400">1 Line</span></span></div>
                    <div className="flex gap-3"><span className="w-28 text-zinc-300">Nama hero</span><span>→ <span className="text-cyan-400">HERO NAME</span> + <span className="text-cyan-400">1 Word</span></span></div>
                    <div className="flex gap-3"><span className="w-28 text-zinc-300">Gold advantage</span><span>→ <span className="text-rose-400">SCORE+/-</span> + <span className="text-cyan-400">1 Word</span></span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Canvas Preview */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#0c0c0e] border border-zinc-800 rounded-xl overflow-hidden relative">
          
          {/* Top Bar on Preview */}
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent z-20 flex justify-between items-center">
            <div className="flex gap-2">
               {isAutoScanning && (
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-900/50 backdrop-blur-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  AUTO SAMPLING (2 FPS)
                </span>
              )}
            </div>
            <div className="text-[10px] font-mono text-zinc-400 bg-black/50 px-2 py-1 rounded backdrop-blur">
              Draw bounding box to select regions
            </div>
          </div>

          {/* Canvas Container */}
          <div className="flex-1 relative w-full h-full flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            {!isCapturing && (
              <div className="text-zinc-600 font-mono text-xs flex flex-col items-center gap-3">
                <Monitor className="w-10 h-10 opacity-20" />
                <span>Select a video source to begin OCR setup</span>
              </div>
            )}
            
            <video 
              ref={videoRef} 
              className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
              autoPlay 
              playsInline 
              muted 
              style={{ display: isCapturing ? 'block' : 'none' }}
            />
            
            <canvas
              ref={overlayCanvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="absolute inset-0 w-full h-full object-contain cursor-crosshair z-10"
              style={{ display: isCapturing ? 'block' : 'none' }}
            />
            
            <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />
          </div>
        </div>
        </div>

        {/* RIGHT PANEL: Controls & Results */}
        <div className="w-[380px] shrink-0 flex flex-col gap-4 overflow-y-auto pr-1">
          
          {/* Action Bar - icon only + FPS input */}
          <div className="bg-[#121215] border border-zinc-800 rounded-xl p-2 flex items-center gap-2 shadow-xl shadow-black/40">
            <button
              onClick={() => runOCR(false)}
              disabled={isProcessing || isAutoScanning || regions.length === 0 || !isCapturing}
              title="Manual Scan — ambil 1 frame dan deteksi teks"
              className="p-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={toggleAutoScan}
              disabled={regions.length === 0 || !isCapturing}
              title={isAutoScanning ? 'Stop Auto Scan' : `Start Auto Scan (${scanFps} FPS)`}
              className={`p-2.5 rounded-lg border transition-colors disabled:opacity-50 ${
                isAutoScanning 
                ? 'bg-rose-600/20 border-rose-500/40 text-rose-400' 
                : 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400'
              }`}
            >
              {isAutoScanning ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
            </button>

            {/* FPS Input */}
            <div className="flex-1 flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase shrink-0">FPS</span>
              <input
                type="number"
                min={1}
                max={30}
                step={1}
                value={scanFps}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (!isNaN(v) && v >= 1 && v <= 30) setScanFps(v);
                }}
                disabled={isAutoScanning}
                title="Sampling rate (1-30 FPS). Lebih tinggi = lebih responsif, lebih berat CPU"
                className="w-full bg-transparent text-white text-xs font-bold text-center focus:outline-none disabled:opacity-50"
              />
            </div>
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilter(f => !f)}
              title="Pengaturan Filter Gambar"
              className={`p-2.5 rounded-lg border transition-colors ${showFilter ? 'bg-violet-600/20 border-violet-500/40 text-violet-400' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-white'}`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* ─── Filter Panel ─── */}
          {showFilter && (
            <div className="bg-[#0f0f12] border border-violet-900/40 rounded-xl p-4 shadow-xl shadow-black/50 space-y-4 shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-violet-400 font-heading font-bold text-[10px] uppercase flex items-center gap-1.5">
                  <Settings className="w-3 h-3" /> Filter Pra-Proses Gambar
                </h3>
                <button
                  onClick={() => setFilter({ ...DEFAULT_FILTER })}
                  className="text-[9px] font-mono text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Mode */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Mode Filter</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['binarize', 'grayscale', 'invert', 'none'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setFilter(f => ({ ...f, mode: m }))}
                      className={`py-1.5 rounded text-[8px] font-bold uppercase transition-colors border ${
                        filter.mode === m
                          ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-white'
                      }`}
                    >
                      {m === 'binarize' ? 'B&W' : m === 'grayscale' ? 'Gray' : m === 'invert' ? 'Invert' : 'None'}
                    </button>
                  ))}
                </div>
                <p className="text-[8px] font-mono text-zinc-600">
                  {filter.mode === 'binarize'  && 'Hitam/Putih murni berdasarkan Threshold — terbaik untuk teks terang di BG gelap'}
                  {filter.mode === 'grayscale' && 'Abu-abu — mempertahankan gradasi, cocok untuk teks berwarna warni'}
                  {filter.mode === 'invert'    && 'Balik semua warna — gunakan jika teks gelap di latar terang'}
                  {filter.mode === 'none'      && 'Tanpa filter — gambar asli dikirim ke OCR (kurang akurat untuk game)'}
                </p>
              </div>

              {/* Threshold — only relevant for binarize */}
              {filter.mode === 'binarize' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase">Threshold</label>
                    <span className="text-[9px] font-mono text-violet-400 font-bold">{filter.threshold}</span>
                  </div>
                  <input
                    type="range" min={0} max={255} step={1}
                    value={filter.threshold}
                    onChange={e => setFilter(f => ({ ...f, threshold: parseInt(e.target.value) }))}
                    className="w-full accent-violet-500 h-1.5 rounded"
                  />
                  <p className="text-[8px] font-mono text-zinc-600">
                    Rendah (0-80): tampilkan lebih banyak detail gelap | Tinggi (170-255): hanya teks terang
                  </p>
                </div>
              )}

              {/* Invert toggle (only for binarize/grayscale) */}
              {(filter.mode === 'binarize' || filter.mode === 'grayscale') && (
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[9px] font-mono text-zinc-400 uppercase">Balik Warna</label>
                    <p className="text-[8px] font-mono text-zinc-600">Aktifkan jika teks berwarna gelap di latar terang</p>
                  </div>
                  <button
                    onClick={() => setFilter(f => ({ ...f, invert: !f.invert }))}
                    className={`w-10 h-5 rounded-full transition-colors relative ${filter.invert ? 'bg-violet-600' : 'bg-zinc-700'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${filter.invert ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>
              )}

              {/* Brightness */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">Kecerahan</label>
                  <span className="text-[9px] font-mono text-violet-400 font-bold">{filter.brightness > 0 ? `+${filter.brightness}` : filter.brightness}</span>
                </div>
                <input
                  type="range" min={-100} max={100} step={5}
                  value={filter.brightness}
                  onChange={e => setFilter(f => ({ ...f, brightness: parseInt(e.target.value) }))}
                  className="w-full accent-violet-500 h-1.5 rounded"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">Kontras</label>
                  <span className="text-[9px] font-mono text-violet-400 font-bold">{filter.contrast > 0 ? `+${filter.contrast}` : filter.contrast}</span>
                </div>
                <input
                  type="range" min={-100} max={100} step={5}
                  value={filter.contrast}
                  onChange={e => setFilter(f => ({ ...f, contrast: parseInt(e.target.value) }))}
                  className="w-full accent-violet-500 h-1.5 rounded"
                />
              </div>

              {/* Scale Factor */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">Skala Zoom</label>
                  <span className="text-[9px] font-mono text-violet-400 font-bold">{filter.scaleFactor}×</span>
                </div>
                <input
                  type="range" min={1} max={5} step={0.5}
                  value={filter.scaleFactor}
                  onChange={e => setFilter(f => ({ ...f, scaleFactor: parseFloat(e.target.value) }))}
                  className="w-full accent-violet-500 h-1.5 rounded"
                />
                <p className="text-[8px] font-mono text-zinc-600">Zoom gambar sebelum OCR. 2.5× default — naikkan untuk teks kecil</p>
              </div>
            </div>
          )}


          <div className="bg-[#121215] border border-zinc-800 rounded-xl shadow-xl shadow-black/40 flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
              <h3 className="font-heading font-bold text-xs text-zinc-300 uppercase flex items-center gap-2">
                <Crop className="w-3.5 h-3.5" /> Regions ({regions.length})
              </h3>
              {regions.length > 0 && (
                <button
                  onClick={applyToOverlay}
                  disabled={Object.keys(results).length === 0}
                  className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:grayscale"
                >
                  <Send className="w-3 h-3" /> PUSH ALL
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {regions.length === 0 ? (
                <div className="h-full flex items-center justify-center border border-dashed border-zinc-800 rounded-lg text-center text-zinc-600 text-[10px] font-mono p-6">
                  Draw bounding box on canvas to create regions
                </div>
              ) : (
                regions.map((r) => {
                  const res = results[r.id];
                  const isCollapsed = collapsedRegions.has(r.id);
                  const isHighConf = res && res.confidence >= 90;
                  const isMedConf = res && res.confidence >= 70 && res.confidence < 90;
                  const typeInfo = TYPE_OPTIONS.find(t => t.value === r.type);

                  return (
                    <div 
                      key={r.id} 
                      className={`bg-[#09090b] border rounded-lg overflow-hidden transition-colors ${
                        activeRegionId === r.id ? 'border-amber-700/60' : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {/* ── Header Row ── */}
                      <div className="flex items-center gap-1.5 px-2 py-1.5">
                        {/* Editable Name */}
                        <input
                          type="text"
                          value={r.name}
                          onChange={(e) => updateRegionName(r.id, e.target.value)}
                          placeholder="Nama Region"
                          className="flex-1 min-w-0 bg-transparent text-xs text-white font-mono focus:outline-none placeholder:text-zinc-600 border-b border-transparent focus:border-zinc-600 py-0.5"
                        />
                        
                        {/* Type Selector */}
                        <select
                          value={r.type}
                          onChange={(e) => updateRegionType(r.id, e.target.value as OCRRegionType)}
                          className={`bg-[#18181b] border border-zinc-800 text-[8px] font-bold px-1 py-0.5 rounded outline-none max-w-[72px] truncate ${getTypeColor(r.type)}`}
                        >
                          {TYPE_OPTIONS.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>

                        {/* PSM Selector */}
                        <select
                          value={r.psm}
                          onChange={(e) => updateRegionPSM(r.id, e.target.value as OCRPageSegmentationMode)}
                          className="bg-[#18181b] border border-zinc-800 text-[8px] text-zinc-500 px-1 py-0.5 rounded outline-none max-w-[58px] truncate"
                        >
                          <option value="AUTO">Auto</option>
                          <option value="SINGLE_LINE">1 Line</option>
                          <option value="SINGLE_BLOCK">1 Block</option>
                          <option value="SINGLE_WORD">1 Word</option>
                          <option value="SINGLE_CHAR">1 Char</option>
                        </select>

                        {/* Collapse Toggle */}
                        <button
                          onClick={() => toggleCollapse(r.id)}
                          className="text-zinc-500 hover:text-zinc-200 transition-colors p-0.5"
                          title={isCollapsed ? 'Tampilkan hasil' : 'Sembunyikan hasil'}
                        >
                          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => deleteRegion(r.id)}
                          className="text-zinc-600 hover:text-rose-500 transition-colors p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* ── Collapsible Result Row ── */}
                      {!isCollapsed && (
                        <div className="border-t border-zinc-800/60 px-2 py-1.5 bg-black/20">
                          {res ? (
                            <div className="flex items-center gap-2">
                              {/* Confidence Badge */}
                              <div className={`flex items-center gap-1 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                isHighConf ? 'text-emerald-500 bg-emerald-500/10' :
                                isMedConf  ? 'text-yellow-500 bg-yellow-500/10' :
                                             'text-rose-500 bg-rose-500/10'
                              }`}>
                                {isHighConf ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                                {Math.round(res.confidence)}%
                              </div>
                              {/* Editable Result Text */}
                              <input
                                type="text"
                                value={res.text}
                                onChange={(e) => updateResultText(r.id, e.target.value)}
                                className="flex-1 min-w-0 bg-transparent text-sm text-white font-bold focus:outline-none border-b border-transparent focus:border-zinc-600 py-0.5"
                              />
                            </div>
                          ) : (
                            <p className="text-[9px] font-mono text-zinc-600 italic">Belum ada hasil — jalankan scan</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};
