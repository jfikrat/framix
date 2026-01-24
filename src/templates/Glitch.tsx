import React from "react";
import { interpolate, spring, type AnimationProps } from "../animations";
import type { TemplateMeta } from "./types";

export const meta: TemplateMeta = {
  id: "glitch",
  name: "Glitch",
  category: "dynamic",
  color: "#00ff88",
};

export const Glitch: React.FC<AnimationProps> = ({ frame, config }) => {
  const { fps, durationInFrames, width, height } = config;

  const text = "ERROR";

  // Glitch offset - rastgele titreme
  const glitchX = Math.sin(frame * 2.5) * (frame % 5 === 0 ? 15 : 2);
  const glitchY = Math.cos(frame * 3) * (frame % 7 === 0 ? 10 : 1);

  // RGB split
  const rgbSplit = frame % 4 === 0 ? 8 : 3;

  // Scanlines
  const scanlineOffset = (frame * 2) % 10;

  // Text reveal
  const textScale = spring({ frame, fps, damping: 10, stiffness: 100 });

  // Flicker
  const flicker = frame % 3 === 0 ? 0.9 : 1;

  // Fade out
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], { clamp: true });

  return (
    <div
      style={{
        width,
        height,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        opacity: fadeOut * flicker,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 136, 0.03) 2px,
            rgba(0, 255, 136, 0.03) 4px
          )`,
          transform: `translateY(${scanlineOffset}px)`,
          pointerEvents: "none",
        }}
      />

      {/* Glitched text layers */}
      <div style={{ position: "relative", transform: `translate(${glitchX}px, ${glitchY}px)` }}>
        {/* Red layer */}
        <h1
          style={{
            position: "absolute",
            fontSize: 140,
            fontWeight: 900,
            color: "#ff0000",
            margin: 0,
            transform: `translate(${-rgbSplit}px, 0) scale(${textScale})`,
            opacity: 0.7,
            mixBlendMode: "screen",
          }}
        >
          {text}
        </h1>

        {/* Blue layer */}
        <h1
          style={{
            position: "absolute",
            fontSize: 140,
            fontWeight: 900,
            color: "#0000ff",
            margin: 0,
            transform: `translate(${rgbSplit}px, 0) scale(${textScale})`,
            opacity: 0.7,
            mixBlendMode: "screen",
          }}
        >
          {text}
        </h1>

        {/* Main text */}
        <h1
          style={{
            fontSize: 140,
            fontWeight: 900,
            color: "#00ff88",
            margin: 0,
            transform: `scale(${textScale})`,
            textShadow: "0 0 20px #00ff88",
          }}
        >
          {text}
        </h1>
      </div>

      {/* Glitch bars */}
      {frame % 8 === 0 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: "30%", height: 4, background: "#00ff88", opacity: 0.8 }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: "70%", height: 2, background: "#ff0088", opacity: 0.6 }} />
        </>
      )}

      {/* Terminal style subtitle */}
      <p
        style={{
          fontSize: 24,
          color: "#00ff88",
          marginTop: 60,
          opacity: interpolate(frame, [30, 50], [0, 1], { clamp: true }),
          fontFamily: "monospace",
        }}
      >
        {">"} SYSTEM_FAILURE_
        <span style={{ opacity: Math.floor(frame / 15) % 2 }}>█</span>
      </p>
    </div>
  );
};
