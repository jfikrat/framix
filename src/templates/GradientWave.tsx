import React from "react";
import { interpolate, spring, type AnimationProps } from "../animations";
import type { TemplateMeta } from "./types";

export const meta: TemplateMeta = {
  id: "gradient-wave",
  name: "Gradient Wave",
  category: "intro",
  color: "#00cec9",
};

interface GradientWaveProps extends AnimationProps {
  title?: string;
  subtitle?: string;
}

export const GradientWave: React.FC<GradientWaveProps> = ({
  frame,
  config,
  title = "FLOW",
  subtitle = "Go with the wave",
}) => {
  const { fps, durationInFrames, width, height } = config;

  // Wave animation
  const waveOffset = frame * 3;

  // Title animation
  const titleProgress = spring({ frame: frame - 15, fps, damping: 12 });

  // Subtitle
  const subtitleProgress = spring({ frame: frame - 35, fps, damping: 15 });

  // Color shift
  const hue1 = (frame * 2) % 360;
  const hue2 = (hue1 + 60) % 360;

  // Fade out
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { clamp: true }
  );

  // Generate wave path
  const generateWavePath = (yOffset: number, amplitude: number, frequency: number) => {
    let path = `M 0 ${height}`;
    for (let x = 0; x <= width; x += 10) {
      const y = yOffset + Math.sin((x + waveOffset) * frequency * 0.01) * amplitude;
      path += ` L ${x} ${y}`;
    }
    path += ` L ${width} ${height} Z`;
    return path;
  };

  return (
    <div
      style={{
        width,
        height,
        background: `linear-gradient(180deg, hsl(${hue1}, 70%, 20%) 0%, hsl(${hue2}, 70%, 10%) 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
        opacity: fadeOut,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Wave layers */}
      <svg
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "60%",
        }}
        viewBox={`0 0 ${width} ${height * 0.6}`}
        preserveAspectRatio="none"
      >
        <path
          d={generateWavePath(height * 0.3, 50, 1.5)}
          fill={`hsla(${hue1}, 70%, 50%, 0.3)`}
        />
        <path
          d={generateWavePath(height * 0.35, 40, 2)}
          fill={`hsla(${hue1 + 30}, 70%, 50%, 0.4)`}
        />
        <path
          d={generateWavePath(height * 0.4, 30, 2.5)}
          fill={`hsla(${hue2}, 70%, 50%, 0.5)`}
        />
      </svg>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => {
        const particleY = ((frame * (1 + i * 0.1) + i * 100) % (height + 100)) - 50;
        const particleX = (i * 97) % width;
        const size = 4 + (i % 4) * 2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: particleX,
              top: particleY,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `hsla(${(hue1 + i * 20) % 360}, 80%, 70%, 0.6)`,
              filter: "blur(1px)",
            }}
          />
        );
      })}

      {/* Title */}
      <h1
        style={{
          fontSize: 160,
          fontWeight: 900,
          color: "white",
          margin: 0,
          opacity: titleProgress,
          transform: `
            scale(${interpolate(titleProgress, [0, 1], [0.8, 1])})
            translateY(${interpolate(titleProgress, [0, 1], [50, 0])}px)
          `,
          textShadow: `
            0 0 60px hsla(${hue1}, 80%, 60%, 0.8),
            0 0 120px hsla(${hue2}, 80%, 60%, 0.5)
          `,
          letterSpacing: 20,
          zIndex: 10,
        }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 36,
          color: "rgba(255,255,255,0.8)",
          margin: 0,
          marginTop: 30,
          opacity: subtitleProgress,
          transform: `translateY(${interpolate(subtitleProgress, [0, 1], [20, 0])}px)`,
          letterSpacing: 6,
          zIndex: 10,
        }}
      >
        {subtitle}
      </p>
    </div>
  );
};
