// Cobrain Bot Assembly — Shared Constants

// ─── COLORS ──────────────────────────────────────────
export const COLORS = {
  primary: "#8b5cf6",
  primaryLight: "#a78bfa",
  primaryDark: "#6d28d9",
  bg: "#0a0a0a",
  surface: "#111111",
  text: "#f5f5f5",
  textMuted: "rgba(255,255,255,0.5)",
  accentBlue: "#3b82f6",
  glow: "rgba(139,92,246,0.15)",
} as const;

// ─── ROBOT PART DEFINITIONS ─────────────────────────
export interface PartDef {
  id: string;
  label: string;
  /** Assembly start frame */
  startFrame: number;
  /** Assembly end frame (for label display) */
  endFrame: number;
  /** World-space final position [x, y, z] */
  finalPos: [number, number, number];
  /** Off-screen start position [x, y, z] */
  startPos: [number, number, number];
  /** Start rotation [x, y, z] in radians */
  startRot: [number, number, number];
}

export const PARTS: PartDef[] = [
  {
    id: "body",
    label: "Cobrain Core",
    startFrame: 20,
    endFrame: 40,
    finalPos: [0, 0, 0],
    startPos: [0, -5, 0],
    startRot: [0.3, 0, 0.2],
  },
  {
    id: "head",
    label: "Akilli Hafiza",
    startFrame: 40,
    endFrame: 60,
    finalPos: [0, 1.35, 0],
    startPos: [0, 6, 0],
    startRot: [-0.4, 0.5, 0],
  },
  {
    id: "armL",
    label: "Coklu Kanal",
    startFrame: 60,
    endFrame: 80,
    finalPos: [-0.85, 0.15, 0],
    startPos: [-5, 0.15, 0],
    startRot: [0, 0, 1.2],
  },
  {
    id: "armR",
    label: "Proaktif Takip",
    startFrame: 80,
    endFrame: 100,
    finalPos: [0.85, 0.15, 0],
    startPos: [5, 0.15, 0],
    startRot: [0, 0, -1.2],
  },
  {
    id: "legL",
    label: "Gizlilik",
    startFrame: 100,
    endFrame: 115,
    finalPos: [-0.3, -1.35, 0],
    startPos: [-0.3, -5, 0],
    startRot: [0, 0, 0.4],
  },
  {
    id: "legR",
    label: "Guvenlik",
    startFrame: 100,
    endFrame: 115,
    finalPos: [0.3, -1.35, 0],
    startPos: [0.3, -5, 0],
    startRot: [0, 0, -0.4],
  },
  {
    id: "antenna",
    label: "Evrimlesen AI",
    startFrame: 115,
    endFrame: 135,
    finalPos: [0, 2.1, 0],
    startPos: [0, 6, 0],
    startRot: [0, 0, 0.8],
  },
];

// ─── TIMING ─────────────────────────────────────────
export const TOTAL_FRAMES = 240;
export const FPS = 30;
export const ASSEMBLY_DONE_FRAME = 135;
export const ACTIVATION_START = 140;
export const ACTIVATION_END = 180;
export const BRANDING_START = 180;

// ─── MATERIAL CONSTANTS ─────────────────────────────
export const METAL = {
  metalness: 0.85,
  roughness: 0.1,
} as const;

// ─── PARTICLE COUNT ─────────────────────────────────
export const PARTICLE_COUNT = 30;
