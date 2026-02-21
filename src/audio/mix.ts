/**
 * Stereo Mixdown Orchestrator
 * Per-event mono render → equal-power pan → stereo sum → master chain
 */

import type { AudioTrack, StereoBuffer } from "./types";
import { bbtToFrames, DEFAULT_TIME_CONFIG } from "./time";
import { renderEvent } from "./synth";
import { applyReverb } from "./effects";
import { applyCompressor } from "./effects";

/**
 * Render a full AudioTrack into a stereo buffer with master effects.
 */
export function mixTrack(
  track: AudioTrack,
  totalFrames: number,
  fps: number,
  sampleRate: number = 44100,
): StereoBuffer {
  const totalSamples = Math.round((totalFrames / fps) * sampleRate);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const timeConfig = {
    bpm: track.bpm ?? DEFAULT_TIME_CONFIG.bpm,
    beatsPerBar: track.beatsPerBar ?? DEFAULT_TIME_CONFIG.beatsPerBar,
    ppq: track.ppq ?? DEFAULT_TIME_CONFIG.ppq,
  };

  for (const event of track.events) {
    // Render mono samples for this event (pass bpm for durationBeats support)
    const mono = renderEvent(event, sampleRate, fps, timeConfig.bpm);

    // Calculate start position
    let startFrame = event.frame ?? 0;
    if (event.bbt) {
      startFrame = bbtToFrames(event.bbt, fps, timeConfig);
    }
    const startSample = Math.round((startFrame / fps) * sampleRate);

    // Equal-power panning: θ = π/4 × (pan + 1), L = cos(θ), R = sin(θ)
    const pan = event.pan ?? 0; // -1 (left) to +1 (right)
    const theta = (Math.PI / 4) * (pan + 1);
    const gainL = Math.cos(theta);
    const gainR = Math.sin(theta);

    // Sum into stereo buffer
    for (let i = 0; i < mono.length; i++) {
      const idx = startSample + i;
      if (idx >= 0 && idx < totalSamples) {
        left[idx] += mono[i] * gainL;
        right[idx] += mono[i] * gainR;
      }
    }
  }

  const stereo: StereoBuffer = { left, right, sampleRate };

  // Master chain: reverb → compressor
  if (track.reverb) {
    applyReverb(stereo, track.reverb);
  }

  if (track.compressor) {
    applyCompressor(stereo, track.compressor);
  } else {
    // Fallback: peak normalization (backward compat behavior)
    let peak = 0;
    for (let i = 0; i < stereo.left.length; i++) {
      const absL = Math.abs(stereo.left[i]);
      const absR = Math.abs(stereo.right[i]);
      if (absL > peak) peak = absL;
      if (absR > peak) peak = absR;
    }
    if (peak > 1) {
      const scale = 0.95 / peak;
      for (let i = 0; i < stereo.left.length; i++) {
        stereo.left[i] *= scale;
        stereo.right[i] *= scale;
      }
    }
  }

  return stereo;
}

/**
 * Backward-compatible mono renderTrack.
 * Delegates to mixTrack and returns mono downmix.
 */
export function renderTrack(
  track: AudioTrack,
  totalFrames: number,
  fps: number,
  sampleRate: number = 44100,
): Float32Array {
  const stereo = mixTrack(track, totalFrames, fps, sampleRate);

  // Mono downmix: (L + R) / 2
  const mono = new Float32Array(stereo.left.length);
  for (let i = 0; i < mono.length; i++) {
    mono[i] = (stereo.left[i] + stereo.right[i]) * 0.5;
  }

  // Peak normalize if clipping
  let peak = 0;
  for (let i = 0; i < mono.length; i++) {
    const abs = Math.abs(mono[i]);
    if (abs > peak) peak = abs;
  }
  if (peak > 1) {
    const scale = 0.95 / peak;
    for (let i = 0; i < mono.length; i++) {
      mono[i] *= scale;
    }
  }

  return mono;
}
