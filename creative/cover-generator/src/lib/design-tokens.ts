import type {LayerColor, NodeColor, StatColor, ThemeId} from './types';

/**
 * N-Brand cover design tokens — the SINGLE source of truth.
 *
 * Anything color- or font-related across the cover must read from here.
 * Don't put hex codes in components; reach in via these constants.
 */

export const CANVAS = {
  width: 1280,
  height: 720,
} as const;

/** Theme-independent constants — text colors, fonts, etc. */
export const COLORS = {
  text: '#f0f0f0',
  textDim: 'rgba(255,255,255,0.38)',
  textMuted: 'rgba(255,255,255,0.28)',

  /** Stats colors */
  stat: {
    default: '#e0e0e0',
    green: '#34d399',
    red: '#f87171',
    yellow: '#fbbf24',
    blue: '#38bdf8',
    purple: '#a855f7',
    orange: '#f4723d',
    indigo: '#818cf8',
    cyan: '#22d3ee',
    amber: '#fbbf24',
  } as Record<StatColor, string>,
} as const;

/**
 * Theme palette — the chrome accent (badge / frame / glows / title gradient
 * stops). Each preset declares one theme; the cover root gets `theme-{id}`
 * class and cover.css picks up the matching CSS variables.
 *
 * Adding a theme: extend ThemeId in types.ts AND add an entry here AND a CSS
 * block in cover.css under .cover.theme-<id>.
 */
export interface ThemeTokens {
  /** Background color — slight variations work better than pure black. */
  bg: string;
  /** Primary chrome color: badge text/border, frame corners, vLine, subtitle accent. */
  primary: string;
  primaryRgb: string; // for use in rgba(...)
  /** Three radial-gradient glow colors: top-right, bottom-left, center. */
  glow1Color: string;
  glow2Color: string;
  glow3Color: string;
  /** Subtle 36-40px grid line color. */
  gridLineColor: string;
  /** Title highlighted-word SVG gradient stops (3-stop). */
  titleGradient: [string, string, string];
}

export const THEMES: Record<ThemeId, ThemeTokens> = {
  emerald: {
    bg: '#090b11',
    primary: '#34d399',
    primaryRgb: '52,211,153',
    glow1Color: 'rgba(16,185,129,0.09)',
    glow2Color: 'rgba(239,68,68,0.06)',
    glow3Color: 'rgba(16,185,129,0.04)',
    gridLineColor: 'rgba(16,185,129,0.02)',
    titleGradient: ['#34d399', '#10b981', '#f87171'],
  },
  orange: {
    bg: '#08090d',
    primary: '#f4723d',
    primaryRgb: '244,114,61',
    glow1Color: 'rgba(99,102,241,0.12)',  // top-left indigo
    glow2Color: 'rgba(244,114,61,0.10)',   // bottom-right orange
    glow3Color: 'rgba(56,189,248,0.04)',   // center sky
    gridLineColor: 'rgba(56,189,248,0.03)',
    titleGradient: ['#38bdf8', '#a855f7', '#f4723d'],
  },
  indigo: {
    bg: '#0a0b10',
    primary: '#818cf8',
    primaryRgb: '99,102,241',
    glow1Color: 'rgba(99,102,241,0.10)',
    glow2Color: 'rgba(14,165,233,0.08)',
    glow3Color: 'rgba(99,102,241,0.05)',
    gridLineColor: 'rgba(99,102,241,0.025)',
    titleGradient: ['#818cf8', '#6366f1', '#0ea5e9'],
  },
  rose: {
    bg: '#0c0a0e',
    primary: '#fb7185',
    primaryRgb: '251,113,133',
    glow1Color: 'rgba(251,113,133,0.10)',
    glow2Color: 'rgba(251,191,36,0.06)',
    glow3Color: 'rgba(251,113,133,0.04)',
    gridLineColor: 'rgba(251,113,133,0.025)',
    titleGradient: ['#fb7185', '#f43f5e', '#fbbf24'],
  },
  amber: {
    bg: '#0c0b08',
    primary: '#fbbf24',
    primaryRgb: '251,191,36',
    glow1Color: 'rgba(251,191,36,0.10)',
    glow2Color: 'rgba(99,102,241,0.07)',
    glow3Color: 'rgba(251,191,36,0.04)',
    gridLineColor: 'rgba(251,191,36,0.025)',
    titleGradient: ['#fbbf24', '#f59e0b', '#818cf8'],
  },
};

/** Returns inline CSS-vars object to apply on the cover root for a theme. */
export function themeStyle(theme: ThemeId): React.CSSProperties {
  const t = THEMES[theme];
  return {
    background: t.bg,
    ['--cv-primary' as string]: t.primary,
    ['--cv-primary-rgb' as string]: t.primaryRgb,
    ['--cv-glow-1' as string]: t.glow1Color,
    ['--cv-glow-2' as string]: t.glow2Color,
    ['--cv-glow-3' as string]: t.glow3Color,
    ['--cv-grid-line' as string]: t.gridLineColor,
  } as React.CSSProperties;
}

// ============================================================================
// Layer slot palette — used inside the pipeline variant. Independent of theme.
// ============================================================================

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
  // Variants used by EP01 architecture-overview style:
  entry: {
    border: 'rgba(56,189,248,0.3)',
    bg: 'rgba(56,189,248,0.04)',
    iconBg: 'rgba(56,189,248,0.15)',
    iconColor: '#38bdf8',
    text: '#38bdf8',
    badgeBg: 'rgba(56,189,248,0.08)',
    badgeColor: '#7dd3fc',
  },
  commands: {
    border: 'rgba(168,85,247,0.3)',
    bg: 'rgba(168,85,247,0.04)',
    iconBg: 'rgba(168,85,247,0.15)',
    iconColor: '#a855f7',
    text: '#a855f7',
    badgeBg: 'rgba(168,85,247,0.08)',
    badgeColor: '#c084fc',
  },
  tools: {
    border: 'rgba(34,197,94,0.3)',
    bg: 'rgba(34,197,94,0.04)',
    iconBg: 'rgba(34,197,94,0.15)',
    iconColor: '#22c55e',
    text: '#22c55e',
    badgeBg: 'rgba(34,197,94,0.08)',
    badgeColor: '#86efac',
  },
  engine: {
    border: 'rgba(244,114,61,0.4)',
    bg: 'rgba(244,114,61,0.06)',
    iconBg: 'rgba(244,114,61,0.18)',
    iconColor: '#f4723d',
    text: '#f4723d',
    badgeBg: 'rgba(244,114,61,0.10)',
    badgeColor: '#fb923c',
    glow: true,
  },
  services: {
    border: 'rgba(236,72,153,0.3)',
    bg: 'rgba(236,72,153,0.04)',
    iconBg: 'rgba(236,72,153,0.15)',
    iconColor: '#ec4899',
    text: '#ec4899',
    badgeBg: 'rgba(236,72,153,0.08)',
    badgeColor: '#f9a8d4',
  },
};

/** Each connector arrow goes from layer[i].color → layer[i+1].color. */
export function arrowGradient(from: LayerColor, to: LayerColor): string {
  return `linear-gradient(${LAYER_PALETTE[from].border}, ${LAYER_PALETTE[to].border})`;
}

// ============================================================================
// State-machine node palette
// ============================================================================

export const NODE_PALETTE: Record<
  NodeColor,
  {border: string; bg: string; text: string}
> = {
  primary: {
    border: 'rgba(99,102,241,0.4)',
    bg: 'rgba(99,102,241,0.08)',
    text: '#818cf8',
  },
  success: {
    border: 'rgba(52,211,153,0.4)',
    bg: 'rgba(52,211,153,0.06)',
    text: '#34d399',
  },
  warning: {
    border: 'rgba(251,191,36,0.4)',
    bg: 'rgba(251,191,36,0.06)',
    text: '#fbbf24',
  },
  danger: {
    border: 'rgba(251,146,60,0.3)',
    bg: 'rgba(251,146,60,0.05)',
    text: '#fb923c',
  },
  final: {
    border: 'rgba(167,139,250,0.4)',
    bg: 'rgba(167,139,250,0.08)',
    text: '#a78bfa',
  },
};

export const FONTS = {
  cn: '"Noto Sans SC", sans-serif',
  mono: '"JetBrains Mono", monospace',
} as const;

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
