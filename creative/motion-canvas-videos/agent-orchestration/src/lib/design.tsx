import {Icon, Layout, Line, Node, NodeProps, Rect, RectProps, Txt} from '@motion-canvas/2d';

/**
 * N-Brand v1 palette — single chromatic color (N-Coral) on a warm grayscale
 * substrate. The four pattern aliases all resolve to brand coral; modes are
 * differentiated by SHAPE, not hue. `warm` (formerly cons-red) collapses into
 * textDim so the X icon carries the negative semantic without color noise.
 */
const BRAND = '#FF5E4D';
const TEXT_DIM = '#a89e90';

export const COLORS = {
  // Warm dark substrate
  bg: '#1a1612',
  panel: '#221d18',
  card: '#2e2822',
  cardBorder: '#3a342d',
  cardBorderActive: '#574c40',

  // Warm grayscale text
  text: '#f5f1e8',
  textDim: TEXT_DIM,
  muted: '#6e6558',

  // The one signature color
  brand: BRAND,
  brandSoft: '#3a1f1a', // brand-tinted dark fill

  // Legacy aliases — all resolve to brand or grayscale (kept for diff-min refactor)
  supervisor: BRAND,
  workflow: BRAND,
  handoff: BRAND,
  council: BRAND,
  accent: BRAND,
  warm: TEXT_DIM,
  yellow: BRAND,
};

export const FONTS = {
  /** Big display CN — LXGW WenKai for personality, with serif/sans fallbacks. */
  display: '"LXGW WenKai", "Noto Serif SC", "Noto Sans SC", sans-serif',
  /** Body Chinese */
  cn: '"Noto Sans SC", sans-serif',
  /** Code / labels */
  mono: '"JetBrains Mono", monospace',
};

export const STAGE = {
  width: 1920,
  height: 1080,
};

interface AgentBoxProps extends RectProps {
  label: string;
  sub?: string;
  accent?: string;
  size?: [number, number];
}

export function AgentBox({label, sub, accent, size = [220, 130], ...rest}: AgentBoxProps) {
  return (
    <Rect
      width={size[0]}
      height={size[1]}
      radius={20}
      fill={COLORS.card}
      stroke={accent ?? COLORS.cardBorder}
      lineWidth={3}
      {...rest}
    >
      <Layout direction="column" alignItems="center" gap={8}>
        <Txt
          text={label}
          fontFamily={FONTS.cn}
          fontWeight={700}
          fontSize={32}
          fill={COLORS.text}
        />
        {sub && (
          <Txt
            text={sub}
            fontFamily={FONTS.mono}
            fontSize={18}
            fill={COLORS.textDim}
          />
        )}
      </Layout>
    </Rect>
  );
}

interface SectionTitleProps extends NodeProps {
  index: string;
  cn: string;
  en: string;
  accent: string;
}

export function SectionTitle({index, cn, en, accent, ...rest}: SectionTitleProps) {
  return (
    <Layout direction="column" alignItems="center" gap={20} {...rest}>
      <Txt
        text={index}
        fontFamily={FONTS.mono}
        fontWeight={700}
        fontSize={42}
        fill={accent}
      />
      <Txt
        text={cn}
        fontFamily={FONTS.cn}
        fontWeight={900}
        fontSize={120}
        fill={COLORS.text}
      />
      <Txt
        text={en}
        fontFamily={FONTS.mono}
        fontSize={48}
        fill={COLORS.textDim}
      />
    </Layout>
  );
}

/**
 * Lucide icon names used across scenes — keep one source of truth so it's
 * easy to swap an icon set globally.
 */
export const ICONS = {
  pros: 'lucide:check',
  cons: 'lucide:x',
  external: 'lucide:arrow-up-right',
  drillDown: 'lucide:corner-down-right',
  finalState: 'lucide:check-circle-2',
};

interface IconLabelProps extends NodeProps {
  icon: string;
  text: string;
  color: string;
  iconSize?: number;
  fontSize?: number;
}

/**
 * Icon + text in a horizontal row. Used for pros/cons headings, repo
 * badges, drill-down hints — anywhere we previously embedded a unicode
 * symbol inside a Txt string.
 */
export function IconLabel({
  icon,
  text,
  color,
  iconSize = 24,
  fontSize = 22,
  ...rest
}: IconLabelProps) {
  return (
    <Layout direction="row" alignItems="center" gap={8} layout {...rest}>
      <Icon icon={icon} color={color} size={iconSize} />
      <Txt
        text={text}
        fontFamily={FONTS.cn}
        fontSize={fontSize}
        fill={color}
      />
    </Layout>
  );
}

interface DecisionBadgeProps extends NodeProps {
  who: string;
  accent: string;
}

export function DecisionBadge({who, accent, ...rest}: DecisionBadgeProps) {
  return (
    <Rect
      width={460}
      height={120}
      radius={16}
      fill={COLORS.panel}
      stroke={accent}
      lineWidth={3}
      {...rest}
    >
      <Layout direction="column" alignItems="start" gap={6} padding={24} layout>
        <Txt
          text="决策者"
          fontFamily={FONTS.cn}
          fontSize={26}
          fill={COLORS.muted}
        />
        <Txt
          text={who}
          fontFamily={FONTS.cn}
          fontWeight={700}
          fontSize={36}
          fill={accent}
        />
      </Layout>
    </Rect>
  );
}
