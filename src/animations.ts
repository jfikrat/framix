// Mini Remotion - Animation Utilities

/**
 * Interpolate a value between input and output ranges
 */
export function interpolate(
  value: number,
  inputRange: [number, number],
  outputRange: [number, number],
  options?: { clamp?: boolean; easing?: (t: number) => number }
): number {
  const [inputMin, inputMax] = inputRange;
  const [outputMin, outputMax] = outputRange;

  let progress = (value - inputMin) / (inputMax - inputMin);

  if (options?.clamp !== false) {
    progress = Math.max(0, Math.min(1, progress));
  }

  if (options?.easing) {
    progress = options.easing(progress);
  }

  return outputMin + progress * (outputMax - outputMin);
}

/**
 * Spring animation
 */
export function spring(options: {
  frame: number;
  fps: number;
  damping?: number;
  stiffness?: number;
  mass?: number;
}): number {
  const { frame, fps, damping = 10, stiffness = 100, mass = 1 } = options;

  if (frame < 0) return 0;

  const time = frame / fps;
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  let value: number;

  if (zeta < 1) {
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    value = 1 - Math.exp(-zeta * omega * time) *
      (Math.cos(omegaD * time) + (zeta * omega / omegaD) * Math.sin(omegaD * time));
  } else if (zeta === 1) {
    value = 1 - Math.exp(-omega * time) * (1 + omega * time);
  } else {
    const s1 = -omega * (zeta + Math.sqrt(zeta * zeta - 1));
    const s2 = -omega * (zeta - Math.sqrt(zeta * zeta - 1));
    value = 1 + (s2 * Math.exp(s1 * time) - s1 * Math.exp(s2 * time)) / (s1 - s2);
  }

  return Math.max(0, Math.min(1, value));
}

/**
 * Easing functions
 */
export const easing = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  bounce: (t: number) => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
  elastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
  },
};

/**
 * Video config type
 */
export interface VideoConfig {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
}

/**
 * Presets
 */
export const presets = {
  // Instagram
  instagramStory: { width: 1080, height: 1920, fps: 30, durationInFrames: 150 },
  instagramPost: { width: 1080, height: 1080, fps: 30, durationInFrames: 150 },
  instagramReel: { width: 1080, height: 1920, fps: 30, durationInFrames: 450 },

  // YouTube
  youtube: { width: 1920, height: 1080, fps: 30, durationInFrames: 150 },
  youtubeShort: { width: 1080, height: 1920, fps: 30, durationInFrames: 450 },

  // TikTok
  tiktok: { width: 1080, height: 1920, fps: 30, durationInFrames: 450 },
};

export const defaultConfig: VideoConfig = presets.instagramStory;

/**
 * Animation props
 */
export interface AnimationProps {
  frame: number;
  config: VideoConfig;
}
