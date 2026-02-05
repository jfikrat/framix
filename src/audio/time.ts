export interface BBT {
  bar: number;
  beat: number;
  tick: number;
}

export interface TimeConfig {
  bpm: number;
  beatsPerBar: number;
  ppq: number; // Pulses (ticks) per quarter note
}

export const DEFAULT_TIME_CONFIG: TimeConfig = {
  bpm: 120,
  beatsPerBar: 4,
  ppq: 480,
};

/**
 * Converts BBT (Bars, Beats, Ticks) to total beats as a decimal.
 * Assumes 0-indexed bars and beats.
 */
export function bbtToBeats(bbt: BBT, config: TimeConfig = DEFAULT_TIME_CONFIG): number {
  return bbt.bar * config.beatsPerBar + bbt.beat + bbt.tick / config.ppq;
}

/**
 * Converts BBT to seconds.
 */
export function bbtToSeconds(bbt: BBT, config: TimeConfig = DEFAULT_TIME_CONFIG): number {
  const beats = bbtToBeats(bbt, config);
  return beats * (60 / config.bpm);
}

/**
 * Converts BBT to audio samples.
 */
export function bbtToSamples(
  bbt: BBT,
  sampleRate: number,
  config: TimeConfig = DEFAULT_TIME_CONFIG,
): number {
  return Math.round(bbtToSeconds(bbt, config) * sampleRate);
}

/**
 * Converts BBT to video frames.
 */
export function bbtToFrames(
  bbt: BBT,
  fps: number,
  config: TimeConfig = DEFAULT_TIME_CONFIG,
): number {
  return Math.round(bbtToSeconds(bbt, config) * fps);
}

/**
 * Converts seconds back to BBT.
 */
export function secondsToBBT(seconds: number, config: TimeConfig = DEFAULT_TIME_CONFIG): BBT {
  const totalBeats = seconds / (60 / config.bpm);
  const bar = Math.floor(totalBeats / config.beatsPerBar);
  const remainingBeats = totalBeats % config.beatsPerBar;
  const beat = Math.floor(remainingBeats);
  const tick = Math.round((remainingBeats - beat) * config.ppq);
  
  return { bar, beat, tick };
}
