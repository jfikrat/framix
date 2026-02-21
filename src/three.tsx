// React Three Fiber Integration for Framix
// FramixCanvas wrapper — Framix defaults ile r3f Canvas sarar.
// frame/config prop olarak geçilir, useCurrentFrame() Canvas içinde ÇALIŞMAZ.
//
// KRITIK: Player CSS transform:scale() kullanıyor. r3f'in react-use-measure
// kütüphanesi getBoundingClientRect() ile boyut ölçer — bu fonksiyon ancestor
// CSS transform'ları hesaba katar ve scale'lenmiş küçük boyutu döndürür.
// Çözüm: offsetSize:true → offsetWidth/Height kullanır, transform'dan etkilenmez.

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { VideoConfig } from "./animations";

interface FramixCanvasProps {
  children: React.ReactNode;
  config: VideoConfig;
  camera?: { position?: [number, number, number]; fov?: number };
  style?: React.CSSProperties;
}

// Güvenlik katmanı: dimensions değiştiğinde buffer'ı düzeltir, invalidate() ile
// tek frame tetikler. frameloop="demand" ile uyumlu (useFrame loop yok).
const SizeEnforcer: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const { gl, camera, invalidate } = useThree();
  useEffect(() => {
    gl.setSize(width, height, false);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    invalidate();
  }, [width, height, gl, camera, invalidate]);
  return null;
};

export const FramixCanvas: React.FC<FramixCanvasProps> = ({
  children,
  config,
  camera,
  style,
}) => (
  <Canvas
    frameloop="demand"
    gl={{ preserveDrawingBuffer: true, antialias: true }}
    dpr={1}
    camera={{
      position: camera?.position ?? [0, 0, 5],
      fov: camera?.fov ?? 50,
    }}
    style={{ width: config.width, height: config.height, ...style }}
    resize={{ offsetSize: true, scroll: false, debounce: 0 }}
  >
    <SizeEnforcer width={config.width} height={config.height} />
    {children}
  </Canvas>
);
