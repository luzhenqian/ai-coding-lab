/**
 * Backward-compat re-export. The first entry in `presets/index.ts` is the
 * default content the app loads on startup. To switch defaults, reorder
 * the array in `presets/index.ts` instead of editing this file.
 */
export {PRESETS as default} from './presets';

import {PRESETS} from './presets';
export const defaultContent = PRESETS[0].content;
