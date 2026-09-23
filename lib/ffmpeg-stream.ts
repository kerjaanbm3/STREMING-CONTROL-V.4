import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type StreamPlatform = 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'CUSTOM';

export interface StreamQuality {
  label: string;
  width: number;
  height: number;
  fps: number;
  videoBitrate: string;
  audioBitrate: string;
}

export interface StreamConfig {
  platform: StreamPlatform;
  rtmpUrl: string;
  streamKey: string;
  quality: StreamQuality;
  useHardwareEncoding?: boolean;
}

export interface StreamStatus {
  isLive: boolean;
  platform?: StreamPlatform;
  rtmpUrl?: string;
  quality?: StreamQuality;
  startedAt?: number;
  uptimeSeconds?: number;
  lastError?: string | null;
  ffmpegAvailable: boolean;
}

// ─────────────────────────────────────────────
// Platform RTMP Presets
// ─────────────────────────────────────────────
export const PLATFORM_RTMP: Record<StreamPlatform, string> = {
  YOUTUBE:   'rtmp://a.rtmp.youtube.com/live2',
  INSTAGRAM: 'rtmps://live-api-s.facebook.com:443/rtmp/',
  TIKTOK:    'rtmp://push.tiktokcdn.com/live/',
  CUSTOM:    '',
};

// ─────────────────────────────────────────────
// Quality Presets
// ─────────────────────────────────────────────
export const QUALITY_PRESETS: Record<string, StreamQuality> = {
  '720p30': {
    label: '720p 30fps',
    width: 1280, height: 720, fps: 30,
    videoBitrate: '2500k', audioBitrate: '128k',
  },
  '1080p30': {
    label: '1080p 30fps',
    width: 1920, height: 1080, fps: 30,
    videoBitrate: '4500k', audioBitrate: '160k',
  },
  '1080p60': {
    label: '1080p 60fps',
    width: 1920, height: 1080, fps: 60,
    videoBitrate: '6000k', audioBitrate: '192k',
  },
};

// ─────────────────────────────────────────────
// FFmpeg Stream Service
// ─────────────────────────────────────────────
class FFmpegStreamService extends EventEmitter {
  private process: ChildProcess | null = null;
  private config: StreamConfig | null = null;
  private startedAt: number | null = null;
  private lastError: string | null = null;
  private _ffmpegAvailable: boolean | null = null;

  async checkFFmpeg(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const proc = spawn('ffmpeg', ['-version'], { stdio: 'pipe' });
        proc.on('close', (code) => { this._ffmpegAvailable = code === 0; resolve(code === 0); });
        proc.on('error', () => { this._ffmpegAvailable = false; resolve(false); });
      } catch { this._ffmpegAvailable = false; resolve(false); }
    });
  }

  private buildArgs(config: StreamConfig, useNvenc = false): string[] {
    const { quality, rtmpUrl, streamKey } = config;
    const fullRtmpUrl = streamKey ? `${rtmpUrl}/${streamKey}` : rtmpUrl;
    const videoEncoder = useNvenc ? 'h264_nvenc' : 'libx264';
    const preset       = useNvenc ? 'p4'         : 'veryfast';
    const bufsize      = `${parseInt(quality.videoBitrate) * 2}k`;
    return [
      '-re', '-i', 'pipe:0',
      '-c:v', videoEncoder, '-preset', preset,
      '-b:v', quality.videoBitrate, '-maxrate', quality.videoBitrate, '-bufsize', bufsize,
      '-pix_fmt', 'yuv420p', '-r', String(quality.fps), '-g', String(quality.fps * 2), '-keyint_min', String(quality.fps),
      '-vf', `scale=${quality.width}:${quality.height}`,
      '-c:a', 'aac', '-b:a', quality.audioBitrate, '-ar', '44100', '-ac', '2',
      '-f', 'flv', fullRtmpUrl,
    ];
  }

  async start(config: StreamConfig): Promise<{ success: boolean; error?: string }> {
    if (this.process) return { success: false, error: 'Stream already running. Stop it first.' };
    this.lastError = null;
    this.config = config;
    const args = this.buildArgs(config, config.useHardwareEncoding ?? false);
    try {
      const proc = spawn('ffmpeg', args, { stdio: ['pipe', 'pipe', 'pipe'] });
      this.process = proc;
      this.startedAt = Date.now();
      proc.stderr?.on('data', (data: Buffer) => {
        const line = data.toString();
        this.emit('progress', line);
        console.log(`[FFmpeg] ${line.trim()}`);
      });
      proc.on('close', (code) => {
        console.log(`[FFmpeg] Process exited with code ${code}`);
        this.process = null; this.startedAt = null;
        if (code !== 0 && code !== null) this.lastError = `FFmpeg exited with code ${code}`;
        this.emit('stopped', { code, error: this.lastError });
      });
      proc.on('error', (err) => {
        console.error(`[FFmpeg] Spawn error: ${err.message}`);
        this.lastError = err.message; this.process = null; this.startedAt = null;
        this.emit('error', err.message);
      });
      return { success: true };
    } catch (err: any) {
      this.process = null; this.startedAt = null; this.lastError = err.message;
      return { success: false, error: err.message };
    }
  }

  write(chunk: Buffer): boolean {
    if (!this.process?.stdin?.writable) return false;
    try { return this.process.stdin.write(chunk); } catch { return false; }
  }

  stop(): void {
    if (!this.process) return;
    try {
      this.process.stdin?.write('q');
      setTimeout(() => { if (this.process) { this.process.kill('SIGTERM'); this.process = null; } }, 1500);
    } catch { this.process?.kill('SIGTERM'); this.process = null; }
    this.startedAt = null; this.config = null;
  }

  getStatus(): StreamStatus {
    const uptimeSeconds = this.startedAt ? Math.floor((Date.now() - this.startedAt) / 1000) : undefined;
    return {
      isLive: !!this.process, platform: this.config?.platform, rtmpUrl: this.config?.rtmpUrl,
      quality: this.config?.quality, startedAt: this.startedAt ?? undefined, uptimeSeconds,
      lastError: this.lastError, ffmpegAvailable: this._ffmpegAvailable ?? true,
    };
  }
}

const ffmpegStream = new FFmpegStreamService();
export default ffmpegStream;
