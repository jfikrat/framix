import React from "react";
import { interpolate, spring, type AnimationProps } from "../animations";
import type { TemplateMeta } from "./types";

export const meta: TemplateMeta = {
  id: "confetti",
  name: "Confetti",
  category: "celebration",
  color: "#ffd93d",
};

interface ConfettiProps extends AnimationProps {
  text?: string;
}

// Confetti parçası
const confettiColors = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff6fff", "#fff"];

interface Particle {
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  speedY: number;
  speedX: number;
  rotationSpeed: number;
}

// Sabit parçacıklar (her frame'de aynı)
const particles: Particle[] = Array.from({ length: 80 }, (_, i) => ({
  x: Math.random() * 100,
  y: -10 - Math.random() * 50,
  rotation: Math.random() * 360,
  color: confettiColors[i % confettiColors.length],
  size: 8 + Math.random() * 12,
  speedY: 2 + Math.random() * 3,
  speedX: (Math.random() - 0.5) * 2,
  rotationSpeed: (Math.random() - 0.5) * 10,
}));

export const Confetti: React.FC<ConfettiProps> = ({
  frame,
  config,
  text = "TEBRIKLER!",
}) => {
  const { fps, durationInFrames, width, height } = config;

  // Text animasyonu
  const textScale = spring({ frame: frame - 20, fps, damping: 8, stiffness: 80 });
  const textOpacity = interpolate(textScale, [0, 1], [0, 1]);

  // Emoji bounce
  const emojiBounce = Math.sin(frame * 0.3) * 10;

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
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        opacity: fadeOut,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Confetti particles */}
      {particles.map((p, i) => {
        const y = p.y + frame * p.speedY;
        const x = p.x + Math.sin(frame * 0.05 + i) * 3 + frame * p.speedX * 0.3;
        const rotation = p.rotation + frame * p.rotationSpeed;
        const opacity = y > 110 ? 0 : 1;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size * 0.6,
              background: p.color,
              borderRadius: 2,
              transform: `rotate(${rotation}deg)`,
              opacity,
              boxShadow: `0 0 10px ${p.color}66`,
            }}
          />
        );
      })}

      {/* Glow background */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Emoji */}
      <div
        style={{
          fontSize: 100,
          marginBottom: 30,
          transform: `translateY(${emojiBounce}px) scale(${textScale})`,
        }}
      >
        🎉
      </div>

      {/* Main text */}
      <h1
        style={{
          fontSize: 80,
          fontWeight: 900,
          color: "white",
          margin: 0,
          opacity: textOpacity,
          transform: `scale(${textScale})`,
          textShadow: "0 0 40px rgba(255,215,0,0.5)",
          letterSpacing: 4,
        }}
      >
        {text}
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 32,
          color: "rgba(255,255,255,0.7)",
          marginTop: 20,
          opacity: interpolate(frame, [40, 60], [0, 1], { clamp: true }),
          letterSpacing: 8,
        }}
      >
        🎊 Harika! 🎊
      </p>
    </div>
  );
};
