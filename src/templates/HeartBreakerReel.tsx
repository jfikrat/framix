import React, { useRef, useEffect } from "react";
import type { ProjectMeta, TimelineSegment } from "./types";
import type { AnimationProps } from "../animations";
import { interpolate, spring, easing } from "../animations";
import { Sequence, useCurrentFrame, useVideoConfig } from "../Sequence";

// ─── Brand Tokens ──────────────────────────────────────
const C = {
  primary: "#F59B93", // coral/salmon pink
  secondary: "#EAE4E1", // warm beige
  text: "#2a2a2a", // dark text on beige
  textLight: "#f5f5f5", // light text on video
  textMuted: "rgba(0,0,0,0.45)", // secondary text on beige
  accent: "#D4A574", // warm gold
};

const SERIF = "'Cormorant Garamond', 'Georgia', 'Times New Roman', serif";
const SANS = "'Inter', system-ui, -apple-system, sans-serif";

// ─── Timeline Constants ────────────────────────────────
const FPS = 30;
const INTRO = { from: 0, dur: 60 }; // 2s
const S1 = { from: 60, dur: 150 }; // 5s
const S2 = { from: 210, dur: 150 }; // 5s
const S3 = { from: 360, dur: 150 }; // 5s
const OUTRO = { from: 510, dur: 90 }; // 3s
const TOTAL = 600; // 20s

// ─── Exports ───────────────────────────────────────────
export const meta: ProjectMeta = {
  id: "heartbreaker-reel",
  name: "HeartBreaker Reel",
  brand: "feelinggood",
  category: "promo",
  color: C.primary,
};

export const templateConfig = {
  width: 1080,
  height: 1920,
  fps: FPS,
  durationInFrames: TOTAL,
};

export const timeline: TimelineSegment[] = [
  { name: "Intro", from: INTRO.from, durationInFrames: INTRO.dur, color: C.accent },
  { name: "Bowl", from: S1.from, durationInFrames: S1.dur, color: C.primary },
  { name: "Plate", from: S2.from, durationInFrames: S2.dur, color: C.accent },
  { name: "Vase", from: S3.from, durationInFrames: S3.dur, color: C.primary },
  { name: "Outro", from: OUTRO.from, durationInFrames: OUTRO.dur, color: C.accent },
];

// ─── Synced Video ──────────────────────────────────────
const SyncedVideo: React.FC<{
  src: string;
  style?: React.CSSProperties;
}> = ({ src, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.pause();
    v.currentTime = Math.min(frame / fps, v.duration || 999);
  }, [frame, fps]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      playsInline
      preload="auto"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        ...style,
      }}
    />
  );
};

// ─── Intro Scene ───────────────────────────────────────
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame: Math.max(0, frame - 8), fps, damping: 10, stiffness: 80 });
  const logoScale = interpolate(logoSpring, [0, 1], [0.85, 1]);
  const logoOpacity = interpolate(frame, [0, 25], [0, 1], { easing: easing.easeOutCubic });

  // Collection name
  const titleDelay = 18;
  const titleSpring = spring({ frame: Math.max(0, frame - titleDelay), fps, damping: 12, stiffness: 90 });
  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);
  const titleOp = interpolate(titleSpring, [0, 1], [0, 1]);

  // Subtitle
  const subDelay = 28;
  const subSpring = spring({ frame: Math.max(0, frame - subDelay), fps, damping: 14, stiffness: 100 });
  const subY = interpolate(subSpring, [0, 1], [20, 0]);
  const subOp = interpolate(subSpring, [0, 1], [0, 1]);

  // Coral accent line
  const lineDelay = 24;
  const lineSpring = spring({ frame: Math.max(0, frame - lineDelay), fps, damping: 15, stiffness: 120 });

  // Exit fade
  const exitOp = interpolate(frame, [INTRO.dur - 12, INTRO.dur], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: C.secondary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        opacity: exitOp,
      }}
    >
      {/* Soft coral glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.primary}18 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Logo */}
      <img
        src="/brands/feelinggood/logo.svg"
        alt="Feeling Good Inside"
        style={{
          height: 200,
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
        }}
      />

      {/* Collection name */}
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 64,
          fontWeight: 600,
          color: C.text,
          letterSpacing: "-0.01em",
          lineHeight: 1.1,
          textAlign: "center",
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        HeartBreaker Club
      </div>

      {/* Accent line */}
      <div
        style={{
          width: interpolate(lineSpring, [0, 1], [0, 80]),
          height: 2.5,
          background: C.primary,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          fontFamily: SANS,
          fontSize: 22,
          fontWeight: 400,
          color: C.textMuted,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          opacity: subOp,
          transform: `translateY(${subY}px)`,
        }}
      >
        XOXO Collection
      </div>
    </div>
  );
};

// ─── Video Scene ───────────────────────────────────────
const VideoSceneContent: React.FC<{
  src: string;
  heading: string;
  subtext: string;
  duration: number;
}> = ({ src, heading, subtext, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in/out — slightly longer for calm feel
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { easing: easing.easeOutCubic });
  const fadeOut = interpolate(frame, [duration - 20, duration], [1, 0], { easing: easing.easeInCubic });
  const opacity = Math.min(fadeIn, fadeOut);

  // Ken Burns — slower zoom for calm mood
  const scale = interpolate(frame, [0, duration], [1.0, 1.06], { easing: easing.linear });

  // Text animation
  const textDelay = 22;
  const textSpring = spring({ frame: Math.max(0, frame - textDelay), fps, damping: 12, stiffness: 90 });
  const textY = interpolate(textSpring, [0, 1], [40, 0]);
  const textOp = interpolate(textSpring, [0, 1], [0, 1]);

  // Subtext stagger
  const subDelay = 34;
  const subSpring = spring({ frame: Math.max(0, frame - subDelay), fps, damping: 14, stiffness: 100 });
  const subY = interpolate(subSpring, [0, 1], [18, 0]);
  const subOp = interpolate(subSpring, [0, 1], [0, 1]);

  // Accent underline
  const lineDelay = 38;
  const lineSpring = spring({ frame: Math.max(0, frame - lineDelay), fps, damping: 15, stiffness: 120 });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity }}>
      {/* Video with Ken Burns */}
      <div style={{ position: "absolute", inset: 0, transform: `scale(${scale})`, transformOrigin: "center" }}>
        <SyncedVideo src={src} />
      </div>

      {/* Gradient overlay — soft, bottom-heavy */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.15) 100%)",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 60% at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Text block */}
      <div
        style={{
          position: "absolute",
          bottom: 280,
          width: "100%",
          textAlign: "center",
          padding: "0 60px",
        }}
      >
        {/* Heading */}
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 50,
            fontWeight: 600,
            color: C.textLight,
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            opacity: textOp,
            transform: `translateY(${textY}px)`,
            textShadow: "0 2px 30px rgba(0,0,0,0.5)",
          }}
        >
          {heading}
        </div>

        {/* Accent underline */}
        <div
          style={{
            width: 44,
            height: 2,
            background: C.primary,
            margin: "14px auto 0",
            transform: `scaleX(${lineSpring})`,
            transformOrigin: "center",
          }}
        />

        {/* Subtext */}
        <div
          style={{
            fontFamily: SANS,
            fontSize: 18,
            fontWeight: 400,
            color: C.primary,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginTop: 12,
            opacity: subOp,
            transform: `translateY(${subY}px)`,
            textShadow: "0 1px 12px rgba(0,0,0,0.4)",
          }}
        >
          {subtext}
        </div>
      </div>
    </div>
  );
};

// ─── Outro Scene ───────────────────────────────────────
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame: Math.max(0, frame - 8), fps, damping: 12, stiffness: 90 });
  const logoY = interpolate(logoSpring, [0, 1], [20, 0]);
  const logoOp = interpolate(logoSpring, [0, 1], [0, 1]);

  const lineSpring = spring({ frame: Math.max(0, frame - 18), fps, damping: 15, stiffness: 120 });

  const handleSpring = spring({ frame: Math.max(0, frame - 25), fps, damping: 14, stiffness: 100 });
  const handleY = interpolate(handleSpring, [0, 1], [15, 0]);
  const handleOp = interpolate(handleSpring, [0, 1], [0, 1]);

  const urlSpring = spring({ frame: Math.max(0, frame - 34), fps, damping: 14, stiffness: 100 });
  const urlOp = interpolate(urlSpring, [0, 1], [0, 1]);
  const urlY = interpolate(urlSpring, [0, 1], [12, 0]);

  // Final fade
  const fadeOut = interpolate(frame, [OUTRO.dur - 20, OUTRO.dur], [1, 0], { easing: easing.easeInCubic });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: C.secondary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        opacity: fadeOut,
      }}
    >
      {/* Soft coral glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.primary}14 0%, transparent 60%)`,
          filter: "blur(80px)",
          transform: "translateY(-30px)",
        }}
      />

      {/* Logo */}
      <img
        src="/brands/feelinggood/logo.svg"
        alt="Feeling Good Inside"
        style={{
          height: 160,
          opacity: logoOp,
          transform: `translateY(${logoY}px)`,
        }}
      />

      {/* Accent divider */}
      <div
        style={{
          width: interpolate(lineSpring, [0, 1], [0, 60]),
          height: 2,
          background: C.accent,
        }}
      />

      {/* Handle */}
      <div
        style={{
          fontFamily: SANS,
          fontSize: 20,
          fontWeight: 400,
          color: C.textMuted,
          letterSpacing: "0.1em",
          opacity: handleOp,
          transform: `translateY(${handleY}px)`,
        }}
      >
        @feelinggoodinside
      </div>

      {/* Website */}
      <div
        style={{
          fontFamily: SANS,
          fontSize: 17,
          fontWeight: 400,
          color: C.textMuted,
          letterSpacing: "0.06em",
          opacity: urlOp,
          transform: `translateY(${urlY}px)`,
          marginTop: 4,
        }}
      >
        feelinggoodinside.com
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────
export const HeartBreakerReel: React.FC<AnimationProps> = ({ frame, config }) => {
  return (
    <div
      style={{
        width: config.width,
        height: config.height,
        position: "relative",
        overflow: "hidden",
        background: C.secondary,
        fontFamily: SANS,
      }}
    >
      {/* Font import */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');`}</style>

      {/* Intro */}
      <Sequence from={INTRO.from} durationInFrames={INTRO.dur}>
        <IntroScene />
      </Sequence>

      {/* Scene 1 — Bowl */}
      <Sequence from={S1.from} durationInFrames={S1.dur}>
        <VideoSceneContent
          src="/brands/feelinggood/video/v2-bowl-portrait.mp4"
          heading="Morning Ritual"
          subtext="Start your day with heart"
          duration={S1.dur}
        />
      </Sequence>

      {/* Scene 2 — Plate */}
      <Sequence from={S2.from} durationInFrames={S2.dur}>
        <VideoSceneContent
          src="/brands/feelinggood/video/v2-plate-portrait.mp4"
          heading="Set with Love"
          subtext="Every detail, a valentine"
          duration={S2.dur}
        />
      </Sequence>

      {/* Scene 3 — Vase */}
      <Sequence from={S3.from} durationInFrames={S3.dur}>
        <VideoSceneContent
          src="/brands/feelinggood/video/v2-vase-portrait.mp4"
          heading="Blooming Hearts"
          subtext="Where flowers find home"
          duration={S3.dur}
        />
      </Sequence>

      {/* Outro */}
      <Sequence from={OUTRO.from} durationInFrames={OUTRO.dur}>
        <OutroScene />
      </Sequence>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 3,
          width: `${(frame / config.durationInFrames) * 100}%`,
          background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
          zIndex: 10,
        }}
      />

      {/* Frame counter */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 16,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: "rgba(0,0,0,0.2)",
          zIndex: 10,
        }}
      >
        FR {String(frame).padStart(3, "0")}/{config.durationInFrames}
      </div>
    </div>
  );
};
