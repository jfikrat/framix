// Cobrain Bot — Robot Assembly Animation (React Three Fiber)
// 7 parts fly in with spring physics, assemble into a robot,
// eyes activate, then gentle idle sway + branding rotation.

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { spring, interpolate } from "../../animations";
import {
  PARTS,
  COLORS,
  METAL,
  ASSEMBLY_DONE_FRAME,
  ACTIVATION_START,
  BRANDING_START,
} from "./constants";

// ─── Types ──────────────────────────────────────────

interface RobotAssemblyProps {
  frame: number;
  fps: number;
}

// ─── Helpers ────────────────────────────────────────

function lerp3(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

// ─── Individual Part Components ─────────────────────

const Body: React.FC = () => (
  <RoundedBox args={[0.8, 1.2, 0.6]} radius={0.08} smoothness={4}>
    <meshStandardMaterial
      color={COLORS.primary}
      metalness={METAL.metalness}
      roughness={METAL.roughness}
    />
  </RoundedBox>
);

const Head = React.forwardRef<
  THREE.Group,
  { eyeLeftRef: React.RefObject<THREE.Mesh | null>; eyeRightRef: React.RefObject<THREE.Mesh | null>; screenRef: React.RefObject<THREE.Mesh | null> }
>(({ eyeLeftRef, eyeRightRef, screenRef }, ref) => (
  <group ref={ref}>
    {/* Main head box */}
    <RoundedBox args={[1.0, 1.0, 0.7]} radius={0.12} smoothness={4}>
      <meshStandardMaterial
        color={COLORS.primary}
        metalness={METAL.metalness}
        roughness={METAL.roughness}
      />
    </RoundedBox>

    {/* Screen face (inset on front) */}
    <RoundedBox
      ref={screenRef as React.Ref<THREE.Mesh>}
      args={[0.7, 0.5, 0.02]}
      radius={0.04}
      smoothness={4}
      position={[0, 0, 0.36]}
    >
      <meshStandardMaterial
        color="#1a1a2e"
        emissive={COLORS.accentBlue}
        emissiveIntensity={0.2}
        metalness={0.3}
        roughness={0.4}
      />
    </RoundedBox>

    {/* Left eye */}
    <mesh ref={eyeLeftRef} position={[-0.18, 0.05, 0.37]}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color="#1a1a2e"
        emissive="#000000"
        emissiveIntensity={0}
        metalness={0.2}
        roughness={0.5}
      />
    </mesh>

    {/* Right eye */}
    <mesh ref={eyeRightRef} position={[0.18, 0.05, 0.37]}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color="#1a1a2e"
        emissive="#000000"
        emissiveIntensity={0}
        metalness={0.2}
        roughness={0.5}
      />
    </mesh>
  </group>
));
Head.displayName = "Head";

const Arm: React.FC<{ side: "left" | "right" }> = ({ side }) => {
  const sx = side === "left" ? -1 : 1;
  return (
    <group>
      {/* Upper arm cylinder */}
      <mesh rotation={[0, 0, sx * 0.1]}>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 12]} />
        <meshStandardMaterial
          color={COLORS.primaryLight}
          metalness={METAL.metalness}
          roughness={METAL.roughness}
        />
      </mesh>
      {/* Hand */}
      <RoundedBox
        args={[0.15, 0.2, 0.12]}
        radius={0.03}
        smoothness={4}
        position={[0, -0.4, 0]}
      >
        <meshStandardMaterial
          color={COLORS.primaryLight}
          metalness={METAL.metalness}
          roughness={METAL.roughness}
        />
      </RoundedBox>
    </group>
  );
};

const Leg: React.FC<{ side: "left" | "right" }> = ({ side }) => {
  const sx = side === "left" ? -1 : 1;
  return (
    <group>
      {/* Leg cylinder */}
      <mesh rotation={[0, 0, sx * 0.02]}>
        <cylinderGeometry args={[0.07, 0.07, 0.5, 12]} />
        <meshStandardMaterial
          color={COLORS.primaryLight}
          metalness={METAL.metalness}
          roughness={METAL.roughness}
        />
      </mesh>
      {/* Foot */}
      <RoundedBox
        args={[0.18, 0.1, 0.25]}
        radius={0.03}
        smoothness={4}
        position={[0, -0.3, 0.04]}
      >
        <meshStandardMaterial
          color={COLORS.primaryLight}
          metalness={METAL.metalness}
          roughness={METAL.roughness}
        />
      </RoundedBox>
    </group>
  );
};

const Antenna: React.FC = () => (
  <group>
    {/* Thin rod */}
    <mesh>
      <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
      <meshStandardMaterial
        color={COLORS.primary}
        metalness={METAL.metalness}
        roughness={METAL.roughness}
      />
    </mesh>
    {/* Glowing tip */}
    <mesh position={[0, 0.27, 0]}>
      <sphereGeometry args={[0.07, 16, 16]} />
      <meshStandardMaterial
        color={COLORS.primary}
        emissive={COLORS.primary}
        emissiveIntensity={2}
        toneMapped={false}
        metalness={0.3}
        roughness={0.2}
      />
    </mesh>
  </group>
);

// ─── Main Assembly Component ────────────────────────

export const RobotAssembly: React.FC<RobotAssemblyProps> = ({ frame, fps }) => {
  // Refs for animated groups (one per part)
  const robotGroupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const legLRef = useRef<THREE.Group>(null);
  const legRRef = useRef<THREE.Group>(null);
  const antennaRef = useRef<THREE.Group>(null);

  // Refs for animated materials (eyes + screen)
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  // Map part ids to their refs
  const partRefs = useMemo(
    () =>
      ({
        body: bodyRef,
        head: headRef,
        armL: armLRef,
        armR: armRRef,
        legL: legLRef,
        legR: legRRef,
        antenna: antennaRef,
      }) as Record<string, React.RefObject<THREE.Group | null>>,
    [],
  );

  // Accent blue color cached
  const accentBlueColor = useMemo(() => new THREE.Color(COLORS.accentBlue), []);

  // ─── Animation loop ───────────────────────────────
  useFrame(() => {
    const time = frame / fps;

    // ── Part assembly animations ──
    for (const part of PARTS) {
      const ref = partRefs[part.id];
      if (!ref?.current) continue;

      const localFrame = frame - part.startFrame;
      const s = spring({ frame: localFrame, fps, damping: 12, stiffness: 80 });

      // Position: startPos -> finalPos
      const pos = lerp3(part.startPos, part.finalPos, s);
      ref.current.position.set(pos[0], pos[1], pos[2]);

      // Rotation: startRot -> [0, 0, 0]
      const rot: [number, number, number] = [
        part.startRot[0] * (1 - s),
        part.startRot[1] * (1 - s),
        part.startRot[2] * (1 - s),
      ];
      ref.current.rotation.set(rot[0], rot[1], rot[2]);
    }

    // ── Post-assembly: idle sway ──
    if (frame >= ASSEMBLY_DONE_FRAME && frame < BRANDING_START) {
      if (robotGroupRef.current) {
        robotGroupRef.current.rotation.y = Math.sin(time * 0.5) * 0.15;
        robotGroupRef.current.scale.setScalar(1);
      }
    }

    // ── Branding phase: slow continuous rotation + slight scale down ──
    if (frame >= BRANDING_START) {
      if (robotGroupRef.current) {
        robotGroupRef.current.rotation.y = time * 0.3;
        const brandProgress = interpolate(
          frame,
          [BRANDING_START, BRANDING_START + 20],
          [1, 0.85],
        );
        robotGroupRef.current.scale.setScalar(brandProgress);
      }
    }

    // ── Eye & screen activation ──
    if (frame >= ACTIVATION_START) {
      // Emissive ramp: frames 140-160 -> intensity 0 to 3, then pulse 2-3
      const rampProgress = interpolate(frame, [ACTIVATION_START, ACTIVATION_START + 20], [0, 1]);
      const baseIntensity = rampProgress * 3;
      const pulse = rampProgress >= 1 ? 2 + Math.sin(time * 3) * 1 : baseIntensity;

      // Update eye materials
      for (const eyeRef of [eyeLeftRef, eyeRightRef]) {
        if (eyeRef.current) {
          const mat = eyeRef.current.material as THREE.MeshStandardMaterial;
          mat.emissive.copy(accentBlueColor);
          mat.emissiveIntensity = pulse;
        }
      }

      // Update screen emissive
      if (screenRef.current) {
        const screenMat = screenRef.current.material as THREE.MeshStandardMaterial;
        screenMat.emissiveIntensity = 0.2 + rampProgress * 1.5 + (rampProgress >= 1 ? Math.sin(time * 2) * 0.3 : 0);
      }
    }

    // ── Before activation: ensure eyes are dark ──
    if (frame < ACTIVATION_START) {
      for (const eyeRef of [eyeLeftRef, eyeRightRef]) {
        if (eyeRef.current) {
          const mat = eyeRef.current.material as THREE.MeshStandardMaterial;
          mat.emissive.setScalar(0);
          mat.emissiveIntensity = 0;
        }
      }
    }

    // ── Reset robot group before assembly done ──
    if (frame < ASSEMBLY_DONE_FRAME && robotGroupRef.current) {
      robotGroupRef.current.rotation.y = 0;
      robotGroupRef.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={robotGroupRef}>
      {/* Body */}
      <group ref={bodyRef}>
        <Body />
      </group>

      {/* Head */}
      <group ref={headRef}>
        <Head
          eyeLeftRef={eyeLeftRef}
          eyeRightRef={eyeRightRef}
          screenRef={screenRef}
        />
      </group>

      {/* Left Arm */}
      <group ref={armLRef}>
        <Arm side="left" />
      </group>

      {/* Right Arm */}
      <group ref={armRRef}>
        <Arm side="right" />
      </group>

      {/* Left Leg */}
      <group ref={legLRef}>
        <Leg side="left" />
      </group>

      {/* Right Leg */}
      <group ref={legRRef}>
        <Leg side="right" />
      </group>

      {/* Antenna */}
      <group ref={antennaRef}>
        <Antenna />
      </group>
    </group>
  );
};
