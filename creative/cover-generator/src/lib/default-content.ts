/**
 * Backward-compat re-export. The first entry in `presets/index.ts` is the
 * default bundle the app loads on startup. To switch defaults, reorder the
 * array in `presets/index.ts` instead of editing this file.
 */
import {PRESETS} from './presets';

export const defaultContent = PRESETS[0].cover;
export const defaultMetadata = PRESETS[0].metadata;
