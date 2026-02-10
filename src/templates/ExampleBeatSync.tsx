import React from "react";
import type { AnimationProps, VideoConfig } from "../animations";
import { interpolate, spring, presets } from "../animations";
import { beatPulse, beatProgress, barProgress, isBeat, currentBeat } from "../audio/sync";
import { getBrand } from "../brand";
import { SafeZone } from "../layout";
import { Anchor } from "../layout";
import { fadeIn, fadeOut } from "../transitions";
import type { ProjectMeta, TimelineSegment } from "./types";

const BPM = 120;
const BEATS_PER_BAR = 4;

export const meta: ProjectMeta = {
  id: "example-beat-sync",
  name: "Example: Beat Sync",
  category: "dynamic",
  color: "#8b5cf6",
};

export const templateConfig: Partial<VideoConfig> = {
  ...presets.instagramReel,
  durationInFrames: 450,
};

export const timeline: TimelineSegment[] = [
  { name: "Intro", from: 0, durationInFrames: 30, color: "#3b82f6" },
  { name: "Beat Loop", from: 30, durationInFrames: 390, color: "#8b5cf6" },
  { name: "Outro", from: 420, durationInFrames: 30, color: "#22c55e" },
];

export const Component: React.FC<AnimationProps> = ({ frame, config }) => {
  const { fps, width, height, durationInFrames } = config;
  const brand = getBrand("cobrain");
  const { primary, primaryLight, background } = brand.palette;

  // Global transitions
  const introOpacity = fadeIn({ frame, durationInFrames: 30 });
  const outroOpacity = fadeOut({
    frame,
    startFrame: durationInFrames - 30,
    durationInFrames: 30,
  });
  const opacity = Math.min(introOpacity, outroOpacity);

  // Beat data
  const pulse = beatPulse(BPM, frame, fps, 0.2);
  const bProg = beatProgress(BPM, frame, fps);
  const barProg = barProgress(BPM, BEATS_PER_BAR, frame, fps);
  const beat = currentBeat(BPM, frame, fps);
  const onBeat = isBeat(BPM, frame, fps);

  // Pulse circle
  const circleScale = 1 + pulse * 0.15;
  const circleGlow = pulse * 0.4;

  return (
    <div
      style={{
        width,
        height,
        background,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
        opacity,
      }}
    >
      {/* Beat flash overlay */}
      {onBeat && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `${primary}08`,
            pointerEvents: "none",
          }}
        />
      )}

      <SafeZone platform="instagram-reel">
        {/* Beat counter — top right */}
        <Anchor position="top-right" offsetX={-10} offsetY={10}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: primaryLight,
              fontVariantNumeric: "tabular-nums",
              fontFamily: "JetBrains Mono, monospace",
              opacity: 0.7,
            }}
          >
            {String(beat).padStart(2, "0")}
          </div>
        </Anchor>

        {/* Bar indicator — top left */}
        <Anchor position="top-left" offsetX={10} offsetY={20}>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2, 3].map((i) => {
              const beatInBar = beat % BEATS_PER_BAR;
              return (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: i <= beatInBar ? primaryLight : "#333",
                    transition: "none",
                  }}
                />
              );
            })}
          </div>
        </Anchor>

        {/* Center pulse circle */}
        <Anchor position="center">
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${primary} 0%, ${primary}40 60%, transparent 100%)`,
              transform: `scale(${circleScale})`,
              boxShadow: `0 0 ${60 + circleGlow * 100}px ${primary}${Math.round(circleGlow * 255).toString(16).padStart(2, "0")}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                opacity: 0.8,
              }}
            >
              {BPM} BPM
            </div>
          </div>
        </Anchor>

        {/* Equalizer bars — bottom center */}
        <Anchor position="bottom-center" offsetY={-40}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 120 }}>
            {Array.from({ length: 8 }).map((_, i) => {
              // Phase-offset wave for each bar
              const phase = (i / 8) * Math.PI * 2;
              const wave = Math.sin(bProg * Math.PI * 2 + phase);
              const barHeight = 20 + (wave * 0.5 + 0.5) * 80 + pulse * 20;

              return (
                <div
                  key={i}
                  style={{
                    width: 16,
                    height: barHeight,
                    borderRadius: 4,
                    background: `linear-gradient(to top, ${primary}, ${primaryLight})`,
                    opacity: 0.6 + pulse * 0.4,
                  }}
                />
              );
            })}
          </div>
        </Anchor>

        {/* BPM label */}
        <Anchor position="bottom-center" offsetY={-10}>
          <div
            style={{
              fontSize: 12,
              color: "#555",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            beatPulse + barProgress
          </div>
        </Anchor>
      </SafeZone>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: `${(frame / durationInFrames) * 100}%`,
          height: 3,
          background: primary,
        }}
      />

      {/* Frame counter */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 20,
          fontSize: 12,
          fontFamily: "JetBrains Mono, monospace",
          color: "#333",
        }}
      >
        FR {String(frame).padStart(3, "0")}/{durationInFrames}
      </div>
    </div>
  );
};
