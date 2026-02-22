import React from "react";
import { interpolate, spring, easing, type AnimationProps, type VideoConfig } from "../animations";
import type { ProjectMeta } from "./types";

// ─── Meta ─────────────────────────────────────────────
export const meta: ProjectMeta = {
  id: "internet-pulse",
  name: "Internet Pulse",
  category: "social",
  color: "#3b82f6",
};

export const templateConfig: Partial<VideoConfig> = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 360, // 12s
};

// ─── Data ─────────────────────────────────────────────
const STATS = [
  { label: "Google Searches", value: 99000, unit: "per second", color: "#3b82f6" },
  { label: "Emails Sent", value: 3400000, unit: "per second", color: "#a78bfa" },
  { label: "YouTube Views", value: 500000, unit: "per second", color: "#e53e3e" },
  { label: "WhatsApp Messages", value: 2000000, unit: "per second", color: "#22c55e" },
] as const;

const STAT_STARTS = [35, 95, 155, 215] as const;
const OUTRO_START = 315;

// ─── Helpers ──────────────────────────────────────────
function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return Math.floor(n / 1000) + "K";
  return String(Math.floor(n));
}

// Deterministic jitter — no Math.random(), render-safe
function seededNoise(frame: number, seed: number): number {
  const x = Math.sin(frame * seed * 0.3 + seed * 13.7) * 43758.5453;
  return x - Math.floor(x);
}

// ─── AnimatedNumber ───────────────────────────────────
const AnimatedNumber: React.FC<{
  finalValue: number;
  localFrame: number;
  color: string;
}> = ({ finalValue, localFrame, color }) => {
  const COUNT_FRAMES = 50;
  const SCRAMBLE_FRAMES = 12;
  const phase = localFrame / (COUNT_FRAMES + SCRAMBLE_FRAMES);

  let display: number;
  if (localFrame <= 0) {
    display = 0;
  } else if (localFrame <= COUNT_FRAMES) {
    const t = localFrame / COUNT_FRAMES;
    display = Math.floor(interpolate(t, [0, 1], [0, finalValue], { easing: easing.easeOutExpo }));
  } else if (localFrame <= COUNT_FRAMES + SCRAMBLE_FRAMES) {
    const scrambleT = (localFrame - COUNT_FRAMES) / SCRAMBLE_FRAMES;
    const jitter = (seededNoise(localFrame, 7.3) - 0.5) * 2 * finalValue * 0.07 * (1 - scrambleT);
    display = Math.floor(finalValue + jitter);
  } else {
    display = finalValue;
  }

  const isLocked = localFrame > COUNT_FRAMES + SCRAMBLE_FRAMES;
  const lockGlow = isLocked
    ? interpolate(localFrame - COUNT_FRAMES - SCRAMBLE_FRAMES, [0, 8, 20], [0, 1, 0], { clamp: true })
    : 0;

  return (
    <span
      style={{
        fontFamily: "'SF Mono', 'Fira Code', 'Courier New', monospace",
        fontSize: 108,
        fontWeight: 900,
        color,
        letterSpacing: -3,
        lineHeight: 1,
        textShadow: lockGlow > 0
          ? `0 0 ${60 * lockGlow}px ${color}, 0 0 ${120 * lockGlow}px ${color}44`
          : `0 0 40px ${color}30`,
        display: "block",
        // Scramble: slight hue-shift via filter
        filter: localFrame > COUNT_FRAMES && localFrame <= COUNT_FRAMES + SCRAMBLE_FRAMES
          ? `brightness(${1 + 0.3 * seededNoise(localFrame, 2.1)})`
          : "none",
      }}
    >
      {formatNum(display)}
    </span>
  );
};

// ─── StatRow ──────────────────────────────────────────
const StatRow: React.FC<{
  stat: (typeof STATS)[number];
  frame: number;
  startFrame: number;
  index: number;
}> = ({ stat, frame, startFrame, index }) => {
  const local = frame - startFrame;
  if (local < 0) return null;

  const enterSpring = spring({ frame: local, fps: 30, damping: 14, stiffness: 110 });
  const opacity = interpolate(local, [0, 12], [0, 1], { clamp: true, easing: easing.easeOutCubic });
  const translateY = interpolate(enterSpring, [0, 1], [72, 0]);
  const accentScaleX = interpolate(local, [0, 18], [0, 1], { clamp: true, easing: easing.easeOutExpo });

  return (
    <div
      style={{
        transform: `translateY(${translateY}px)`,
        opacity,
        padding: "28px 48px 28px 52px",
        position: "relative",
        background: `linear-gradient(90deg, ${stat.color}0a 0%, transparent 55%)`,
        borderBottom: "1px solid #0f0f0f",
      }}
    >
      {/* Left accent line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: stat.color,
          transformOrigin: "top",
          transform: `scaleY(${accentScaleX})`,
          boxShadow: `2px 0 20px ${stat.color}50`,
        }}
      />
      {/* Index */}
      <div style={{ fontSize: 10, color: "#2a2a2a", fontFamily: "monospace", marginBottom: 6, letterSpacing: 2 }}>
        {String(index + 1).padStart(2, "0")}
      </div>
      {/* Label */}
      <div style={{ fontSize: 13, color: "#4a4a4a", textTransform: "uppercase", letterSpacing: 3, marginBottom: 8, fontWeight: 600 }}>
        {stat.label}
      </div>
      {/* Number */}
      <AnimatedNumber finalValue={stat.value} localFrame={local} color={stat.color} />
      {/* Unit */}
      <div style={{ fontSize: 12, color: "#333", textTransform: "uppercase", letterSpacing: 3, marginTop: 6 }}>
        {stat.unit}
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────
export const Component: React.FC<AnimationProps> = ({ frame, config }) => {
  const { width, height, fps, durationInFrames } = config;

  // Header
  const headerSpring = spring({ frame, fps, damping: 11, stiffness: 90, mass: 1.1 });
  const headerY = interpolate(headerSpring, [0, 1], [-50, 0]);
  const headerOpacity = interpolate(frame, [0, 18], [0, 1], { clamp: true });
  const subtitleOpacity = interpolate(frame, [18, 40], [0, 1], { clamp: true });

  // Live blink — 0.5s cycle
  const blinkPhase = Math.floor(frame / 15) % 2;
  const liveDotOpacity = blinkPhase === 0 ? 1 : 0.25;

  // Collective pulse when all stats appear (frame 260-290)
  const pulseLocal = Math.max(0, frame - 260);
  const pulseOpacity = pulseLocal > 0
    ? interpolate(pulseLocal, [0, 8, 30], [0, 0.06, 0], { clamp: true })
    : 0;

  // Outro
  const outroOpacity = frame >= OUTRO_START
    ? interpolate(frame, [OUTRO_START, OUTRO_START + 20], [0, 1], { clamp: true })
    : 0;

  // Outro text words stagger
  const outroWords = ["Every.", "Single.", "Second."];
  const outroWordOpacity = (i: number) =>
    frame >= OUTRO_START
      ? interpolate(frame, [OUTRO_START + i * 10, OUTRO_START + i * 10 + 15], [0, 1], { clamp: true })
      : 0;

  const progress = frame / durationInFrames;

  return (
    <div
      style={{
        width,
        height,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Scanline texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)",
          pointerEvents: "none",
          zIndex: 8,
        }}
      />

      {/* Collective pulse flash */}
      {pulseOpacity > 0 && (
        <div style={{ position: "absolute", inset: 0, background: "white", opacity: pulseOpacity, zIndex: 6, pointerEvents: "none" }} />
      )}

      {/* Header */}
      <div
        style={{
          padding: "80px 48px 40px",
          transform: `translateY(${headerY}px)`,
          opacity: headerOpacity,
          flexShrink: 0,
        }}
      >
        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, opacity: subtitleOpacity }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e53e3e", opacity: liveDotOpacity, transition: "opacity 0.1s", boxShadow: "0 0 10px #e53e3e" }} />
          <span style={{ fontSize: 11, color: "#555", letterSpacing: 4, textTransform: "uppercase", fontWeight: 600 }}>
            Live
          </span>
        </div>

        <div style={{ fontSize: 13, color: "#333", textTransform: "uppercase", letterSpacing: 6, marginBottom: 10 }}>
          The Internet
        </div>
        <div style={{ fontSize: 80, fontWeight: 900, color: "#fff", letterSpacing: -3, lineHeight: 0.92 }}>
          RIGHT
          <br />
          NOW
        </div>
        <div style={{ marginTop: 20, opacity: subtitleOpacity, fontSize: 12, color: "#2a2a2a", letterSpacing: 3, textTransform: "uppercase" }}>
          ↓ every second
        </div>
      </div>

      {/* Stats */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {STATS.map((stat, i) => (
          <StatRow key={stat.label} stat={stat} frame={frame} startFrame={STAT_STARTS[i]} index={i} />
        ))}
      </div>

      {/* Outro overlay */}
      {outroOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#000",
            opacity: outroOpacity,
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "0 52px",
            gap: 2,
          }}
        >
          {outroWords.map((word, i) => (
            <div
              key={word}
              style={{
                fontSize: 80,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: -2,
                lineHeight: 1.05,
                opacity: outroWordOpacity(i),
                transform: `translateX(${interpolate(outroWordOpacity(i), [0, 1], [-24, 0])}px)`,
              }}
            >
              {word}
            </div>
          ))}
          <div
            style={{
              marginTop: 24,
              fontSize: 11,
              color: "#2a2a2a",
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: outroWordOpacity(2),
            }}
          >
            framix
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ height: 2, background: "#0a0a0a", flexShrink: 0, position: "relative", zIndex: 9 }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, #3b82f6 0%, #a78bfa 50%, #22c55e 100%)",
          }}
        />
      </div>

      {/* Frame counter */}
      <div style={{ position: "absolute", bottom: 10, right: 16, fontSize: 10, color: "#1a1a1a", fontFamily: "monospace", letterSpacing: 1, zIndex: 9 }}>
        FR {String(frame).padStart(3, "0")}/{durationInFrames}
      </div>
    </div>
  );
};
