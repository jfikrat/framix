// Framix — Transition Primitives
// Pure functions for common animation transitions.
// All functions use interpolate/easing from animations.ts.

import { interpolate, easing } from "./animations";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface TransitionConfig {
  frame: number;
  startFrame?: number; // default 0
  durationInFrames: number;
  easing?: (t: number) => number;
}

export type Direction = "left" | "right" | "up" | "down";

// ---------------------------------------------------------------------------
// Opacity transitions
// ---------------------------------------------------------------------------

/**
 * Fade in: opacity 0 -> 1
 */
export function fadeIn(config: TransitionConfig): number {
  const { frame, startFrame = 0, durationInFrames, easing: ease } = config;
  return interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    easing: ease,
  });
}

/**
 * Fade out: opacity 1 -> 0
 */
export function fadeOut(config: TransitionConfig): number {
  const { frame, startFrame = 0, durationInFrames, easing: ease } = config;
  return interpolate(frame, [startFrame, startFrame + durationInFrames], [1, 0], {
    easing: ease,
  });
}

/**
 * Combined enter + exit transition. Returns 0 -> 1 -> 0.
 * enterDuration and exitDuration split the durationInFrames.
 * The middle portion holds at 1.
 */
export function transition(
  config: TransitionConfig & {
    enterDuration?: number;
    exitDuration?: number;
  },
): number {
  const {
    frame,
    startFrame = 0,
    durationInFrames,
    easing: ease,
    enterDuration,
    exitDuration,
  } = config;

  const enter = enterDuration ?? Math.floor(durationInFrames * 0.3);
  const exit = exitDuration ?? Math.floor(durationInFrames * 0.3);
  const exitStart = startFrame + durationInFrames - exit;

  if (frame < startFrame + enter) {
    return interpolate(frame, [startFrame, startFrame + enter], [0, 1], {
      easing: ease,
    });
  }
  if (frame > exitStart) {
    return interpolate(frame, [exitStart, startFrame + durationInFrames], [1, 0], {
      easing: ease,
    });
  }
  return 1;
}

// ---------------------------------------------------------------------------
// Clip-path transitions
// ---------------------------------------------------------------------------

/**
 * Wipe transition using CSS clip-path inset(). Returns a clip-path string.
 * Progress goes from fully clipped to fully visible.
 */
export function wipe(
  config: TransitionConfig,
  direction: Direction = "right",
): string {
  const { frame, startFrame = 0, durationInFrames, easing: ease } = config;
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { easing: ease ?? easing.easeInOut },
  );

  switch (direction) {
    case "right":
      return `inset(0 ${(1 - progress) * 100}% 0 0)`;
    case "left":
      return `inset(0 0 0 ${(1 - progress) * 100}%)`;
    case "down":
      return `inset(0 0 ${(1 - progress) * 100}% 0)`;
    case "up":
      return `inset(${(1 - progress) * 100}% 0 0 0)`;
  }
}

// ---------------------------------------------------------------------------
// Crossfade
// ---------------------------------------------------------------------------

/**
 * Dissolve: returns outgoing and incoming opacity for crossfade between
 * two layers. outgoing fades from 1 -> 0 while incoming fades from 0 -> 1.
 */
export function dissolve(
  config: TransitionConfig,
): { outgoing: number; incoming: number } {
  const { frame, startFrame = 0, durationInFrames, easing: ease } = config;
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { easing: ease ?? easing.easeInOut },
  );
  return { outgoing: 1 - progress, incoming: progress };
}

// ---------------------------------------------------------------------------
// Movement transitions
// ---------------------------------------------------------------------------

/**
 * Slide: returns translate distance in px.
 * Animates from `distance` to 0 (element slides into its final position).
 */
export function slide(
  config: TransitionConfig,
  direction: Direction = "right",
  distance: number = 100,
): number {
  const { frame, startFrame = 0, durationInFrames, easing: ease } = config;
  const sign = direction === "left" || direction === "up" ? -1 : 1;
  return interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [sign * distance, 0],
    { easing: ease ?? easing.easeOutCubic },
  );
}

// ---------------------------------------------------------------------------
// Scale transitions
// ---------------------------------------------------------------------------

/**
 * Scale in: animates scale from `from` to 1.
 */
export function scaleIn(config: TransitionConfig, from: number = 0): number {
  const { frame, startFrame = 0, durationInFrames, easing: ease } = config;
  return interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [from, 1],
    { easing: ease ?? easing.easeOutCubic },
  );
}

/**
 * Scale out: animates scale from 1 to `to`.
 */
export function scaleOut(config: TransitionConfig, to: number = 0): number {
  const { frame, startFrame = 0, durationInFrames, easing: ease } = config;
  return interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [1, to],
    { easing: ease ?? easing.easeInCubic },
  );
}
