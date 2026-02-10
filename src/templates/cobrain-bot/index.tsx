// Cobrain Bot Assembly — 3D robot assembly animation with branding overlay
// Parts fly in with spring physics, assemble into a robot, eyes activate,
// then cobrain branding fades in over a gentle rotation.

import React from "react";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { AnimationProps, VideoConfig } from "../../animations";
import { interpolate, spring } from "../../animations";
import { FramixCanvas } from "../../three";
import { useCamera } from "../../camera";
import type { ProjectMeta, TimelineSegment } from "../types";
import { RobotAssembly } from "./RobotParts";
import { AssemblyParticles } from "./Particles";
import { COLORS, PARTS, TOTAL_FRAMES, BRANDING_START } from "./constants";

// ─── META ────────────────────────────────────────────
export const meta: ProjectMeta = {
  id: "cobrain-bot-assembly",
  name: "Bot Assembly",
  brand: "cobrain",
  category: "promo",
  color: "#8b5cf6",
};

export const templateConfig: Partial<VideoConfig> = {
  width: 1920,
  height: 1080,
  durationInFrames: 240,
};

export const timeline: TimelineSegment[] = [
  { name: "Ambient", from: 0, durationInFrames: 20, color: "#6d28d9" },
  { name: "Assembly", from: 20, durationInFrames: 120, color: "#8b5cf6" },
  { name: "Activation", from: 140, durationInFrames: 40, color: "#3b82f6" },
  { name: "Branding", from: 180, durationInFrames: 60, color: "#22c55e" },
];

// ─── CAMERA ANIMATION ────────────────────────────────
const CameraRig: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  useCamera({
    frame,
    fps,
    keyframes: [
      // Ambient: uzaktan, hafif yukarıdan
      { frame: 0, position: [0, 1.5, 9], lookAt: [0, 0, 0], fov: 50 },
      // Assembly başlangıcı: yavaşça yaklaş
      { frame: 20, position: [0, 1, 8], lookAt: [0, 0, 0], fov: 48 },
      // Assembly ortası: biraz sola kay, yaklaş
      { frame: 80, position: [-1.5, 0.5, 5.5], lookAt: [0, 0.3, 0], fov: 45 },
      // Assembly sonu: merkeze dön, yakın
      { frame: 135, position: [0, 0.5, 5], lookAt: [0, 0.2, 0], fov: 42 },
      // Activation: hafif geri çekil (bloom patlaması için alan aç)
      { frame: 155, position: [0, 0.3, 5.8], lookAt: [0, 0.3, 0], fov: 44 },
      // Branding: yukarı çekil, geniş açı
      { frame: 190, position: [0, 0.8, 6], lookAt: [0, 0.2, 0], fov: 45 },
      // Son frame: aynı pozisyonda kal
      { frame: 240, position: [0, 0.8, 6], lookAt: [0, 0.2, 0], fov: 45 },
    ],
    interpolation: "catmullrom",
    // Activation anında hafif sarsıntı
    shake: {
      intensity: 0.08,
      frequency: 20,
      frames: [140, 160],
      decay: 0.8,
    },
  });
  return null;
};

// ─── SCENE (r3f tree) ────────────────────────────────
const Scene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Bloom ramps up at activation, then settles
  const bloomIntensity =
    frame < 140
      ? 1.5
      : frame < 160
        ? interpolate(frame, [140, 155], [1.5, 4])
        : interpolate(frame, [160, 180], [4, 2]);

  return (
    <>
      <CameraRig frame={frame} fps={fps} />

      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#a78bfa" />
      <pointLight position={[-4, -2, 3]} intensity={0.6} color="#3b82f6" />

      <RobotAssembly frame={frame} fps={fps} />
      <AssemblyParticles frame={frame} fps={fps} />

      <Environment preset="studio" />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.7}
          luminanceSmoothing={0.3}
          intensity={bloomIntensity}
        />
      </EffectComposer>
    </>
  );
};

// ─── FEATURE LABELS ──────────────────────────────────
// Shows part label briefly when each part snaps into place
const FeatureLabels: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Find active label: visible from part.endFrame to part.endFrame + 20
  const activeLabel = PARTS.find(
    (p) => frame >= p.endFrame && frame < p.endFrame + 20,
  );

  if (!activeLabel) return null;

  const localFrame = frame - activeLabel.endFrame;
  const enterProgress = spring({ frame: localFrame, fps, damping: 14, stiffness: 100 });
  const exitOpacity = interpolate(localFrame, [10, 20], [1, 0]);
  const opacity = enterProgress * exitOpacity;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 15,
      }}
    >
      <div
        style={{
          color: COLORS.textMuted,
          fontSize: 18,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          opacity,
          transform: `translateY(${interpolate(enterProgress, [0, 1], [10, 0])}px)`,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {activeLabel.label}
      </div>
    </div>
  );
};

// ─── SCANLINES ───────────────────────────────────────
const Scanlines: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 4px)",
      pointerEvents: "none",
      zIndex: 10,
    }}
  />
);

// ─── PROGRESS BAR ────────────────────────────────────
const ProgressBar: React.FC<{ frame: number; width: number; totalFrames: number }> = ({
  frame,
  width,
  totalFrames,
}) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      width: (frame / (totalFrames - 1)) * width,
      height: 3,
      background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accentBlue})`,
      boxShadow: `0 0 10px ${COLORS.glow}`,
      zIndex: 20,
    }}
  />
);

// ─── FRAME COUNTER ───────────────────────────────────
const FrameCounter: React.FC<{ frame: number; totalFrames: number }> = ({
  frame,
  totalFrames,
}) => (
  <div
    style={{
      position: "absolute",
      bottom: 30,
      right: 60,
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      fontSize: 12,
      color: "rgba(255,255,255,0.15)",
      letterSpacing: "0.1em",
      zIndex: 20,
    }}
  >
    FR {String(frame).padStart(3, "0")}/{totalFrames}
  </div>
);

// ─── BRANDING OVERLAY ────────────────────────────────
const BrandingOverlay: React.FC<{ frame: number; fps: number; totalFrames: number }> = ({
  frame,
  fps,
  totalFrames,
}) => {
  if (frame < BRANDING_START) return null;

  const localFrame = frame - BRANDING_START;
  const enterSpring = spring({ frame: localFrame - 5, fps, damping: 12, stiffness: 80 });
  const fadeIn = interpolate(frame, [185, 200], [0, 1]);

  // Final 15 frames: entire screen fades out
  const fadeOut = interpolate(frame, [totalFrames - 15, totalFrames], [1, 0]);

  const translateY = interpolate(enterSpring, [0, 1], [30, 0]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 25,
        opacity: fadeIn * fadeOut,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 18,
          transform: `translateY(${translateY}px)`,
        }}
      >
        <img
          src="/brands/cobrain/logo.png"
          alt="cobrain"
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
          }}
        />
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: COLORS.textMuted,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          cobrain
        </span>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────
export const CobrainBotAssembly: React.FC<AnimationProps> = ({ frame, config }) => {
  const { width, height, durationInFrames, fps } = config;

  // Final 15 frames: full scene fade out
  const sceneFadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0]);

  return (
    <div
      style={{
        width,
        height,
        background: COLORS.bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        opacity: sceneFadeOut,
      }}
    >
      {/* 3D Canvas */}
      <FramixCanvas
        config={config}
        camera={{ position: [0, 0.5, 6], fov: 45 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Scene frame={frame} fps={fps} />
      </FramixCanvas>

      {/* DOM Overlays */}
      <FeatureLabels frame={frame} fps={fps} />
      <Scanlines />
      <ProgressBar frame={frame} width={width} totalFrames={durationInFrames} />
      <FrameCounter frame={frame} totalFrames={durationInFrames} />
      <BrandingOverlay frame={frame} fps={fps} totalFrames={durationInFrames} />
    </div>
  );
};
