import type { StereoBuffer } from "./types";

/** Encode a StereoBuffer as interleaved 16-bit PCM WAV */
export function stereoToWav(stereo: StereoBuffer): Uint8Array {
  const { left, right, sampleRate } = stereo;
  const numChannels = 2;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const numSamples = left.length;
  const dataSize = numSamples * numChannels * bytesPerSample;
  const headerSize = 44;
  const buffer = new Uint8Array(headerSize + dataSize);
  const view = new DataView(buffer.buffer);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");

  // fmt chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // Interleaved PCM: L R L R L R ...
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const clampL = Math.max(-1, Math.min(1, left[i]));
    const clampR = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset, clampL < 0 ? clampL * 0x8000 : clampL * 0x7fff, true);
    offset += 2;
    view.setInt16(offset, clampR < 0 ? clampR * 0x8000 : clampR * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

export function samplesToWav(samples: Float32Array, sampleRate: number): Uint8Array {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const dataSize = samples.length * bytesPerSample;
  const headerSize = 44;
  const buffer = new Uint8Array(headerSize + dataSize);
  const view = new DataView(buffer.buffer);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");

  // fmt chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // byte rate
  view.setUint16(32, numChannels * bytesPerSample, true); // block align
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  return buffer;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
