/** Color slot for a single layer card on the right pipeline. */
export type LayerColor =
  | 'hook'        // violet
  | 'classifier'  // sky
  | 'deny'        // red
  | 'allow'       // green
  | 'mode'        // amber
  | 'dialog';     // emerald (highlighted final slot)

/** Color slot for the three big stat numbers on the left. */
export type StatColor = 'green' | 'red' | 'yellow' | 'default';

export interface SubtitleSegment {
  text: string;
  /** When true, render with the emerald accent color. */
  accent?: boolean;
}

export interface StatItem {
  value: string;
  label: string;
  color?: StatColor;
}

export interface LayerItem {
  /** "LAYER 1" — kept as raw text so user can localize / abbreviate. */
  layer: string;
  /** Short layer name displayed bold. */
  name: string;
  /** One-line description. */
  desc: string;
  /** Right-side badge (e.g. "INTERCEPT", "PASS", "BLOCK"). */
  badge: string;
  color: LayerColor;
  /** Single-character icon — emoji or Unicode glyph. */
  icon: string;
}

/** The full editable content for one cover. */
export interface CoverContent {
  /** Top series badge text, e.g. "CLAUDE CODE 源码深度解析". */
  series: string;
  /** Episode number text, e.g. "EPISODE 03". */
  episode: string;
  /** Title's highlighted CN word — gets the gradient SVG treatment. */
  titleHighlight: string;
  /** Rest of the title that follows the highlighted word, on its own line. */
  titleRest: string;
  /** Subtitle composed of segments; mark some `accent: true` to color them. */
  subtitleLine1: SubtitleSegment[];
  subtitleLine2?: string;
  stats: StatItem[];
  /** Pipeline layers — best with 5 or 6 items for visual rhythm. */
  layers: LayerItem[];
  /** Bottom-left technology tags. */
  techTags: string[];
  /** Optional faint code snippets that ghost behind the canvas. */
  ghostCodeTop?: string;
  ghostCodeBottom?: string;
}
