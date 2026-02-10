import { interpolate, spring, easing } from "./animations";

// ─── Typewriter ──────────────────────────────────────

interface TypewriterConfig {
  text: string;
  frame: number;
  startFrame?: number;
  speed?: number; // chars per frame, default 0.5
  easing?: (t: number) => number;
}

interface TypewriterResult {
  displayText: string;
  cursorVisible: boolean;
  isComplete: boolean;
  progress: number;
}

/**
 * Typewriter effect — reveals text character by character.
 * Pure function, frame-driven.
 */
export function useTypewriter(config: TypewriterConfig): TypewriterResult {
  const { text, frame, startFrame = 0, speed = 0.5, easing: ease } = config;
  const localFrame = frame - startFrame;

  if (localFrame < 0) {
    return { displayText: "", cursorVisible: true, isComplete: false, progress: 0 };
  }

  const totalFrames = text.length / speed;
  const rawProgress = Math.min(localFrame / totalFrames, 1);
  const progress = ease ? ease(rawProgress) : rawProgress;
  const charCount = Math.floor(progress * text.length);
  const displayText = text.slice(0, charCount);
  const isComplete = charCount >= text.length;

  // Cursor blinks every 15 frames after complete
  const cursorVisible = isComplete
    ? Math.floor(localFrame / 15) % 2 === 0
    : true;

  return { displayText, cursorVisible, isComplete, progress: rawProgress };
}

// ─── Letter Stagger ──────────────────────────────────

interface LetterStaggerConfig {
  text: string;
  frame: number;
  fps: number;
  delay?: number; // frames between each letter, default 3
  damping?: number; // spring damping, default 12
  stiffness?: number; // spring stiffness, default 100
}

interface LetterState {
  char: string;
  opacity: number;
  y: number;
  scale: number;
}

/**
 * Spring-based letter stagger animation.
 * Each letter enters with spring physics, staggered by delay.
 */
export function useLetterStagger(config: LetterStaggerConfig): LetterState[] {
  const {
    text,
    frame,
    fps,
    delay = 3,
    damping = 12,
    stiffness = 100,
  } = config;

  return text.split("").map((char, i) => {
    const letterFrame = frame - i * delay;
    const s = spring({ frame: letterFrame, fps, damping, stiffness });

    return {
      char,
      opacity: s,
      y: interpolate(s, [0, 1], [20, 0]),
      scale: interpolate(s, [0, 1], [0.5, 1]),
    };
  });
}

// ─── Word Reveal ─────────────────────────────────────

interface WordRevealConfig {
  text: string;
  frame: number;
  fps: number;
  wordDelay?: number; // frames between each word, default 8
  damping?: number;
  stiffness?: number;
}

interface WordState {
  word: string;
  opacity: number;
  y: number;
}

/**
 * Word-by-word reveal with spring animation.
 */
export function useWordReveal(config: WordRevealConfig): WordState[] {
  const {
    text,
    frame,
    fps,
    wordDelay = 8,
    damping = 14,
    stiffness = 100,
  } = config;

  return text.split(" ").map((word, i) => {
    const wordFrame = frame - i * wordDelay;
    const s = spring({ frame: wordFrame, fps, damping, stiffness });

    return {
      word,
      opacity: s,
      y: interpolate(s, [0, 1], [30, 0]),
    };
  });
}

// ─── Count Up ────────────────────────────────────────

interface CountUpConfig {
  from: number;
  to: number;
  frame: number;
  durationInFrames: number;
  startFrame?: number;
  format?: (value: number) => string;
  easing?: (t: number) => number;
}

/**
 * Animated number counter. Returns formatted string.
 */
export function useCountUp(config: CountUpConfig): string {
  const {
    from,
    to,
    frame,
    durationInFrames,
    startFrame = 0,
    format = (v) => Math.round(v).toLocaleString(),
    easing: ease = easing.easeOutCubic,
  } = config;

  const value = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [from, to],
    { easing: ease }
  );

  return format(value);
}
