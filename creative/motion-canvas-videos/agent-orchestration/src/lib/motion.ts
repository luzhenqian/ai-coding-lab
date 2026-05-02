import {Node, Rect} from '@motion-canvas/2d';
import {
  TimingFunction,
  all,
  chain,
  easeInOutQuart,
  easeOutBack,
  easeOutCubic,
  easeOutQuart,
} from '@motion-canvas/core';

/**
 * N-Move · the project's motion DSL.
 *
 * Every animation in this project should pull its duration from `D` and its
 * easing from `E`. Locking these two tables is what makes our reveals feel
 * like the same hand wrote them — the brand fingerprint that's hardest to
 * imitate. Resist the urge to write `0.4` or `easeInOutCubic` inline.
 */

/** Locked durations. Anything ad-hoc breaks the rhythm. */
export const D = {
  /** Brief flash — pulses, micro-highlights. */
  flash: 0.3,
  /** Standard reveal — fades, drops, line growth. */
  reveal: 0.5,
  /** Position shifts and bigger reorders. */
  shift: 0.7,
  /** Pause-on-screen between phases of the same scene. */
  hold: 1.6,
  /** End-of-phase / scene cleanup fade. */
  cleanup: 0.5,
} as const;

/** Locked easings. easeInOutQuart is sharper than the motion-canvas default
 *  and reads as "decisive"; easeOutBack gives titles a confident overshoot. */
export const E = {
  /** Signature — section bars, transitions, anything spanning. */
  sig: easeInOutQuart as TimingFunction,
  /** Stamp drops — text + cards arriving with a small overshoot. */
  drop: easeOutBack as TimingFunction,
  /** Token / data flow movement. */
  flow: easeOutCubic as TimingFunction,
  /** Smooth exits. */
  exit: easeOutQuart as TimingFunction,
} as const;

// ---------------------------------------------------------------------------
// Signature motions — call these instead of writing the steps inline.
// ---------------------------------------------------------------------------

/**
 * #1 underline-reveal — coral horizontal line grows from current width to
 * target. Use this for every section bar and emphasis underline.
 */
export function* underlineReveal(bar: Rect, targetWidth: number, duration = D.reveal) {
  yield* bar.width(targetWidth, duration, E.sig);
}

/**
 * #2 stamp-drop — node fades in while easing into final position with a
 * small overshoot. Caller must set the node's initial scale to 0.92 (or
 * any other start) on its JSX props; this helper just animates to 1.
 */
export function* stampIn(node: Node, duration = D.reveal) {
  yield* all(
    node.opacity(1, duration * 0.7),
    node.scale(1, duration, E.drop),
  );
}

/**
 * #4 pulse-active — momentary 1.05 scale up then back to 1. Use whenever an
 * element becomes "active" or receives a token.
 */
export function* pulse(node: Node, peak = 1.05, duration = D.flash) {
  yield* node.scale(peak, duration).to(1, duration);
}

/**
 * #3 wipe-cut — single coral horizontal bar sweeps across the full stage,
 * masking the previous content. Use at scene boundaries when you want a
 * hard cut feel. Caller is responsible for adding a Rect ref-ed `wiper` to
 * the view at width 0 and y=0; this helper expands then collapses it.
 */
export function* wipeCut(wiper: Rect, stageWidth: number, duration = D.shift) {
  yield* chain(
    wiper.width(stageWidth * 1.1, duration * 0.5, E.sig),
    wiper.width(0, duration * 0.5, E.sig).to(0, 0),
  );
}
