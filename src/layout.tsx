import React from "react";

// ─── Types ───────────────────────────────────────────

export type Platform =
  | "tiktok"
  | "instagram-story"
  | "instagram-reel"
  | "youtube-short"
  | "youtube"
  | "twitter"
  | "default";

export interface Insets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// ─── Safe Zone Data ──────────────────────────────────
// Values in px for standard resolutions

export const SAFE_ZONES: Record<Platform, Insets> = {
  "tiktok":          { top: 150, bottom: 270, left: 20, right: 20 },
  "instagram-story": { top: 120, bottom: 200, left: 20, right: 20 },
  "instagram-reel":  { top: 150, bottom: 270, left: 20, right: 100 },
  "youtube-short":   { top: 100, bottom: 200, left: 20, right: 20 },
  "youtube":         { top: 0,   bottom: 0,   left: 0,  right: 0 },
  "twitter":         { top: 0,   bottom: 0,   left: 0,  right: 0 },
  "default":         { top: 40,  bottom: 40,  left: 40, right: 40 },
};

// ─── SafeZone Component ─────────────────────────────

export interface SafeZoneProps {
  platform?: Platform;
  children: React.ReactNode;
  debug?: boolean;
  style?: React.CSSProperties;
}

/**
 * Container with platform-appropriate padding to avoid UI overlay clipping.
 */
export const SafeZone: React.FC<SafeZoneProps> = ({
  platform = "default",
  children,
  debug = false,
  style,
}) => {
  const insets = SAFE_ZONES[platform];
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        boxSizing: "border-box",
        ...(debug ? { border: "2px dashed rgba(255,0,0,0.5)" } : {}),
        ...style,
      }}
    >
      {debug && (
        <div style={{
          position: "absolute",
          top: 4,
          left: 4,
          fontSize: 10,
          color: "rgba(255,0,0,0.5)",
          fontFamily: "monospace",
        }}>
          {platform} safe-zone
        </div>
      )}
      {children}
    </div>
  );
};

// ─── Anchor Component ────────────────────────────────

export type AnchorPosition =
  | "top-left" | "top-center" | "top-right"
  | "center-left" | "center" | "center-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

export interface AnchorProps {
  position: AnchorPosition;
  children: React.ReactNode;
  offsetX?: number;
  offsetY?: number;
  style?: React.CSSProperties;
}

const anchorStyles: Record<AnchorPosition, React.CSSProperties> = {
  "top-left":      { top: 0, left: 0 },
  "top-center":    { top: 0, left: "50%", transform: "translateX(-50%)" },
  "top-right":     { top: 0, right: 0 },
  "center-left":   { top: "50%", left: 0, transform: "translateY(-50%)" },
  "center":        { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  "center-right":  { top: "50%", right: 0, transform: "translateY(-50%)" },
  "bottom-left":   { bottom: 0, left: 0 },
  "bottom-center": { bottom: 0, left: "50%", transform: "translateX(-50%)" },
  "bottom-right":  { bottom: 0, right: 0 },
};

/**
 * Absolute positioned anchor within a relative parent.
 */
export const Anchor: React.FC<AnchorProps> = ({
  position,
  children,
  offsetX = 0,
  offsetY = 0,
  style,
}) => {
  const base = anchorStyles[position];
  return (
    <div
      style={{
        position: "absolute",
        ...base,
        marginLeft: offsetX,
        marginTop: offsetY,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
