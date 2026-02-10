import React from "react";
import type { AnimationProps, VideoConfig } from "../animations";
import { interpolate, spring, easing } from "../animations";
import { Sequence, useCurrentFrame, useVideoConfig } from "../Sequence";
import { useTimeline } from "../gsap";
import type { ProjectMeta, TimelineSegment } from "./types";

export const meta: ProjectMeta = {
  id: "ai-timeline-v2",
  name: "AI Timeline V2",
  brand: "cobrain",
  category: "promo",
  color: "#8b5cf6",
};

// ─── BRAND ICONS (Simple Icons exact paths) ──────────
const BrandIcon: React.FC<{ path: string; color: string; size?: number }> = ({ path, color, size = 48 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
    <path d={path} />
  </svg>
);

const ICON_PATHS = {
  apple: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
  meta: "M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z",
  x: "M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z",
  tiktok: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  // Goldman Sachs: clean monogram (no simple-icons available)
  goldman: "",
  // Checkered flag for racing
  checkered: "",
} as const;

// ─── CARD DATA ───────────────────────────────────────
interface CardData {
  iconPath: string;
  iconType: "svg" | "text";
  iconText?: string;
  title: string;
  subtitle: string;
  accent: string;
}

const CARDS: CardData[] = [
  { iconPath: ICON_PATHS.apple, iconType: "svg", title: "APPLE × GEMINI", subtitle: "Gemini inside Siri", accent: "#A2AAAD" },
  { iconPath: ICON_PATHS.goldman, iconType: "text", iconText: "GS", title: "GOLDMAN × CLAUDE", subtitle: "Replacing accountants", accent: "#D4AF37" },
  { iconPath: ICON_PATHS.meta, iconType: "svg", title: "META AI", subtitle: "5 secret models", accent: "#0668E1" },
  { iconPath: ICON_PATHS.x, iconType: "svg", title: "GROK TRADING", subtitle: "35% returns", accent: "#FF6B00" },
  { iconPath: ICON_PATHS.tiktok, iconType: "svg", title: "BYTEDANCE VIDEO", subtitle: "Out-directs humans", accent: "#FF0050" },
  { iconPath: ICON_PATHS.checkered, iconType: "text", iconText: "🏁", title: "DAYTONA 300KM/H", subtitle: "Between all of this", accent: "#00C851" },
];

// ─── TIMING (dynamic) ────────────────────────────────
const INTRO_DURATION = 55;
const CARD_DURATION = 50;
const CLOSING_DURATION = 60;
const CARDS_START = INTRO_DURATION;
const CARDS_END = CARDS_START + CARD_DURATION * CARDS.length;
const TOTAL_FRAMES = CARDS_END + CLOSING_DURATION;

export const templateConfig: Partial<VideoConfig> = {
  width: 1920,
  height: 1080,
  durationInFrames: TOTAL_FRAMES,
};

export const timeline: TimelineSegment[] = [
  { name: "Intro", from: 0, durationInFrames: INTRO_DURATION, color: "#3b82f6" },
  ...CARDS.map((card, i) => ({
    name: card.title,
    from: CARDS_START + i * CARD_DURATION,
    durationInFrames: CARD_DURATION,
    color: card.accent,
  })),
  { name: "Closing", from: CARDS_END, durationInFrames: CLOSING_DURATION, color: "#8b5cf6" },
];

// ─── PARTICLES (deterministic) ───────────────────────
const PARTICLE_COUNT = 50;
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const phi = i * 137.508 * (Math.PI / 180);
  const r = Math.sqrt(i / PARTICLE_COUNT);
  return {
    x: 50 + Math.cos(phi) * r * 45,
    y: 50 + Math.sin(phi) * r * 45,
    speedX: ((i % 7) - 3) * 0.08,
    speedY: ((i % 5) - 2) * 0.06,
    size: 1.5 + (i % 3) * 0.8,
    opacity: 0.1 + (i % 4) * 0.05,
  };
});

// ─── SUB-COMPONENTS ──────────────────────────────────

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const myX = interpolate(frame, [3, 24], [-600, 0], { easing: easing.easeOutCubic });
  const myOpacity = interpolate(frame, [3, 12], [0, 1]);

  const aiX = interpolate(frame, [8, 28], [600, 0], { easing: easing.easeOutCubic });
  const aiOpacity = interpolate(frame, [8, 16], [0, 1]);

  const tlScale = spring({ frame: Math.max(0, frame - 15), fps, damping: 8, stiffness: 80 });
  const tlOpacity = interpolate(frame, [15, 22], [0, 1]);
  const tlY = interpolate(tlScale, [0, 1], [120, 0]);

  const emojiScale = spring({ frame: Math.max(0, frame - 21), fps, damping: 6, stiffness: 120, mass: 0.8 });
  const emojiOpacity = interpolate(frame, [21, 26], [0, 1]);

  const fadeOut = interpolate(frame, [INTRO_DURATION - 8, INTRO_DURATION], [1, 0]);

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: fadeOut,
    }}>
      <div style={{
        fontSize: 120, fontWeight: 900, color: "#f5f5f5",
        letterSpacing: "-0.02em", lineHeight: 1,
        opacity: myOpacity, transform: `translateX(${myX}px)`,
      }}>MY</div>

      <div style={{ display: "flex", alignItems: "center", gap: 30, marginTop: -10 }}>
        <div style={{
          fontSize: 160, fontWeight: 900, color: "#3b82f6",
          letterSpacing: "-0.04em", lineHeight: 1,
          opacity: aiOpacity, transform: `translateX(${aiX}px)`,
          textShadow: "0 0 60px rgba(59,130,246,0.4)",
        }}>AI</div>
        <div style={{ fontSize: 80, opacity: emojiOpacity, transform: `scale(${emojiScale})` }}>
          🔥
        </div>
      </div>

      <div style={{
        fontSize: 72, fontWeight: 800, color: "#f5f5f5",
        letterSpacing: "0.15em", lineHeight: 1, marginTop: 5,
        opacity: tlOpacity, transform: `translateY(${tlY}px)`,
      }}>TIMELINE</div>
    </div>
  );
};

const CardView: React.FC<{ card: CardData; index: number }> = ({ card, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Enter: spring
  const enterP = spring({ frame, fps, damping: 12, stiffness: 100 });
  const enterX = interpolate(enterP, [0, 1], [800, 0]);
  const enterRotY = interpolate(enterP, [0, 1], [-15, 0]);
  const enterScale = interpolate(enterP, [0, 1], [0.85, 1]);
  const enterOpacity = interpolate(frame, [0, 5], [0, 1]);

  // Exit: accelerate out
  const exitP = interpolate(frame, [38, CARD_DURATION], [0, 1], { easing: easing.easeInCubic });
  const exitX = interpolate(exitP, [0, 1], [0, -600]);
  const exitScale = interpolate(exitP, [0, 1], [1, 0.8]);
  const exitOpacity = interpolate(exitP, [0, 1], [1, 0]);

  const isExiting = frame >= 38;
  const x = isExiting ? exitX : enterX;
  const s = isExiting ? exitScale : enterScale;
  const rY = isExiting ? 0 : enterRotY;
  const o = isExiting ? exitOpacity : enterOpacity;

  // Icon pulse
  const pulseT = interpolate(frame, [18, 36], [0, Math.PI * 2]);
  const iconScale = frame >= 18 && frame <= 36 ? 1 + 0.12 * Math.sin(pulseT) : 1;

  const renderIcon = () => {
    if (card.iconType === "text") {
      if (card.iconText === "GS") {
        return (
          <svg viewBox="0 0 72 52" width={72} height={52} fill="none">
            <rect x="1" y="1" width="70" height="50" rx="4" stroke={card.accent} strokeWidth="2" />
            <text x="36" y="34" textAnchor="middle" fontFamily="'Georgia',serif" fontSize="28" fontWeight="700" fill={card.accent}>GS</text>
          </svg>
        );
      }
      return <span style={{ fontSize: 56 }}>{card.iconText}</span>;
    }
    return <BrandIcon path={card.iconPath} color={card.accent} size={56} />;
  };

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        width: 800, height: 420,
        background: "#111111", borderRadius: 24,
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
        opacity: o,
        transform: `translateX(${x}px) perspective(1200px) rotateY(${rY}deg) scale(${s})`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${card.accent}15, inset 0 1px 0 rgba(255,255,255,0.05)`,
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Accent top */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 6,
          background: card.accent, borderRadius: "24px 24px 0 0",
        }} />

        {/* Icon */}
        <div style={{ transform: `scale(${iconScale})`, marginTop: 20, filter: `drop-shadow(0 0 8px ${card.accent}40)` }}>
          {renderIcon()}
        </div>

        {/* Title */}
        <div style={{
          fontSize: 36, fontWeight: 800, color: "#f5f5f5",
          letterSpacing: "0.04em", textAlign: "center",
        }}>{card.title}</div>

        {/* Subtitle */}
        <div style={{ fontSize: 24, fontWeight: 500, color: "#8b8b8b", textAlign: "center" }}>
          {card.subtitle}
        </div>

        {/* Accent bottom */}
        <div style={{
          position: "absolute", bottom: 0, left: "15%", right: "15%", height: 4,
          background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)`,
          borderRadius: 2, boxShadow: `0 0 20px ${card.accent}40`,
        }} />
      </div>

      {/* Dots */}
      <div style={{
        position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 14,
      }}>
        {CARDS.map((c, i) => (
          <div key={i} style={{
            width: i === index ? 28 : 10, height: 10, borderRadius: 5,
            background: i === index ? c.accent : "rgba(255,255,255,0.15)",
            boxShadow: i === index ? `0 0 12px ${c.accent}60` : "none",
          }} />
        ))}
      </div>
    </div>
  );
};

const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Color streak (GSAP for complex multi-stop)
  const streak = useTimeline({
    initial: { x: -width },
    fps, frame,
    builder: (tl, t) => {
      tl.to(t, { x: width * 1.2, duration: 0.5, ease: "expo.out" }, 0);
    },
  });

  // Logo spring
  const logoP = spring({ frame: Math.max(0, frame - 10), fps, damping: 15, stiffness: 60 });
  const logoOpacity = interpolate(logoP, [0, 1], [0, 1]);
  const logoY = interpolate(logoP, [0, 1], [20, 0]);

  return (
    <>
      {frame < 20 && (
        <div style={{
          position: "absolute", top: 0, left: streak.x,
          width: width * 0.3, height: "100%", display: "flex", pointerEvents: "none",
        }}>
          {CARDS.map((c, i) => (
            <div key={i} style={{
              flex: 1,
              background: `linear-gradient(180deg, ${c.accent}60, ${c.accent}20)`,
              filter: "blur(8px)",
            }} />
          ))}
        </div>
      )}

      {logoOpacity > 0.01 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: logoOpacity, transform: `translateY(${logoY}px)`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <img src="/cobrain-logo.png" style={{ width: 56, height: 56, borderRadius: "50%" }} />
            <span style={{
              fontSize: 28, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.03em",
            }}>cobrain</span>
          </div>
        </div>
      )}
    </>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────
export const AITimelineV2: React.FC<AnimationProps> = ({ frame, config }) => {
  const { width, height, durationInFrames } = config;

  // Active card (for particles + bg)
  const cardIndex = frame >= CARDS_START && frame < CARDS_END
    ? Math.min(Math.floor((frame - CARDS_START) / CARD_DURATION), CARDS.length - 1)
    : -1;
  const activeCard = cardIndex >= 0 ? CARDS[cardIndex] : null;
  const accentColor = activeCard?.accent ?? "#3b82f6";

  // Background glow
  const hex = accentColor;
  const bgR = activeCard ? parseInt(hex.slice(1, 3), 16) * 0.06 : 10;
  const bgG = activeCard ? parseInt(hex.slice(3, 5), 16) * 0.06 : 10;
  const bgB = activeCard ? parseInt(hex.slice(5, 7), 16) * 0.06 : 10;
  const bgColor = `rgb(${Math.round(bgR)}, ${Math.round(bgG)}, ${Math.round(bgB)})`;

  // Exit fade
  const exitOpacity = interpolate(frame, [TOTAL_FRAMES - 15, TOTAL_FRAMES], [1, 0]);

  // Progress
  const progressW = (frame / (TOTAL_FRAMES - 1)) * width;

  return (
    <div style={{
      width, height, background: bgColor,
      position: "relative", overflow: "hidden",
      fontFamily: "'Inter', system-ui, sans-serif",
      opacity: exitOpacity,
    }}>
      {/* Ambient glow */}
      {activeCard && (
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          width: width * 0.8, height: height * 0.8, borderRadius: "50%",
          background: `radial-gradient(ellipse, ${accentColor}10 0%, transparent 70%)`,
          filter: "blur(100px)", pointerEvents: "none",
        }} />
      )}

      {/* Particles */}
      {particles.map((p, i) => {
        const px = ((p.x + p.speedX * frame) % 100 + 100) % 100;
        const py = ((p.y + p.speedY * frame) % 100 + 100) % 100;
        return (
          <div key={i} style={{
            position: "absolute", left: `${px}%`, top: `${py}%`,
            width: p.size, height: p.size, borderRadius: "50%",
            background: accentColor, opacity: p.opacity, pointerEvents: "none",
          }} />
        );
      })}

      {/* Scanlines */}
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 4px)",
        pointerEvents: "none", zIndex: 50,
      }} />

      {/* ═══ ACT 1 — INTRO ═══ */}
      <Sequence durationInFrames={INTRO_DURATION}>
        <Intro />
      </Sequence>

      {/* ═══ ACT 2 — CARDS ═══ */}
      {CARDS.map((card, i) => (
        <Sequence key={i} from={CARDS_START + i * CARD_DURATION} durationInFrames={CARD_DURATION}>
          <CardView card={card} index={i} />
        </Sequence>
      ))}

      {/* ═══ ACT 3 — CLOSING ═══ */}
      <Sequence from={CARDS_END} durationInFrames={CLOSING_DURATION}>
        <Closing />
      </Sequence>

      {/* Progress bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, width: progressW, height: 3,
        background: activeCard
          ? `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`
          : "linear-gradient(90deg, #3b82f6, #3b82f680)",
        boxShadow: activeCard ? `0 0 10px ${accentColor}40` : "0 0 10px rgba(59,130,246,0.3)",
        zIndex: 40,
      }} />

      {/* Frame counter */}
      <div style={{
        position: "absolute", bottom: 30, right: 60,
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        fontSize: 12, color: "rgba(255,255,255,0.15)",
        letterSpacing: "0.1em", zIndex: 40,
      }}>
        FR {String(frame).padStart(3, "0")}/{durationInFrames}
      </div>
    </div>
  );
};
