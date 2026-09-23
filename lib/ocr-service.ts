/**
 * OCRService — Global singleton that keeps scanning even when OCRView is unmounted.
 * Components register themselves (subscribe for results), and the service
 * runs the scan loop independently of React's lifecycle.
 */
import { ocrEngine, OCRResult, OCRFilterOptions, DEFAULT_FILTER } from '@/lib/ocr-engine';
import { OCRRegion } from '@/components/admin/views/OCRView';

type ResultsCallback = (results: Record<string, OCRResult>) => void;

class OCRService {
  // ── Public state ────────────────────────────────────────────────────────────
  public isGlobalEnabled = false;
  public scanFps = 2;
  public regions: OCRRegion[] = [];
  public filter: OCRFilterOptions = { ...DEFAULT_FILTER };
  public lastResults: Record<string, OCRResult> = {};

  // ── Private internals ────────────────────────────────────────────────────────
  private intervalId: ReturnType<typeof setInterval> | null = null;
  
  // Persistent global video element for background scanning
  private globalVideoElement: HTMLVideoElement | null = null;
  public activeStream: MediaStream | null = null;

  private captureCanvas: HTMLCanvasElement | null = null;
  private subscribers: Set<ResultsCallback> = new Set();
  private streamSubscribers: Set<(stream: MediaStream | null) => void> = new Set();
  private stabilityMap: Record<string, { value: string; count: number }> = {};
  private isScanning = false;

  // ── Subscribers ──────────────────────────────────────────────────────────────
  public subscribe(cb: ResultsCallback) {
    this.subscribers.add(cb);
  }

  public unsubscribe(cb: ResultsCallback) {
    this.subscribers.delete(cb);
  }

  private notify() {
    this.subscribers.forEach(cb => cb({ ...this.lastResults }));
  }

  public subscribeStream(cb: (s: MediaStream | null) => void) {
    this.streamSubscribers.add(cb);
    cb(this.activeStream); // initial state
  }

  public unsubscribeStream(cb: (s: MediaStream | null) => void) {
    this.streamSubscribers.delete(cb);
  }

  // ── Video source ─────────────────────────────────────────────────────────────
  public async startScreenCapture(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'window', frameRate: { max: 30 } }
      });
      
      this.activeStream = stream;

      // Create global hidden video for background processing
      if (!this.globalVideoElement) {
        this.globalVideoElement = document.createElement('video');
        this.globalVideoElement.muted = true;
        this.globalVideoElement.playsInline = true;
      }
      this.globalVideoElement.srcObject = stream;
      await this.globalVideoElement.play();

      if (!this.captureCanvas) {
        this.captureCanvas = document.createElement('canvas');
      }

      // Handle user stopping from browser native UI
      stream.getVideoTracks()[0].onended = () => {
        this.stopCapture();
      };

      this.streamSubscribers.forEach(cb => cb(this.activeStream));
      return true;
    } catch (err) {
      console.error("[OCRService] Error sharing screen: ", err);
      return false;
    }
  }

  public stopCapture() {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach(track => track.stop());
      this.activeStream = null;
    }
    if (this.globalVideoElement) {
      this.globalVideoElement.srcObject = null;
    }
    this.streamSubscribers.forEach(cb => cb(null));
  }

  // ── Controls ─────────────────────────────────────────────────────────────────
  public setGlobalEnabled(enabled: boolean) {
    this.isGlobalEnabled = enabled;
    if (enabled) {
      this.startLoop();
    } else {
      this.stopLoop();
    }
  }

  public setFps(fps: number) {
    this.scanFps = fps;
    if (this.isGlobalEnabled) {
      this.stopLoop();
      this.startLoop();
    }
  }

  public setRegions(regions: OCRRegion[]) {
    this.regions = regions;
  }

  public setFilter(filter: OCRFilterOptions) {
    this.filter = filter;
  }

  public updateResultManually(regionId: string, text: string) {
    if (this.lastResults[regionId]) {
      this.lastResults[regionId] = { ...this.lastResults[regionId], text };
      this.notify();
      this.writeToFiles();
    }
  }

  // ── Scan loop ─────────────────────────────────────────────────────────────────
  private startLoop() {
    if (this.intervalId !== null) return;
    const ms = Math.max(100, Math.round(1000 / this.scanFps));
    this.intervalId = setInterval(() => {
      this.runOCR(true);
    }, ms);
  }

  private stopLoop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public async runOCR(isSilent: boolean = false) {
    if (this.isScanning) return;
    if (!this.globalVideoElement || !this.captureCanvas || this.regions.length === 0) return;
    if (this.globalVideoElement.videoWidth === 0) return;

    this.isScanning = true;

    try {
      const canvas = this.captureCanvas;
      canvas.width = this.globalVideoElement.videoWidth;
      canvas.height = this.globalVideoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { this.isScanning = false; return; }
      ctx.drawImage(this.globalVideoElement, 0, 0, canvas.width, canvas.height);

      await ocrEngine.init();

      const newResults: Record<string, OCRResult> = { ...this.lastResults };

      for (const region of this.regions) {
        const result = await ocrEngine.recognizeRegion(canvas, region, this.filter);
        if (!result) continue;

        if (isSilent) {
          const tracker = this.stabilityMap[region.id] || { value: '', count: 0 };
          if (tracker.value === result.text && result.text !== '') {
            tracker.count += 1;
          } else {
            tracker.value = result.text;
            tracker.count = 1;
          }
          this.stabilityMap[region.id] = tracker;
          if (tracker.count >= 3) {
            newResults[region.id] = result;
          }
        } else {
          newResults[region.id] = result;
        }
      }

      this.lastResults = newResults;
      this.notify();
      this.writeToFiles();
    } finally {
      this.isScanning = false;
    }
  }

  // ── File output ───────────────────────────────────────────────────────────────
  private writeDebounce: ReturnType<typeof setTimeout> | null = null;

  private writeToFiles() {
    // Debounce file writes to max 1 per second
    if (this.writeDebounce) clearTimeout(this.writeDebounce);
    this.writeDebounce = setTimeout(async () => {
      try {
        const payload = this.regions
          .filter(r => this.lastResults[r.id])
          .map(r => ({
            name: r.name,
            text: this.lastResults[r.id]?.text ?? '',
            confidence: this.lastResults[r.id]?.confidence ?? 0,
          }));

        if (payload.length === 0) return;

        await fetch('/api/ocr-output', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ regions: payload }),
        });
      } catch (err) {
        console.warn('[OCRService] File write failed', err);
      }
    }, 1000);
  }
}

// ── Singleton export ─────────────────────────────────────────────────────────
const ocrService = new OCRService();
export default ocrService;
