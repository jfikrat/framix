/**
 * Biquad Filter — Direct Form II Transposed
 * Robert Bristow-Johnson Audio EQ Cookbook formulas
 */

export interface BiquadCoefficients {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

export interface BiquadState {
  z1: number;
  z2: number;
}

export function computeCoefficients(
  type: "lowpass" | "highpass" | "bandpass",
  cutoff: number,
  Q: number,
  sampleRate: number,
): BiquadCoefficients {
  const w0 = (2 * Math.PI * cutoff) / sampleRate;
  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const alpha = sinW0 / (2 * Q);

  let b0: number, b1: number, b2: number, a0: number, a1: number, a2: number;

  switch (type) {
    case "lowpass":
      b0 = (1 - cosW0) / 2;
      b1 = 1 - cosW0;
      b2 = (1 - cosW0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosW0;
      a2 = 1 - alpha;
      break;
    case "highpass":
      b0 = (1 + cosW0) / 2;
      b1 = -(1 + cosW0);
      b2 = (1 + cosW0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosW0;
      a2 = 1 - alpha;
      break;
    case "bandpass":
      b0 = alpha;
      b1 = 0;
      b2 = -alpha;
      a0 = 1 + alpha;
      a1 = -2 * cosW0;
      a2 = 1 - alpha;
      break;
  }

  // Normalize by a0
  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0,
  };
}

/** Process samples in-place using Direct Form II Transposed */
export function processBiquad(
  samples: Float32Array,
  coeffs: BiquadCoefficients,
  state?: BiquadState,
): BiquadState {
  const s = state ?? { z1: 0, z2: 0 };
  const { b0, b1, b2, a1, a2 } = coeffs;

  for (let i = 0; i < samples.length; i++) {
    const x = samples[i];
    const y = b0 * x + s.z1;
    s.z1 = b1 * x - a1 * y + s.z2;
    s.z2 = b2 * x - a2 * y;
    samples[i] = y;
  }

  return s;
}

/** Convenience: compute coefficients and process in one call */
export function applyBiquadFilter(
  samples: Float32Array,
  type: "lowpass" | "highpass" | "bandpass",
  cutoff: number,
  Q: number,
  sampleRate: number,
): void {
  const coeffs = computeCoefficients(type, cutoff, Q, sampleRate);
  processBiquad(samples, coeffs);
}
