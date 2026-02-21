import type { AudioEvent, Waveform } from "./types";
import { applyBiquadFilter } from "./filter";

// Deterministic noise PRNG
let noiseSeed = 0;
function noiseValue(): number {
  noiseSeed = (noiseSeed * 1664525 + 1013904223) & 0xffffffff;
  return ((noiseSeed >>> 0) / 0xffffffff) * 2 - 1;
}

/** PolyBLEP residual for anti-aliased waveforms */
function polyBLEP(t: number, dt: number): number {
  if (t < dt) {
    const n = t / dt;
    return n + n - n * n - 1;
  }
  if (t > 1 - dt) {
    const n = (t - 1) / dt;
    return n * n + n + n + 1;
  }
  return 0;
}

export function oscillator(phase: number, waveform: Waveform, dt: number = 0): number {
  // Normalize phase to 0-1
  const p = phase - Math.floor(phase);

  switch (waveform) {
    case "sine":
      return Math.sin(p * Math.PI * 2);
    case "square": {
      let value = p < 0.5 ? 1 : -1;
      if (dt > 0) {
        value += polyBLEP(p, dt);
        value -= polyBLEP((p + 0.5) % 1, dt);
      }
      return value;
    }
    case "saw": {
      let value = 2 * p - 1;
      if (dt > 0) {
        value -= polyBLEP(p, dt);
      }
      return value;
    }
    case "triangle":
      return p < 0.5 ? 4 * p - 1 : 3 - 4 * p;
    case "noise":
      return noiseValue();
    default:
      return 0;
  }
}

/**
 * Full ADSR envelope with exponential curves.
 * attack/decay/release in seconds, sustain 0-1.
 */
export function envelope(
  sampleIndex: number,
  totalSamples: number,
  event: AudioEvent,
  sampleRate: number,
): number {
  const attackTime = event.attack ?? 0;
  const decayTime = event.decay ?? 0;
  const sustainLevel = event.sustain ?? 1;
  const releaseTime = event.release ?? 0;

  const attackSamples = attackTime * sampleRate;
  const decaySamples = decayTime * sampleRate;
  const releaseSamples = releaseTime * sampleRate;

  const releaseStart = totalSamples - releaseSamples;

  // Release phase (exponential decay from current level)
  if (releaseSamples > 0 && sampleIndex >= releaseStart) {
    const releaseT = (sampleIndex - releaseStart) / releaseSamples;
    // Figure out what level we'd be at when release starts
    const levelAtRelease = getADSLevel(releaseStart, attackSamples, decaySamples, sustainLevel);
    return levelAtRelease * Math.exp(-5 * releaseT);
  }

  return getADSLevel(sampleIndex, attackSamples, decaySamples, sustainLevel);
}

/** Attack → Decay → Sustain level (no release) */
function getADSLevel(
  sampleIndex: number,
  attackSamples: number,
  decaySamples: number,
  sustainLevel: number,
): number {
  // Attack: exponential rise 0→1
  if (attackSamples > 0 && sampleIndex < attackSamples) {
    const t = sampleIndex / attackSamples;
    return 1 - Math.exp(-5 * t);
  }

  // Decay: exponential fall 1→sustain
  const decayStart = attackSamples;
  if (decaySamples > 0 && sampleIndex < decayStart + decaySamples) {
    const t = (sampleIndex - decayStart) / decaySamples;
    return sustainLevel + (1 - sustainLevel) * Math.exp(-5 * t);
  }

  // Sustain
  return sustainLevel;
}

function applyDistortion(sample: number, amount: number): number {
  if (amount <= 0) return sample;
  const k = amount * 50;
  return Math.tanh(k * sample) / Math.tanh(k);
}

export function renderEvent(
  event: AudioEvent,
  sampleRate: number,
  fps: number,
  bpm?: number,
): Float32Array {
  // Duration: prefer durationBeats (requires bpm) over frame-based duration
  const durationSeconds =
    event.durationBeats !== undefined && bpm !== undefined && bpm > 0
      ? (event.durationBeats * 60) / bpm
      : event.duration / fps;
  const totalSamples = Math.round(durationSeconds * sampleRate);
  const samples = new Float32Array(totalSamples);

  const freq = event.frequency ?? 440;
  const waveform = event.waveform ?? "sine";
  const volume = event.volume ?? 0.8;
  const endFreq = event.pitchSlide ?? freq;

  let phase = 0;

  // Deterministic noise seed: use BBT hash if available, else frame-based
  if (event.bbt) {
    noiseSeed = (event.bbt.bar * 10000 + event.bbt.beat * 100 + event.bbt.tick) * 12345;
  } else {
    noiseSeed = Math.round((event.frame ?? 0) * 12345);
  }

  for (let i = 0; i < totalSamples; i++) {
    const t = i / totalSamples;

    // Interpolate frequency for pitch slide
    const currentFreq = freq + (endFreq - freq) * t;
    const dt = currentFreq / sampleRate;

    // Generate sample with PolyBLEP
    let sample = oscillator(phase, waveform, dt);

    // Apply ADSR envelope
    sample *= envelope(i, totalSamples, event, sampleRate);

    // Apply volume
    sample *= volume;

    // Apply distortion
    if (event.distortion && event.distortion > 0) {
      sample = applyDistortion(sample, event.distortion);
    }

    samples[i] = sample;

    // Advance phase
    phase += dt;
  }

  // Apply biquad filter if specified
  if (event.filter) {
    applyBiquadFilter(
      samples,
      event.filter.type,
      event.filter.cutoff,
      event.filter.Q ?? 0.707,
      sampleRate,
    );
  }

  return samples;
}

// Backward-compatible renderTrack re-exported from mix.ts
export { renderTrack } from "./mix";
