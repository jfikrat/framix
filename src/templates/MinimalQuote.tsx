import React from "react";
import { interpolate, spring, type AnimationProps } from "../animations";
import type { TemplateMeta } from "./types";

export const meta: TemplateMeta = {
  id: "minimal-quote",
  name: "Minimal Quote",
  category: "quote",
  color: "#1a1a1a",
};

interface MinimalQuoteProps extends AnimationProps {
  quote?: string;
  author?: string;
}

export const MinimalQuote: React.FC<MinimalQuoteProps> = ({
  frame,
  config,
  quote = "Simplicity is the ultimate sophistication.",
  author = "Leonardo da Vinci",
}) => {
  const { fps, durationInFrames, width, height } = config;

  // Quote animation - word by word
  const words = quote.split(" ");
  const wordDelay = 4;

  // Author animation
  const authorStart = words.length * wordDelay + 30;
  const authorProgress = spring({ frame: frame - authorStart, fps, damping: 15 });

  // Line animation
  const lineProgress = spring({ frame: frame - 20, fps, damping: 20 });

  // Breathing background
  const breathe = Math.sin(frame * 0.03) * 0.02 + 1;

  // Fade out
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 25, durationInFrames],
    [1, 0],
    { clamp: true }
  );

  return (
    <div
      style={{
        width,
        height,
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Playfair Display', Georgia, serif",
        opacity: fadeOut,
        overflow: "hidden",
        position: "relative",
        transform: `scale(${breathe})`,
      }}
    >
      {/* Subtle grain texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
        }}
      />

      {/* Opening quote mark */}
      <div
        style={{
          position: "absolute",
          top: height * 0.2,
          left: width * 0.1,
          fontSize: 300,
          color: "#e0e0e0",
          fontFamily: "Georgia, serif",
          lineHeight: 1,
          opacity: interpolate(frame, [0, 20], [0, 1], { clamp: true }),
        }}
      >
        "
      </div>

      {/* Quote text */}
      <div
        style={{
          maxWidth: width * 0.7,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontSize: 56,
            fontWeight: 400,
            color: "#1a1a1a",
            lineHeight: 1.5,
            margin: 0,
            fontStyle: "italic",
          }}
        >
          {words.map((word, i) => {
            const wordProgress = spring({
              frame: frame - i * wordDelay,
              fps,
              damping: 15,
            });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  marginRight: 16,
                  opacity: wordProgress,
                  transform: `translateY(${interpolate(wordProgress, [0, 1], [20, 0])}px)`,
                }}
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>

      {/* Divider line */}
      <div
        style={{
          width: interpolate(lineProgress, [0, 1], [0, 100]),
          height: 2,
          background: "#1a1a1a",
          marginTop: 60,
          marginBottom: 40,
        }}
      />

      {/* Author */}
      <p
        style={{
          fontSize: 28,
          color: "#666",
          margin: 0,
          fontWeight: 400,
          fontStyle: "normal",
          letterSpacing: 4,
          textTransform: "uppercase",
          opacity: authorProgress,
          transform: `translateY(${interpolate(authorProgress, [0, 1], [15, 0])}px)`,
        }}
      >
        — {author}
      </p>

      {/* Closing quote mark */}
      <div
        style={{
          position: "absolute",
          bottom: height * 0.15,
          right: width * 0.1,
          fontSize: 300,
          color: "#e0e0e0",
          fontFamily: "Georgia, serif",
          lineHeight: 1,
          transform: "rotate(180deg)",
          opacity: interpolate(frame, [0, 20], [0, 1], { clamp: true }),
        }}
      >
        "
      </div>
    </div>
  );
};
