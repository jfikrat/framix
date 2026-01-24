import React from "react";
import { interpolate, spring, type AnimationProps } from "../animations";
import type { TemplateMeta } from "./types";

// META: Bu template'in bilgileri
export const meta: TemplateMeta = {
  id: "text-reveal",
  name: "Text Reveal",
  category: "intro",
  color: "#8b5cf6",
};

interface TextRevealProps extends AnimationProps {
  text?: string;
  subtitle?: string;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  frame,
  config,
  text = "MERHABA",
  subtitle = "Dünya",
}) => {
  const { fps, durationInFrames, width, height } = config;

  // Her harf için ayrı animasyon
  const letters = text.split("");
  const letterDelay = 3; // Her harf arasında 3 frame

  // Arka plan animasyonu
  const bgScale = spring({ frame, fps, damping: 20, stiffness: 80 });

  // Subtitle fade in
  const subtitleStart = letters.length * letterDelay + 20;
  const subtitleOpacity = interpolate(
    frame,
    [subtitleStart, subtitleStart + 20],
    [0, 1],
    { clamp: true }
  );
  const subtitleY = interpolate(
    frame,
    [subtitleStart, subtitleStart + 20],
    [30, 0],
    { clamp: true }
  );

  // Fade out
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { clamp: true }
  );

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
        fontFamily: "'Inter', system-ui, sans-serif",
        opacity: fadeOut,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Animated background circle */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
          transform: `scale(${bgScale * 2})`,
          filter: "blur(60px)",
        }}
      />

      {/* Main text - letter by letter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {letters.map((letter, i) => {
          const letterProgress = spring({
            frame: frame - i * letterDelay,
            fps,
            damping: 12,
            stiffness: 100,
          });
          const letterY = interpolate(letterProgress, [0, 1], [100, 0]);
          const letterOpacity = interpolate(letterProgress, [0, 1], [0, 1]);
          const letterRotation = interpolate(letterProgress, [0, 1], [-20, 0]);

          return (
            <span
              key={i}
              style={{
                fontSize: 120,
                fontWeight: 900,
                color: "white",
                opacity: letterOpacity,
                transform: `translateY(${letterY}px) rotate(${letterRotation}deg)`,
                textShadow: "0 0 40px rgba(139,92,246,0.5)",
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 48,
          fontWeight: 300,
          color: "rgba(255,255,255,0.7)",
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          letterSpacing: 8,
          textTransform: "uppercase",
        }}
      >
        {subtitle}
      </p>

      {/* Frame counter */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 40,
          color: "rgba(255,255,255,0.2)",
          fontSize: 14,
          fontFamily: "monospace",
        }}
      >
        {frame} / {durationInFrames}
      </div>
    </div>
  );
};
