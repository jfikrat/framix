import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { interpolate } from "../../animations";
import { PARTICLE_COUNT, COLORS, ASSEMBLY_DONE_FRAME } from "./constants";

// ─── DETERMINISTIC PARTICLE DATA (golden ratio spiral) ──
const particleData = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const phi = i * 137.508 * (Math.PI / 180);
  const r = 2 + Math.sqrt(i / PARTICLE_COUNT) * 3;
  return {
    baseX: Math.cos(phi) * r,
    baseY: (Math.sin(phi + i * 0.5) * r) * 0.5,
    baseZ: Math.sin(phi * 0.7) * r * 0.5,
    speed: 0.4 + (i % 7) * 0.1,
    size: 0.025 + (i % 4) * 0.01,
  };
});

// ─── ASSEMBLY PARTICLES ─────────────────────────────────
export const AssemblyParticles: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const time = frame / fps;

  useFrame(() => {
    if (!meshRef.current) return;

    // Phase factors
    const pullFactor =
      frame < 20
        ? 1
        : frame < ASSEMBLY_DONE_FRAME
          ? interpolate(frame, [20, ASSEMBLY_DONE_FRAME], [1, 0.3])
          : 1;

    const burstFactor =
      frame >= ASSEMBLY_DONE_FRAME
        ? interpolate(frame, [ASSEMBLY_DONE_FRAME, 160], [1, 3.5])
        : 1;

    const fadeScale =
      frame >= 200 ? interpolate(frame, [200, 240], [1, 0]) : 1;

    const radiusMult = pullFactor * burstFactor;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particleData[i];
      const angle = time * p.speed;

      dummy.position.set(
        (p.baseX * Math.cos(angle) - p.baseZ * Math.sin(angle)) * radiusMult,
        p.baseY + Math.sin(time * p.speed * 2 + i) * 0.4 * radiusMult,
        (p.baseX * Math.sin(angle) + p.baseZ * Math.cos(angle)) * radiusMult,
      );
      dummy.scale.setScalar(p.size * fadeScale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Emissive intensity boost during burst
  const emissiveIntensity =
    frame >= ASSEMBLY_DONE_FRAME
      ? interpolate(frame, [ASSEMBLY_DONE_FRAME, 155], [2, 5])
      : 2;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color={COLORS.primaryLight}
        emissive={COLORS.primary}
        emissiveIntensity={emissiveIntensity}
        toneMapped={false}
      />
    </instancedMesh>
  );
};
