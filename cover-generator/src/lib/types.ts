/** Color slot for a single layer card in the pipeline variant. */
export type LayerColor =
  | 'hook'        // violet
  | 'classifier'  // sky
  | 'deny'        // red
  | 'allow'       // green
  | 'mode'        // amber
  | 'dialog'      // emerald (highlighted final slot)
  | 'entry'       // sky-blue (used for ENTRY layer)
  | 'commands'    // purple-600
  | 'tools'       // green-500
  | 'engine'      // orange (highlighted middle slot, like a "core")
  | 'services';   // pink

/** Theme — controls primary accent + glow palette + frame corner color.
 *  Theme is independent of the layer slot palette: layers always render in
 *  their declared color regardless of theme. The theme tints the chrome
 *  (badge / frame / glows / title gradient stops). */
export type ThemeId =
  | 'emerald'   // green primary, red secondary glow — default
  | 'orange'    // coral primary, indigo+sky glows
  | 'indigo'   // indigo/violet primary, sky secondary
  | 'rose'      // rose/pink primary, amber secondary
  | 'amber';    // amber primary, indigo secondary

export type StatColor =
  | 'green' | 'red' | 'yellow' | 'default'
  | 'blue' | 'purple' | 'orange' | 'indigo' | 'cyan' | 'amber';

export interface SubtitleSegment {
  text: string;
  /** When true, render with the theme's accent color. */
  accent?: boolean;
}

export interface StatItem {
  value: string;
  label: string;
  color?: StatColor;
}

/**
 * Layer card. Two render styles share this type — rendered shape is decided
 * by which fields are populated:
 *
 *   • Row style: name + desc + badge + icon (e.g. EP03 6-layer permission)
 *   • Chips style: modules[] (e.g. EP01 architecture map)
 *
 * `layer` (the header label) is always shown.
 */
export interface LayerItem {
  /** Header label, e.g. "LAYER 1 · HOOK 预审" or "入口层 · ENTRY". */
  layer: string;
  color: LayerColor;
  // Row style fields — used together.
  name?: string;
  desc?: string;
  badge?: string;
  icon?: string;
  // Chips style — module names rendered as small chip pills under the header.
  modules?: string[];
}

// ============================================================================
// State-machine variant types — used when right side is an irregular diagram
// rather than a stacked pipeline. Positions are within a 460×500 right-side
// area; author writes them by hand for clean, intentional layouts.
// ============================================================================

export type NodeColor = 'primary' | 'success' | 'warning' | 'danger' | 'final';

export interface StateNode {
  /** Unique id within this cover (also used as React key). */
  id: string;
  label: string;
  /** Pixel position within the 460×500 right-side area, top-left origin. */
  position: [number, number];
  color: NodeColor;
  /** Visual emphasis — `primary` and `final` are larger / bolder. */
  emphasis?: 'normal' | 'primary' | 'final';
  /** Optional override for very small label fonts. */
  fontSize?: number;
}

export interface StateEdge {
  /** Raw SVG `d` path attribute. Coordinates are within the 460×500 area. */
  path: string;
  color: NodeColor;
  /** Default 'solid'. */
  style?: 'solid' | 'dashed';
}

// ============================================================================
// Cover content — a discriminated union over the right-side variant.
// ============================================================================

interface CoverBase {
  series: string;
  episode: string;
  titleHighlight: string;
  titleRest: string;
  subtitleLine1: SubtitleSegment[];
  subtitleLine2?: string;
  stats: StatItem[];
  techTags: string[];
  ghostCodeTop?: string;
  ghostCodeBottom?: string;
  /** Color theme — controls chrome, not layer slot colors. */
  theme: ThemeId;
}

export interface PipelineCover extends CoverBase {
  variant: 'pipeline';
  /** 5 or 6 layers recommended. Fewer feels sparse; more crowds the canvas. */
  layers: LayerItem[];
}

export interface StateMachineCover extends CoverBase {
  variant: 'state-machine';
  /** Free-form node positions — author writes coordinates explicitly. */
  stateNodes: StateNode[];
  /** Free-form SVG edges — author writes path strings explicitly. */
  stateEdges: StateEdge[];
  /** Decorative streaming gradient lines on the right (EP02 style). */
  streamingLines?: boolean;
  /** Optional top-right code-style label (e.g. "yield* → yield* → yield*"). */
  yieldBadge?: string;
}

export type CoverContent = PipelineCover | StateMachineCover;

// ============================================================================
// Per-platform metadata — unchanged from previous version.
// ============================================================================

export const PLATFORM_LIMITS = {
  bilibili: {title: 80, description: 250, tags: 12},
  youtube: {title: 100, description: 5000, tagsTotalChars: 500},
  xiaohongshu: {title: 20, body: 1000, topics: 10},
  wechat: {title: 22, description: 600, tags: 6},
} as const;

export interface PlatformBilibili {
  title: string;
  description: string;
  tags: string[];
  category?: string;
}

export interface PlatformYouTube {
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
}

export interface PlatformXiaohongshu {
  title: string;
  body: string;
  topics: string[];
}

export interface PlatformWeChatChannels {
  title: string;
  description: string;
  tags: string[];
}

export interface VideoMetadata {
  topic: string;
  duration: string;
  summary: string;
  videoPath?: string;
  bilibili: PlatformBilibili;
  youtube: PlatformYouTube;
  xiaohongshu: PlatformXiaohongshu;
  wechatChannels: PlatformWeChatChannels;
}
