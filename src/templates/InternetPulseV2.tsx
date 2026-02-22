import React from "react";
import { interpolate, type AnimationProps, type VideoConfig } from "../animations";
import type { ProjectMeta } from "./types";

// ─── Meta ─────────────────────────────────────────────
export const meta: ProjectMeta = {
  id: "internet-pulse-v2",
  name: "Internet Pulse II",
  category: "social",
  color: "#C5B396",
};

export const templateConfig: Partial<VideoConfig> = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 360, // 12s
};

// ─── Palette — obsidian-sand ─────────────────────────
const P = {
  bg:     "#050505",
  text:   "#F2F2F2",
  muted:  "#636363",
  accent: "#C5B396",   // champagne/sand
  dim:    "#282828",
} as const;

// ─── Stats — 3 only, full breathing room ─────────────
const STATS = [
  { value: "99K",  label: "Google Searches", enter: 25,  exit: 140 },
  { value: "3.4M", label: "Emails Sent",     enter: 150, exit: 265 },
  { value: "500K", label: "YouTube Views",   enter: 275, exit: 335 },
] as const;

const OUTRO = 335;

// ─── Easings ──────────────────────────────────────────
const expoOut = (t: number) => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
const expoIn  = (t: number) => t <= 0 ? 0 : Math.pow(2, 10 * t - 10);

function clamp01(t: number) { return Math.max(0, Math.min(1, t)); }

function progress(frame: number, start: number, end: number) {
  return clamp01((frame - start) / Math.max(1, end - start));
}

// ─── Clip-path reveal (bottom → up) ──────────────────
function clipUp(frame: number, start: number, duration: number): string {
  const t = expoOut(progress(frame, start, start + duration));
  const bottom = (1 - t) * 108; // slight overshoot % for descenders
  return `inset(0% 0% ${bottom}% 0%)`;
}

// ─── StatScene ────────────────────────────────────────
const StatScene: React.FC<{
  stat: (typeof STATS)[number];
  frame: number;
}> = ({ stat, frame }) => {
  const local = frame - stat.enter;
  if (local < 0) return null;

  // Enter
  const REVEAL = 26; // frames
  const numClip    = clipUp(frame, stat.enter, REVEAL);
  const labelAlpha = expoOut(progress(frame, stat.enter + REVEAL * 0.5, stat.enter + REVEAL * 1.8));
  const subAlpha   = expoOut(progress(frame, stat.enter + REVEAL,       stat.enter + REVEAL * 2.5));

  // Exit — fast fade out
  const exitAlpha  = stat.exit > 0
    ? 1 - expoIn(progress(frame, stat.exit, stat.exit + 14))
    : 1;

  return (
    <div style={{ position: "absolute", inset: 0, opacity: exitAlpha }}>
      <div
        style={{
          position: "absolute",
          top: "36%",
          left: 72,
          right: 72,
        }}
      >
        {/* Category label */}
        <div
          style={{
            fontSize: 12,
            color: P.accent,
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            fontWeight: 400,
            marginBottom: 36,
            opacity: labelAlpha,
          }}
        >
          {stat.label}
        </div>

        {/* Big number — clip reveal */}
        <div
          style={{
            clipPath: numClip,
            fontSize: 172,
            fontWeight: 900,
            color: P.text,
            letterSpacing: "-0.05em",
            lineHeight: 0.88,
            fontFamily: "'Inter', -apple-system, 'Helvetica Neue', sans-serif",
          }}
        >
          {stat.value}
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: 15,
            color: P.muted,
            fontWeight: 300,
            letterSpacing: "0.06em",
            marginTop: 40,
            opacity: subAlpha,
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          per second
        </div>
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────
export const Component: React.FC<AnimationProps> = ({ frame, config }) => {
  const { width, height, durationInFrames } = config;

  // Atmospheric gradient — slow drift
  const atmX = interpolate(frame, [0, durationInFrames], [20, 80]);
  const atmY = interpolate(frame, [0, durationInFrames], [60, 30]);

  // Intro
  const introAlpha = expoOut(progress(frame, 0, 22));
  const introY     = interpolate(expoOut(clamp01(frame / 22)), [0, 1], [16, 0]);

  // Outro
  const outroAlpha = expoOut(progress(frame, OUTRO, OUTRO + 18));
  const outroWords = ["Every.", "Single.", "Second."];

  const pct = frame / durationInFrames;

  return (
    <div
      style={{
        width,
        height,
        background: P.bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, 'Helvetica Neue', sans-serif",
      }}
    >
      {/* Atmospheric gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 60% at ${atmX}% ${atmY}%, rgba(197,179,150,0.045) 0%, transparent 60%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* SVG grain */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.06,
          pointerEvents: "none",
          zIndex: 10,
          mixBlendMode: "overlay",
        }}
      >
        <filter id="grain-v2">
          <feTurbulence type="fractalNoise" baseFrequency="0.88" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-v2)" />
      </svg>

      {/* Content */}
      <div style={{ position: "absolute", inset: 0, zIndex: 5 }}>

        {/* Intro header */}
        <div
          style={{
            position: "absolute",
            top: 88,
            left: 72,
            opacity: introAlpha,
            transform: `translateY(${introY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: P.muted,
              textTransform: "uppercase",
              letterSpacing: "0.38em",
              fontWeight: 400,
              marginBottom: 14,
            }}
          >
            The Internet
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 10,
              color: P.accent,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              fontWeight: 500,
            }}
          >
            {/* Live dot */}
            <span
              style={{
                display: "inline-block",
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: P.accent,
                opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0.3,
              }}
            />
            Right Now
          </div>
        </div>

        {/* Stats */}
        {STATS.map((s) => (
          <StatScene key={s.value} stat={s} frame={frame} />
        ))}

        {/* Outro */}
        {outroAlpha > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: P.bg,
              opacity: outroAlpha,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 72px",
              zIndex: 20,
            }}
          >
            {outroWords.map((word, i) => (
              <div
                key={word}
                style={{
                  fontSize: 90,
                  fontWeight: 900,
                  color: P.text,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.0,
                  clipPath: clipUp(frame, OUTRO + i * 9, 16),
                }}
              >
                {word}
              </div>
            ))}
            <div
              style={{
                marginTop: 52,
                fontSize: 10,
                color: P.dim,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                opacity: expoOut(progress(frame, OUTRO + 36, OUTRO + 50)),
              }}
            >
              framix
            </div>
          </div>
        )}
      </div>

      {/* Progress — 1px, ultra thin */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          background: P.dim,
          zIndex: 15,
        }}
      >
        <div style={{ height: "100%", width: `${pct * 100}%`, background: P.muted }} />
      </div>

      {/* Frame counter */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 24,
          fontSize: 9,
          color: P.dim,
          fontFamily: "monospace",
          letterSpacing: "0.1em",
          zIndex: 16,
        }}
      >
        {String(frame).padStart(3, "0")}/{durationInFrames}
      </div>
    </div>
  );
};
