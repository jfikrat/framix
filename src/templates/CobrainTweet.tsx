// Cobrain Tweet — Sinematik kamera hareketiyle tweet showcase
// computeCamera (pure function) ile CSS perspective transform kullanır
// X/Twitter gerçek design tokens + SVG ikonlar

import React from "react";
import type { AnimationProps, VideoConfig } from "../animations";
import { interpolate, spring, easing } from "../animations";
import { computeCamera, type CameraKeyframe } from "../camera";
import type { ProjectMeta, TimelineSegment } from "./types";

// ─── META ────────────────────────────────────────────
export const meta: ProjectMeta = {
  id: "cobrain-tweet",
  name: "Cobrain Tweet",
  brand: "cobrain",
  category: "promo",
  color: "#8b5cf6",
};

export const templateConfig: Partial<VideoConfig> = {
  width: 1080,
  height: 1080,
  durationInFrames: 210,
};

export const timeline: TimelineSegment[] = [
  { name: "Reveal", from: 0, durationInFrames: 40, color: "#6d28d9" },
  { name: "Focus", from: 40, durationInFrames: 60, color: "#8b5cf6" },
  { name: "Engage", from: 100, durationInFrames: 60, color: "#3b82f6" },
  { name: "Outro", from: 160, durationInFrames: 50, color: "#22c55e" },
];

// ─── X/TWITTER DESIGN TOKENS (extracted from x.com) ─
const X = {
  font: "TwitterChirp, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  bg: "#000000",
  cardBg: "#000000",
  border: "#2f3336",
  text: "#e7e9ea",
  secondary: "#71767b",
  accent: "#1d9bf0",
  like: "#f91880",
  retweet: "#00ba7c",
  nameSize: 15,
  textSize: 17,
  textLineHeight: "24px",
  handleSize: 15,
  timeSize: 15,
  iconSize: 18.75,
};

// Cobrain brand overlay
const BRAND = {
  purple: "#8b5cf6",
};

// ─── X/TWITTER SVG ICONS (extracted from x.com) ─────
const XIcon = {
  reply: "M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z",
  repost: "M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z",
  like: "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z",
  bookmark: "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z",
  share: "M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z",
  views: "M8.75 21V3h2v18h-2zM18.75 21V8.5h2V21h-2zM13.75 21v-9h2v9h-2zM3.75 21v-4h2v4h-2z",
  verified: "M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z",
};

// ─── CAMERA KEYFRAMES ───────────────────────────────
const KEYFRAMES: CameraKeyframe[] = [
  { frame: 0, position: [0.8, -0.5, 8], lookAt: [0, 0, 0], fov: 50 },
  { frame: 15, position: [0.3, -0.2, 6], lookAt: [0, 0, 0], fov: 48 },
  { frame: 45, position: [0, 0, 3.5], lookAt: [0, 0, 0], fov: 45 },
  { frame: 70, position: [-0.3, 0.2, 3], lookAt: [-0.1, 0.1, 0], fov: 42 },
  { frame: 105, position: [0, 0.6, 3.2], lookAt: [0, 0.3, 0], fov: 44 },
  { frame: 140, position: [0, 0, 4], lookAt: [0, 0, 0], fov: 46 },
  { frame: 175, position: [0, -0.3, 5.5], lookAt: [0, 0, 0], fov: 48 },
  { frame: 210, position: [0, -0.5, 7], lookAt: [0, 0, 0], fov: 50 },
];

// ─── CAMERA STATE → CSS TRANSFORM ───────────────────
function cameraToCSS(
  frame: number,
  fps: number,
): { transform: string; perspective: string } {
  const state = computeCamera({
    frame,
    fps,
    keyframes: KEYFRAMES,
    interpolation: "catmullrom",
  });

  const scale = 4 / state.position[2];
  const tx = -state.position[0] * 80;
  const ty = -state.position[1] * 80;
  const rx = (state.lookAt[1] - state.position[1]) * 8;
  const ry = -(state.lookAt[0] - state.position[0]) * 8;

  return {
    perspective: `${state.fov * 25}px`,
    transform: `scale(${scale}) translate(${tx}px, ${ty}px) rotateX(${rx}deg) rotateY(${ry}deg)`,
  };
}

// ─── TWEET DATA ─────────────────────────────────────
const TWEET = {
  name: "Cobrain",
  handle: "@cobrainai",
  verified: true,
  avatar: "/brands/cobrain/logo.png",
  text: "Artık seni tanıyan bir AI var.\n\nTercihlerini hatırlıyor. Alışkanlıklarını öğreniyor. Hedeflerini takip ediyor.\n\nWhatsApp, Telegram, Web — üç kanalda seninle.\n\nCobrain ile tanış. 🧠",
  time: "2:42 PM · Feb 10, 2026",
  replies: "847",
  retweets: "3.2K",
  likes: "12.4K",
  views: "1.8M",
  bookmarks: "284",
};

// ─── SVG ICON COMPONENT ─────────────────────────────
const SvgIcon: React.FC<{
  path: string;
  size?: number;
  color?: string;
}> = ({ path, size = X.iconSize, color = X.secondary }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    style={{ flexShrink: 0 }}
  >
    <path d={path} />
  </svg>
);

// ─── ENGAGEMENT COUNTER ─────────────────────────────
const Counter: React.FC<{
  value: string;
  iconPath: string;
  hoverColor: string;
  frame: number;
  fps: number;
  delay: number;
}> = ({ value, iconPath, hoverColor, frame, fps, delay }) => {
  const s = spring({ frame: frame - delay, fps, damping: 14, stiffness: 100 });
  const scale = interpolate(s, [0, 1], [0.5, 1]);
  const opacity = interpolate(s, [0, 1], [0, 1]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <SvgIcon path={iconPath} color={X.secondary} />
      <span
        style={{
          fontSize: 13,
          fontFamily: X.font,
          color: X.secondary,
        }}
      >
        {value}
      </span>
    </div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────
export const CobrainTweet: React.FC<AnimationProps> = ({ frame, config }) => {
  const { width, height, durationInFrames, fps } = config;

  const { transform, perspective } = cameraToCSS(frame, fps);

  // Card entrance
  const cardEntrance = spring({ frame, fps, damping: 12, stiffness: 60 });
  const cardOpacity = interpolate(cardEntrance, [0, 1], [0, 1]);

  // Typewriter
  const fullText = TWEET.text;
  const charCount = fullText.length;
  const typedChars = Math.floor(
    interpolate(frame, [8, 80], [0, charCount], { easing: easing.easeOutCubic }),
  );
  const displayText = fullText.slice(0, typedChars);

  // Engagement
  const engageStart = 100;

  // Glow
  const glowIntensity =
    frame > 50
      ? 0.08 + Math.sin(frame * 0.08) * 0.03
      : interpolate(frame, [20, 50], [0, 0.08]);

  // Outro
  const outroFade = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0]);

  // Progress bar
  const progressW = (frame / (durationInFrames - 1)) * width;

  return (
    <div
      style={{
        width,
        height,
        background: X.bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: X.font,
        opacity: outroFade,
      }}
    >
      {/* Purple ambient glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: width * 0.8,
          height: width * 0.8,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${BRAND.purple}${Math.round(glowIntensity * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Camera container */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective,
        }}
      >
        <div
          style={{
            transform,
            transformOrigin: "center center",
            opacity: cardOpacity,
            willChange: "transform",
          }}
        >
          {/* ─── TWEET CARD ─── */}
          <div
            style={{
              width: width * 0.82,
              background: X.cardBg,
              border: `1px solid ${X.border}`,
              borderRadius: 16,
              padding: "16px 16px 4px",
            }}
          >
            {/* ── Header: avatar + name + handle ── */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: 8,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  overflow: "hidden",
                  flexShrink: 0,
                  background: BRAND.purple,
                }}
              >
                <img
                  src={TWEET.avatar}
                  alt=""
                  style={{ width: 40, height: 40, objectFit: "cover" }}
                />
              </div>

              {/* Name + handle column */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span
                    style={{
                      fontSize: X.nameSize,
                      fontWeight: 700,
                      color: X.text,
                      lineHeight: "20px",
                    }}
                  >
                    {TWEET.name}
                  </span>
                  {TWEET.verified && (
                    <SvgIcon path={XIcon.verified} size={18} color={X.accent} />
                  )}
                </div>
                <div
                  style={{
                    fontSize: X.handleSize,
                    color: X.secondary,
                    lineHeight: "20px",
                  }}
                >
                  {TWEET.handle}
                </div>
              </div>

              {/* X logo (top right) */}
              <svg
                viewBox="0 0 24 24"
                width={20}
                height={20}
                fill={X.text}
                style={{ flexShrink: 0, opacity: 0.5 }}
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>

            {/* ── Tweet text ── */}
            <div
              style={{
                fontSize: X.textSize,
                fontWeight: 400,
                color: X.text,
                lineHeight: X.textLineHeight,
                whiteSpace: "pre-wrap",
                marginBottom: 16,
                minHeight: 145,
                wordBreak: "break-word",
              }}
            >
              {displayText}
              {typedChars < charCount && (
                <span
                  style={{
                    opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                    color: X.accent,
                    fontWeight: 100,
                  }}
                >
                  |
                </span>
              )}
            </div>

            {/* ── Timestamp ── */}
            <div
              style={{
                fontSize: X.timeSize,
                color: X.secondary,
                lineHeight: "20px",
                paddingBottom: 16,
                borderBottom: `1px solid ${X.border}`,
              }}
            >
              {TWEET.time} ·{" "}
              <span style={{ color: X.text, fontWeight: 700 }}>
                {TWEET.views}
              </span>{" "}
              Views
            </div>

            {/* ── Engagement stats row ── */}
            <div
              style={{
                display: "flex",
                gap: 20,
                padding: "12px 0",
                borderBottom: `1px solid ${X.border}`,
                fontSize: 14,
                color: X.secondary,
              }}
            >
              {[
                { count: TWEET.replies, label: "Replies", delay: 0 },
                { count: TWEET.retweets, label: "Reposts", delay: 4 },
                { count: TWEET.likes, label: "Likes", delay: 8 },
                { count: TWEET.bookmarks, label: "Bookmarks", delay: 12 },
              ].map((stat, i) => {
                const s = spring({
                  frame: frame - engageStart - stat.delay,
                  fps,
                  damping: 14,
                  stiffness: 100,
                });
                const op = interpolate(s, [0, 1], [0, 1]);
                const sc = interpolate(s, [0, 1], [0.7, 1]);
                return (
                  <span
                    key={i}
                    style={{
                      opacity: op,
                      transform: `scale(${sc})`,
                      display: "inline-block",
                    }}
                  >
                    <span style={{ color: X.text, fontWeight: 700 }}>
                      {stat.count}
                    </span>{" "}
                    {stat.label}
                  </span>
                );
              })}
            </div>

            {/* ── Action buttons row ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                padding: "8px 0",
                opacity: interpolate(
                  frame,
                  [engageStart + 16, engageStart + 30],
                  [0, 1],
                ),
              }}
            >
              <Counter
                value=""
                iconPath={XIcon.reply}
                hoverColor={X.accent}
                frame={frame}
                fps={fps}
                delay={engageStart + 16}
              />
              <Counter
                value=""
                iconPath={XIcon.repost}
                hoverColor={X.retweet}
                frame={frame}
                fps={fps}
                delay={engageStart + 19}
              />
              <Counter
                value=""
                iconPath={XIcon.like}
                hoverColor={X.like}
                frame={frame}
                fps={fps}
                delay={engageStart + 22}
              />
              <Counter
                value=""
                iconPath={XIcon.views}
                hoverColor={X.accent}
                frame={frame}
                fps={fps}
                delay={engageStart + 25}
              />
              <Counter
                value=""
                iconPath={XIcon.bookmark}
                hoverColor={X.accent}
                frame={frame}
                fps={fps}
                delay={engageStart + 28}
              />
              <Counter
                value=""
                iconPath={XIcon.share}
                hoverColor={X.accent}
                frame={frame}
                fps={fps}
                delay={engageStart + 31}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.006) 3px, rgba(255,255,255,0.006) 4px)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      {/* Cobrain branding (outro) */}
      {frame >= 165 && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: "50%",
            transform: `translate(-50%, ${interpolate(
              spring({ frame: frame - 170, fps, damping: 12, stiffness: 80 }),
              [0, 1],
              [20, 0],
            )}px)`,
            display: "flex",
            alignItems: "center",
            gap: 14,
            opacity: interpolate(frame, [165, 180], [0, 1]),
            zIndex: 15,
          }}
        >
          <img
            src="/brands/cobrain/logo.png"
            alt=""
            style={{ width: 40, height: 40, borderRadius: "50%" }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            cobrain
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: progressW,
          height: 3,
          background: `linear-gradient(90deg, ${BRAND.purple}, ${X.accent})`,
          boxShadow: `0 0 10px ${BRAND.purple}40`,
          zIndex: 20,
        }}
      />

      {/* Frame counter */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 30,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: "rgba(255,255,255,0.12)",
          letterSpacing: "0.1em",
          zIndex: 20,
        }}
      >
        FR {String(frame).padStart(3, "0")}/{durationInFrames}
      </div>
    </div>
  );
};
