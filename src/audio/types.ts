export type Waveform = "sine" | "square" | "saw" | "triangle" | "noise";

export interface BBT {
  bar: number;
  beat: number;
  tick: number;
}

export interface AudioEvent {
  frame?: number;
  bbt?: BBT;
  duration: number;
  durationBeats?: number;
  frequency?: number;
  waveform?: Waveform;
  volume?: number;
  /** Attack time in seconds */
  attack?: number;
  /** Decay time in seconds */
  decay?: number;
  /** Sustain level 0-1 */
  sustain?: number;
  /** Release time in seconds */
  release?: number;
  pan?: number;
  pitchSlide?: number;
  distortion?: number;
  filter?: { type: "lowpass" | "highpass" | "bandpass"; cutoff: number; Q?: number };
  /** Per-event reverb wet override (0-1) */
  reverb?: number;
}

export interface StereoBuffer {
  left: Float32Array;
  right: Float32Array;
  sampleRate: number;
}

export interface AudioTrack {
  bpm?: number;
  beatsPerBar?: number;
  ppq?: number;
  events: AudioEvent[];
  reverb?: { wet: number; roomSize?: number; damping?: number };
  compressor?: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    knee?: number;
    makeupGain?: number;
  };
}
