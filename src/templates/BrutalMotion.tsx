import React from "react";
import { interpolate, spring, type AnimationProps, type VideoConfig } from "../animations";
import type { TemplateMeta } from "./types";
import type { AudioTrack } from "../audio/types";

export const meta: TemplateMeta = {
  id: "brutal-motion",
  name: "Brutal Motion",
  category: "dynamic",
  color: "#FF0000",
};

// Per-template config override: 15 seconds
export const templateConfig: Partial<VideoConfig> = {
  durationInFrames: 450,
};

// ─── AUDIO TRACK ──────────────────────────────────────
// NOTE: attack/release/decay are in SECONDS (not frames)
const FPS = 30;
const f2s = (frames: number) => frames / FPS; // frame→seconds helper

export const audioTrack: AudioTrack = {
  bpm: 140,
  reverb: { wet: 0.15, roomSize: 0.6, damping: 0.4 },
  compressor: { threshold: -6, ratio: 4, attack: 0.003, release: 0.1, knee: 6 },
  events: [
    // ── Sub bass drone (underlying each act) ── pan: center
    { frame: 0,   duration: 90,  frequency: 40,  waveform: "sine",     volume: 0.35, attack: f2s(10), decay: 0.1, sustain: 0.9, release: f2s(8),  pan: 0, filter: { type: "lowpass", cutoff: 120 } },
    { frame: 102, duration: 95,  frequency: 38,  waveform: "sine",     volume: 0.35, attack: f2s(8),  decay: 0.1, sustain: 0.9, release: f2s(8),  pan: 0, filter: { type: "lowpass", cutoff: 120 } },
    { frame: 208, duration: 95,  frequency: 42,  waveform: "sine",     volume: 0.35, attack: f2s(8),  decay: 0.1, sustain: 0.9, release: f2s(8),  pan: 0, filter: { type: "lowpass", cutoff: 120 } },
    { frame: 315, duration: 130, frequency: 36,  waveform: "sine",     volume: 0.4,  attack: f2s(8),  decay: 0.15, sustain: 0.85, release: f2s(15), pan: 0, filter: { type: "lowpass", cutoff: 150 } },

    // ── Bass hits on act transitions ── pan: center
    { frame: 0,   duration: 8,  frequency: 55,  waveform: "square",   volume: 0.7, attack: 0, decay: 0.02, sustain: 0.6, release: f2s(4), pan: 0, distortion: 0.3, filter: { type: "lowpass", cutoff: 300 } },
    { frame: 102, duration: 8,  frequency: 52,  waveform: "square",   volume: 0.7, attack: 0, decay: 0.02, sustain: 0.6, release: f2s(4), pan: 0, distortion: 0.3, filter: { type: "lowpass", cutoff: 300 } },
    { frame: 208, duration: 8,  frequency: 58,  waveform: "square",   volume: 0.7, attack: 0, decay: 0.02, sustain: 0.6, release: f2s(4), pan: 0, distortion: 0.3, filter: { type: "lowpass", cutoff: 300 } },
    { frame: 315, duration: 10, frequency: 50,  waveform: "square",   volume: 0.8, attack: 0, decay: 0.03, sustain: 0.5, release: f2s(5), pan: 0, distortion: 0.4, filter: { type: "lowpass", cutoff: 350 } },

    // ── Kick drums on word entries ── pan: center
    // Act 1
    { frame: 8,   duration: 5, frequency: 150, waveform: "sine", volume: 0.6, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 40 },
    { frame: 25,  duration: 4, frequency: 140, waveform: "sine", volume: 0.5, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(2), pan: 0, pitchSlide: 35 },
    { frame: 45,  duration: 5, frequency: 150, waveform: "sine", volume: 0.6, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 40 },
    // Act 2
    { frame: 105, duration: 5, frequency: 150, waveform: "sine", volume: 0.6, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 40 },
    { frame: 118, duration: 4, frequency: 140, waveform: "sine", volume: 0.5, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(2), pan: 0, pitchSlide: 35 },
    { frame: 135, duration: 5, frequency: 160, waveform: "sine", volume: 0.65, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 42 },
    { frame: 160, duration: 5, frequency: 150, waveform: "sine", volume: 0.6, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 40 },
    // Act 3
    { frame: 212, duration: 5, frequency: 150, waveform: "sine", volume: 0.6, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 40 },
    { frame: 230, duration: 5, frequency: 150, waveform: "sine", volume: 0.6, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 40 },
    { frame: 250, duration: 6, frequency: 160, waveform: "sine", volume: 0.7, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 38 },
    // Act 4
    { frame: 318, duration: 5, frequency: 150, waveform: "sine", volume: 0.6, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 40 },
    { frame: 335, duration: 5, frequency: 160, waveform: "sine", volume: 0.65, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 42 },
    { frame: 372, duration: 5, frequency: 150, waveform: "sine", volume: 0.6, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 40 },
    { frame: 392, duration: 6, frequency: 170, waveform: "sine", volume: 0.7, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 38 },

    // ── Hi-hat pattern (8th notes, ~4.3 frames apart at 140bpm/30fps) ── pan: slight right
    ...Array.from({ length: 100 }, (_, i) => ({
      frame: Math.round(i * 4.3),
      duration: 2,
      frequency: 8000,
      waveform: "noise" as const,
      volume: i % 2 === 0 ? 0.12 : 0.07,
      attack: 0,
      release: f2s(1),
      pan: 0.3,
      filter: { type: "highpass" as const, cutoff: 6000 },
    })).filter(e => {
      // Silence during blackouts
      const f = e.frame;
      return !(f >= 93 && f < 102) && !(f >= 199 && f < 208) && !(f >= 306 && f < 315) && f < 450;
    }),

    // ── Reverse cymbal swells before act transitions ── pan: spread
    { frame: 78,  duration: 14, frequency: 5000, waveform: "noise", volume: 0.25, attack: f2s(12), release: 0, pan: -0.5, filter: { type: "highpass", cutoff: 3000 } },
    { frame: 185, duration: 14, frequency: 5000, waveform: "noise", volume: 0.25, attack: f2s(12), release: 0, pan: 0.5,  filter: { type: "highpass", cutoff: 3000 } },
    { frame: 292, duration: 14, frequency: 5000, waveform: "noise", volume: 0.25, attack: f2s(12), release: 0, pan: -0.5, filter: { type: "highpass", cutoff: 3000 } },

    // ── Rising pitch sweep in final act ──
    { frame: 400, duration: 45, frequency: 200, waveform: "saw", volume: 0.15, attack: f2s(5), release: f2s(10), pitchSlide: 2000, pan: 0, filter: { type: "lowpass", cutoff: 4000 } },

    // ── Period impact (frame 418) ── pan: center
    { frame: 418, duration: 12, frequency: 60,  waveform: "square",  volume: 0.9, attack: 0, decay: 0.01, sustain: 0.4, release: f2s(8), pan: 0, distortion: 0.5, filter: { type: "lowpass", cutoff: 400 } },
    { frame: 418, duration: 8,  frequency: 4000, waveform: "noise",  volume: 0.3, attack: 0, release: f2s(5), pan: 0, filter: { type: "highpass", cutoff: 2000 } },
  ],
};

// Deterministic noise for glitch effects
const noise = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

interface WordDef {
  text: string;
  enter: number;
  exit?: number;
  x: number;
  y: number;
  size: number;
  from: "left" | "right" | "top" | "bottom" | "scale";
  color?: string;
  rotation?: number;
  spacing?: string;
  damping?: number;
  stiffness?: number;
  mass?: number;
}

const WORDS: WordDef[] = [
  // ─── ACT 1: STOP THE SCROLL (0-92) ───
  { text: "STOP",   enter: 8,   exit: 93,  x: 0.50, y: 0.22, size: 0.22, from: "right",  damping: 10, stiffness: 100, mass: 1 },
  { text: "THE",    enter: 25,  exit: 93,  x: 0.18, y: 0.46, size: 0.085, from: "left",   color: "#FF0000", rotation: -3, spacing: "0.2em", damping: 14, stiffness: 140, mass: 0.4 },
  { text: "SCROLL", enter: 45,  exit: 93,  x: 0.50, y: 0.74, size: 0.18, from: "bottom", damping: 9, stiffness: 70, mass: 1.4 },

  // ─── ACT 2: MAKE THEM FEEL SOMETHING (102-198) ───
  { text: "MAKE",      enter: 105, exit: 199, x: 0.50, y: 0.18, size: 0.19, from: "top",    damping: 12, stiffness: 120, mass: 0.6 },
  { text: "THEM",      enter: 118, exit: 199, x: 0.50, y: 0.36, size: 0.19, from: "left",   damping: 12, stiffness: 120, mass: 0.6 },
  { text: "FEEL",      enter: 135, exit: 199, x: 0.50, y: 0.54, size: 0.25, from: "scale",  color: "#FF0000", damping: 8, stiffness: 70, mass: 1.2 },
  { text: "SOMETHING", enter: 160, exit: 199, x: 0.50, y: 0.78, size: 0.135, from: "bottom", spacing: "-0.02em", damping: 8, stiffness: 50, mass: 1.6 },

  // ─── ACT 3: DON'T BLEND IN (208-305) ───
  { text: "DON'T", enter: 212, exit: 306, x: 0.50, y: 0.25, size: 0.22, from: "right",  damping: 10, stiffness: 90, mass: 1 },
  { text: "BLEND", enter: 230, exit: 306, x: 0.50, y: 0.50, size: 0.20, from: "left",   damping: 10, stiffness: 90, mass: 1 },
  { text: "IN",    enter: 250, exit: 306, x: 0.50, y: 0.75, size: 0.30, from: "scale",  color: "#FF0000", damping: 7, stiffness: 60, mass: 1.5 },

  // ─── ACT 4: CREATE IMPACT / BE UNFORGETTABLE (315-450) ───
  { text: "CREATE", enter: 318, exit: 365, x: 0.50, y: 0.25, size: 0.18, from: "top",    damping: 12, stiffness: 120, mass: 0.6 },
  { text: "IMPACT", enter: 335, exit: 365, x: 0.50, y: 0.55, size: 0.22, from: "right",  color: "#FF0000", damping: 9, stiffness: 80, mass: 1 },
  { text: "BE",            enter: 372, x: 0.50, y: 0.28, size: 0.22, from: "scale", damping: 14, stiffness: 130, mass: 0.4 },
  { text: "UNFORGETTABLE", enter: 392, x: 0.50, y: 0.58, size: 0.105, from: "right", spacing: "-0.02em", damping: 6, stiffness: 35, mass: 2.2 },
];

export const BrutalMotion: React.FC<AnimationProps> = ({ frame, config }) => {
  const { width, height, fps, durationInFrames } = config;

  // ─── ACT DETECTION ────────────────────────────────
  const act = frame < 93 ? 1 : frame < 199 ? 2 : frame < 306 ? 3 : 4;

  // ─── FLASH FRAMES (at transitions + word hits) ────
  const flashFrames = new Set([
    23, 24,     // before "THE"
    43, 44,     // before "SCROLL"
    91, 92,     // act 1→2
    133, 134,   // before "FEEL"
    158, 159,   // before "SOMETHING"
    197, 198,   // act 2→3
    248, 249,   // before "IN"
    304, 305,   // act 3→4
    333, 334,   // before "IMPACT"
    390, 391,   // before "UNFORGETTABLE"
    415, 416,   // period drop
  ]);
  const isFlash = flashFrames.has(frame);
  const bg = isFlash ? "#F5F5F5" : "#0A0A0A";
  const fg = isFlash ? "#0A0A0A" : "#F5F5F5";

  // ─── INTER-ACT BLACKOUT ──────────────────────────
  const isBlackout = (frame >= 93 && frame < 102) || (frame >= 199 && frame < 208) || (frame >= 306 && frame < 315);

  // ─── GRID ─────────────────────────────────────────
  const actStart = act === 1 ? 0 : act === 2 ? 102 : act === 3 ? 208 : 315;
  const gridAlpha = isBlackout ? 0 : interpolate(frame - actStart, [0, 12], [0, 0.1], { clamp: true });

  // ─── SCAN LINE ────────────────────────────────────
  const scanY = (frame * 11) % (height + 40) - 20;

  // ─── GLITCH ───────────────────────────────────────
  const glitchActive = frame % 13 < 2;
  const gx = glitchActive ? (noise(frame) - 0.5) * 14 : 0;
  const gy = glitchActive ? (noise(frame + 99) - 0.5) * 10 : 0;

  // ─── CHROMATIC ABERRATION ─────────────────────────
  const chromaSet = new Set([25, 26, 45, 46, 102, 103, 135, 136, 212, 213, 250, 251, 318, 319, 392, 393]);
  const chroma = chromaSet.has(frame) ? 5 : 0;

  // ─── RED ACCENT BARS (per act) ────────────────────
  const bar1W = (act === 1 && frame >= 22)
    ? interpolate(frame, [22, 35], [0, width * 0.65], { clamp: true }) : 0;
  const bar2W = (act === 2 && frame >= 130)
    ? interpolate(frame, [130, 142], [0, width * 0.5], { clamp: true }) : 0;
  const bar3W = (act === 3 && frame >= 245)
    ? interpolate(frame, [245, 258], [0, width * 0.6], { clamp: true }) : 0;
  const bar4W = (act === 4 && frame >= 385)
    ? interpolate(frame, [385, 400], [0, width * 0.75], { clamp: true }) : 0;

  // ─── VERTICAL STRIPE ──────────────────────────────
  const stripeH = (frame >= 65 && frame < 93)
    ? interpolate(frame, [65, 85], [0, height * 0.5], { clamp: true })
    : (frame >= 275 && frame < 306)
      ? interpolate(frame, [275, 295], [0, height * 0.5], { clamp: true })
      : (frame >= 400)
        ? interpolate(frame, [400, 420], [0, height * 0.6], { clamp: true })
        : 0;

  // ─── CORNER BRACKETS ──────────────────────────────
  const bracketFrameStart = act === 1 ? 70 : act === 2 ? 175 : act === 3 ? 280 : 410;
  const actEnd = act === 1 ? 93 : act === 2 ? 199 : act === 3 ? 306 : durationInFrames;
  const bracketSize = (frame >= bracketFrameStart && frame < actEnd)
    ? interpolate(frame, [bracketFrameStart, bracketFrameStart + 12], [0, 130], { clamp: true })
    : 0;

  // ─── PERIOD (Act 4 finale) ─────────────────────────
  const periodEnter = 418;
  const periodSpring = frame >= periodEnter
    ? spring({ frame: frame - periodEnter, fps, damping: 10, stiffness: 80, mass: 1 })
    : 0;

  // ─── HORIZONTAL GLITCH BARS ───────────────────────
  const showGlitchBar = (frame >= 22 && frame <= 24) ||
    (frame >= 43 && frame <= 45) ||
    (frame >= 133 && frame <= 135) ||
    (frame >= 247 && frame <= 249) ||
    (frame >= 332 && frame <= 334) ||
    (frame >= 389 && frame <= 391);

  // ─── FINAL PULSE ──────────────────────────────────
  const pulse = frame >= 430
    ? 1 + Math.sin((frame - 430) * 0.2) * 0.005
    : 1;

  // ─── EXIT ─────────────────────────────────────────
  const exitScale = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 1.15], { clamp: true });
  const exitOp = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { clamp: true });

  // ─── ACT NUMBER (top right) ────────────────────────
  const actLabel = isBlackout ? "" : `0${act}/04`;

  return (
    <div
      style={{
        width,
        height,
        background: isBlackout ? "#000" : bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Arial Black', 'Impact', system-ui, sans-serif",
        transform: `scale(${pulse * exitScale})`,
        opacity: exitOp,
      }}
    >
      {/* ── GRID ── */}
      {gridAlpha > 0 && (
        <svg
          width={width}
          height={height}
          style={{ position: "absolute", inset: 0, opacity: gridAlpha, pointerEvents: "none" }}
        >
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`v${i}`} x1={(width / 12) * (i + 1)} y1={0} x2={(width / 12) * (i + 1)} y2={height} stroke="#fff" strokeWidth={0.5} />
          ))}
          {Array.from({ length: 19 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={(height / 20) * (i + 1)} x2={width} y2={(height / 20) * (i + 1)} stroke="#fff" strokeWidth={0.5} />
          ))}
          {[3, 6, 9].flatMap((col) =>
            [4, 10, 16].map((row) => {
              const cx = (width / 12) * col;
              const cy = (height / 20) * row;
              return (
                <g key={`c${col}-${row}`}>
                  <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke="#FF0000" strokeWidth={1} />
                  <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} stroke="#FF0000" strokeWidth={1} />
                </g>
              );
            })
          )}
        </svg>
      )}

      {/* ── SCANLINES ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.015) 3px, rgba(255,255,255,0.015) 4px)`,
          pointerEvents: "none",
        }}
      />

      {/* ── MOVING SCAN LINE ── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: scanY,
          width: "100%",
          height: 2,
          background: "rgba(255, 0, 0, 0.25)",
          boxShadow: "0 0 12px rgba(255, 0, 0, 0.12)",
          pointerEvents: "none",
        }}
      />

      {/* ── GLITCH BARS ── */}
      {showGlitchBar && (
        <>
          <div style={{ position: "absolute", left: 0, top: noise(frame * 7) * height * 0.6 + height * 0.1, width: "100%", height: 15 + noise(frame * 3) * 30, background: "#FF0000", opacity: 0.12, pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: 0, top: noise(frame * 13) * height * 0.4 + height * 0.5, width: "100%", height: 8 + noise(frame * 5) * 20, background: "#fff", opacity: 0.05, pointerEvents: "none" }} />
        </>
      )}

      {/* ── RED ACCENT BARS ── */}
      {bar1W > 0 && <div style={{ position: "absolute", left: width * 0.15, top: height * 0.42, width: bar1W, height: 3, background: "#FF0000" }} />}
      {bar2W > 0 && <div style={{ position: "absolute", left: width * 0.25, top: height * 0.45, width: bar2W, height: 3, background: "#FF0000" }} />}
      {bar3W > 0 && <div style={{ position: "absolute", left: width * 0.18, top: height * 0.62, width: bar3W, height: 3, background: "#FF0000" }} />}
      {bar4W > 0 && <div style={{ position: "absolute", left: width * 0.12, top: height * 0.44, width: bar4W, height: 4, background: "#FF0000" }} />}

      {/* ── VERTICAL RED STRIPE ── */}
      {stripeH > 0 && (
        <div style={{ position: "absolute", right: width * 0.08, top: height * 0.2, width: 3, height: stripeH, background: "#FF0000" }} />
      )}

      {/* ── WORDS ── */}
      {WORDS.map((w, i) => {
        if (frame < w.enter) return null;
        if (w.exit && frame >= w.exit) return null;

        const localFrame = frame - w.enter;
        const s = spring({
          frame: localFrame,
          fps,
          damping: w.damping ?? 10,
          stiffness: w.stiffness ?? 100,
          mass: w.mass ?? 1,
        });

        const opacity = Math.min(1, localFrame / 3);
        const wordColor = w.color || fg;
        const fontSize = Math.round(width * w.size);

        // Entrance transforms
        let translateX = 0;
        let translateY = 0;
        let scale = 1;

        switch (w.from) {
          case "right":
            translateX = interpolate(s, [0, 1], [width * 0.8, 0]);
            scale = interpolate(s, [0, 1], [3, 1]);
            break;
          case "left":
            translateX = interpolate(s, [0, 1], [-width * 0.6, 0]);
            break;
          case "top":
            translateY = interpolate(s, [0, 1], [-height * 0.4, 0]);
            scale = interpolate(s, [0, 1], [2.5, 1]);
            break;
          case "bottom":
            translateY = interpolate(s, [0, 1], [height * 0.5, 0]);
            scale = interpolate(s, [0, 1], [3, 1]);
            break;
          case "scale":
            scale = interpolate(s, [0, 1], [5, 1]);
            break;
        }

        // Exit animation (quick scale down before act transition)
        let exitOpacity = 1;
        let exitScale = 1;
        if (w.exit) {
          exitOpacity = interpolate(frame, [w.exit - 5, w.exit], [1, 0], { clamp: true });
          exitScale = interpolate(frame, [w.exit - 5, w.exit], [1, 0.85], { clamp: true });
        }

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: w.x * width + gx,
              top: w.y * height + gy,
              transform: `translate(-50%, -50%) translate(${translateX}px, ${translateY}px) scale(${scale * exitScale}) rotate(${w.rotation ?? 0}deg)`,
              fontSize,
              fontWeight: 900,
              color: wordColor,
              opacity: opacity * exitOpacity,
              letterSpacing: w.spacing ?? "-0.04em",
              lineHeight: 0.85,
              whiteSpace: "nowrap",
              textShadow: w.color === "#FF0000" ? "0 0 40px rgba(255, 0, 0, 0.4)" : "none",
            }}
          >
            {/* Chromatic aberration */}
            {chroma > 0 && (
              <>
                <span style={{ position: "absolute", left: -chroma, top: 0, color: "#FF0000", opacity: 0.6 }}>{w.text}</span>
                <span style={{ position: "absolute", left: chroma, top: 0, color: "#0066FF", opacity: 0.6 }}>{w.text}</span>
              </>
            )}
            {w.text}
          </div>
        );
      })}

      {/* ── PERIOD (Act 3 dramatic punctuation) ── */}
      {frame >= periodEnter && (
        <div
          style={{
            position: "absolute",
            right: width * 0.1,
            bottom: height * 0.12,
            fontSize: Math.round(width * 0.35),
            fontWeight: 900,
            color: "#FF0000",
            opacity: interpolate(frame, [periodEnter, periodEnter + 3], [0, 1], { clamp: true }),
            lineHeight: 0.5,
            transform: `scale(${periodSpring})`,
          }}
        >
          .
        </div>
      )}

      {/* ── CORNER BRACKETS ── */}
      {bracketSize > 0 && (
        <>
          <div style={{ position: "absolute", bottom: 70, left: 30, width: bracketSize, height: bracketSize, borderLeft: "3px solid #FF0000", borderBottom: "3px solid #FF0000" }} />
          <div style={{ position: "absolute", top: 50, right: 30, width: bracketSize * 0.7, height: bracketSize * 0.7, borderRight: "3px solid #FF0000", borderTop: "3px solid #FF0000" }} />
        </>
      )}

      {/* ── ACT NUMBER ── */}
      {actLabel && (
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 28,
            fontFamily: "'Courier New', monospace",
            fontSize: 48,
            fontWeight: 900,
            color: "rgba(255, 0, 0, 0.08)",
            letterSpacing: "0.05em",
          }}
        >
          {actLabel}
        </div>
      )}

      {/* ── SYSTEM INFO ── */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 28,
          fontFamily: "'Courier New', monospace",
          fontSize: 11,
          color: "rgba(255,255,255,0.15)",
          letterSpacing: "0.05em",
          opacity: isBlackout ? 0 : interpolate(frame - actStart, [3, 10], [0, 1], { clamp: true }),
        }}
      >
        {width}x{height} — {fps}FPS
      </div>

      {/* ── FRAME COUNTER ── */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          right: 28,
          fontFamily: "'Courier New', monospace",
          fontSize: 12,
          color: "#FF0000",
          opacity: isBlackout ? 0 : 0.4,
          letterSpacing: "0.1em",
        }}
      >
        FR {String(frame).padStart(3, "0")}/{durationInFrames}
      </div>

      {/* ── GRAIN OVERLAY ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          pointerEvents: "none",
          background: `repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)`,
        }}
      />
    </div>
  );
};
