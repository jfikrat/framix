// ─── Audio Sync Helpers ──────────────────────────────
// Pure math functions for syncing animation to BPM.
// Zero dependencies.

/**
 * Returns true on beat frames (within ±0.5 frame tolerance).
 */
export function isBeat(bpm: number, frame: number, fps: number): boolean {
  const framesPerBeat = (fps * 60) / bpm;
  const position = frame % framesPerBeat;
  return position < 0.5 || position > framesPerBeat - 0.5;
}

/**
 * Progress within current beat (0 → 1).
 */
export function beatProgress(bpm: number, frame: number, fps: number): number {
  const framesPerBeat = (fps * 60) / bpm;
  return (frame % framesPerBeat) / framesPerBeat;
}

/**
 * Pulse that fires on each beat: 1 at beat, decays to 0.
 * Great for scale/glow animations synced to music.
 */
export function beatPulse(
  bpm: number,
  frame: number,
  fps: number,
  decay: number = 0.15,
): number {
  const progress = beatProgress(bpm, frame, fps);
  return Math.max(0, 1 - progress / decay);
}

/**
 * Progress within current bar (0 → 1).
 */
export function barProgress(
  bpm: number,
  beatsPerBar: number,
  frame: number,
  fps: number,
): number {
  const framesPerBar = (fps * 60 * beatsPerBar) / bpm;
  return (frame % framesPerBar) / framesPerBar;
}

/**
 * Current beat number (0-indexed).
 */
export function currentBeat(bpm: number, frame: number, fps: number): number {
  const framesPerBeat = (fps * 60) / bpm;
  return Math.floor(frame / framesPerBeat);
}

/**
 * Current bar number (0-indexed).
 */
export function currentBar(
  bpm: number,
  beatsPerBar: number,
  frame: number,
  fps: number,
): number {
  const framesPerBar = (fps * 60 * beatsPerBar) / bpm;
  return Math.floor(frame / framesPerBar);
}

/**
 * Convert beat number to frame number.
 */
export function beatToFrame(bpm: number, beat: number, fps: number): number {
  return Math.round((beat * fps * 60) / bpm);
}

/**
 * Convert bar number to frame number.
 */
export function barToFrame(
  bpm: number,
  beatsPerBar: number,
  bar: number,
  fps: number,
): number {
  return Math.round((bar * beatsPerBar * fps * 60) / bpm);
}

/**
 * Subdivision within a beat (e.g., 16th notes).
 * Returns progress 0→1 for each subdivision.
 */
export function subdivisionProgress(
  bpm: number,
  frame: number,
  fps: number,
  subdivisions: number = 4,
): number {
  const framesPerSub = (fps * 60) / (bpm * subdivisions);
  return (frame % framesPerSub) / framesPerSub;
}

/**
 * Returns true on subdivision hits.
 */
export function isSubdivision(
  bpm: number,
  frame: number,
  fps: number,
  subdivisions: number = 4,
): boolean {
  const framesPerSub = (fps * 60) / (bpm * subdivisions);
  const position = frame % framesPerSub;
  return position < 0.5 || position > framesPerSub - 0.5;
}
