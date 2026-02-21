import React, { useRef, useEffect } from "react";
import type { ProjectMeta, TimelineSegment } from "./types";
import type { AnimationProps } from "../animations";
import { interpolate, spring, easing } from "../animations";
import { Sequence, useCurrentFrame, useVideoConfig } from "../Sequence";
import { ReelBase } from "../components/ReelBase";
import { OverlayStack } from "../components/overlays/OverlayStack";
import { FilmGrain } from "../components/overlays/FilmGrain";
import { Bokeh } from "../components/overlays/Bokeh";
import { LightLeak } from "../components/overlays/LightLeak";
import { MaskedRevealText } from "../components/typography/MaskedRevealText";
import { RevealText } from "../components/typography/RevealText";
import { CinematicText } from "../components/typography/CinematicText";

// ─── Brand Tokens ──────────────────────────────────────
const C = {
  primary: "#F59B93",
  secondary: "#EAE4E1",
  text: "#2a2a2a",
  textLight: "#f5f5f5",
  textMuted: "rgba(0,0,0,0.45)",
  accent: "#D4A574",
};

const SERIF = "'Cormorant Garamond', 'Georgia', 'Times New Roman', serif";
const SANS = "'Inter', system-ui, -apple-system, sans-serif";
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap";

// ─── Timeline — Variable Pacing ─────────────────────────
// Scenes overlap by 8-15 frames for smooth crossfades.
// Cinematic text "beats" punch between video scenes.
const FPS = 30;
const INTRO = { from: 0, dur: 75 }; // 2.5s
const S1 = { from: 60, dur: 160 }; // 5.3s — hero product, longest
const BEAT1 = { from: 212, dur: 24 }; // 0.8s — "XOXO"
const S2 = { from: 228, dur: 142 }; // 4.7s
const BEAT2 = { from: 362, dur: 24 }; // 0.8s — "with love"
const S3 = { from: 378, dur: 125 }; // 4.2s — shortest, builds urgency
const OUTRO = { from: 495, dur: 105 }; // 3.5s
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
  { name: "♡ XOXO", from: BEAT1.from, durationInFrames: BEAT1.dur, color: "#e8d5d0" },
  { name: "Plate", from: S2.from, durationInFrames: S2.dur, color: C.accent },
  { name: "♡ Love", from: BEAT2.from, durationInFrames: BEAT2.dur, color: "#e8d5d0" },
  { name: "Vase", from: S3.from, durationInFrames: S3.dur, color: C.primary },
  { name: "Outro", from: OUTRO.from, durationInFrames: OUTRO.dur, color: C.accent },
];

// ─── Synced Video ──────────────────────────────────────
const SyncedVideo: React.FC<{ src: string; style?: React.CSSProperties }> = ({ src, style }) => {
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
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style }}
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

  const lineSpring = spring({ frame: Math.max(0, frame - 26), fps, damping: 15, stiffness: 120 });
  const exitOp = interpolate(frame, [INTRO.dur - 18, INTRO.dur], [1, 0]);

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
        style={{ height: 200, opacity: logoOpacity, transform: `scale(${logoScale})` }}
      />

      {/* Collection name — masked clip reveal */}
      <MaskedRevealText
        lines={["HeartBreaker", "Club"]}
        frame={Math.max(0, frame - 16)}
        fps={fps}
        lineDelay={6}
        damping={12}
        stiffness={90}
        fontSize={64}
        fontWeight={600}
        fontFamily={SERIF}
        color={C.text}
        style={{ letterSpacing: "-0.01em" }}
      />

      {/* Accent line */}
      <div style={{ width: interpolate(lineSpring, [0, 1], [0, 80]), height: 2.5, background: C.primary }} />

      {/* Subtitle — word reveal */}
      <RevealText
        text="XOXO Collection"
        frame={Math.max(0, frame - 34)}
        fps={fps}
        wordDelay={6}
        damping={14}
        stiffness={100}
        fontSize={22}
        fontWeight={400}
        fontFamily={SANS}
        color={C.textMuted}
        wordStyle={{ letterSpacing: "0.18em", textTransform: "uppercase" as const }}
      />
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

  // Crossfade envelope
  const fadeIn = interpolate(frame, [0, 25], [0, 1], { easing: easing.easeOutCubic });
  const fadeOut = interpolate(frame, [duration - 25, duration], [1, 0], { easing: easing.easeInCubic });
  const opacity = Math.min(fadeIn, fadeOut);

  // Ken Burns slow zoom
  const scale = interpolate(frame, [0, duration], [1.0, 1.06], { easing: easing.linear });

  // Accent underline
  const lineSpring = spring({ frame: Math.max(0, frame - 36), fps, damping: 15, stiffness: 120 });

  // Subtext
  const subSpring = spring({ frame: Math.max(0, frame - 40), fps, damping: 14, stiffness: 100 });
  const subY = interpolate(subSpring, [0, 1], [18, 0]);
  const subOp = interpolate(subSpring, [0, 1], [0, 1]);

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
      <div style={{ position: "absolute", bottom: 280, width: "100%", textAlign: "center", padding: "0 60px" }}>
        {/* Heading — word-by-word reveal */}
        <RevealText
          text={heading}
          frame={Math.max(0, frame - 20)}
          fps={fps}
          wordDelay={8}
          damping={12}
          stiffness={90}
          fontSize={50}
          fontWeight={600}
          fontFamily={SERIF}
          color={C.textLight}
          wordStyle={{
            textShadow: "0 2px 30px rgba(0,0,0,0.5)",
            letterSpacing: "-0.01em",
            lineHeight: "1.15",
          }}
        />

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

// ─── Cinematic Beat (pattern interrupt) ────────────────
const CinematicBeat: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <CinematicText
      text={text}
      frame={frame}
      fps={fps}
      durationInFrames={dur}
      fontSize={100}
      fontWeight={300}
      fontFamily={SERIF}
      color={C.text}
      accentColor={C.primary}
      background={C.secondary}
      style={{ letterSpacing: "0.04em" }}
    />
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
        style={{ height: 160, opacity: logoOp, transform: `translateY(${logoY}px)` }}
      />

      {/* Accent divider */}
      <div style={{ width: interpolate(lineSpring, [0, 1], [0, 60]), height: 2, background: C.accent }} />

      {/* Handle — masked reveal */}
      <MaskedRevealText
        lines={["@feelinggoodinside"]}
        frame={Math.max(0, frame - 25)}
        fps={fps}
        damping={14}
        stiffness={100}
        fontSize={20}
        fontWeight={400}
        fontFamily={SANS}
        color={C.textMuted}
        style={{ letterSpacing: "0.1em" }}
      />

      {/* Website */}
      <MaskedRevealText
        lines={["feelinggoodinside.com"]}
        frame={Math.max(0, frame - 34)}
        fps={fps}
        damping={14}
        stiffness={100}
        fontSize={17}
        fontWeight={400}
        fontFamily={SANS}
        color={C.textMuted}
        style={{ letterSpacing: "0.06em", marginTop: 4 }}
      />
    </div>
  );
};

// ─── Main Component ────────────────────────────────────
export const HeartBreakerReel: React.FC<AnimationProps> = ({ frame, config }) => {
  return (
    <ReelBase
      frame={frame}
      config={config}
      background={C.secondary}
      fontFamily={SANS}
      fontImport={FONT_URL}
      progressColors={[C.primary, C.accent]}
      frameCounterColor="rgba(0,0,0,0.2)"
    >
      {/* ── Scenes ──────────────────────────────────── */}

      <Sequence from={INTRO.from} durationInFrames={INTRO.dur}>
        <IntroScene />
      </Sequence>

      {/* Bowl — hero product, longest scene */}
      <Sequence from={S1.from} durationInFrames={S1.dur}>
        <VideoSceneContent
          src="/brands/feelinggood/video/v2-bowl-portrait.mp4"
          heading="Morning Ritual"
          subtext="Start your day with heart"
          duration={S1.dur}
        />
      </Sequence>

      {/* Cinematic beat — XOXO */}
      <Sequence from={BEAT1.from} durationInFrames={BEAT1.dur}>
        <CinematicBeat text="XOXO" dur={BEAT1.dur} />
      </Sequence>

      {/* Plate */}
      <Sequence from={S2.from} durationInFrames={S2.dur}>
        <VideoSceneContent
          src="/brands/feelinggood/video/v2-plate-portrait.mp4"
          heading="Set with Love"
          subtext="Every detail, a valentine"
          duration={S2.dur}
        />
      </Sequence>

      {/* Cinematic beat — with love */}
      <Sequence from={BEAT2.from} durationInFrames={BEAT2.dur}>
        <CinematicBeat text="with love" dur={BEAT2.dur} />
      </Sequence>

      {/* Vase — shortest, builds urgency */}
      <Sequence from={S3.from} durationInFrames={S3.dur}>
        <VideoSceneContent
          src="/brands/feelinggood/video/v2-vase-portrait.mp4"
          heading="Blooming Hearts"
          subtext="Where flowers find home"
          duration={S3.dur}
        />
      </Sequence>

      <Sequence from={OUTRO.from} durationInFrames={OUTRO.dur}>
        <OutroScene />
      </Sequence>

      {/* ── Overlays ────────────────────────────────── */}
      <OverlayStack>
        {/* Film grain — subtle organic texture */}
        <FilmGrain frame={frame} opacity={0.04} blendMode="overlay" />

        {/* Bokeh — warm floating circles */}
        <Bokeh
          frame={frame}
          fps={config.fps}
          count={8}
          color={C.primary}
          maxRadius={35}
          blur={20}
          opacityRange={[0.02, 0.06]}
          speed={0.2}
        />

        {/* Light leaks at transition windows */}
        <LightLeak
          frame={frame}
          fps={config.fps}
          color="rgba(245,155,147,0.6)"
          intensity={0.12}
          activeRange={[52, 85]}
          origin="top-right"
        />
        <LightLeak
          frame={frame}
          fps={config.fps}
          color="rgba(212,165,116,0.5)"
          intensity={0.1}
          activeRange={[205, 240]}
          origin="bottom-left"
        />
        <LightLeak
          frame={frame}
          fps={config.fps}
          color="rgba(245,155,147,0.6)"
          intensity={0.1}
          activeRange={[355, 390]}
          origin="top-left"
        />
        <LightLeak
          frame={frame}
          fps={config.fps}
          color="rgba(212,165,116,0.5)"
          intensity={0.12}
          activeRange={[488, 510]}
          origin="center"
        />
      </OverlayStack>
    </ReelBase>
  );
};
