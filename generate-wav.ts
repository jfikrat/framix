import { writeFileSync } from "fs";

const sampleRate = 44100;
const bpm = 120;
const beatsPerBar = 4;
const bars = 2;
const secondsPerBeat = 60 / bpm;
const totalSeconds = beatsPerBar * bars * secondsPerBeat;
const totalSamples = Math.floor(totalSeconds * sampleRate);

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

function env(t: number, a: number, d: number) {
  if (t < 0) return 0;
  if (t < a) return t / a;
  return Math.exp(-(t - a) / d);
}

function kick(t: number) {
  const a = 0.005;
  const d = 0.25;
  const e = env(t, a, d);
  const f0 = 120;
  const f1 = 45;
  const sweep = f1 + (f0 - f1) * Math.exp(-t * 16);
  return Math.sin(2 * Math.PI * sweep * t) * e * 0.9;
}

function snare(t: number) {
  const a = 0.003;
  const d = 0.18;
  const e = env(t, a, d);
  const noise = (Math.random() * 2 - 1) * 0.6;
  const tone = Math.sin(2 * Math.PI * 180 * t) * 0.4;
  return (noise + tone) * e;
}

function hihat(t: number) {
  const a = 0.001;
  const d = 0.05;
  const e = env(t, a, d);
  const noise = (Math.random() * 2 - 1);
  const hp = noise - (Math.random() * 2 - 1) * 0.5;
  return hp * e * 0.35;
}

const sequence: Array<{ beat: number; type: "kick" | "snare" | "hihat" }> = [];
for (let bar = 0; bar < bars; bar++) {
  const base = bar * beatsPerBar;
  sequence.push({ beat: base + 0, type: "kick" });
  sequence.push({ beat: base + 2, type: "kick" });
  sequence.push({ beat: base + 1, type: "snare" });
  sequence.push({ beat: base + 3, type: "snare" });
  for (let i = 0; i < beatsPerBar * 2; i++) {
    sequence.push({ beat: base + i * 0.5, type: "hihat" });
  }
}

const samples = new Int16Array(totalSamples);

for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;
  let v = 0;
  for (const hit of sequence) {
    const hitTime = hit.beat * secondsPerBeat;
    const dt = t - hitTime;
    if (dt < 0 || dt > 1) continue;
    if (hit.type === "kick") v += kick(dt);
    if (hit.type === "snare") v += snare(dt);
    if (hit.type === "hihat") v += hihat(dt);
  }
  v = clamp(v * 0.8);
  samples[i] = Math.round(v * 32767);
}

function writeWav(path: string, data: Int16Array) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = data.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < data.length; i++) {
    buffer.writeInt16LE(data[i], 44 + i * 2);
  }
  writeFileSync(path, buffer);
}

const outPath = "assets/drum-loop.wav";
writeWav(outPath, samples);
console.log(`Wrote ${outPath} (${totalSeconds.toFixed(2)}s at ${sampleRate}Hz)`);
