/**
 * Schroeder Reverb + Soft-knee Compressor
 * Zero-dependency DSP for stereo master chain
 */

import type { StereoBuffer } from "./types";

// ─── SCHROEDER REVERB ─────────────────────────────────

interface CombState {
  buffer: Float32Array;
  index: number;
  filterStore: number;
}

interface AllpassState {
  buffer: Float32Array;
  index: number;
}

// Mutually prime delay lengths @44.1kHz
const COMB_DELAYS = [1557, 1617, 1491, 1422];
const ALLPASS_DELAYS = [225, 556];

// L/R offset for stereo width (samples)
const STEREO_OFFSET = 23;

function createCombState(delay: number): CombState {
  return { buffer: new Float32Array(delay), index: 0, filterStore: 0 };
}

function createAllpassState(delay: number): AllpassState {
  return { buffer: new Float32Array(delay), index: 0 };
}

function processComb(
  input: number,
  state: CombState,
  feedback: number,
  damping: number,
): number {
  const output = state.buffer[state.index];

  // One-pole lowpass damping on feedback path
  state.filterStore = output * (1 - damping) + state.filterStore * damping;

  state.buffer[state.index] = input + state.filterStore * feedback;
  state.index = (state.index + 1) % state.buffer.length;

  return output;
}

function processAllpass(input: number, state: AllpassState, feedback: number): number {
  const buffered = state.buffer[state.index];
  const output = -input + buffered;

  state.buffer[state.index] = input + buffered * feedback;
  state.index = (state.index + 1) % state.buffer.length;

  return output;
}

export interface ReverbConfig {
  wet: number;
  roomSize?: number;
  damping?: number;
}

export function applyReverb(stereo: StereoBuffer, config: ReverbConfig): void {
  const { left, right, sampleRate } = stereo;
  const wet = config.wet;
  const dry = 1 - wet;
  const roomSize = config.roomSize ?? 0.5;
  const damping = config.damping ?? 0.5;
  const feedback = 0.7 + roomSize * 0.28; // 0.7-0.98 range

  // Scale delays for sample rate
  const scale = sampleRate / 44100;

  // Create states for L and R channels
  const combsL = COMB_DELAYS.map((d) => createCombState(Math.round(d * scale)));
  const combsR = COMB_DELAYS.map((d) => createCombState(Math.round((d + STEREO_OFFSET) * scale)));
  const allpassL = ALLPASS_DELAYS.map((d) => createAllpassState(Math.round(d * scale)));
  const allpassR = ALLPASS_DELAYS.map((d) => createAllpassState(Math.round((d + STEREO_OFFSET) * scale)));

  // Extend buffer for reverb tail (~1s)
  const tailSamples = Math.round(sampleRate * 1.0);
  const totalLen = left.length + tailSamples;
  const newLeft = new Float32Array(totalLen);
  const newRight = new Float32Array(totalLen);
  newLeft.set(left);
  newRight.set(right);

  for (let i = 0; i < totalLen; i++) {
    const inputL = newLeft[i];
    const inputR = newRight[i];

    // Parallel comb filters
    let combOutL = 0;
    let combOutR = 0;
    for (let c = 0; c < 4; c++) {
      combOutL += processComb(inputL, combsL[c], feedback, damping);
      combOutR += processComb(inputR, combsR[c], feedback, damping);
    }
    combOutL *= 0.25;
    combOutR *= 0.25;

    // Series allpass filters
    let apL = combOutL;
    let apR = combOutR;
    for (let a = 0; a < 2; a++) {
      apL = processAllpass(apL, allpassL[a], 0.5);
      apR = processAllpass(apR, allpassR[a], 0.5);
    }

    newLeft[i] = inputL * dry + apL * wet;
    newRight[i] = inputR * dry + apR * wet;
  }

  // Replace stereo buffer arrays (reassign via property)
  stereo.left = newLeft;
  stereo.right = newRight;
}

// ─── SOFT-KNEE COMPRESSOR ─────────────────────────────

export interface CompressorConfig {
  threshold: number; // dB
  ratio: number;
  attack: number; // seconds
  release: number; // seconds
  knee?: number; // dB (default 0 = hard knee)
  makeupGain?: number; // dB
}

function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

function linearToDb(linear: number): number {
  return 20 * Math.log10(Math.max(linear, 1e-10));
}

function computeGainReduction(inputDb: number, threshold: number, ratio: number, knee: number): number {
  const halfKnee = knee / 2;

  if (inputDb <= threshold - halfKnee) {
    // Below knee — no compression
    return 0;
  } else if (inputDb >= threshold + halfKnee) {
    // Above knee — full compression
    return (inputDb - threshold) * (1 - 1 / ratio);
  } else {
    // In soft-knee zone — quadratic transition
    const x = inputDb - threshold + halfKnee;
    return (x * x * (1 - 1 / ratio)) / (2 * knee);
  }
}

export function applyCompressor(stereo: StereoBuffer, config: CompressorConfig): void {
  const { left, right, sampleRate } = stereo;
  const threshold = config.threshold;
  const ratio = config.ratio;
  const knee = config.knee ?? 0;
  const makeupLinear = dbToLinear(config.makeupGain ?? 0);

  // Ballistics coefficients
  const attackCoeff = Math.exp(-1 / (config.attack * sampleRate));
  const releaseCoeff = Math.exp(-1 / (config.release * sampleRate));

  let envDb = 0; // Envelope follower in dB

  for (let i = 0; i < left.length; i++) {
    // Linked stereo detection: max of |L| and |R|
    const peak = Math.max(Math.abs(left[i]), Math.abs(right[i]));
    const inputDb = linearToDb(peak);

    // Gain reduction target
    const targetGr = computeGainReduction(inputDb, threshold, ratio, knee);

    // Smooth with attack/release ballistics
    if (targetGr > envDb) {
      envDb = attackCoeff * envDb + (1 - attackCoeff) * targetGr;
    } else {
      envDb = releaseCoeff * envDb + (1 - releaseCoeff) * targetGr;
    }

    // Apply gain
    const gainLinear = dbToLinear(-envDb) * makeupLinear;
    left[i] *= gainLinear;
    right[i] *= gainLinear;
  }
}
