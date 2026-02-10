import React from "react";
import type { AnimationProps, VideoConfig } from "../animations";
import { spring, presets } from "../animations";
import type { InputSchema } from "../inputs";
import { resolveInputs } from "../inputs";
import { Scene } from "../Scene";
import { Sequence, useCurrentFrame, useVideoConfig } from "../Sequence";
import { slide, scaleIn, fadeIn, fadeOut, wipe, transition } from "../transitions";
import type { ProjectMeta, TimelineSegment } from "./types";

// ─── Input Schema ────────────────────────────────────────

const inputSchema: InputSchema = {
  title: { type: "text", label: "Title", default: "Build Video Animations", required: true },
  subtitle: { type: "text", label: "Subtitle", default: "with pure React components" },
  accentColor: { type: "color", label: "Accent Color", default: "#22c55e" },
  showBadge: { type: "boolean", label: "Show Badge", default: true },
};

// ─── Meta & Config ───────────────────────────────────────

export const meta: ProjectMeta = {
  id: "example-inputs-demo",
  name: "Example: Inputs Demo",
  category: "promo",
  color: "#22c55e",
  inputs: inputSchema,
};

export const templateConfig: Partial<VideoConfig> = {
  ...presets.twitterPost,
  durationInFrames: 180,
};

export const timeline: TimelineSegment[] = [
  { name: "Intro Scene", from: 0, durationInFrames: 60, color: "#3b82f6" },
  { name: "Main Content", from: 60, durationInFrames: 90, color: "#22c55e" },
  { name: "Outro", from: 150, durationInFrames: 30, color: "#8b8b8b" },
];

// ─── Intro (embedded via Scene) ──────────────────────────

const IntroComponent: React.FC<AnimationProps> = ({ frame, config }) => {
  const { fps } = config;

  const circleScale = scaleIn({ frame, durationInFrames: 25 });
  const textSlide = slide({ frame, startFrame: 12, durationInFrames: 20 }, "up", 60);
  const textOpacity = fadeIn({ frame, startFrame: 12, durationInFrames: 15 });

  return (
    <div
      style={{
        width: config.width,
        height: config.height,
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent circle */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "#22c55e",
          transform: `scale(${circleScale})`,
        }}
      />
      {/* Title text */}
      <div
        style={{
          fontSize: 56,
          fontWeight: 900,
          color: "#f5f5f5",
          fontFamily: "Inter, system-ui, sans-serif",
          opacity: textOpacity,
          transform: `translateY(${textSlide}px)`,
        }}
      >
        FRAMIX
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────

export const Component: React.FC<AnimationProps> = ({ frame, config }) => {
  const { fps, width, height, durationInFrames } = config;

  const inputs = resolveInputs(inputSchema);
  const title = inputs.title as string;
  const subtitle = inputs.subtitle as string;
  const accent = inputs.accentColor as string;
  const showBadge = inputs.showBadge as boolean;

  const progress = durationInFrames > 0 ? frame / durationInFrames : 0;

  return (
    <div
      style={{
        width,
        height,
        background: "#0a0a0a",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Scene 1: Intro */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: wipe({ frame, startFrame: 50, durationInFrames: 10 }, "right"),
          // Wipe reveals fully first, then the whole div is hidden by the clipPath going from visible to clipped
        }}
      >
        <Scene component={IntroComponent} from={0} durationInFrames={60} />
      </div>

      {/* Scene 2: Main Content */}
      <Sequence from={60} durationInFrames={90}>
        <MainContent title={title} subtitle={subtitle} accent={accent} showBadge={showBadge} />
      </Sequence>

      {/* Scene 3: Outro */}
      <Sequence from={150} durationInFrames={30}>
        <OutroContent />
      </Sequence>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: `${progress * 100}%`,
          height: 3,
          background: accent,
        }}
      />

      {/* Frame counter */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          right: 16,
          fontSize: 11,
          fontFamily: "JetBrains Mono, monospace",
          color: "#333",
        }}
      >
        FR {String(frame).padStart(3, "0")}/{durationInFrames}
      </div>
    </div>
  );
};

/* ─── Sub-components ──────────────────────────────────── */

const MainContent: React.FC<{
  title: string;
  subtitle: string;
  accent: string;
  showBadge: boolean;
}> = ({ title, subtitle, accent, showBadge }) => {
  const frame = useCurrentFrame();
  const config = useVideoConfig();
  const { fps } = config;

  const titleSpring = spring({ frame, fps, damping: 12, stiffness: 100 });
  const subtitleOpacity = fadeIn({ frame, startFrame: 15, durationInFrames: 15 });
  const subtitleSlide = slide({ frame, startFrame: 15, durationInFrames: 20 }, "up", 30);
  const dividerScale = scaleIn({ frame, startFrame: 10, durationInFrames: 20 }, 0);
  const badgeOpacity = fadeIn({ frame, startFrame: 30, durationInFrames: 12 });

  const contentOpacity = transition({
    frame,
    durationInFrames: 90,
    enterDuration: 15,
    exitDuration: 10,
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        opacity: contentOpacity,
        padding: "0 60px",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "#f5f5f5",
          textAlign: "center",
          transform: `translateY(${(1 - titleSpring) * 40}px)`,
          opacity: titleSpring,
        }}
      >
        {title}
      </div>

      {/* Divider */}
      <div
        style={{
          width: 60,
          height: 3,
          background: accent,
          borderRadius: 2,
          transform: `scaleX(${dividerScale})`,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          fontSize: 24,
          fontWeight: 400,
          color: "#8b8b8b",
          textAlign: "center",
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleSlide}px)`,
        }}
      >
        {subtitle}
      </div>

      {/* Badge */}
      {showBadge && (
        <div
          style={{
            marginTop: 20,
            padding: "8px 20px",
            borderRadius: 20,
            background: `${accent}20`,
            border: `1px solid ${accent}40`,
            fontSize: 14,
            fontWeight: 600,
            color: accent,
            letterSpacing: "0.04em",
            opacity: badgeOpacity,
          }}
        >
          POWERED BY FRAMIX
        </div>
      )}
    </div>
  );
};

const OutroContent: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = transition({
    frame,
    durationInFrames: 30,
    enterDuration: 10,
    exitDuration: 10,
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          fontSize: 18,
          color: "rgba(255,255,255,0.3)",
          fontWeight: 500,
          letterSpacing: "0.1em",
        }}
      >
        Made with Framix
      </div>
    </div>
  );
};
