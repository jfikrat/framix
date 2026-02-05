import type { AudioTrack } from "./types";
import { mixTrack } from "./mix";

export class AudioPreview {
  private ctx: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private playing = false;
  private startTime = 0;
  private startOffset = 0;
  private fps: number;
  private totalFrames: number;

  constructor(track: AudioTrack, totalFrames: number, fps: number) {
    this.fps = fps;
    this.totalFrames = totalFrames;
    this.init(track);
  }

  private async init(track: AudioTrack) {
    this.ctx = new AudioContext();
    this.gainNode = this.ctx.createGain();
    this.gainNode.connect(this.ctx.destination);

    const sampleRate = this.ctx.sampleRate;
    const stereo = mixTrack(track, this.totalFrames, this.fps, sampleRate);

    // Create stereo AudioBuffer
    this.buffer = this.ctx.createBuffer(2, stereo.left.length, sampleRate);
    this.buffer.getChannelData(0).set(stereo.left);
    this.buffer.getChannelData(1).set(stereo.right);
  }

  play(fromFrame: number = 0) {
    if (!this.ctx || !this.buffer || !this.gainNode) return;

    this.stop();

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.source = this.ctx.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.gainNode);

    this.startOffset = fromFrame / this.fps;
    this.startTime = this.ctx.currentTime;
    this.source.start(0, this.startOffset);
    this.playing = true;

    this.source.onended = () => {
      this.playing = false;
    };
  }

  pause() {
    if (!this.playing || !this.ctx || !this.source) return;

    this.startOffset += this.ctx.currentTime - this.startTime;
    this.source.stop();
    this.source.disconnect();
    this.source = null;
    this.playing = false;
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop();
        this.source.disconnect();
      } catch {
        // Already stopped
      }
      this.source = null;
    }
    this.playing = false;
    this.startOffset = 0;
  }

  seekToFrame(frame: number) {
    if (this.playing) {
      this.play(frame);
    } else {
      this.startOffset = frame / this.fps;
    }
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  setMuted(muted: boolean) {
    if (this.gainNode) {
      this.gainNode.gain.value = muted ? 0 : 1;
    }
  }

  get isPlaying() {
    return this.playing;
  }

  dispose() {
    this.stop();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.buffer = null;
    this.gainNode = null;
  }
}
