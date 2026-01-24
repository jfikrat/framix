import React from "react";
import { interpolate, spring, easing, type AnimationProps } from "../animations";
import type { TemplateMeta } from "./types";

export const meta: TemplateMeta = {
  id: "kinetic-type",
  name: "Kinetic Type",
  category: "dynamic",
  color: "#e94560",
};

interface KineticTypeProps extends AnimationProps {
  words?: string[];
}

export const KineticType: React.FC<KineticTypeProps> = ({
  frame,
  config,
  words = ["THINK", "CREATE", "INSPIRE"],
}) => {
  const { fps, durationInFrames, width, height } = config;

  // Her kelime için frame aralığı
  const wordDuration = Math.floor(durationInFrames / words.length);

  // Aktif kelime indexi
  const activeWordIndex = Math.min(
    Math.floor(frame / wordDuration),
    words.length - 1
  );

  // Kelime içi frame
  const wordFrame = frame - activeWordIndex * wordDuration;

  // Kelime animasyonları
  const enterProgress = spring({
    frame: wordFrame,
    fps,
    damping: 12,
    stiffness: 100,
  });

  const exitProgress = spring({
    frame: wordFrame - wordDuration + 20,
    fps,
    damping: 15,
  });

  // Arka plan renk geçişi
  const colors = ["#1a1a2e", "#16213e", "#0f3460"];
  const bgColor = colors[activeWordIndex % colors.length];

  // Accent renkleri
  const accents = ["#e94560", "#f39c12", "#00cec9"];
  const accent = accents[activeWordIndex % accents.length];

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
        background: bgColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        opacity: fadeOut,
        overflow: "hidden",
        position: "relative",
        transition: "background 0.3s",
      }}
    >
      {/* Animated background shapes */}
      {[...Array(5)].map((_, i) => {
        const shapeProgress = (frame + i * 20) % 100 / 100;
        const size = 100 + i * 50;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: i % 2 === 0 ? "50%" : "0%",
              border: `2px solid ${accent}33`,
              transform: `
                translate(
                  ${Math.sin(shapeProgress * Math.PI * 2 + i) * 200}px,
                  ${Math.cos(shapeProgress * Math.PI * 2 + i) * 200}px
                )
                rotate(${shapeProgress * 360}deg)
              `,
              opacity: 0.3,
            }}
          />
        );
      })}

      {/* Word counter */}
      <div
        style={{
          position: "absolute",
          top: 80,
          display: "flex",
          gap: 12,
        }}
      >
        {words.map((_, i) => (
          <div
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: i === activeWordIndex ? accent : "rgba(255,255,255,0.3)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      {/* Main word */}
      <h1
        style={{
          fontSize: 160,
          fontWeight: 900,
          color: "white",
          margin: 0,
          transform: `
            scale(${interpolate(enterProgress, [0, 1], [0.5, 1])})
            translateY(${interpolate(enterProgress, [0, 1], [100, 0])}px)
            translateX(${interpolate(exitProgress, [0, 1], [0, -200])}px)
          `,
          opacity: interpolate(enterProgress, [0, 1], [0, 1]) *
                   (1 - interpolate(exitProgress, [0, 1], [0, 1])),
          textShadow: `4px 4px 0 ${accent}`,
          letterSpacing: -5,
        }}
      >
        {words[activeWordIndex]}
      </h1>

      {/* Accent line */}
      <div
        style={{
          width: interpolate(enterProgress, [0, 1], [0, 200]),
          height: 8,
          background: accent,
          marginTop: 40,
          borderRadius: 4,
        }}
      />

      {/* Number indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          fontSize: 120,
          fontWeight: 900,
          color: "rgba(255,255,255,0.05)",
        }}
      >
        0{activeWordIndex + 1}
      </div>
    </div>
  );
};
