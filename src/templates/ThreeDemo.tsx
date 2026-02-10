import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { AnimationProps, VideoConfig } from "../animations";
import { interpolate, spring, easing } from "../animations";
import { FramixCanvas } from "../three";
import type { ProjectMeta, TimelineSegment } from "./types";

// ─── META ────────────────────────────────────────────
export const meta: ProjectMeta = {
  id: "three-demo",
  name: "3D Showcase",
  category: "dynamic",
  color: "#8b5cf6",
};

export const templateConfig: Partial<VideoConfig> = {
  width: 1920,
  height: 1080,
  durationInFrames: 150,
};

export const timeline: TimelineSegment[] = [
  { name: "Entrance", from: 0, durationInFrames: 30, color: "#8b5cf6" },
  { name: "Showcase", from: 30, durationInFrames: 90, color: "#3b82f6" },
  { name: "Exit", from: 120, durationInFrames: 30, color: "#6d28d9" },
];

// ─── PARTICLES (deterministic positions) ─────────────
const PARTICLE_COUNT = 40;
const particleData = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const phi = i * 137.508 * (Math.PI / 180);
  const r = 1.5 + Math.sqrt(i / PARTICLE_COUNT) * 3;
  return {
    x: Math.cos(phi) * r,
    y: (Math.sin(phi + i * 0.5) * r) * 0.6,
    z: Math.sin(phi * 0.7) * r * 0.4,
    speed: 0.3 + (i % 5) * 0.15,
    size: 0.02 + (i % 3) * 0.015,
  };
});

// ─── FLOATING PARTICLES ──────────────────────────────
const Particles: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const time = frame / fps;

  useFrame(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particleData[i];
      const angle = time * p.speed;
      dummy.position.set(
        p.x * Math.cos(angle) - p.z * Math.sin(angle),
        p.y + Math.sin(time * p.speed * 2 + i) * 0.3,
        p.x * Math.sin(angle) + p.z * Math.cos(angle),
      );
      dummy.scale.setScalar(p.size);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#a78bfa"
        emissive="#8b5cf6"
        emissiveIntensity={2}
        toneMapped={false}
      />
    </instancedMesh>
  );
};

// ─── TORUS KNOT ──────────────────────────────────────
const AnimatedTorusKnot: React.FC<{
  frame: number;
  fps: number;
  totalFrames: number;
}> = ({ frame, fps, totalFrames }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Entrance: spring scale
  const scaleP = spring({ frame, fps, damping: 10, stiffness: 80 });
  const scale = interpolate(scaleP, [0, 1], [0, 1.2]);

  // Camera approach: z position
  const camZ = interpolate(frame, [0, 30], [8, 5], { easing: easing.easeOutCubic });

  // Exit fade
  const exitOpacity = interpolate(frame, [totalFrames - 30, totalFrames], [1, 0]);
  const exitScale = interpolate(frame, [totalFrames - 30, totalFrames], [1, 0.6], {
    easing: easing.easeInCubic,
  });

  const finalScale = scale * exitScale;

  // Rotation per frame
  const time = frame / fps;

  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.3;
      meshRef.current.rotation.y = time * 0.5;
      meshRef.current.scale.setScalar(finalScale);
    }
    camera.position.z = camZ;
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.35, 128, 32]} />
      <meshStandardMaterial
        color="#7c3aed"
        metalness={0.9}
        roughness={0.1}
        emissive="#4c1d95"
        emissiveIntensity={0.3 * exitOpacity}
        transparent
        opacity={exitOpacity}
      />
    </mesh>
  );
};

// ─── SCENE ───────────────────────────────────────────
const Scene: React.FC<{
  frame: number;
  fps: number;
  totalFrames: number;
}> = ({ frame, fps, totalFrames }) => (
  <>
    <ambientLight intensity={0.2} />
    <pointLight position={[5, 5, 5]} intensity={1.5} color="#a78bfa" />
    <pointLight position={[-5, -3, 3]} intensity={0.8} color="#3b82f6" />

    <AnimatedTorusKnot frame={frame} fps={fps} totalFrames={totalFrames} />
    <Particles frame={frame} fps={fps} />

    <Environment preset="studio" />

    <EffectComposer>
      <Bloom
        luminanceThreshold={0.8}
        luminanceSmoothing={0.3}
        intensity={1.5}
      />
    </EffectComposer>
  </>
);

// ─── MAIN COMPONENT ─────────────────────────────────
export const ThreeDemo: React.FC<AnimationProps> = ({ frame, config }) => {
  const { width, height, durationInFrames } = config;

  // Progress bar
  const progressW = (frame / (durationInFrames - 1)) * width;

  // Exit fade for overlay
  const overlayOpacity = interpolate(frame, [durationInFrames - 30, durationInFrames], [1, 0]);

  return (
    <div
      style={{
        width,
        height,
        background: "#0a0a0a",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* 3D Canvas */}
      <FramixCanvas
        config={config}
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Scene frame={frame} fps={config.fps} totalFrames={durationInFrames} />
      </FramixCanvas>

      {/* Scanlines overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 4px)",
          pointerEvents: "none",
          zIndex: 10,
          opacity: overlayOpacity,
        }}
      />

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: progressW,
          height: 3,
          background: "linear-gradient(90deg, #8b5cf6, #3b82f6)",
          boxShadow: "0 0 10px rgba(139,92,246,0.4)",
          zIndex: 20,
        }}
      />

      {/* Frame counter */}
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
          opacity: overlayOpacity,
        }}
      >
        FR {String(frame).padStart(3, "0")}/{durationInFrames}
      </div>
    </div>
  );
};
