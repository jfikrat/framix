import React from "react";
import { interpolate, spring, easing, type AnimationProps, type VideoConfig } from "../animations";
import type { TemplateMeta, TimelineSegment } from "./types";
import type { AudioTrack } from "../audio/types";

export const meta: TemplateMeta = {
  id: "cobrain-promo",
  name: "Cobrain Promo",
  brand: "cobrain",
  category: "promo",
  color: "#3b82f6",
};

export const templateConfig: Partial<VideoConfig> = {
  durationInFrames: 450,
};

export const timeline: TimelineSegment[] = [
  { name: "Hook", from: 0, durationInFrames: 90, color: "#8b5cf6" },
  { name: "Features", from: 90, durationInFrames: 160, color: "#3b82f6" },
  { name: "USP", from: 250, durationInFrames: 110, color: "#22c55e" },
  { name: "CTA", from: 360, durationInFrames: 90, color: "#e53e3e" },
];

// ─── CONSTANTS ──────────────────────────────────────────
const FPS = 30;
const f2s = (frames: number) => frames / FPS;

const COLORS = {
  bg: "#0a0a0a",
  accent: "#3b82f6",
  accentLight: "#60a5fa",
  text: "#fafafa",
  secondary: "#a1a1a1",
};

// ─── AUDIO TRACK ────────────────────────────────────────
export const audioTrack: AudioTrack = {
  bpm: 140,
  reverb: { wet: 0.12, roomSize: 0.5, damping: 0.4 },
  compressor: { threshold: -8, ratio: 4, attack: 0.003, release: 0.1, knee: 6 },
  events: [
    // ── Sub-bass drone (entire duration, lowpass 120Hz) ──
    { frame: 0,   duration: 90,  frequency: 40, waveform: "sine", volume: 0.3,  attack: f2s(15), decay: 0.1, sustain: 0.9, release: f2s(10), pan: 0, filter: { type: "lowpass", cutoff: 120 } },
    { frame: 90,  duration: 160, frequency: 38, waveform: "sine", volume: 0.3,  attack: f2s(8),  decay: 0.1, sustain: 0.9, release: f2s(8),  pan: 0, filter: { type: "lowpass", cutoff: 120 } },
    { frame: 250, duration: 110, frequency: 42, waveform: "sine", volume: 0.32, attack: f2s(8),  decay: 0.1, sustain: 0.9, release: f2s(8),  pan: 0, filter: { type: "lowpass", cutoff: 130 } },
    { frame: 360, duration: 90,  frequency: 36, waveform: "sine", volume: 0.35, attack: f2s(8),  decay: 0.15, sustain: 0.85, release: f2s(15), pan: 0, filter: { type: "lowpass", cutoff: 150 } },

    // ── Impact hits on flash frames ──
    { frame: 50, duration: 6, frequency: 80, waveform: "square", volume: 0.5, attack: 0, decay: 0.02, sustain: 0.4, release: f2s(4), pan: 0, distortion: 0.2, filter: { type: "lowpass", cutoff: 300 } },
    { frame: 60, duration: 6, frequency: 80, waveform: "square", volume: 0.45, attack: 0, decay: 0.02, sustain: 0.4, release: f2s(4), pan: 0, distortion: 0.2, filter: { type: "lowpass", cutoff: 300 } },
    { frame: 68, duration: 6, frequency: 80, waveform: "square", volume: 0.4, attack: 0, decay: 0.02, sustain: 0.4, release: f2s(4), pan: 0, distortion: 0.2, filter: { type: "lowpass", cutoff: 300 } },

    // ── Kick drums on feature transitions (140Hz→35Hz pitch slide) ──
    { frame: 90,  duration: 5, frequency: 140, waveform: "sine", volume: 0.6, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 35 },
    { frame: 130, duration: 5, frequency: 140, waveform: "sine", volume: 0.6, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 35 },
    { frame: 170, duration: 5, frequency: 140, waveform: "sine", volume: 0.6, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 35 },
    { frame: 210, duration: 5, frequency: 140, waveform: "sine", volume: 0.6, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 35 },

    // ── Act 3 kicks ──
    { frame: 250, duration: 5, frequency: 150, waveform: "sine", volume: 0.65, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 38 },
    { frame: 275, duration: 5, frequency: 150, waveform: "sine", volume: 0.6, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 38 },
    { frame: 290, duration: 5, frequency: 150, waveform: "sine", volume: 0.65, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 38 },

    // ── Act 4 kicks ──
    { frame: 360, duration: 5, frequency: 150, waveform: "sine", volume: 0.6, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 40 },
    { frame: 392, duration: 5, frequency: 160, waveform: "sine", volume: 0.65, attack: 0, decay: 0.02, sustain: 0.3, release: f2s(3), pan: 0, pitchSlide: 42 },

    // ── Hi-hat pattern (16th notes) ── pan: slight right
    ...Array.from({ length: 105 }, (_, i) => ({
      frame: Math.round(i * 4.3),
      duration: 2,
      frequency: 8000,
      waveform: "noise" as const,
      volume: i % 2 === 0 ? 0.1 : 0.06,
      attack: 0,
      release: f2s(1),
      pan: 0.25,
      filter: { type: "highpass" as const, cutoff: 6000 },
    })).filter(e => e.frame < 450),

    // ── Rising sweep (Act 3, 200→1800Hz saw) ──
    { frame: 250, duration: 100, frequency: 200, waveform: "saw", volume: 0.12, attack: f2s(10), release: f2s(15), pitchSlide: 1800, pan: 0, filter: { type: "lowpass", cutoff: 4000 } },

    // ── Reverse cymbal swells ──
    { frame: 76,  duration: 14, frequency: 5000, waveform: "noise", volume: 0.2, attack: f2s(12), release: 0, pan: -0.4, filter: { type: "highpass", cutoff: 3000 } },
    { frame: 236, duration: 14, frequency: 5000, waveform: "noise", volume: 0.2, attack: f2s(12), release: 0, pan: 0.4,  filter: { type: "highpass", cutoff: 3000 } },
    { frame: 346, duration: 14, frequency: 5000, waveform: "noise", volume: 0.2, attack: f2s(12), release: 0, pan: -0.4, filter: { type: "highpass", cutoff: 3000 } },

    // ── Final impact (frame 420) ── 60Hz square + distortion
    { frame: 420, duration: 12, frequency: 60,   waveform: "square", volume: 0.85, attack: 0, decay: 0.01, sustain: 0.4, release: f2s(8), pan: 0, distortion: 0.5, filter: { type: "lowpass", cutoff: 400 } },
    { frame: 420, duration: 8,  frequency: 4000, waveform: "noise",  volume: 0.25, attack: 0, release: f2s(5), pan: 0, filter: { type: "highpass", cutoff: 2000 } },
  ],
};

// ─── DETERMINISTIC NOISE ────────────────────────────────
const noise = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ─── PARTICLE SYSTEM ────────────────────────────────────
interface Particle {
  x: number; y: number;
  radius: number;
  speed: number;
  phase: number;
  orbitRadius: number;
}

const PARTICLES: Particle[] = Array.from({ length: 18 }, (_, i) => ({
  x: noise(i * 3.7) * 0.8 + 0.1,
  y: noise(i * 5.3) * 0.6 + 0.2,
  radius: 2 + noise(i * 7.1) * 4,
  speed: 0.02 + noise(i * 11.3) * 0.03,
  phase: noise(i * 13.7) * Math.PI * 2,
  orbitRadius: 15 + noise(i * 17.1) * 35,
}));

// ─── COMPONENT ──────────────────────────────────────────
export const CobrainPromo: React.FC<AnimationProps> = ({ frame, config }) => {
  const { width, height, fps, durationInFrames } = config;

  // ─── ACT DETECTION ─────────────────────────────────
  const act = frame < 90 ? 1 : frame < 250 ? 2 : frame < 360 ? 3 : 4;

  // ─── FLASH FRAMES ──────────────────────────────────
  const flashFrames = new Set([
    50, 51,   // Act 1 flash burst 1
    60, 61,   // Act 1 flash burst 2
    68, 69,   // Act 1 flash burst 3
    88, 89,   // Act 1→2 transition
    128, 129, // Feature 1→2
    168, 169, // Feature 2→3
    208, 209, // Feature 3→4
    248, 249, // Act 2→3
    358, 359, // Act 3→4
    418, 419, // Period impact
  ]);
  const isFlash = flashFrames.has(frame);

  // ─── BLUE LINE SWEEP (between acts) ────────────────
  const sweepActive = (frame >= 75 && frame < 90) || (frame >= 245 && frame < 260) || (frame >= 355 && frame < 370);
  const sweepProgress = sweepActive
    ? frame < 90
      ? interpolate(frame, [75, 90], [0, 1], { clamp: true })
      : frame < 260
        ? interpolate(frame, [245, 260], [0, 1], { clamp: true })
        : interpolate(frame, [355, 370], [0, 1], { clamp: true })
    : 0;

  // ─── GRID (Act 3) ─────────────────────────────────
  const gridAlpha = act === 3
    ? interpolate(frame, [290, 310], [0, 0.12], { clamp: true }) * interpolate(frame, [340, 360], [1, 0], { clamp: true })
    : 0;

  // ─── SCAN LINE (Act 3) ────────────────────────────
  const scanY = (frame * 8) % (height + 40) - 20;

  // ─── PARTICLE OPACITY (Act 1) ─────────────────────
  const particleAlpha = act === 1
    ? interpolate(frame, [0, 20], [0, 0.6], { clamp: true }) * interpolate(frame, [70, 90], [1, 0], { clamp: true })
    : 0;

  // ─── FINAL PULSE (Act 4, frame 440+) ──────────────
  const pulse = frame >= 440
    ? 1 + Math.sin((frame - 440) * 0.3) * 0.004
    : 1;

  // ─── EXIT ──────────────────────────────────────────
  const exitOp = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0.85], { clamp: true });

  return (
    <div
      style={{
        width,
        height,
        background: isFlash ? "#e0e8ff" : COLORS.bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        transform: `scale(${pulse})`,
        opacity: exitOp,
      }}
    >
      {/* ── NEURAL PARTICLES (Act 1) ── */}
      {particleAlpha > 0 && PARTICLES.map((p, i) => {
        const px = p.x * width + Math.cos(frame * p.speed + p.phase) * p.orbitRadius;
        const py = p.y * height + Math.sin(frame * p.speed + p.phase) * p.orbitRadius;
        return (
          <div
            key={`p${i}`}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: p.radius * 2,
              height: p.radius * 2,
              borderRadius: "50%",
              background: COLORS.accent,
              opacity: particleAlpha * (0.3 + noise(i * 19.3) * 0.5),
              boxShadow: `0 0 ${p.radius * 4}px ${COLORS.accent}`,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* ── Particle connection lines (Act 1) ── */}
      {particleAlpha > 0 && (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {PARTICLES.slice(0, 10).map((p, i) => {
            const p2 = PARTICLES[(i + 3) % PARTICLES.length];
            const x1 = p.x * width + Math.cos(frame * p.speed + p.phase) * p.orbitRadius;
            const y1 = p.y * height + Math.sin(frame * p.speed + p.phase) * p.orbitRadius;
            const x2 = p2.x * width + Math.cos(frame * p2.speed + p2.phase) * p2.orbitRadius;
            const y2 = p2.y * height + Math.sin(frame * p2.speed + p2.phase) * p2.orbitRadius;
            return (
              <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS.accent} strokeWidth={0.8} opacity={particleAlpha * 0.2} />
            );
          })}
        </svg>
      )}

      {/* ════════════════════════════════════════════════
          ACT 1 — HOOK (Frame 0-90)
          ════════════════════════════════════════════════ */}
      {act === 1 && <Act1Hook frame={frame} width={width} height={height} fps={fps} isFlash={isFlash} />}

      {/* ════════════════════════════════════════════════
          ACT 2 — FEATURE SHOWCASE (Frame 90-250)
          ════════════════════════════════════════════════ */}
      {act === 2 && <Act2Features frame={frame} width={width} height={height} fps={fps} isFlash={isFlash} />}

      {/* ════════════════════════════════════════════════
          ACT 3 — USP (Frame 250-360)
          ════════════════════════════════════════════════ */}
      {act === 3 && <Act3USP frame={frame} width={width} height={height} fps={fps} />}

      {/* ════════════════════════════════════════════════
          ACT 4 — CTA (Frame 360-450)
          ════════════════════════════════════════════════ */}
      {act === 4 && <Act4CTA frame={frame} width={width} height={height} fps={fps} durationInFrames={durationInFrames} />}

      {/* ── BLUE LINE SWEEP ── */}
      {sweepProgress > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: interpolate(sweepProgress, [0, 1], [width, 0]),
            height: "100%",
            background: `linear-gradient(90deg, transparent, ${COLORS.accent}40, ${COLORS.accent}20)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── GRID (Act 3) ── */}
      {gridAlpha > 0 && (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: gridAlpha, pointerEvents: "none" }}>
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`v${i}`} x1={(width / 12) * (i + 1)} y1={0} x2={(width / 12) * (i + 1)} y2={height} stroke={COLORS.accent} strokeWidth={0.5} />
          ))}
          {Array.from({ length: 19 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={(height / 20) * (i + 1)} x2={width} y2={(height / 20) * (i + 1)} stroke={COLORS.accent} strokeWidth={0.5} />
          ))}
        </svg>
      )}

      {/* ── SCAN LINE (Act 3) ── */}
      {act === 3 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: scanY,
            width: "100%",
            height: 2,
            background: `${COLORS.accent}30`,
            boxShadow: `0 0 12px ${COLORS.accent}15`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── SCANLINES OVERLAY ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.01) 3px, rgba(255,255,255,0.01) 4px)",
          pointerEvents: "none",
        }}
      />

      {/* ── GRAIN OVERLAY ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          pointerEvents: "none",
          background: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)",
        }}
      />
    </div>
  );
};

// ════════════════════════════════════════════════════════
// ACT 1 — HOOK (Frame 0-90, 0-3s)
// ════════════════════════════════════════════════════════
interface ActProps {
  frame: number;
  width: number;
  height: number;
  fps: number;
  isFlash?: boolean;
  durationInFrames?: number;
}

const Act1Hook: React.FC<ActProps> = ({ frame, width, height, fps, isFlash }) => {
  // "Yapay zekan seni tanıyor mu?" — spring entrance
  const textEnter = 20;
  const textProgress = frame >= textEnter
    ? spring({ frame: frame - textEnter, fps, damping: 8, stiffness: 200, mass: 1 })
    : 0;

  const textScale = interpolate(textProgress, [0, 1], [3, 1]);
  const textOpacity = interpolate(textProgress, [0, 1], [0, 1]);
  const textY = interpolate(textProgress, [0, 1], [100, 0]);

  // Fade out before transition
  const fadeOut = interpolate(frame, [50, 75], [1, 0], { clamp: true });

  return (
    <>
      {frame >= textEnter && frame < 75 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) translateY(${textY}px) scale(${textScale})`,
            opacity: textOpacity * fadeOut,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              fontSize: Math.round(width * 0.065),
              fontWeight: 900,
              color: isFlash ? COLORS.bg : COLORS.text,
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
            }}
          >
            Yapay zekan seni
          </div>
          <div
            style={{
              fontSize: Math.round(width * 0.095),
              fontWeight: 900,
              color: COLORS.accent,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              textShadow: `0 0 40px ${COLORS.accent}80, 0 0 80px ${COLORS.accent}40`,
            }}
          >
            tanıyor
          </div>
          <div
            style={{
              fontSize: Math.round(width * 0.065),
              fontWeight: 900,
              color: isFlash ? COLORS.bg : COLORS.text,
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
            }}
          >
            mu?
          </div>
        </div>
      )}
    </>
  );
};

// ════════════════════════════════════════════════════════
// ACT 2 — FEATURE SHOWCASE (Frame 90-250, 3-8.3s)
// ════════════════════════════════════════════════════════
const Act2Features: React.FC<ActProps> = ({ frame, width, height, fps, isFlash }) => {
  // Feature 1: Çoklu Kanal (90-130)
  const f1Active = frame >= 90 && frame < 130;
  // Feature 2: Akıllı Hafıza (130-170)
  const f2Active = frame >= 130 && frame < 170;
  // Feature 3: Evrimleşen Persona (170-210)
  const f3Active = frame >= 170 && frame < 210;
  // Feature 4: Hedefler & Hatırlatıcılar (210-250)
  const f4Active = frame >= 210 && frame < 250;

  return (
    <>
      {/* ── Feature 1: Çoklu Kanal ── */}
      {f1Active && <Feature1Channel frame={frame} width={width} height={height} fps={fps} isFlash={isFlash} />}

      {/* ── Feature 2: Akıllı Hafıza ── */}
      {f2Active && <Feature2Memory frame={frame} width={width} height={height} fps={fps} />}

      {/* ── Feature 3: Evrimleşen Persona ── */}
      {f3Active && <Feature3Persona frame={frame} width={width} height={height} fps={fps} />}

      {/* ── Feature 4: Hedefler ── */}
      {f4Active && <Feature4Goals frame={frame} width={width} height={height} fps={fps} />}
    </>
  );
};

// ── Feature 1: Çoklu Kanal ──────────────────────────────
const Feature1Channel: React.FC<ActProps> = ({ frame, width, height, fps }) => {
  const localFrame = frame - 90;

  const channels = [
    { icon: "\u{1F4AC}", label: "Telegram", delay: 0 },
    { icon: "\u{1F4F1}", label: "WhatsApp", delay: 5 },
    { icon: "\u{1F310}", label: "Web", delay: 10 },
  ];

  // Subtitle
  const subOpacity = interpolate(localFrame, [15, 25], [0, 1], { clamp: true });
  const subY = interpolate(localFrame, [15, 25], [20, 0], { clamp: true });

  // Exit
  const exitOp = interpolate(frame, [125, 130], [1, 0], { clamp: true });

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: exitOp }}>
      <div style={{ display: "flex", gap: 60, marginBottom: 50 }}>
        {channels.map((ch, i) => {
          const s = spring({ frame: localFrame - ch.delay, fps, damping: 12, stiffness: 120, mass: 0.6 });
          const x = interpolate(s, [0, 1], [-200, 0]);
          const op = interpolate(s, [0, 1], [0, 1]);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 15,
                transform: `translateX(${x}px)`,
                opacity: op,
              }}
            >
              <div style={{ fontSize: Math.round(width * 0.08) }}>{ch.icon}</div>
              <div style={{ fontSize: Math.round(width * 0.025), fontWeight: 600, color: COLORS.secondary, letterSpacing: "0.05em", textTransform: "uppercase" }}>{ch.label}</div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          fontSize: Math.round(width * 0.042),
          fontWeight: 700,
          color: COLORS.text,
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          letterSpacing: "-0.01em",
        }}
      >
        Tek AI. Üç kanal.
      </div>
    </div>
  );
};

// ── Feature 2: Akıllı Hafıza ────────────────────────────
const Feature2Memory: React.FC<ActProps> = ({ frame, width, height, fps }) => {
  const localFrame = frame - 130;

  // "Hafıza" title scale-in
  const titleS = spring({ frame: localFrame, fps, damping: 10, stiffness: 100, mass: 1 });
  const titleScale = interpolate(titleS, [0, 1], [4, 1]);
  const titleOp = interpolate(titleS, [0, 1], [0, 1]);

  // Tags appear staggered
  const tags = ["tercihler", "alışkanlıklar", "hedefler", "geçmiş", "kişilik"];

  // Subtitle
  const subOpacity = interpolate(localFrame, [18, 28], [0, 1], { clamp: true });
  const subY = interpolate(localFrame, [18, 28], [20, 0], { clamp: true });

  // Exit
  const exitOp = interpolate(frame, [165, 170], [1, 0], { clamp: true });

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: exitOp }}>
      <div
        style={{
          fontSize: Math.round(width * 0.12),
          fontWeight: 900,
          color: COLORS.text,
          transform: `scale(${titleScale})`,
          opacity: titleOp,
          letterSpacing: "-0.03em",
          marginBottom: 30,
        }}
      >
        Hafıza
      </div>

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, maxWidth: width * 0.7, marginBottom: 40 }}>
        {tags.map((tag, i) => {
          const tagS = spring({ frame: localFrame - 8 - i * 3, fps, damping: 14, stiffness: 130, mass: 0.5 });
          const tagScale = interpolate(tagS, [0, 1], [0.5, 1]);
          const tagOp = interpolate(tagS, [0, 1], [0, 1]);
          return (
            <div
              key={i}
              style={{
                padding: "8px 20px",
                borderRadius: 20,
                border: `1px solid ${COLORS.accent}60`,
                background: `${COLORS.accent}15`,
                fontSize: Math.round(width * 0.025),
                fontWeight: 600,
                color: COLORS.accentLight,
                opacity: tagOp,
                transform: `scale(${tagScale})`,
              }}
            >
              {tag}
            </div>
          );
        })}
      </div>

      <div
        style={{
          fontSize: Math.round(width * 0.038),
          fontWeight: 700,
          color: COLORS.secondary,
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          letterSpacing: "0.02em",
        }}
      >
        Hatırlar. Öğrenir. Unutmaz.
      </div>
    </div>
  );
};

// ── Feature 3: Evrimleşen Persona ───────────────────────
const Feature3Persona: React.FC<ActProps> = ({ frame, width, height, fps }) => {
  const localFrame = frame - 170;

  // Morphing text styles: formal → samimi → teknik
  const phase = localFrame < 12 ? 0 : localFrame < 24 ? 1 : 2;

  const styles = [
    { text: "Merhaba, size nasıl yardımcı olabilirim?", weight: 400, size: 0.035, color: COLORS.secondary },
    { text: "Naber, bugün ne yapalım? 😊", weight: 700, size: 0.042, color: COLORS.text },
    { text: "API rate limit analizi tamamlandı.", weight: 600, size: 0.038, color: COLORS.accentLight },
  ];

  const current = styles[phase];
  const morphOp = spring({ frame: localFrame - phase * 12, fps, damping: 15, stiffness: 140, mass: 0.4 });

  // Subtitle
  const subOpacity = interpolate(localFrame, [20, 30], [0, 1], { clamp: true });
  const subY = interpolate(localFrame, [20, 30], [20, 0], { clamp: true });

  // Exit
  const exitOp = interpolate(frame, [205, 210], [1, 0], { clamp: true });

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: exitOp }}>
      {/* Persona label */}
      <div
        style={{
          fontSize: Math.round(width * 0.028),
          fontWeight: 600,
          color: COLORS.accent,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 25,
          opacity: interpolate(localFrame, [0, 8], [0, 0.7], { clamp: true }),
        }}
      >
        Evrimleşen Persona
      </div>

      {/* Chat bubble with morphing text */}
      <div
        style={{
          background: `${COLORS.accent}10`,
          border: `1px solid ${COLORS.accent}30`,
          borderRadius: 20,
          padding: "25px 40px",
          maxWidth: width * 0.75,
          opacity: interpolate(morphOp, [0, 1], [0, 1]),
        }}
      >
        <div
          style={{
            fontSize: Math.round(width * current.size),
            fontWeight: current.weight,
            color: current.color,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {current.text}
        </div>
      </div>

      <div
        style={{
          fontSize: Math.round(width * 0.038),
          fontWeight: 700,
          color: COLORS.secondary,
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          marginTop: 40,
        }}
      >
        Sana uyum sağlar.
      </div>
    </div>
  );
};

// ── Feature 4: Hedefler & Hatırlatıcılar ────────────────
const Feature4Goals: React.FC<ActProps> = ({ frame, width, height, fps }) => {
  const localFrame = frame - 210;

  // Progress bar animation (0% → 100%)
  const progressT = Math.min(1, localFrame / 25);
  const progressW = easing.easeInOutCubic(progressT) * 100;

  // Checklist items
  const items = [
    { text: "Blog yazısı taslağı", delay: 5 },
    { text: "API entegrasyonu", delay: 10 },
    { text: "Haftalık rapor", delay: 15 },
  ];

  // Subtitle
  const subOpacity = interpolate(localFrame, [22, 32], [0, 1], { clamp: true });
  const subY = interpolate(localFrame, [22, 32], [20, 0], { clamp: true });

  // Exit
  const exitOp = interpolate(frame, [245, 250], [1, 0], { clamp: true });

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: exitOp }}>
      {/* Progress bar */}
      <div style={{ width: width * 0.6, marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: Math.round(width * 0.025), fontWeight: 600, color: COLORS.secondary }}>Haftalık Hedefler</div>
          <div style={{ fontSize: Math.round(width * 0.025), fontWeight: 700, color: COLORS.accent }}>{Math.round(progressW)}%</div>
        </div>
        <div style={{ width: "100%", height: 8, borderRadius: 4, background: `${COLORS.accent}20` }}>
          <div style={{ width: `${progressW}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentLight})`, boxShadow: `0 0 12px ${COLORS.accent}40` }} />
        </div>
      </div>

      {/* Checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: width * 0.55 }}>
        {items.map((item, i) => {
          const checkT = localFrame - item.delay;
          const checked = checkT > 8;
          const itemS = spring({ frame: checkT, fps, damping: 14, stiffness: 130, mass: 0.5 });
          const itemOp = interpolate(itemS, [0, 1], [0, 1]);
          const itemX = interpolate(itemS, [0, 1], [30, 0]);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                opacity: itemOp,
                transform: `translateX(${itemX}px)`,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border: `2px solid ${checked ? COLORS.accent : COLORS.secondary}40`,
                  background: checked ? COLORS.accent : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: "#fff",
                  transition: "none",
                }}
              >
                {checked ? "✓" : ""}
              </div>
              <div
                style={{
                  fontSize: Math.round(width * 0.03),
                  fontWeight: 500,
                  color: checked ? COLORS.text : COLORS.secondary,
                  textDecoration: checked ? "line-through" : "none",
                  textDecorationColor: `${COLORS.accent}60`,
                }}
              >
                {item.text}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          fontSize: Math.round(width * 0.038),
          fontWeight: 700,
          color: COLORS.secondary,
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          marginTop: 40,
        }}
      >
        Proaktif. Takip eder.
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// ACT 3 — USP (Frame 250-360, 8.3-12s)
// ════════════════════════════════════════════════════════
const Act3USP: React.FC<ActProps> = ({ frame, width, height, fps }) => {
  const localFrame = frame - 250;

  // ── Kinetic Typography: word by word ──
  interface KWord { text: string; enter: number; from: "scale" | "left" | "right"; accent?: boolean }
  const words: KWord[] = [
    { text: "SENİN", enter: 0, from: "scale" },
    { text: "VERİN", enter: 8, from: "right" },
    { text: "SENİN", enter: 16, from: "left" },
    { text: "KURALLARIN", enter: 24, from: "scale", accent: true },
  ];

  // Privacy section (frame 290-330 → localFrame 40-80)
  const privacyShow = localFrame >= 40 && localFrame < 100;
  const privacyOp = privacyShow
    ? interpolate(localFrame, [40, 50], [0, 1], { clamp: true }) * interpolate(localFrame, [90, 100], [1, 0], { clamp: true })
    : 0;

  // Corner brackets for privacy section
  const bracketSize = privacyShow
    ? interpolate(localFrame, [42, 55], [0, 100], { clamp: true })
    : 0;

  // Fade all elements out
  const actExit = interpolate(frame, [350, 360], [1, 0], { clamp: true });

  return (
    <div style={{ position: "absolute", inset: 0, opacity: actExit }}>
      {/* ── Kinetic words (frame 250-290) ── */}
      {localFrame < 45 && words.map((w, i) => {
        if (localFrame < w.enter) return null;
        const wFrame = localFrame - w.enter;
        const s = spring({ frame: wFrame, fps, damping: 9, stiffness: 80, mass: 1.2 });
        const scale = w.from === "scale" ? interpolate(s, [0, 1], [5, 1]) : 1;
        const x = w.from === "right" ? interpolate(s, [0, 1], [width * 0.6, 0]) : w.from === "left" ? interpolate(s, [0, 1], [-width * 0.6, 0]) : 0;
        const op = interpolate(s, [0, 1], [0, 1]);
        const wordExit = interpolate(localFrame, [38, 45], [1, 0], { clamp: true });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: `${22 + i * 18}%`,
              transform: `translate(-50%, -50%) translateX(${x}px) scale(${scale})`,
              fontSize: Math.round(width * (w.accent ? 0.1 : 0.13)),
              fontWeight: 900,
              color: w.accent ? COLORS.accent : COLORS.text,
              opacity: op * wordExit,
              letterSpacing: "-0.03em",
              textShadow: w.accent ? `0 0 30px ${COLORS.accent}60` : "none",
              whiteSpace: "nowrap",
            }}
          >
            {w.text}
          </div>
        );
      })}

      {/* ── Privacy Section (frame 290-330) ── */}
      {privacyOp > 0 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            opacity: privacyOp,
          }}
        >
          <div style={{ fontSize: Math.round(width * 0.08), marginBottom: 20 }}>
            🔒
          </div>
          <div
            style={{
              fontSize: Math.round(width * 0.04),
              fontWeight: 700,
              color: COLORS.text,
              letterSpacing: "-0.01em",
              lineHeight: 1.5,
            }}
          >
            Self-hosted. %100 Gizlilik.
          </div>
        </div>
      )}

      {/* ── Corner brackets ── */}
      {bracketSize > 0 && (
        <>
          <div style={{ position: "absolute", left: width * 0.12, top: height * 0.35, width: bracketSize, height: bracketSize, borderLeft: `3px solid ${COLORS.accent}`, borderTop: `3px solid ${COLORS.accent}` }} />
          <div style={{ position: "absolute", right: width * 0.12, top: height * 0.35, width: bracketSize, height: bracketSize, borderRight: `3px solid ${COLORS.accent}`, borderTop: `3px solid ${COLORS.accent}` }} />
          <div style={{ position: "absolute", left: width * 0.12, bottom: height * 0.35, width: bracketSize, height: bracketSize, borderLeft: `3px solid ${COLORS.accent}`, borderBottom: `3px solid ${COLORS.accent}` }} />
          <div style={{ position: "absolute", right: width * 0.12, bottom: height * 0.35, width: bracketSize, height: bracketSize, borderRight: `3px solid ${COLORS.accent}`, borderBottom: `3px solid ${COLORS.accent}` }} />
        </>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════
// ACT 4 — CTA (Frame 360-450, 12-15s)
// ════════════════════════════════════════════════════════
const Act4CTA: React.FC<ActProps> = ({ frame, width, height, fps, durationInFrames = 450 }) => {
  const localFrame = frame - 360;

  // ── "COBRAIN" letter-by-letter spring ──
  const letters = "COBRAIN".split("");
  const directions: Array<"left" | "top" | "right" | "bottom" | "scale"> = ["left", "top", "right", "bottom", "scale", "left", "top"];
  const letterDelay = 3;

  // Letter-spacing animation (wide → normal)
  const spacingS = spring({ frame: localFrame, fps, damping: 12, stiffness: 80, mass: 1 });
  const letterSpacing = interpolate(spacingS, [0, 1], [40, 4]);

  // Tagline (frame 400-420 → localFrame 40-60)
  const taglineOp = interpolate(localFrame, [40, 55], [0, 1], { clamp: true });
  const taglineY = interpolate(localFrame, [40, 55], [20, 0], { clamp: true });

  // Blue dot (frame 420-440 → localFrame 60-80)
  const dotS = localFrame >= 60
    ? spring({ frame: localFrame - 60, fps, damping: 10, stiffness: 80, mass: 1 })
    : 0;

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {/* ── "COBRAIN" letters ── */}
      <div style={{ display: "flex", marginBottom: 30, letterSpacing }}>
        {letters.map((letter, i) => {
          const lFrame = localFrame - i * letterDelay;
          const s = spring({ frame: lFrame, fps, damping: 10, stiffness: 100, mass: 0.8 });
          const dir = directions[i];

          let tx = 0, ty = 0, sc = 1;
          switch (dir) {
            case "left": tx = interpolate(s, [0, 1], [-width * 0.4, 0]); break;
            case "right": tx = interpolate(s, [0, 1], [width * 0.4, 0]); break;
            case "top": ty = interpolate(s, [0, 1], [-height * 0.3, 0]); break;
            case "bottom": ty = interpolate(s, [0, 1], [height * 0.3, 0]); break;
            case "scale": sc = interpolate(s, [0, 1], [5, 1]); break;
          }
          const op = interpolate(s, [0, 1], [0, 1]);

          return (
            <span
              key={i}
              style={{
                fontSize: Math.round(width * 0.12),
                fontWeight: 900,
                color: COLORS.text,
                opacity: op,
                transform: `translate(${tx}px, ${ty}px) scale(${sc})`,
                display: "inline-block",
                textShadow: `0 0 30px ${COLORS.accent}50, 0 0 60px ${COLORS.accent}25`,
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>

      {/* ── Tagline ── */}
      <div
        style={{
          fontSize: Math.round(width * 0.035),
          fontWeight: 500,
          color: COLORS.secondary,
          opacity: taglineOp,
          transform: `translateY(${taglineY}px)`,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Kişisel AI Asistanın
      </div>

      {/* ── Blue dot (period → large circle) ── */}
      {dotS > 0 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "68%",
            transform: `translate(-50%, -50%) scale(${dotS})`,
            width: Math.round(width * 0.06),
            height: Math.round(width * 0.06),
            borderRadius: "50%",
            background: COLORS.accent,
            boxShadow: `0 0 30px ${COLORS.accent}60, 0 0 60px ${COLORS.accent}30`,
          }}
        />
      )}

      {/* ── Neon glow backdrop ── */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          transform: "translate(-50%, -50%)",
          width: width * 0.8,
          height: width * 0.3,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${COLORS.accent}15 0%, transparent 70%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
