import { interpolate } from "./animations";

// ─── Types ───────────────────────────────────────────

export interface CueDef {
  duration: number;
  gap?: number; // gap after this cue (frames)
}

export type CueInput = number | "auto" | CueDef;

export interface Cue {
  name: string;
  from: number;
  durationInFrames: number;
  to: number;
}

export interface CueMap {
  [key: string]: Cue;
}

export interface CueResult {
  cues: CueMap;
  list: Cue[];
  totalFrames: number;
}

// ─── Core ────────────────────────────────────────────

/**
 * Define named cues with durations. "auto" fills remaining space.
 *
 * Example:
 *   const { cues } = defineCues({ intro: 30, cards: "auto", outro: 45 }, 300);
 *   // cues.intro = { name: "intro", from: 0, durationInFrames: 30, to: 30 }
 *   // cues.cards = { name: "cards", from: 30, durationInFrames: 225, to: 255 }
 *   // cues.outro = { name: "outro", from: 255, durationInFrames: 45, to: 300 }
 */
export function defineCues(
  defs: Record<string, CueInput>,
  totalFrames: number,
): CueResult {
  const entries = Object.entries(defs);

  // Calculate fixed durations and gaps
  let fixedTotal = 0;
  let autoCount = 0;

  for (const [, value] of entries) {
    if (value === "auto") {
      autoCount++;
    } else if (typeof value === "number") {
      fixedTotal += value;
    } else {
      fixedTotal += value.duration + (value.gap ?? 0);
    }
  }

  const autoFrames =
    autoCount > 0
      ? Math.floor((totalFrames - fixedTotal) / autoCount)
      : 0;

  // Build cues
  const cues: CueMap = {};
  const list: Cue[] = [];
  let cursor = 0;

  for (const [name, value] of entries) {
    let duration: number;
    let gap = 0;

    if (value === "auto") {
      duration = autoFrames;
    } else if (typeof value === "number") {
      duration = value;
    } else {
      duration = value.duration;
      gap = value.gap ?? 0;
    }

    const cue: Cue = {
      name,
      from: cursor,
      durationInFrames: duration,
      to: cursor + duration,
    };

    cues[name] = cue;
    list.push(cue);
    cursor += duration + gap;
  }

  return { cues, list, totalFrames };
}

/**
 * Get local frame within a cue. Returns -1 if frame is outside cue range.
 */
export function cueFrame(cue: Cue, frame: number): number {
  const local = frame - cue.from;
  if (local < 0 || local >= cue.durationInFrames) return -1;
  return local;
}

/**
 * Get progress (0→1) within a cue. Clamped.
 */
export function cueProgress(cue: Cue, frame: number): number {
  return interpolate(frame, [cue.from, cue.to], [0, 1]);
}

/**
 * Check if frame is within a cue's range.
 */
export function isInCue(cue: Cue, frame: number): boolean {
  return frame >= cue.from && frame < cue.to;
}

/**
 * Get the active cue at a given frame.
 */
export function activeCue(result: CueResult, frame: number): Cue | null {
  for (const cue of result.list) {
    if (isInCue(cue, frame)) return cue;
  }
  return null;
}
