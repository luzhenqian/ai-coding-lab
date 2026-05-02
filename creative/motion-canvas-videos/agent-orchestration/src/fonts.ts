/**
 * Loads Google Fonts via <link> + FontFace API before motion-canvas first paints.
 * Doing this in JS (rather than CSS @import) avoids the canvas drawing a frame
 * with a fallback font during the brief window before async CSS resolves.
 */

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Noto+Sans+SC:wght@400;700;900&display=swap';

/** LXGW WenKai — open-source Chinese font with handwritten warmth.
 *  Used for big display headlines (FONTS.display) so the channel feels
 *  hand-set rather than "default Source Han". */
const LXGW_FONTS_URL =
  'https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css';

function injectStylesheet(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function injectPreconnect(href: string, crossorigin = false) {
  if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = href;
  if (crossorigin) link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

injectPreconnect('https://fonts.googleapis.com');
injectPreconnect('https://fonts.gstatic.com', true);
injectPreconnect('https://cdn.jsdelivr.net');
injectStylesheet(GOOGLE_FONTS_URL);
injectStylesheet(LXGW_FONTS_URL);

// Explicitly request the weights we use so document.fonts.ready resolves
// only after they are actually downloaded and parsed.
const required = [
  '400 16px "Noto Sans SC"',
  '700 16px "Noto Sans SC"',
  '900 16px "Noto Sans SC"',
  '400 16px "JetBrains Mono"',
  '700 16px "JetBrains Mono"',
  '400 16px "LXGW WenKai"',
];

export const fontsReady = Promise.all(
  required.map(spec => document.fonts.load(spec).catch(() => {})),
);
