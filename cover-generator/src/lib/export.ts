import html2canvas from 'html2canvas';
import {CANVAS, type ResolutionOption} from './design-tokens';

export interface ExportResult {
  blob: Blob;
  width: number;
  height: number;
  sizeMB: number;
}

/**
 * Render `element` (which must be exactly CANVAS.width × CANVAS.height in DOM
 * coords) to a PNG blob at the requested resolution.
 *
 * The element is captured at 1280×720 base size, then scaled by `resolution.scale`
 * via html2canvas's built-in oversampling — this gives crisp output at 2K / 4K / 5K
 * without us having to re-render the DOM at a different zoom level.
 */
export async function renderCover(
  element: HTMLElement,
  resolution: ResolutionOption,
): Promise<ExportResult> {
  // Yield one frame so any pending font loads / state updates flush first.
  await new Promise(r => requestAnimationFrame(r));

  const canvas = await html2canvas(element, {
    scale: resolution.scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: CANVAS.background,
    width: CANVAS.width,
    height: CANVAS.height,
    logging: false,
  });

  return new Promise<ExportResult>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('toBlob returned null'));
          return;
        }
        resolve({
          blob,
          width: resolution.width,
          height: resolution.height,
          sizeMB: blob.size / 1024 / 1024,
        });
      },
      'image/png',
      1.0,
    );
  });
}

/** Trigger a browser download for the given blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildFilename(episode: string, suffix: string): string {
  const slug = episode
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `cover-${slug || 'untitled'}-${suffix}.png`;
}
