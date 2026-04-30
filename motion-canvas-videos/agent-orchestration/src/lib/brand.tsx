import {Layout, Polygon, Rect, Txt} from '@motion-canvas/2d';
import {COLORS, FONTS, STAGE} from './design';

/**
 * N-Brand visual marks. Three rules:
 *   1. The mark is always coral (or full-opacity grayscale on coral background).
 *   2. The mark is always positioned in the same corner across every scene.
 *   3. The mark never moves, never fades — it's the constant.
 */

interface NCatLogoProps {
  size?: number;
  color?: string;
}

/**
 * NCatLogo — a stylized N with two cat-ear triangles. Used as the persistent
 * corner stamp on every scene and as the centered bug on title cards.
 *
 * Built from primitives (no SVG path / no font dependency for the mark) so
 * that even before LXGW WenKai loads, the brand mark renders correctly.
 */
export function NCatLogo({size = 36, color = COLORS.brand}: NCatLogoProps) {
  const earSize = size * 0.36;
  return (
    <Layout direction="column" alignItems="center" gap={-earSize * 0.18} layout>
      <Layout direction="row" gap={size * 0.16} layout>
        <Polygon sides={3} size={earSize} fill={color} />
        <Polygon sides={3} size={earSize} fill={color} />
      </Layout>
      <Txt
        text="N"
        fontFamily={FONTS.mono}
        fontWeight={900}
        fontSize={size}
        fill={color}
        lineHeight={`${Math.round(size * 0.95)}px`}
      />
    </Layout>
  );
}

interface BrandCornerProps {
  /** Distance from the scene edge in px. */
  inset?: number;
  size?: number;
}

/**
 * BrandCorner — the persistent stamp that lives in the same spot of every
 * scene. We pick bottom-left so it sits below the action, like a printer's
 * mark on a page.
 */
export function BrandCorner({inset = 56, size = 36}: BrandCornerProps) {
  return (
    <Layout
      direction="row"
      alignItems="center"
      gap={14}
      layout
      position={[
        -STAGE.width / 2 + inset + size * 0.6,
        STAGE.height / 2 - inset,
      ]}
    >
      <NCatLogo size={size} />
      <Txt
        text="Noah"
        fontFamily={FONTS.mono}
        fontWeight={700}
        fontSize={size * 0.5}
        fill={COLORS.textDim}
      />
    </Layout>
  );
}

/**
 * Mode shape watermarks — drawn behind the wordmark on each pattern's title
 * card so the geometry, not the color, signals which pattern this is.
 *
 * All four come in at the same scale (~520px) and at low opacity (0.18) so
 * they read as a wordmark background, never compete with the title text.
 */

interface ShapeProps {
  size?: number;
  color?: string;
  opacity?: number;
}

/** ▽  Supervisor — inverted triangle, hierarchy points down. */
export function ShapeSupervisor({size = 520, color = COLORS.brand, opacity = 0.18}: ShapeProps) {
  return (
    <Polygon
      sides={3}
      size={size}
      stroke={color}
      lineWidth={6}
      rotation={180}
      opacity={opacity}
    />
  );
}

/** ▱  Workflow — slanted parallelogram, single direction of flow. */
export function ShapeWorkflow({size = 520, color = COLORS.brand, opacity = 0.18}: ShapeProps) {
  return (
    <Rect
      width={size}
      height={size * 0.62}
      stroke={color}
      lineWidth={6}
      skew={[14, 0]}
      opacity={opacity}
    />
  );
}

/** ⌒  Handoff — three stacked chevrons, pass-the-baton motion. */
export function ShapeHandoff({size = 520, color = COLORS.brand, opacity = 0.18}: ShapeProps) {
  const chevronW = size * 0.7;
  return (
    <Layout direction="row" gap={size * 0.05} layout opacity={opacity}>
      {[0, 1, 2].map(i => (
        <Polygon
          sides={3}
          size={chevronW * 0.5}
          stroke={color}
          lineWidth={6}
          rotation={90}
          scale={[0.5, 1]}
        />
      ))}
    </Layout>
  );
}

/** ◯  Council — circle, gathered around a center, no leader. */
export function ShapeCouncil({size = 520, color = COLORS.brand, opacity = 0.18}: ShapeProps) {
  return (
    <Rect
      width={size}
      height={size}
      radius={size / 2}
      stroke={color}
      lineWidth={6}
      opacity={opacity}
    />
  );
}
