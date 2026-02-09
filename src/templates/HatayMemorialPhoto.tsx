import React from "react";
import { interpolate, type AnimationProps } from "../animations";
import type { VideoConfig } from "../animations";
import type { TemplateMeta } from "./types";
import type { AudioTrack } from "../audio/types";

export const meta: TemplateMeta = {
  id: "hatay-memorial-photo",
  name: "Hatay Memorial (Photo)",
  category: "minimal",
  color: "#D4A574",
};

export const templateConfig: Partial<VideoConfig> = {
  durationInFrames: 450,
};

// --- Audio (same atmospheric style) ---
const FPS = 30;
const f2s = (frames: number) => frames / FPS;

export const audioTrack: AudioTrack = {
  bpm: 60,
  reverb: { wet: 0.35, roomSize: 0.8, damping: 0.6 },
  events: [
    // Deep sine drone
    {
      frame: 0,
      duration: 300,
      frequency: 55,
      waveform: "sine",
      volume: 0.12,
      attack: f2s(90),
      decay: 0.5,
      sustain: 0.8,
      release: f2s(60),
      pan: 0,
      filter: { type: "lowpass", cutoff: 200 },
    },
    // Bell at 04:17 moment
    {
      frame: 90,
      duration: 45,
      frequency: 220,
      waveform: "sine",
      volume: 0.15,
      attack: 0.01,
      decay: 0.3,
      sustain: 0.2,
      release: f2s(30),
      pan: 0,
    },
    // Upper harmonic
    {
      frame: 120,
      duration: 180,
      frequency: 110,
      waveform: "sine",
      volume: 0.08,
      attack: f2s(60),
      decay: 0.5,
      sustain: 0.7,
      release: f2s(60),
      pan: 0,
      filter: { type: "lowpass", cutoff: 400 },
    },
    // Gentle high harmonic
    {
      frame: 150,
      duration: 120,
      frequency: 165,
      waveform: "sine",
      volume: 0.04,
      attack: f2s(45),
      sustain: 0.6,
      release: f2s(45),
      pan: 0,
      filter: { type: "lowpass", cutoff: 500 },
    },
    // Second bell — UNUTMADIK
    {
      frame: 240,
      duration: 40,
      frequency: 196,
      waveform: "sine",
      volume: 0.1,
      attack: 0.01,
      decay: 0.4,
      sustain: 0.15,
      release: f2s(25),
      pan: 0,
    },
  ],
};

// --- Image paths ---
const IMG_FLAME = "/assets/memorial-flame-close.jpg";
const IMG_SINGLE = "/assets/memorial-candle-single.jpg";
const IMG_MANY = "/assets/memorial-candles-many.jpg";

// --- Component ---
export const HatayMemorialPhoto: React.FC<AnimationProps> = ({ frame, config }) => {
  const { durationInFrames, width, height } = config;

  // --- Layer opacities ---

  // Layer 1: Close-up flame (0-120 intro, 380-450 outro)
  const flameOpacity =
    interpolate(frame, [0, 60], [0, 0.7], { clamp: true })
    * interpolate(frame, [90, 140], [1, 0], { clamp: true })
    + interpolate(frame, [370, 410], [0, 0.5], { clamp: true })
    * interpolate(frame, [430, 450], [1, 0], { clamp: true });

  // Layer 2: Single candle (80-260)
  const singleOpacity =
    interpolate(frame, [80, 130], [0, 0.8], { clamp: true })
    * interpolate(frame, [230, 280], [1, 0], { clamp: true });

  // Layer 3: Many candles (240-400)
  const manyOpacity =
    interpolate(frame, [240, 290], [0, 0.7], { clamp: true })
    * interpolate(frame, [370, 410], [1, 0], { clamp: true });

  // Ken Burns — very slow zoom
  const flameScale = interpolate(frame, [0, 450], [1.0, 1.15], { clamp: true });
  const singleScale = interpolate(frame, [80, 280], [1.05, 1.0], { clamp: true });
  const manyScale = interpolate(frame, [240, 410], [1.0, 1.08], { clamp: true });

  // --- Text ---

  // Date
  const dateOpacity =
    interpolate(frame, [30, 70], [0, 1], { clamp: true })
    * interpolate(frame, [130, 160], [1, 0], { clamp: true });

  // Time
  const timeOpacity =
    interpolate(frame, [80, 120], [0, 1], { clamp: true })
    * interpolate(frame, [190, 220], [1, 0], { clamp: true });
  const timeScale = interpolate(frame, [80, 140], [1.05, 1.0], { clamp: true });

  // UNUTMADIK / UNUTMAYACAĞIZ
  const unutmadikOpacity =
    interpolate(frame, [260, 300], [0, 1], { clamp: true })
    * interpolate(frame, [380, 410], [1, 0], { clamp: true });
  const unutmayacagizOpacity =
    interpolate(frame, [310, 350], [0, 1], { clamp: true })
    * interpolate(frame, [380, 410], [1, 0], { clamp: true });
  const lineWidth =
    interpolate(frame, [290, 330], [0, 120], { clamp: true })
    * interpolate(frame, [380, 410], [1, 0], { clamp: true });

  // Global fade out
  const globalFade = interpolate(frame, [420, 450], [1, 0], { clamp: true });
  // Global fade in
  const globalIn = interpolate(frame, [0, 20], [0, 1], { clamp: true });

  const imgStyle = (opacity: number, scale: number): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity,
    transform: `scale(${scale})`,
    transformOrigin: "center center",
  });

  return (
    <div
      style={{
        width,
        height,
        background: "#000",
        position: "relative",
        overflow: "hidden",
        opacity: globalIn * globalFade,
      }}
    >
      {/* Background image layers */}
      <img src={IMG_FLAME} alt="" style={imgStyle(flameOpacity, flameScale)} />
      <img src={IMG_SINGLE} alt="" style={imgStyle(singleOpacity, singleScale)} />
      <img src={IMG_MANY} alt="" style={imgStyle(manyOpacity, manyScale)} />

      {/* Dark overlay for text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
        }}
      />

      {/* Date: 6 ŞUBAT 2023 */}
      <div
        style={{
          position: "absolute",
          top: height * 0.28,
          width: "100%",
          textAlign: "center",
          opacity: dateOpacity,
        }}
      >
        <span
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: 36,
            fontWeight: 300,
            color: "#E8E8E8",
            letterSpacing: 12,
          }}
        >
          6 Şubat 2023
        </span>
      </div>

      {/* Time: 04:17 */}
      <div
        style={{
          position: "absolute",
          top: height * 0.36,
          width: "100%",
          textAlign: "center",
          opacity: timeOpacity,
          transform: `scale(${timeScale})`,
        }}
      >
        <span
          style={{
            fontFamily: "'Courier New', 'Courier', monospace",
            fontSize: 110,
            fontWeight: 300,
            color: "#E8E8E8",
            letterSpacing: 8,
            textShadow: "0 0 50px rgba(212,165,116,0.5), 0 0 100px rgba(212,165,116,0.2)",
          }}
        >
          04:17
        </span>
      </div>

      {/* UNUTMADIK / UNUTMAYACAĞIZ */}
      <div
        style={{
          position: "absolute",
          top: height * 0.45,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: 52,
            fontWeight: 400,
            color: "#E8E8E8",
            letterSpacing: 16,
            opacity: unutmadikOpacity,
            textShadow: "0 0 30px rgba(0,0,0,0.8)",
          }}
        >
          UNUTMADIK
        </span>

        <div
          style={{
            width: lineWidth,
            height: 1,
            background: "rgba(212,165,116,0.6)",
            marginTop: 30,
            marginBottom: 30,
          }}
        />

        <span
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: 38,
            fontWeight: 300,
            color: "rgba(232,232,232,0.85)",
            letterSpacing: 12,
            opacity: unutmayacagizOpacity,
            textShadow: "0 0 30px rgba(0,0,0,0.8)",
          }}
        >
          UNUTMAYACAĞIZ
        </span>
      </div>
    </div>
  );
};
