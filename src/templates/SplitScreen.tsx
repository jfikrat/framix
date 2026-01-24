import React from "react";
import { interpolate, spring, type AnimationProps } from "../animations";
import type { TemplateMeta } from "./types";

export const meta: TemplateMeta = {
  id: "split-screen",
  name: "Split Screen",
  category: "dynamic",
  color: "#667eea",
};

interface SplitScreenProps extends AnimationProps {
  topText?: string;
  bottomText?: string;
}

export const SplitScreen: React.FC<SplitScreenProps> = ({
  frame,
  config,
  topText = "BEFORE",
  bottomText = "AFTER",
}) => {
  const { fps, durationInFrames, width, height } = config;

  // Split animation
  const splitProgress = spring({ frame: frame - 10, fps, damping: 20, stiffness: 60 });
  const splitAmount = interpolate(splitProgress, [0, 1], [0, height / 2 - 40]);

  // Text animations
  const topTextProgress = spring({ frame: frame - 30, fps, damping: 15 });
  const bottomTextProgress = spring({ frame: frame - 40, fps, damping: 15 });

  // Center line glow
  const lineGlow = Math.sin(frame * 0.15) * 10 + 20;

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
        background: "#000",
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
      {/* Top half */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: height / 2,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          transform: `translateY(-${splitAmount}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "white",
            margin: 0,
            opacity: topTextProgress,
            transform: `translateY(${interpolate(topTextProgress, [0, 1], [50, 0])}px)`,
            textTransform: "uppercase",
            letterSpacing: 10,
          }}
        >
          {topText}
        </h2>
      </div>

      {/* Bottom half */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: height / 2,
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          transform: `translateY(${splitAmount}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "white",
            margin: 0,
            opacity: bottomTextProgress,
            transform: `translateY(${interpolate(bottomTextProgress, [0, 1], [-50, 0])}px)`,
            textTransform: "uppercase",
            letterSpacing: 10,
          }}
        >
          {bottomText}
        </h2>
      </div>

      {/* Center divider line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: 4,
          background: "white",
          transform: "translateY(-50%)",
          boxShadow: `0 0 ${lineGlow}px white, 0 0 ${lineGlow * 2}px white`,
          zIndex: 10,
        }}
      />

      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "white",
          boxShadow: `0 0 30px white`,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 32, color: "#000" }}>VS</span>
      </div>
    </div>
  );
};
