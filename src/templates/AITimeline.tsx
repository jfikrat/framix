import React from "react";
import { interpolate, spring, type AnimationProps, type VideoConfig } from "../animations";
import type { TemplateMeta } from "./types";

export const meta: TemplateMeta = {
  id: "ai-timeline",
  name: "AI Timeline Tweet",
  category: "promo",
  color: "#3b82f6",
};

export const templateConfig: Partial<VideoConfig> = {
  width: 1920,
  height: 1080,
  durationInFrames: 450,
};

// ─── COLORS ───────────────────────────────────────────
const C = {
  bg: "#0a0a0a",
  accent: "#3b82f6",
  accentGlow: "#3b82f680",
  text: "#f5f5f5",
  sub: "#8b8b8b",
  dim: "#444444",
};

// ─── BULLET DATA ──────────────────────────────────────
interface Bullet {
  text: string;
  highlight: string;
  enter: number;
}

const BULLETS: Bullet[] = [
  { text: "Apple putting Gemini inside Siri", highlight: "Gemini", enter: 45 },
  { text: "Goldman Sachs replacing accountants with Claude", highlight: "Claude", enter: 85 },
  { text: "Meta secretly testing 5 different AI models at once", highlight: "5 different AI models", enter: 125 },
  { text: "Grok making 35% returns trading real money", highlight: "35% returns", enter: 165 },
  { text: "ByteDance dropping a video model that out-directs humans", highlight: "out-directs humans", enter: 205 },
  { text: "A guy doing 300 km/h at Daytona between all of this", highlight: "300 km/h", enter: 245 },
];

// ─── HELPERS ──────────────────────────────────────────
const renderHL = (text: string, hl: string) => {
  const idx = text.indexOf(hl);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: C.accent, fontWeight: 700 }}>{hl}</span>
      {text.slice(idx + hl.length)}
    </>
  );
};

// ─── COMPONENT ────────────────────────────────────────
export const AITimeline: React.FC<AnimationProps> = ({ frame, config }) => {
  const { width, height, fps, durationInFrames } = config;

  const isClosing = frame >= 310;
  const isTransition = frame >= 290 && frame < 310;

  // ─── TITLE ──────────────────────────────────────
  const titleS = spring({ frame, fps, damping: 12, stiffness: 100, mass: 0.8 });
  const titleOp = interpolate(titleS, [0, 1], [0, 1]);
  const titleY = interpolate(titleS, [0, 1], [25, 0]);
  const contentFade = interpolate(frame, [290, 310], [1, 0], { clamp: true });

  // ─── LOGO ───────────────────────────────────────
  const logoOp = interpolate(frame, [0, 20], [0, 1], { clamp: true });
  const exitOp = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { clamp: true });

  // ─── PROGRESS BAR ──────────────────────────────
  const progressW = frame < 45
    ? 0
    : interpolate(frame, [45, 285], [0, width], { clamp: true });

  // ─── BLUE SWEEP ────────────────────────────────
  const sweepX = isTransition
    ? interpolate(frame, [290, 310], [-width * 0.2, width * 1.1], { clamp: true })
    : -width;

  // ─── CLOSING ───────────────────────────────────
  const line1S = frame >= 320
    ? spring({ frame: frame - 320, fps, damping: 14, stiffness: 100, mass: 0.7 })
    : 0;
  const line2S = frame >= 360
    ? spring({ frame: frame - 360, fps, damping: 10, stiffness: 70, mass: 1 })
    : 0;

  // ─── CLOSING LOGO (centered, Act 4 outro) ─────
  const outroLogoS = frame >= 410
    ? spring({ frame: frame - 410, fps, damping: 12, stiffness: 100, mass: 0.8 })
    : 0;

  // ─── SCAN LINE ─────────────────────────────────
  const scanY = (frame * 5) % (height + 40) - 20;

  return (
    <div
      style={{
        width,
        height,
        background: C.bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        opacity: exitOp,
      }}
    >
      {/* ── Background glow ── */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: width * 0.7,
          height: height * 0.5,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${C.accent}08 0%, transparent 70%)`,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Scan line ── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: scanY,
          width: "100%",
          height: 1,
          background: `${C.accent}12`,
          pointerEvents: "none",
        }}
      />

      {/* ── Logo + handle (top-left) ── */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 60,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: logoOp * exitOp,
        }}
      >
        <img
          src="/cobrain-logo.png"
          style={{ width: 44, height: 44, borderRadius: "50%" }}
        />
        <span
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: C.sub,
            letterSpacing: "0.01em",
          }}
        >
          @cobrain
        </span>
      </div>

      {/* ════════════════════════════════════════════
          BULLETS PHASE (0-310)
          ════════════════════════════════════════════ */}
      {!isClosing && (
        <div
          style={{
            position: "absolute",
            left: 140,
            top: 130,
            right: 140,
            bottom: 80,
            opacity: contentFade,
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: C.text,
              opacity: titleOp,
              transform: `translateY(${titleY}px)`,
              marginBottom: 48,
            }}
          >
            My timeline today:
          </div>

          {/* Bullet list */}
          {BULLETS.map((bullet, i) => {
            if (frame < bullet.enter) return null;

            const localFrame = frame - bullet.enter;
            const s = spring({
              frame: localFrame,
              fps,
              damping: 14,
              stiffness: 120,
              mass: 0.6,
            });
            const op = interpolate(s, [0, 1], [0, 1]);
            const x = interpolate(s, [0, 1], [50, 0]);

            // Blue dot pulse on entry
            const dotScale = spring({
              frame: localFrame,
              fps,
              damping: 8,
              stiffness: 200,
              mass: 0.4,
            });

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  marginBottom: 30,
                  opacity: op,
                  transform: `translateX(${x}px)`,
                }}
              >
                {/* Number */}
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: C.accent,
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    letterSpacing: "0.05em",
                    minWidth: 30,
                    textAlign: "right",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Animated dash */}
                <div
                  style={{
                    width: interpolate(dotScale, [0, 1], [4, 22]),
                    height: 2,
                    background: C.accent,
                    borderRadius: 1,
                    boxShadow: `0 0 8px ${C.accentGlow}`,
                    flexShrink: 0,
                  }}
                />

                {/* Text */}
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 500,
                    color: C.text,
                    lineHeight: 1.4,
                  }}
                >
                  {renderHL(bullet.text, bullet.highlight)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Blue sweep transition ── */}
      {isTransition && (
        <div
          style={{
            position: "absolute",
            left: sweepX,
            top: 0,
            width: width * 0.15,
            height: "100%",
            background: `linear-gradient(90deg, transparent, ${C.accent}25, ${C.accent}12, transparent)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ════════════════════════════════════════════
          CLOSING PHASE (310-450)
          ════════════════════════════════════════════ */}
      {isClosing && (
        <div
          style={{
            position: "absolute",
            left: 140,
            top: 0,
            right: 140,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Line 1 — faded, smaller */}
          <div
            style={{
              fontSize: 38,
              fontWeight: 500,
              color: C.sub,
              opacity: interpolate(line1S, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(line1S, [0, 1], [20, 0])}px)`,
              marginBottom: 24,
              lineHeight: 1.4,
            }}
          >
            We're not in the "AI is coming" era anymore.
          </div>

          {/* Line 2 — bold, large, highlighted */}
          <div
            style={{
              fontSize: 50,
              fontWeight: 800,
              color: C.text,
              opacity: interpolate(line2S, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(line2S, [0, 1], [30, 0])}px)`,
              lineHeight: 1.35,
              maxWidth: width * 0.75,
            }}
          >
            We're in the{" "}
            <span
              style={{
                color: C.accent,
                textShadow: `0 0 40px ${C.accent}50`,
              }}
            >
              "AI is everywhere
            </span>
            <br />
            and most people{" "}
            <span
              style={{
                color: C.accent,
                textShadow: `0 0 40px ${C.accent}50`,
              }}
            >
              haven't noticed yet"
            </span>{" "}
            era.
          </div>

          {/* Outro logo (centered, below closing text) */}
          {outroLogoS > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: 60,
                opacity: interpolate(outroLogoS, [0, 1], [0, 0.7]),
                transform: `translateY(${interpolate(outroLogoS, [0, 1], [15, 0])}px)`,
              }}
            >
              <img
                src="/cobrain-logo.png"
                style={{ width: 36, height: 36, borderRadius: "50%" }}
              />
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: C.dim,
                  letterSpacing: "0.02em",
                }}
              >
                cobrain
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Progress bar (bottom edge) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: isClosing ? width : progressW,
          height: 3,
          background: `linear-gradient(90deg, ${C.accent}, ${C.accentGlow})`,
          boxShadow: `0 0 10px ${C.accentGlow}`,
        }}
      />

      {/* ── Frame counter ── */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          right: 60,
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 12,
          color: C.dim,
          letterSpacing: "0.1em",
        }}
      >
        FR {String(frame).padStart(3, "0")}/{durationInFrames}
      </div>

      {/* ── Scanlines overlay ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.006) 3px, rgba(255,255,255,0.006) 4px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
