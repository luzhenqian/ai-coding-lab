import {forwardRef, useMemo} from 'react';
import {CoverStateMachine} from './CoverStateMachine';
import {LAYER_PALETTE, THEMES, arrowGradient, themeStyle} from './lib/design-tokens';
import type {CoverContent, LayerItem} from './lib/types';
import './styles/cover.css';

interface CoverProps {
  content: CoverContent;
}

/**
 * The cover canvas — fixed at 1280×720, all positioning hard-coded so
 * exported PNG is pixel-stable across episodes. Theme and variant are
 * driven by `content.theme` and `content.variant`.
 */
export const Cover = forwardRef<HTMLDivElement, CoverProps>(function Cover(
  {content},
  ref,
) {
  const {
    series,
    episode,
    titleHighlight,
    titleRest,
    subtitleLine1,
    subtitleLine2,
    stats,
    techTags,
    ghostCodeTop,
    ghostCodeBottom,
    theme,
  } = content;

  const themedRoot = useMemo(() => themeStyle(theme), [theme]);
  const themeTokens = THEMES[theme];

  return (
    <div
      className={`cover theme-${theme}`}
      ref={ref}
      style={themedRoot}
    >
      <div className="bg-grid" />
      <div className="bg-glow-1" />
      <div className="bg-glow-2" />
      <div className="bg-glow-3" />
      <div className="scanline" />

      {ghostCodeTop && <div className="code-ghost cg-1">{ghostCodeTop}</div>}
      {ghostCodeBottom && <div className="code-ghost cg-2">{ghostCodeBottom}</div>}

      <div className="frame">
        <div className="frame-corner fc-tl" />
        <div className="frame-corner fc-tr" />
        <div className="frame-corner fc-bl" />
        <div className="frame-corner fc-br" />
      </div>

      <div className="v-line" />

      {/* ============== LEFT CONTENT ============== */}
      <div className="content-left">
        <div className="series-badge">
          <div className="series-dot" />
          <span>{series}</span>
        </div>
        <div className="ep-number">{episode}</div>

        <div className="main-title">
          <HighlightSvg
            text={titleHighlight}
            gradientStops={themeTokens.titleGradient}
            gradientId={`title-grad-${theme}`}
          />
          {titleRest.split('\n').map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </div>

        <div className="subtitle">
          {subtitleLine1.map((seg, i) => (
            <span key={i} className={seg.accent ? 'accent' : undefined}>
              {seg.text}
            </span>
          ))}
          {subtitleLine2 && (
            <>
              <br />
              {subtitleLine2}
            </>
          )}
        </div>

        <div className="stats-row">
          {stats.map((s, i) => (
            <div key={i} className="stat-item">
              <div className={`stat-value ${s.color ?? 'default'}`}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ============== RIGHT SIDE ============== */}
      {content.variant === 'pipeline' ? (
        <PipelineSide layers={content.layers} />
      ) : (
        <CoverStateMachine
          nodes={content.stateNodes}
          edges={content.stateEdges}
          streamingLines={content.streamingLines}
          yieldBadge={content.yieldBadge}
        />
      )}

      {/* ============== BOTTOM TAGS ============== */}
      <div className="bottom-bar">
        {techTags.map((tag, i) => (
          <div key={i} className="tech-tag">
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
});

// ----------------------------------------------------------------------------
// Pipeline variant — stack of layer cards with arrow connectors.
// ----------------------------------------------------------------------------

function PipelineSide({layers}: {layers: LayerItem[]}) {
  const layerStyles = useMemo(() => layers.map(l => buildLayerStyle(l)), [layers]);

  return (
    <div className="shield-area">
      {layers.map((layer, i) => {
        const styles = layerStyles[i];
        const isLast = i === layers.length - 1;
        const usesChips = !!layer.modules;
        return (
          <div key={i}>
            {usesChips ? (
              <div className="arch-layer" style={styles.layerStyle}>
                <div
                  className="arch-layer-label"
                  style={{color: styles.text}}
                >
                  {layer.layer}
                </div>
                <div className="arch-modules">
                  {layer.modules!.map((m, j) => (
                    <span
                      key={j}
                      className="arch-mod"
                      style={{
                        color: styles.badgeText,
                        background: styles.badgeBg,
                        borderColor: styles.badgeBorder,
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="perm-layer" style={styles.layerStyle}>
                {layer.icon && (
                  <div className="perm-icon" style={styles.iconStyle}>
                    {layer.icon}
                  </div>
                )}
                <div className="perm-info">
                  <div className="perm-name" style={{color: styles.text}}>
                    {layer.layer}
                  </div>
                  {layer.desc && (
                    <div className="perm-desc" style={{color: styles.text}}>
                      {layer.desc}
                    </div>
                  )}
                </div>
                {layer.badge && (
                  <div className="perm-badge" style={styles.badgeStyle}>
                    {layer.badge}
                  </div>
                )}
              </div>
            )}
            {!isLast && (
              <div
                className="perm-arrow"
                style={{
                  background: arrowGradient(layer.color, layers[i + 1].color),
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Highlighted title word — inline SVG with theme gradient stops.
// ----------------------------------------------------------------------------

function HighlightSvg({
  text,
  gradientStops,
  gradientId,
}: {
  text: string;
  gradientStops: [string, string, string];
  gradientId: string;
}) {
  const charCount = Array.from(text).length;
  const width = Math.max(charCount * 56, 100);
  return (
    <svg
      className="highlight-svg"
      viewBox={`0 0 ${width} 66`}
      xmlns="http://www.w3.org/2000/svg"
      style={{width: `${width}px`}}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradientStops[0]} />
          <stop offset="50%" stopColor={gradientStops[1]} />
          <stop offset="100%" stopColor={gradientStops[2]} />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="54"
        fontFamily="'Noto Sans SC', sans-serif"
        fontWeight={900}
        fontSize={54}
        letterSpacing={-1}
        fill={`url(#${gradientId})`}
      >
        {text}
      </text>
    </svg>
  );
}

function buildLayerStyle(layer: LayerItem) {
  const palette = LAYER_PALETTE[layer.color];
  const layerStyle: React.CSSProperties = {
    borderColor: palette.border,
    background: palette.bg,
  };
  if (palette.glow) {
    layerStyle.boxShadow =
      `0 0 25px rgba(${rgbFromHex(palette.iconColor)}, 0.10), inset 0 0 25px rgba(${rgbFromHex(palette.iconColor)}, 0.03)`;
  }
  return {
    layerStyle,
    iconStyle: {
      background: palette.iconBg,
      color: palette.iconColor,
    } as React.CSSProperties,
    text: palette.text,
    badgeStyle: {
      background: palette.badgeBg,
      color: palette.badgeColor,
    } as React.CSSProperties,
    badgeBg: palette.badgeBg,
    badgeBorder: palette.border,
    badgeText: palette.badgeColor,
  };
}

/** Best-effort #rrggbb -> "r,g,b" for use in rgba(). Assumes 6-char hex. */
function rgbFromHex(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}
