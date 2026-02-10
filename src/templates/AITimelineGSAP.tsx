import React from "react";
import type { AnimationProps, VideoConfig } from "../animations";
import { useTimeline } from "../gsap";
import type { TemplateMeta } from "./types";

export const meta: TemplateMeta = {
  id: "ai-timeline-gsap",
  name: "AI Timeline (GSAP)",
  brand: "cobrain",
  category: "promo",
  color: "#8b5cf6",
};

// ─── CARD DATA ───────────────────────────────────────
interface CardData {
  icon: (color: string) => React.ReactNode;
  title: string;
  subtitle: string;
  accent: string;
}

// ─── INLINE SVG ICONS ────────────────────────────────
const AppleLogo = (color: string) => (
  <svg viewBox="0 0 72 72" width={72} height={72} fill={color}>
    <path d="M56.2 47.6c-1.2 2.7-1.8 3.9-3.4 6.3-2.2 3.3-5.3 7.5-9.2 7.5-3.4.1-4.3-2.2-9-2.2-4.6 0-5.6 2.3-9.2 2.3-3.8 0-6.7-3.7-8.9-7.1-6.2-9.4-6.9-20.4-3-26.3 2.7-4.2 7-6.7 11-6.7 4.1 0 6.7 2.3 10.1 2.3 3.3 0 5.3-2.3 10-2.3 3.6 0 7.5 2 10.1 5.4-8.9 4.9-7.5 17.5 1.5 20.8zM43.4 15.2c1.7-2.2 3-5.3 2.5-8.5-2.8.2-6 2-7.9 4.3-1.8 2.1-3.2 5.2-2.7 8.3 3 .1 6.1-1.7 8.1-4.1z" />
  </svg>
);

const GoldmanLogo = (color: string) => (
  <svg viewBox="0 0 72 72" width={72} height={72} fill="none">
    <text x="36" y="44" textAnchor="middle" fontFamily="'Georgia', serif" fontSize="34" fontWeight="700" fill={color}>
      GS
    </text>
    <rect x="8" y="10" width="56" height="52" rx="4" stroke={color} strokeWidth="2.5" fill="none" />
  </svg>
);

const MetaLogo = (color: string) => (
  <svg viewBox="0 0 72 72" width={72} height={72} fill="none">
    <path d="M16 36c0-10 4-18 10-18 3 0 5.5 3 8 8l2 4 2-4c2.5-5 5-8 8-8 6 0 10 8 10 18s-4 18-10 18c-3 0-5.5-3-8-8l-2-4-2 4c-2.5 5-5 8-8 8-6 0-10-8-10-18z" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

const GrokLogo = (color: string) => (
  <svg viewBox="0 0 72 72" width={72} height={72} fill={color}>
    <path d="M8 12h10.5l17.5 22L53.5 12H64L43.2 39.5 64 60H53.5L36 38 18.5 60H8l20.8-20.5z" />
  </svg>
);

const ByteDanceLogo = (color: string) => (
  <svg viewBox="0 0 72 72" width={72} height={72} fill={color}>
    <path d="M42 8v36c0 6.6-5.4 12-12 12s-12-5.4-12-12h6c0 3.3 2.7 6 6 6s6-2.7 6-6V14h-8V8h14z" />
    <path d="M48 22c4.4 0 8-3.6 8-8h-6c0 1.1-.9 2-2 2v6z" />
    <circle cx="30" cy="44" r="4" />
  </svg>
);

const CheckeredFlag = (color: string) => (
  <svg viewBox="0 0 72 72" width={72} height={72} fill="none">
    <rect x="14" y="10" width="10" height="10" fill={color} />
    <rect x="34" y="10" width="10" height="10" fill={color} />
    <rect x="24" y="20" width="10" height="10" fill={color} />
    <rect x="44" y="20" width="10" height="10" fill={color} />
    <rect x="14" y="30" width="10" height="10" fill={color} />
    <rect x="34" y="30" width="10" height="10" fill={color} />
    <rect x="24" y="40" width="10" height="10" fill={color} />
    <rect x="44" y="40" width="10" height="10" fill={color} />
    <rect x="24" y="10" width="10" height="10" fill={color} opacity={0.15} />
    <rect x="44" y="10" width="10" height="10" fill={color} opacity={0.15} />
    <rect x="14" y="20" width="10" height="10" fill={color} opacity={0.15} />
    <rect x="34" y="20" width="10" height="10" fill={color} opacity={0.15} />
    <rect x="24" y="30" width="10" height="10" fill={color} opacity={0.15} />
    <rect x="44" y="30" width="10" height="10" fill={color} opacity={0.15} />
    <rect x="14" y="40" width="10" height="10" fill={color} opacity={0.15} />
    <rect x="34" y="40" width="10" height="10" fill={color} opacity={0.15} />
    <line x1="10" y1="10" x2="10" y2="62" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <circle cx="10" cy="8" r="3" fill={color} />
  </svg>
);

const CARDS: CardData[] = [
  { icon: AppleLogo, title: "APPLE \u00D7 GEMINI", subtitle: "Gemini inside Siri", accent: "#A2AAAD" },
  { icon: GoldmanLogo, title: "GOLDMAN \u00D7 CLAUDE", subtitle: "Replacing accountants", accent: "#D4AF37" },
  { icon: MetaLogo, title: "META AI", subtitle: "5 secret models", accent: "#0668E1" },
  { icon: GrokLogo, title: "GROK TRADING", subtitle: "35% returns", accent: "#FF6B00" },
  { icon: ByteDanceLogo, title: "BYTEDANCE VIDEO", subtitle: "Out-directs humans", accent: "#FF0050" },
  { icon: CheckeredFlag, title: "DAYTONA 300KM/H", subtitle: "Between all of this", accent: "#00C851" },
];

// ─── CONSTANTS (dynamic duration) ────────────────────
const INTRO_DURATION = 55;
const CARD_DURATION = 50; // frames per card
const CLOSING_DURATION = 60; // branding-only outro

const CARDS_START = INTRO_DURATION;
const INTRO_END = INTRO_DURATION;
const CARDS_END = CARDS_START + CARD_DURATION * CARDS.length;
const CLOSING_START = CARDS_END;
const TOTAL_FRAMES = CARDS_END + CLOSING_DURATION;

export const templateConfig: Partial<VideoConfig> = {
  width: 1920,
  height: 1080,
  durationInFrames: TOTAL_FRAMES,
};

const TEXT_PRIMARY = "#f5f5f5";
const TEXT_DIM = "#8b8b8b";

// ─── DETERMINISTIC PARTICLES ─────────────────────────
const PARTICLE_COUNT = 40;
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  x: ((i * 137.508) % 100),
  y: ((i * 89.333) % 100),
  size: 1.5 + (i % 3) * 0.8,
  speedX: ((i % 7) - 3) * 0.15,
  speedY: ((i % 5) - 2) * 0.12,
  opacity: 0.08 + (i % 4) * 0.04,
}));

// ─── COMPONENT ───────────────────────────────────────
export const AITimelineGSAP: React.FC<AnimationProps> = ({ frame, config }) => {
  const { width, height, fps, durationInFrames } = config;

  // ─── Determine active card ─────────────────────────
  const cardIndex = frame >= CARDS_START && frame < CARDS_END
    ? Math.min(Math.floor((frame - CARDS_START) / CARD_DURATION), CARDS.length - 1)
    : -1;
  const cardLocalFrame = cardIndex >= 0 ? (frame - CARDS_START) % CARD_DURATION : -1;
  const activeCard = cardIndex >= 0 ? CARDS[cardIndex] : null;

  // ─── INTRO ANIMATIONS ─────────────────────────────
  const introMY = useTimeline({
    initial: { x: -600, opacity: 0 },
    fps,
    frame,
    builder: (tl, t) => {
      tl.to(t, { x: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }, 0.1);
    },
  });

  const introAI = useTimeline({
    initial: { x: 600, opacity: 0 },
    fps,
    frame,
    builder: (tl, t) => {
      tl.to(t, { x: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }, 0.25);
    },
  });

  const introTimeline = useTimeline({
    initial: { y: 120, opacity: 0 },
    fps,
    frame,
    builder: (tl, t) => {
      tl.to(t, { y: 0, opacity: 1, duration: 1.0, ease: "elastic.out(1, 0.6)" }, 0.5);
    },
  });

  const introEmoji = useTimeline({
    initial: { y: -200, opacity: 0, scale: 0.3 },
    fps,
    frame,
    builder: (tl, t) => {
      tl.to(t, { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "bounce.out" }, 0.7);
    },
  });

  const introFadeOut = useTimeline({
    initial: { opacity: 1 },
    fps,
    frame,
    builder: (tl, t) => {
      tl.to(t, { opacity: 0, duration: 0.25, ease: "power2.in" }, (INTRO_END - 8) / fps);
    },
  });

  // ─── CLOSING ANIMATIONS ────────────────────────────
  // Color streak (0-15 frames into closing)
  const streak = useTimeline({
    initial: { x: -width },
    fps,
    frame,
    builder: (tl, t) => {
      tl.to(t, { x: width * 1.2, duration: 0.5, ease: "expo.out" }, CLOSING_START / fps);
    },
  });

  // Cobrain logo (starts 10 frames into closing, larger)
  const closingLogo = useTimeline({
    initial: { opacity: 0, y: 20 },
    fps,
    frame,
    builder: (tl, t) => {
      tl.to(t, { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }, (CLOSING_START + 10) / fps);
    },
  });

  // ─── EXIT FADE ─────────────────────────────────────
  const exit = useTimeline({
    initial: { opacity: 1 },
    fps,
    frame,
    builder: (tl, t) => {
      tl.to(t, { opacity: 0, duration: 0.5, ease: "power2.in" }, (TOTAL_FRAMES - 15) / fps);
    },
  });

  // ─── BACKGROUND COLOR TRANSITION ───────────────────
  const bgGlow = useTimeline({
    initial: { r: 10, g: 10, b: 10 },
    fps,
    frame,
    builder: (tl, t) => {
      // Subtle glow shift per card
      CARDS.forEach((card, i) => {
        const hex = card.accent;
        const r = parseInt(hex.slice(1, 3), 16) * 0.06;
        const g = parseInt(hex.slice(3, 5), 16) * 0.06;
        const b = parseInt(hex.slice(5, 7), 16) * 0.06;
        const startT = (CARDS_START + i * CARD_DURATION) / fps;
        const dur = CARD_DURATION / fps;
        tl.to(t, { r, g, b, duration: dur * 0.3, ease: "sine.inOut" }, startT);
        if (i < CARDS.length - 1) {
          tl.to(t, { r: 10, g: 10, b: 10, duration: dur * 0.2, ease: "sine.inOut" }, startT + dur * 0.7);
        }
      });
      // Reset for closing
      tl.to(t, { r: 10, g: 10, b: 10, duration: 0.3, ease: "power2.out" }, CLOSING_START / fps);
    },
  });

  // ─── PROGRESS BAR ──────────────────────────────────
  const progressW = Math.min(1, frame / (TOTAL_FRAMES - 1)) * width;

  // ─── Seek card timeline to local frame position ────
  // We must manually compute card state from cardLocalFrame
  const getCardState = () => {
    if (cardLocalFrame < 0) return { x: 800, rotY: -15, scale: 0.85, opacity: 0, iconScale: 1 };

    const enterEnd = 15;
    const exitStart = 38;

    let x: number, rotY: number, scale: number, opacity: number;

    if (cardLocalFrame <= enterEnd) {
      // Enter phase
      const t = cardLocalFrame / enterEnd;
      const ease = Math.min(1, t); // simplified back.out approximation
      const backEase = 1 + 2.4 * Math.pow(ease - 1, 3) + 1.7 * Math.pow(ease - 1, 2);
      x = 800 * (1 - backEase);
      rotY = -15 * (1 - backEase);
      scale = 0.85 + 0.15 * backEase;
      opacity = Math.min(1, t * 3);
    } else if (cardLocalFrame <= exitStart) {
      // Display phase
      x = 0;
      rotY = 0;
      scale = 1;
      opacity = 1;
    } else {
      // Exit phase
      const t = (cardLocalFrame - exitStart) / (CARD_DURATION - exitStart);
      const ease = t * t * t; // power3.in approximation
      x = -600 * ease;
      scale = 1 - 0.2 * ease;
      opacity = 1 - ease;
    }

    // Icon pulse
    let iconScale = 1;
    if (cardLocalFrame >= 18 && cardLocalFrame <= 36) {
      const pulseT = (cardLocalFrame - 18) / 18;
      iconScale = 1 + 0.12 * Math.sin(pulseT * Math.PI * 2);
    }

    return { x, rotY, scale, opacity, iconScale };
  };

  const cs = getCardState();

  // ─── RENDER ────────────────────────────────────────
  const bgColor = `rgb(${Math.round(bgGlow.r)}, ${Math.round(bgGlow.g)}, ${Math.round(bgGlow.b)})`;
  const isIntro = frame < INTRO_END;
  const isCards = frame >= CARDS_START && frame < CARDS_END;
  const isClosing = frame >= CLOSING_START;

  return (
    <div
      style={{
        width,
        height,
        background: bgColor,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        opacity: exit.opacity,
      }}
    >
      {/* ── Ambient glow (card accent leak) ── */}
      {activeCard && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: width * 0.8,
            height: height * 0.8,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${activeCard.accent}10 0%, transparent 70%)`,
            filter: "blur(100px)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── Floating micro-particles ── */}
      {particles.map((p, i) => {
        const px = ((p.x + p.speedX * frame) % 100 + 100) % 100;
        const py = ((p.y + p.speedY * frame) % 100 + 100) % 100;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${px}%`,
              top: `${py}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: activeCard ? activeCard.accent : "#3b82f6",
              opacity: p.opacity,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* ── Scanlines overlay ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 4px)",
          pointerEvents: "none",
          zIndex: 50,
        }}
      />

      {/* ════════════════════════════════════════════════
          ACT 1 — INTRO (0-55)
          ════════════════════════════════════════════════ */}
      {isIntro && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: introFadeOut.opacity,
          }}
        >
          {/* MY */}
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              color: TEXT_PRIMARY,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              opacity: introMY.opacity,
              transform: `translateX(${introMY.x}px)`,
            }}
          >
            MY
          </div>

          {/* AI + Emoji row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 30,
              marginTop: -10,
            }}
          >
            <div
              style={{
                fontSize: 160,
                fontWeight: 900,
                color: "#3b82f6",
                letterSpacing: "-0.04em",
                lineHeight: 1,
                opacity: introAI.opacity,
                transform: `translateX(${introAI.x}px)`,
                textShadow: "0 0 60px rgba(59,130,246,0.4)",
              }}
            >
              AI
            </div>
            <div
              style={{
                fontSize: 80,
                opacity: introEmoji.opacity,
                transform: `translateY(${introEmoji.y}px) scale(${introEmoji.scale})`,
              }}
            >
              {"\u{1F525}"}
            </div>
          </div>

          {/* TIMELINE */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: TEXT_PRIMARY,
              letterSpacing: "0.15em",
              lineHeight: 1,
              marginTop: 5,
              opacity: introTimeline.opacity,
              transform: `translateY(${introTimeline.y}px)`,
            }}
          >
            TIMELINE
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          ACT 2 — CARD SHOWCASE (55-355)
          ════════════════════════════════════════════════ */}
      {isCards && activeCard && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* ── Card ── */}
          <div
            style={{
              width: 800,
              height: 420,
              background: "#111111",
              borderRadius: 24,
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              opacity: cs.opacity,
              transform: `translateX(${cs.x}px) perspective(1200px) rotateY(${cs.rotY}deg) scale(${cs.scale})`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${activeCard.accent}15, inset 0 1px 0 rgba(255,255,255,0.05)`,
              border: `1px solid rgba(255,255,255,0.06)`,
            }}
          >
            {/* Accent top border */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                background: activeCard.accent,
                borderRadius: "24px 24px 0 0",
              }}
            />

            {/* Icon */}
            <div
              style={{
                lineHeight: 1,
                transform: `scale(${cs.iconScale})`,
                marginTop: 20,
              }}
            >
              {activeCard.icon(activeCard.accent)}
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: TEXT_PRIMARY,
                letterSpacing: "0.04em",
                textAlign: "center",
              }}
            >
              {activeCard.title}
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 24,
                fontWeight: 500,
                color: TEXT_DIM,
                textAlign: "center",
              }}
            >
              {activeCard.subtitle}
            </div>

            {/* Accent bottom bar */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "15%",
                right: "15%",
                height: 4,
                background: `linear-gradient(90deg, transparent, ${activeCard.accent}, transparent)`,
                borderRadius: 2,
                boxShadow: `0 0 20px ${activeCard.accent}40`,
              }}
            />
          </div>

          {/* ── Card index dots ── */}
          <div
            style={{
              position: "absolute",
              bottom: 80,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 14,
            }}
          >
            {CARDS.map((c, i) => (
              <div
                key={i}
                style={{
                  width: i === cardIndex ? 28 : 10,
                  height: 10,
                  borderRadius: 5,
                  background: i === cardIndex ? c.accent : "rgba(255,255,255,0.15)",
                  boxShadow: i === cardIndex ? `0 0 12px ${c.accent}60` : "none",
                  transition: "none",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          ACT 3 — CLOSING (355-450)
          ════════════════════════════════════════════════ */}
      {isClosing && (
        <>
          {/* Color streak */}
          {frame < CLOSING_START + 20 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: streak.x,
                width: width * 0.3,
                height: "100%",
                display: "flex",
                pointerEvents: "none",
              }}
            >
              {CARDS.map((c, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    background: `linear-gradient(180deg, ${c.accent}60, ${c.accent}20)`,
                    filter: "blur(8px)",
                  }}
                />
              ))}
            </div>
          )}

          {/* Cobrain branding */}
          {closingLogo.opacity > 0.01 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: closingLogo.opacity,
                transform: `translateY(${closingLogo.y}px)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <img
                  src="/cobrain-logo.png"
                  style={{ width: 56, height: 56, borderRadius: "50%" }}
                />
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.5)",
                    letterSpacing: "0.03em",
                  }}
                >
                  cobrain
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Progress bar (full-width bottom) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: progressW,
          height: 3,
          background: activeCard
            ? `linear-gradient(90deg, ${activeCard.accent}, ${activeCard.accent}80)`
            : "linear-gradient(90deg, #3b82f6, #3b82f680)",
          boxShadow: activeCard
            ? `0 0 10px ${activeCard.accent}40`
            : "0 0 10px rgba(59,130,246,0.3)",
          zIndex: 40,
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
          color: "rgba(255,255,255,0.15)",
          letterSpacing: "0.1em",
          zIndex: 40,
        }}
      >
        FR {String(frame).padStart(3, "0")}/{durationInFrames}
      </div>
    </div>
  );
};
