import React from "react";
import { interpolate, type AnimationProps } from "../animations";
import type { VideoConfig } from "../animations";
import type { TemplateMeta } from "./types";
import type { AudioTrack } from "../audio/types";

export const meta: TemplateMeta = {
  id: "hatay-memorial",
  name: "Hatay Memorial",
  category: "minimal",
  color: "#D4A574",
};

export const templateConfig: Partial<VideoConfig> = {
  durationInFrames: 450,
};

// --- Audio ---
const FPS = 30;
const f2s = (frames: number) => frames / FPS;

export const audioTrack: AudioTrack = {
  bpm: 60,
  reverb: { wet: 0.35, roomSize: 0.8, damping: 0.6 },
  events: [
    // Deep sine drone — slowly fades in over scene 1-2
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
    // Bell tone at 04:17 moment (scene 2 peak, ~frame 90)
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
    // Upper harmonic layer — scene 3 ethereal pad
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
    // Very gentle high harmonic — adds air
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
    // Second soft bell — scene 4 "UNUTMADIK" moment
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

// --- Component ---
export const HatayMemorial: React.FC<AnimationProps> = ({ frame, config }) => {
  const { durationInFrames, width, height } = config;

  // Scene boundaries
  const SCENE1_START = 0;
  const SCENE2_START = 60;
  const SCENE3_START = 120;
  const SCENE4_START = 210;
  const SCENE5_START = 330;

  // --- Scene 1: Date "6 ŞUBAT 2023" ---
  const dateOpacity = interpolate(frame, [SCENE1_START + 15, SCENE1_START + 60], [0, 1], { clamp: true })
    * interpolate(frame, [SCENE2_START + 60, SCENE2_START + 90], [1, 0], { clamp: true });

  // --- Scene 2: Time "04:17" ---
  const timeOpacity = interpolate(frame, [SCENE2_START, SCENE2_START + 40], [0, 1], { clamp: true })
    * interpolate(frame, [SCENE3_START + 30, SCENE3_START + 60], [1, 0], { clamp: true });
  const timeScale = interpolate(frame, [SCENE2_START, SCENE2_START + 60], [1.05, 1.0], { clamp: true });

  // --- Scene 3: Amber light (candle metaphor) ---
  const lightOpacity = interpolate(frame, [SCENE3_START, SCENE3_START + 40], [0, 1], { clamp: true })
    * interpolate(frame, [SCENE5_START + 60, SCENE5_START + 120], [1, 0], { clamp: true });
  // Breathing pulse
  const breathCycle = Math.sin((frame - SCENE3_START) * 0.04) * 0.15 + 1;
  const lightRadius = 80 * breathCycle;
  const glowRadius = 250 * breathCycle;

  // --- Scene 4: "UNUTMADIK" / "UNUTMAYACAĞIZ" ---
  const unutmadikOpacity = interpolate(frame, [SCENE4_START, SCENE4_START + 40], [0, 1], { clamp: true })
    * interpolate(frame, [SCENE5_START, SCENE5_START + 45], [1, 0], { clamp: true });
  const unutmayacagizOpacity = interpolate(frame, [SCENE4_START + 50, SCENE4_START + 90], [0, 1], { clamp: true })
    * interpolate(frame, [SCENE5_START, SCENE5_START + 45], [1, 0], { clamp: true });
  const lineWidth = interpolate(frame, [SCENE4_START + 30, SCENE4_START + 70], [0, 120], { clamp: true })
    * interpolate(frame, [SCENE5_START, SCENE5_START + 45], [1, 0], { clamp: true });

  // --- Scene 5: Final fade out ---
  const globalFade = interpolate(frame, [SCENE5_START + 30, durationInFrames], [1, 0], { clamp: true });

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
        position: "relative",
        overflow: "hidden",
        opacity: globalFade,
      }}
    >
      {/* Scene 1: Date */}
      <div
        style={{
          position: "absolute",
          top: height * 0.22,
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
            textTransform: "uppercase",
          }}
        >
          6 Şubat 2023
        </span>
      </div>

      {/* Scene 2: Time 04:17 */}
      <div
        style={{
          position: "absolute",
          top: height * 0.35,
          width: "100%",
          textAlign: "center",
          opacity: timeOpacity,
          transform: `scale(${timeScale})`,
        }}
      >
        <span
          style={{
            fontFamily: "'Courier New', 'Courier', monospace",
            fontSize: 120,
            fontWeight: 300,
            color: "#E8E8E8",
            letterSpacing: 8,
            textShadow: "0 0 40px rgba(212,165,116,0.4), 0 0 80px rgba(212,165,116,0.15)",
          }}
        >
          04:17
        </span>
      </div>

      {/* Scene 3: Amber light (candle) */}
      <div
        style={{
          position: "absolute",
          top: height * 0.5 - glowRadius / 2,
          left: width / 2 - glowRadius / 2,
          width: glowRadius,
          height: glowRadius,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,165,116,0.25) 0%, rgba(212,165,116,0.05) 40%, transparent 70%)",
          opacity: lightOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: height * 0.5 - lightRadius / 2,
          left: width / 2 - lightRadius / 2,
          width: lightRadius,
          height: lightRadius,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,165,116,0.6) 0%, rgba(212,165,116,0.2) 50%, transparent 100%)",
          opacity: lightOpacity,
        }}
      />

      {/* Scene 4: UNUTMADIK / UNUTMAYACAĞIZ */}
      <div
        style={{
          position: "absolute",
          top: height * 0.58,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
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
          }}
        >
          UNUTMADIK
        </span>

        {/* Divider line */}
        <div
          style={{
            width: lineWidth,
            height: 1,
            background: "rgba(212,165,116,0.5)",
            marginTop: 30,
            marginBottom: 30,
          }}
        />

        <span
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: 38,
            fontWeight: 300,
            color: "rgba(232,232,232,0.8)",
            letterSpacing: 12,
            opacity: unutmayacagizOpacity,
          }}
        >
          UNUTMAYACAĞIZ
        </span>
      </div>
    </div>
  );
};
