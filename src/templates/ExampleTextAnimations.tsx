import React from "react";
import type { AnimationProps, VideoConfig } from "../animations";
import { interpolate, presets } from "../animations";
import { defineCues, isInCue, cueFrame } from "../cues";
import { useTypewriter } from "../text";
import { useLetterStagger } from "../text";
import { useWordReveal } from "../text";
import { useCountUp } from "../text";
import { fadeIn, fadeOut, transition } from "../transitions";
import type { ProjectMeta, TimelineSegment } from "./types";

export const meta: ProjectMeta = {
  id: "example-text-animations",
  name: "Example: Text Animations",
  category: "minimal",
  color: "#3b82f6",
};

export const templateConfig: Partial<VideoConfig> = {
  ...presets.youtube,
  durationInFrames: 300,
};

export const timeline: TimelineSegment[] = [
  { name: "Typewriter", from: 0, durationInFrames: 75, color: "#3b82f6" },
  { name: "Stagger", from: 75, durationInFrames: 75, color: "#8b5cf6" },
  { name: "Words", from: 150, durationInFrames: 75, color: "#22c55e" },
  { name: "Counter", from: 225, durationInFrames: 75, color: "#e53e3e" },
];

const SCENES = [
  { label: "useTypewriter", color: "#3b82f6" },
  { label: "useLetterStagger", color: "#8b5cf6" },
  { label: "useWordReveal", color: "#22c55e" },
  { label: "useCountUp", color: "#e53e3e" },
] as const;

export const Component: React.FC<AnimationProps> = ({ frame, config }) => {
  const { fps, width, height, durationInFrames } = config;

  const { cues, list } = defineCues(
    { typewriter: 75, stagger: 75, words: 75, counter: 75 },
    durationInFrames,
  );

  const activeCueIndex = list.findIndex(
    (c) => frame >= c.from && frame < c.to,
  );
  const activeColor = activeCueIndex >= 0 ? SCENES[activeCueIndex].color : "#3b82f6";
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Subtle background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${activeColor}15 0%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Scene 1: Typewriter */}
      {isInCue(cues.typewriter, frame) && (
        <TypewriterScene frame={cueFrame(cues.typewriter, frame)} fps={fps} />
      )}

      {/* Scene 2: Letter Stagger */}
      {isInCue(cues.stagger, frame) && (
        <StaggerScene frame={cueFrame(cues.stagger, frame)} fps={fps} />
      )}

      {/* Scene 3: Word Reveal */}
      {isInCue(cues.words, frame) && (
        <WordScene frame={cueFrame(cues.words, frame)} fps={fps} />
      )}

      {/* Scene 4: Counter */}
      {isInCue(cues.counter, frame) && (
        <CounterScene frame={cueFrame(cues.counter, frame)} fps={fps} />
      )}

      {/* Label */}
      {activeCueIndex >= 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 18,
            fontFamily: "JetBrains Mono, monospace",
            color: "#555",
            opacity: transition({
              frame: activeCueIndex >= 0 ? cueFrame(list[activeCueIndex], frame) : 0,
              durationInFrames: 75,
              enterDuration: 10,
              exitDuration: 10,
            }),
          }}
        >
          {SCENES[activeCueIndex].label}
        </div>
      )}

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: `${progress * 100}%`,
          height: 3,
          background: activeColor,
        }}
      />

      {/* Frame counter */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 20,
          fontSize: 12,
          fontFamily: "JetBrains Mono, monospace",
          color: "#333",
        }}
      >
        FR {String(frame).padStart(3, "0")}/{durationInFrames}
      </div>
    </div>
  );
};

/* ─── Sub-scenes ─────────────────────────────────────── */

const TypewriterScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const { displayText, cursorVisible } = useTypewriter({
    text: "Hello, Framix!",
    frame,
    speed: 0.4,
  });

  const opacity = fadeIn({ frame, durationInFrames: 10 });

  return (
    <div style={{ opacity, textAlign: "center" }}>
      <span style={{ fontSize: 72, fontWeight: 800, color: "#f5f5f5" }}>
        {displayText}
      </span>
      <span
        style={{
          fontSize: 72,
          fontWeight: 300,
          color: "#3b82f6",
          opacity: cursorVisible ? 1 : 0,
        }}
      >
        |
      </span>
    </div>
  );
};

const StaggerScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const letters = useLetterStagger({
    text: "FRAMIX",
    frame,
    fps,
    delay: 4,
    damping: 10,
    stiffness: 120,
  });

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {letters.map((l, i) => (
        <span
          key={i}
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: "#f5f5f5",
            opacity: l.opacity,
            transform: `translateY(${l.y}px) scale(${l.scale})`,
            display: "inline-block",
          }}
        >
          {l.char}
        </span>
      ))}
    </div>
  );
};

const WordScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const words = useWordReveal({
    text: "Animate every word with spring physics",
    frame,
    fps,
    wordDelay: 6,
  });

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", maxWidth: 900, padding: "0 40px" }}>
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#f5f5f5",
            opacity: w.opacity,
            transform: `translateY(${w.y}px)`,
            display: "inline-block",
          }}
        >
          {w.word}
        </span>
      ))}
    </div>
  );
};

const CounterScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const count = useCountUp({
    from: 0,
    to: 10000,
    frame,
    durationInFrames: 60,
  });

  const opacity = fadeIn({ frame, durationInFrames: 8 });

  return (
    <div style={{ opacity, textAlign: "center" }}>
      <div style={{ fontSize: 120, fontWeight: 900, color: "#f5f5f5", fontVariantNumeric: "tabular-nums" }}>
        {count}
      </div>
      <div style={{ fontSize: 24, color: "#555", marginTop: 8 }}>
        users onboarded
      </div>
    </div>
  );
};
