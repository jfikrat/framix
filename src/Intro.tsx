import React from "react";
import { interpolate, spring, VideoConfig } from "./animations";

interface IntroProps {
  frame: number;
  config: VideoConfig;
}

export const Intro: React.FC<IntroProps> = ({ frame, config }) => {
  const { fps, durationInFrames } = config;

  // Logo scale animation (spring, starts at frame 0)
  const logoScale = spring({
    frame,
    fps,
    damping: 12,
    stiffness: 100,
  });

  // Logo rotation (subtle)
  const logoRotation = interpolate(frame, [0, 30], [0, 360], { clamp: true });

  // Title slide up + fade in (starts at frame 25)
  const titleProgress = spring({
    frame: frame - 25,
    fps,
    damping: 15,
  });
  const titleY = interpolate(titleProgress, [0, 1], [50, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // Subtitle fade in (starts at frame 50)
  const subtitleOpacity = interpolate(frame, [50, 70], [0, 1], { clamp: true });

  // Fade out everything at the end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    { clamp: true }
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        opacity: fadeOut,
        overflow: "hidden",
      }}
    >
      {/* Animated background circles */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(229,62,62,0.3) 0%, transparent 70%)",
          transform: `scale(${logoScale * 1.5})`,
          filter: "blur(40px)",
        }}
      />

      {/* Logo */}
      <div
        style={{
          width: 120,
          height: 120,
          background: "linear-gradient(135deg, #e53e3e 0%, #f6ad55 100%)",
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${logoScale}) rotate(${logoRotation}deg)`,
          boxShadow: "0 20px 60px rgba(229,62,62,0.4)",
          marginBottom: 40,
        }}
      >
        <span style={{ fontSize: 48, color: "white" }}>▶</span>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: "white",
          margin: 0,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        Mini Remotion
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 28,
          color: "rgba(255,255,255,0.7)",
          margin: 0,
          marginTop: 16,
          opacity: subtitleOpacity,
          letterSpacing: 2,
        }}
      >
        Saf React ile Video Render
      </p>

      {/* Frame counter (debug) */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          color: "rgba(255,255,255,0.3)",
          fontSize: 14,
          fontFamily: "monospace",
        }}
      >
        Frame: {frame} / {durationInFrames}
      </div>
    </div>
  );
};

export default Intro;
