import {forwardRef, useMemo} from 'react';
import type {CoverContent, LayerItem} from './lib/types';
import {LAYER_PALETTE, arrowGradient} from './lib/design-tokens';
import './styles/cover.css';

interface CoverProps {
  content: CoverContent;
}

/**
 * The cover canvas — fixed at 1280×720, all positioning hard-coded so
 * exported PNG is pixel-stable across episodes.
 *
 * Wraps with forwardRef so the parent can grab the DOM node and feed it
 * to html2canvas at export time.
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
    layers,
    techTags,
    ghostCodeTop,
    ghostCodeBottom,
  } = content;

  // Pre-compute the inline styles for each layer card so the DOM stays clean.
  const layerStyles = useMemo(() => layers.map(l => buildLayerStyle(l)), [layers]);

  return (
    <div className="cover" ref={ref}>
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
          <HighlightSvg text={titleHighlight} />
          {titleRest}
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

      {/* ============== RIGHT PIPELINE ============== */}
      <div className="shield-area">
        {layers.map((layer, i) => {
          const styles = layerStyles[i];
          const isLast = i === layers.length - 1;
          return (
            <div key={i}>
              <div className="perm-layer" style={styles.layerStyle}>
                <div className="perm-icon" style={styles.iconStyle}>
                  {layer.icon}
                </div>
                <div className="perm-info">
                  <div className="perm-name" style={{color: styles.text}}>
                    {layer.layer}
                  </div>
                  <div className="perm-desc" style={{color: styles.text}}>
                    {layer.desc}
                  </div>
                </div>
                <div className="perm-badge" style={styles.badgeStyle}>
                  {layer.badge}
                </div>
              </div>
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

/**
 * The highlighted CN word in the title — rendered via inline SVG with a
 * linearGradient so the gradient text effect is preserved when html2canvas
 * rasterizes the DOM (CSS background-clip:text fails inside html2canvas).
 */
function HighlightSvg({text}: {text: string}) {
  // Approximate width based on character count — CN chars are roughly 54px wide
  // at this size. Add some padding so the SVG canvas doesn't crop the glyphs.
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
        <linearGradient id="cover-title-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#f87171" />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="54"
        fontFamily="'Noto Sans SC', sans-serif"
        fontWeight={900}
        fontSize={54}
        letterSpacing={-1}
        fill="url(#cover-title-grad)"
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
      '0 0 25px rgba(16,185,129,0.08), inset 0 0 25px rgba(16,185,129,0.02)';
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
  };
}
