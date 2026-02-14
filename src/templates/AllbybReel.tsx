import React, { useRef, useEffect } from "react";
import type { ProjectMeta, TimelineSegment } from "./types";
import type { AnimationProps } from "../animations";
import { interpolate, spring, easing } from "../animations";
import { Sequence, useCurrentFrame, useVideoConfig } from "../Sequence";

// ─── Brand Tokens ──────────────────────────────────────
const C = {
  primary: "#82B735",
  accent: "#D4AF37",
  bg: "#0a0a0a",
  surface: "#1a1a1a",
  text: "#f5f5f5",
  textMuted: "rgba(255,255,255,0.5)",
};

const SERIF = "'Playfair Display', 'Georgia', 'Times New Roman', serif";
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
  id: "allbyb-reel",
  name: "ALLBYB Reel",
  brand: "allbyb",
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
  { name: "Street Walk", from: S1.from, durationInFrames: S1.dur, color: C.primary },
  { name: "Café", from: S2.from, durationInFrames: S2.dur, color: C.accent },
  { name: "Golden Hour", from: S3.from, durationInFrames: S3.dur, color: C.primary },
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

  const tagDelay = 20;
  const tagSpring = spring({ frame: Math.max(0, frame - tagDelay), fps, damping: 14, stiffness: 100 });
  const tagY = interpolate(tagSpring, [0, 1], [24, 0]);
  const tagOpacity = interpolate(tagSpring, [0, 1], [0, 1]);

  // Gold shimmer line
  const shimmerX = interpolate(frame, [15, 45], [-120, 120], { easing: easing.easeInOut });

  // Exit fade
  const exitOp = interpolate(frame, [INTRO.dur - 12, INTRO.dur], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        opacity: exitOp,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.accent}18 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Logo */}
      <img
        src="/brands/allbyb/logo.svg"
        alt="ALLBYB"
        style={{
          height: 110,
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          filter: "brightness(0) invert(1)",
        }}
      />

      {/* Gold shimmer line */}
      <div
        style={{
          width: 80,
          height: 1.5,
          background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
          opacity: interpolate(frame, [12, 20, 42, 50], [0, 0.8, 0.8, 0]),
          transform: `translateX(${shimmerX}px)`,
        }}
      />

      {/* Tagline */}
      <div
        style={{
          fontFamily: SANS,
          fontSize: 17,
          fontWeight: 400,
          color: C.accent,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          opacity: tagOpacity,
          transform: `translateY(${tagY}px)`,
        }}
      >
        Handwoven Luxury
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
  textAlign?: "left" | "center";
}> = ({ src, heading, subtext, duration, textAlign = "center" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in/out
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { easing: easing.easeOutCubic });
  const fadeOut = interpolate(frame, [duration - 15, duration], [1, 0], { easing: easing.easeInCubic });
  const opacity = Math.min(fadeIn, fadeOut);

  // Ken Burns — slow zoom
  const scale = interpolate(frame, [0, duration], [1.0, 1.08], { easing: easing.linear });

  // Text animation
  const textDelay = 18;
  const textSpring = spring({ frame: Math.max(0, frame - textDelay), fps, damping: 12, stiffness: 90 });
  const textY = interpolate(textSpring, [0, 1], [50, 0]);
  const textOp = interpolate(textSpring, [0, 1], [0, 1]);

  // Subtext stagger
  const subDelay = 30;
  const subSpring = spring({ frame: Math.max(0, frame - subDelay), fps, damping: 14, stiffness: 100 });
  const subY = interpolate(subSpring, [0, 1], [20, 0]);
  const subOp = interpolate(subSpring, [0, 1], [0, 1]);

  // Gold underline
  const lineDelay = 35;
  const lineSpring = spring({ frame: Math.max(0, frame - lineDelay), fps, damping: 15, stiffness: 120 });

  const pad = textAlign === "left" ? { left: 72, right: 72 } : { left: 0, right: 0 };

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity }}>
      {/* Video with Ken Burns */}
      <div style={{ position: "absolute", inset: 0, transform: `scale(${scale})`, transformOrigin: "center" }}>
        <SyncedVideo src={src} />
      </div>

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 60% at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Text block */}
      <div
        style={{
          position: "absolute",
          bottom: 260,
          ...pad,
          width: textAlign === "center" ? "100%" : undefined,
          textAlign,
          padding: textAlign === "center" ? "0 60px" : undefined,
        }}
      >
        {/* Heading */}
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 54,
            fontWeight: 700,
            color: C.text,
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            opacity: textOp,
            transform: `translateY(${textY}px)`,
            textShadow: "0 2px 30px rgba(0,0,0,0.6)",
          }}
        >
          {heading}
        </div>

        {/* Gold underline */}
        <div
          style={{
            width: 48,
            height: 2,
            background: C.accent,
            margin: textAlign === "center" ? "16px auto 0" : "16px 0 0",
            transform: `scaleX(${lineSpring})`,
            transformOrigin: textAlign === "center" ? "center" : "left",
          }}
        />

        {/* Subtext */}
        <div
          style={{
            fontFamily: SANS,
            fontSize: 19,
            fontWeight: 400,
            color: C.accent,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginTop: 14,
            opacity: subOp,
            transform: `translateY(${subY}px)`,
            textShadow: "0 1px 12px rgba(0,0,0,0.5)",
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
  const logoY = interpolate(logoSpring, [0, 1], [25, 0]);
  const logoOp = interpolate(logoSpring, [0, 1], [0, 1]);

  const lineSpring = spring({ frame: Math.max(0, frame - 18), fps, damping: 15, stiffness: 120 });

  const handleSpring = spring({ frame: Math.max(0, frame - 25), fps, damping: 14, stiffness: 100 });
  const handleY = interpolate(handleSpring, [0, 1], [15, 0]);
  const handleOp = interpolate(handleSpring, [0, 1], [0, 1]);

  const sloganSpring = spring({ frame: Math.max(0, frame - 35), fps, damping: 14, stiffness: 100 });
  const sloganOp = interpolate(sloganSpring, [0, 1], [0, 1]);
  const sloganY = interpolate(sloganSpring, [0, 1], [12, 0]);

  // Final fade
  const fadeOut = interpolate(frame, [OUTRO.dur - 20, OUTRO.dur], [1, 0], { easing: easing.easeInCubic });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        opacity: fadeOut,
      }}
    >
      {/* Dual glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.accent}12 0%, transparent 60%)`,
          filter: "blur(80px)",
          transform: "translateY(-40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.primary}10 0%, transparent 60%)`,
          filter: "blur(60px)",
          transform: "translateY(60px)",
        }}
      />

      {/* Logo */}
      <img
        src="/brands/allbyb/logo.svg"
        alt="ALLBYB"
        style={{
          height: 80,
          filter: "brightness(0) invert(1)",
          opacity: logoOp,
          transform: `translateY(${logoY}px)`,
        }}
      />

      {/* Gold divider */}
      <div
        style={{
          width: interpolate(lineSpring, [0, 1], [0, 44]),
          height: 1.5,
          background: C.accent,
        }}
      />

      {/* Slogan */}
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 20,
          fontWeight: 400,
          fontStyle: "italic",
          color: C.textMuted,
          opacity: sloganOp,
          transform: `translateY(${sloganY}px)`,
          letterSpacing: "0.02em",
        }}
      >
        Heritage in Every Thread
      </div>

      {/* Handle */}
      <div
        style={{
          fontFamily: SANS,
          fontSize: 15,
          fontWeight: 400,
          color: C.accent,
          letterSpacing: "0.12em",
          opacity: handleOp,
          transform: `translateY(${handleY}px)`,
          marginTop: 6,
        }}
      >
        @allbybdesign
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────
export const AllbybReel: React.FC<AnimationProps> = ({ frame, config }) => {
  return (
    <div
      style={{
        width: config.width,
        height: config.height,
        position: "relative",
        overflow: "hidden",
        background: C.bg,
        fontFamily: SANS,
      }}
    >
      {/* Font import */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>

      {/* Intro */}
      <Sequence from={INTRO.from} durationInFrames={INTRO.dur}>
        <IntroScene />
      </Sequence>

      {/* Scene 1 — Street walk */}
      <Sequence from={S1.from} durationInFrames={S1.dur}>
        <VideoSceneContent
          src="/brands/allbyb/video/s1.mp4"
          heading="Crafted by Hand"
          subtext="Artisan Heritage"
          duration={S1.dur}
        />
      </Sequence>

      {/* Scene 2 — Café */}
      <Sequence from={S2.from} durationInFrames={S2.dur}>
        <VideoSceneContent
          src="/brands/allbyb/video/s2.mp4"
          heading="Woven with Purpose"
          subtext="Everyday Luxury"
          duration={S2.dur}
        />
      </Sequence>

      {/* Scene 3 — Golden hour */}
      <Sequence from={S3.from} durationInFrames={S3.dur}>
        <VideoSceneContent
          src="/brands/allbyb/video/s3.mp4"
          heading="Carried with Pride"
          subtext="Adelie Citrine"
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
          color: "rgba(255,255,255,0.25)",
          zIndex: 10,
        }}
      >
        FR {String(frame).padStart(3, "0")}/{config.durationInFrames}
      </div>
    </div>
  );
};
