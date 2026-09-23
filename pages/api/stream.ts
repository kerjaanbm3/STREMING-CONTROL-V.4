import type { NextApiRequest, NextApiResponse } from 'next';
import ffmpegStream, { PLATFORM_RTMP, QUALITY_PRESETS, StreamConfig, StreamPlatform } from '@/lib/ffmpeg-stream';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ── GET: status ──
  if (req.method === 'GET') {
    const status = ffmpegStream.getStatus();
    return res.status(200).json({ success: true, status });
  }

  // ── POST: actions ──
  if (req.method === 'POST') {
    const { action } = req.body;

    // Check FFmpeg availability
    if (action === 'check_ffmpeg') {
      const available = await ffmpegStream.checkFFmpeg();
      return res.status(200).json({ success: true, available });
    }

    // Start streaming
    if (action === 'start') {
      const { platform, streamKey, customRtmpUrl, qualityKey, useHardwareEncoding } = req.body;

      if (!platform || !streamKey) {
        return res.status(400).json({ success: false, error: 'platform and streamKey are required' });
      }

      const qualityPreset = QUALITY_PRESETS[qualityKey] || QUALITY_PRESETS['1080p30'];
      const rtmpBase = platform === 'CUSTOM'
        ? (customRtmpUrl || '')
        : PLATFORM_RTMP[platform as StreamPlatform];

      if (!rtmpBase) {
        return res.status(400).json({ success: false, error: 'Invalid RTMP URL' });
      }

      const config: StreamConfig = {
        platform: platform as StreamPlatform,
        rtmpUrl: rtmpBase,
        streamKey,
        quality: qualityPreset,
        useHardwareEncoding: useHardwareEncoding ?? false,
      };

      const result = await ffmpegStream.start(config);
      return res.status(result.success ? 200 : 500).json(result);
    }

    // Stop streaming
    if (action === 'stop') {
      ffmpegStream.stop();
      return res.status(200).json({ success: true, message: 'Stream stopped' });
    }

    // Write chunk (called from WebSocket or internal; not via HTTP normally)
    if (action === 'write_chunk') {
      const { chunk } = req.body;
      if (!chunk) return res.status(400).json({ success: false, error: 'No chunk provided' });
      const buf = Buffer.from(chunk, 'base64');
      const ok = ffmpegStream.write(buf);
      return res.status(200).json({ success: ok });
    }

    return res.status(400).json({ success: false, error: `Unknown action: ${action}` });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
