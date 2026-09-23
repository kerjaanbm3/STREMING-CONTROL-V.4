import { createWorker, Worker } from 'tesseract.js';
import { OCRRegion } from '@/components/admin/views/OCRView';

export interface OCRResult {
  regionId: string;
  text: string;
  confidence: number;
}

export interface OCRFilterOptions {
  mode: 'binarize' | 'grayscale' | 'invert' | 'none';
  threshold: number;     // 0-255, default 128
  contrast: number;      // -100 to 100, default 0
  brightness: number;    // -100 to 100, default 0
  invert: boolean;       // flip black/white after binarize
  scaleFactor: number;   // 1.0 to 5.0, default 2.5
}

export const DEFAULT_FILTER: OCRFilterOptions = {
  mode: 'binarize',
  threshold: 128,
  contrast: 0,
  brightness: 0,
  invert: false,
  scaleFactor: 2.5,
};

/**
 * Apply preprocessing filters to an image crop and return a processed canvas.
 * This is exported so OCRView can also use it to show a real-time preview.
 */
export function applyFilters(
  sourceCanvas: HTMLCanvasElement,
  region: { x: number; y: number; width: number; height: number },
  filter: OCRFilterOptions
): HTMLCanvasElement {
  // Step 1: Crop
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = Math.max(1, region.width);
  cropCanvas.height = Math.max(1, region.height);
  const cropCtx = cropCanvas.getContext('2d')!;
  cropCtx.drawImage(
    sourceCanvas,
    Math.max(0, region.x), Math.max(0, region.y), region.width, region.height,
    0, 0, cropCanvas.width, cropCanvas.height
  );

  // Step 2: Apply filters
  const imageData = cropCtx.getImageData(0, 0, cropCanvas.width, cropCanvas.height);
  const data = imageData.data;

  const contrastFactor = (259 * (filter.contrast + 255)) / (255 * (259 - filter.contrast));
  const brightnessDelta = filter.brightness * 2.55;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Apply brightness
    if (filter.brightness !== 0) {
      r = Math.min(255, Math.max(0, r + brightnessDelta));
      g = Math.min(255, Math.max(0, g + brightnessDelta));
      b = Math.min(255, Math.max(0, b + brightnessDelta));
    }

    // Apply contrast
    if (filter.contrast !== 0) {
      r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
      g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
      b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));
    }

    // Convert to grayscale
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    let finalColor: number;

    if (filter.mode === 'binarize') {
      // Black & White threshold
      finalColor = gray > filter.threshold ? 255 : 0;
      if (filter.invert) finalColor = finalColor === 0 ? 255 : 0;
    } else if (filter.mode === 'grayscale') {
      finalColor = gray;
      if (filter.invert) finalColor = 255 - finalColor;
    } else if (filter.mode === 'invert') {
      // Full invert of original color
      data[i] = 255 - r;
      data[i + 1] = 255 - g;
      data[i + 2] = 255 - b;
      continue;
    } else {
      // 'none' — pass through original
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      continue;
    }

    data[i] = finalColor;
    data[i + 1] = finalColor;
    data[i + 2] = finalColor;
  }

  cropCtx.putImageData(imageData, 0, 0);

  // Step 3: Scale up
  const scaledCanvas = document.createElement('canvas');
  const sf = filter.scaleFactor;
  scaledCanvas.width = cropCanvas.width * sf;
  scaledCanvas.height = cropCanvas.height * sf;
  const scaledCtx = scaledCanvas.getContext('2d')!;
  scaledCtx.imageSmoothingEnabled = false;
  scaledCtx.scale(sf, sf);
  scaledCtx.drawImage(cropCanvas, 0, 0);

  return scaledCanvas;
}

class OCREngine {
  private worker: Worker | null = null;
  private isReady = false;

  public async init() {
    if (this.isReady) return;
    try {
      this.worker = await createWorker('eng');
      this.isReady = true;
      console.log('[OCREngine] Tesseract Worker Initialized');
    } catch (err) {
      console.error('[OCREngine] Failed to initialize worker', err);
    }
  }

  public async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isReady = false;
    }
  }

  public async recognizeRegion(
    imageCanvas: HTMLCanvasElement,
    region: OCRRegion,
    filter: OCRFilterOptions = DEFAULT_FILTER
  ): Promise<OCRResult | null> {
    if (!this.isReady || !this.worker) await this.init();
    if (!this.worker) return null;

    const parameters: any = {
      tessedit_pageseg_mode:
        region.psm === 'SINGLE_LINE'  ? '7' :
        region.psm === 'SINGLE_BLOCK' ? '6' :
        region.psm === 'SINGLE_WORD'  ? '8' :
        region.psm === 'SINGLE_CHAR'  ? '10' : '3',
    };
    await this.worker.setParameters(parameters);

    try {
      // Apply preprocessing + scaling
      const processedCanvas = applyFilters(imageCanvas, region, filter);

      // Recognize
      const resultData = await this.worker.recognize(processedCanvas);
      let text = resultData.data.text.trim();

      // Post-processing: fix OCR misreads (never strip valid symbols)
      const isNumericType = ['NUMBER', 'KDA', 'PERCENTAGE', 'SCORE_COMBO', 'TIMER'].includes(region.type);
      if (isNumericType) {
        text = text
          .replace(/O/g, '0')
          .replace(/l/g, '1')
          .replace(/I/g, '1')
          .replace(/B/g, '8')
          .replace(/\n+/g, ' ')
          .trim();
      } else {
        text = text.replace(/\n+/g, ' ').trim();
      }

      return {
        regionId: region.id,
        text,
        confidence: resultData.data.confidence
      };
    } catch (err) {
      console.error(`[OCREngine] Failed to recognize region ${region.id}`, err);
      return null;
    }
  }
}

export const ocrEngine = new OCREngine();
