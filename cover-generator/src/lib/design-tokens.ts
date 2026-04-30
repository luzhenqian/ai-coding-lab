import type {LayerColor, StatColor} from './types';

/**
 * N-Brand cover design tokens — the SINGLE source of truth.
 *
 * Anything color- or font-related across the cover must read from here.
 * Don't put hex codes in components; reach in via these constants.
 */

export const CANVAS = {
  width: 1280,
  height: 720,
  background: '#090b11',
} as const;

export const COLORS = {
  /** Body text */
  text: '#f0f0f0',
  textDim: 'rgba(255,255,255,0.38)',
  textMuted: 'rgba(255,255,255,0.28)',

  /** Primary brand accent — used for badge, frame, etc. */
  emerald: '#34d399',
  emeraldDark: '#10b981',

  /** Stats colors */
  stat: {
    default: '#e0e0e0',
    green: '#34d399',
    red: '#f87171',
    yellow: '#fbbf24',
  } as Record<StatColor, string>,
} as const;

/**
 * Per-layer color palettes. Each layer slot has 4 derived shades:
 *   border / bg / text / badge
 * to keep the cards visually distinct without polluting the rest of the canvas.
 */
export const LAYER_PALETTE: Record<
  LayerColor,
  {
    border: string;
    bg: string;
    iconBg: string;
    iconColor: string;
    text: string;
    badgeBg: string;
    badgeColor: string;
    /** When true, the layer gets an extra soft glow — used for the final slot. */
    glow?: boolean;
  }
> = {
  hook: {
    border: 'rgba(139,92,246,0.3)',
    bg: 'rgba(139,92,246,0.05)',
    iconBg: 'rgba(139,92,246,0.15)',
    iconColor: '#a78bfa',
    text: '#a78bfa',
    badgeBg: 'rgba(139,92,246,0.15)',
    badgeColor: '#c4b5fd',
  },
  classifier: {
    border: 'rgba(14,165,233,0.3)',
    bg: 'rgba(14,165,233,0.05)',
    iconBg: 'rgba(14,165,233,0.15)',
    iconColor: '#38bdf8',
    text: '#38bdf8',
    badgeBg: 'rgba(14,165,233,0.15)',
    badgeColor: '#7dd3fc',
  },
  deny: {
    border: 'rgba(239,68,68,0.3)',
    bg: 'rgba(239,68,68,0.05)',
    iconBg: 'rgba(239,68,68,0.15)',
    iconColor: '#f87171',
    text: '#f87171',
    badgeBg: 'rgba(239,68,68,0.15)',
    badgeColor: '#fca5a5',
  },
  allow: {
    border: 'rgba(34,197,94,0.3)',
    bg: 'rgba(34,197,94,0.05)',
    iconBg: 'rgba(34,197,94,0.15)',
    iconColor: '#4ade80',
    text: '#4ade80',
    badgeBg: 'rgba(34,197,94,0.15)',
    badgeColor: '#86efac',
  },
  mode: {
    border: 'rgba(251,191,36,0.3)',
    bg: 'rgba(251,191,36,0.05)',
    iconBg: 'rgba(251,191,36,0.15)',
    iconColor: '#fbbf24',
    text: '#fbbf24',
    badgeBg: 'rgba(251,191,36,0.15)',
    badgeColor: '#fde68a',
  },
  dialog: {
    border: 'rgba(16,185,129,0.4)',
    bg: 'rgba(16,185,129,0.06)',
    iconBg: 'rgba(16,185,129,0.2)',
    iconColor: '#34d399',
    text: '#34d399',
    badgeBg: 'rgba(16,185,129,0.15)',
    badgeColor: '#6ee7b7',
    glow: true,
  },
};

/** Each connector arrow goes from layer[i].color → layer[i+1].color. */
export function arrowGradient(from: LayerColor, to: LayerColor): string {
  return `linear-gradient(${LAYER_PALETTE[from].border}, ${LAYER_PALETTE[to].border})`;
}

export const FONTS = {
  cn: '"Noto Sans SC", sans-serif',
  mono: '"JetBrains Mono", monospace',
} as const;

/** Available export resolutions. */
export interface ResolutionOption {
  label: string;
  scale: number;
  width: number;
  height: number;
}

export const RESOLUTIONS: ResolutionOption[] = [
  {label: '720p · 1280×720', scale: 1, width: 1280, height: 720},
  {label: '2K · 2560×1440', scale: 2, width: 2560, height: 1440},
  {label: '4K · 3840×2160', scale: 3, width: 3840, height: 2160},
  {label: '5K · 5120×2880', scale: 4, width: 5120, height: 2880},
];
