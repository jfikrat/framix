import React from "react";
import { interpolate, spring, type AnimationProps } from "../animations";
import type { TemplateMeta } from "./types";

export const meta: TemplateMeta = {
  id: "neon-glow",
  name: "Neon Glow",
  category: "promo",
  color: "#ff00ff",
};

interface NeonGlowProps extends AnimationProps {
  text?: string;
  color?: string;
}

export const NeonGlow: React.FC<NeonGlowProps> = ({
  frame,
  config,
  text = "NEON",
  color = "#ff00ff",
}) => {
  const { fps, durationInFrames, width, height } = config;

  // Flicker effect
  const flicker = Math.sin(frame * 0.5) * 0.1 + 0.9;

  // Glow pulse
  const glowPulse = Math.sin(frame * 0.1) * 20 + 40;

  // Text scale in
  const scaleProgress = spring({ frame, fps, damping: 15, stiffness: 80 });

  // Subtitle
  const subtitleProgress = spring({ frame: frame - 30, fps, damping: 12 });
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);

  // Scan line effect
  const scanLineY = (frame * 4) % height;

  // Fade out
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { clamp: true }
  );

  return (
    <div
      style={{
        width,
        height,
        background: "linear-gradient(180deg, #0a0010 0%, #1a0020 50%, #0a0010 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Orbitron', 'Courier New', monospace",
        opacity: fadeOut,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${color}22 1px, transparent 1px),
            linear-gradient(90deg, ${color}22 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          transform: "perspective(500px) rotateX(60deg)",
          transformOrigin: "center top",
          opacity: 0.5,
        }}
      />

      {/* Scan line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scanLineY,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}66, transparent)`,
        }}
      />

      {/* Main neon text */}
      <h1
        style={{
          fontSize: 140,
          fontWeight: 900,
          color: "white",
          margin: 0,
          transform: `scale(${scaleProgress})`,
          opacity: flicker,
          textShadow: `
            0 0 10px ${color},
            0 0 20px ${color},
            0 0 ${glowPulse}px ${color},
            0 0 ${glowPulse * 2}px ${color}
          `,
          letterSpacing: 20,
        }}
      >
        {text}
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 32,
          color: color,
          marginTop: 40,
          opacity: subtitleOpacity,
          textShadow: `0 0 10px ${color}`,
          letterSpacing: 15,
          textTransform: "uppercase",
        }}
      >
        ★ RETRO VIBES ★
      </p>

      {/* Corner decorations */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            border: `2px solid ${color}`,
            opacity: 0.5,
            top: i < 2 ? 40 : undefined,
            bottom: i >= 2 ? 40 : undefined,
            left: i % 2 === 0 ? 40 : undefined,
            right: i % 2 === 1 ? 40 : undefined,
            borderRadius: 4,
            boxShadow: `0 0 10px ${color}, inset 0 0 10px ${color}33`,
          }}
        />
      ))}
    </div>
  );
};
