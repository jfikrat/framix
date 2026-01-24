import React from "react";
import { interpolate, spring, type AnimationProps } from "../animations";
import type { TemplateMeta } from "./types";

export const meta: TemplateMeta = {
  id: "pulse",
  name: "Pulse",
  category: "minimal",
  color: "#ef4444",
};

export const Pulse: React.FC<AnimationProps> = ({ frame, config }) => {
  const { fps, durationInFrames, width, height } = config;

  // Pulse animasyonu
  const pulse = Math.sin(frame * 0.15) * 0.2 + 1;
  const glow = Math.sin(frame * 0.1) * 30 + 50;

  // Ring animasyonları
  const ring1 = spring({ frame, fps, damping: 20 });
  const ring2 = spring({ frame: frame - 10, fps, damping: 20 });
  const ring3 = spring({ frame: frame - 20, fps, damping: 20 });

  // Fade out
  const fadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], { clamp: true });

  return (
    <div
      style={{
        width,
        height,
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
        position: "relative",
      }}
    >
      {/* Rings */}
      {[ring1, ring2, ring3].map((r, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 200 + i * 100,
            height: 200 + i * 100,
            borderRadius: "50%",
            border: `2px solid rgba(239, 68, 68, ${0.5 - i * 0.15})`,
            transform: `scale(${r * (1 + i * 0.3)})`,
            opacity: 1 - r * 0.5,
          }}
        />
      ))}

      {/* Center circle */}
      <div
        style={{
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
          transform: `scale(${pulse})`,
          boxShadow: `0 0 ${glow}px #ef4444, 0 0 ${glow * 2}px #ef444466`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 50, color: "white" }}>♥</span>
      </div>
    </div>
  );
};
