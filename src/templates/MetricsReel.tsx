/**
 * MetricsReel — Vertical stats showcase template
 * Demonstrating defineTemplate + Motion preset system
 *
 * Blueprint:
 *   0-30f   Brand mark scalePop + giant number fadeInUp
 *   30-75f  Three vertical stat bars grow from bottom (maskReveal)
 *   75-120f Horizontal message strip slides in (slideInLeft)
 *  120-150f CTA fadeInUp + brand mark loop.float
 *  150-180f All fadeOut outro
 */
import React from "react"
import { Sequence, useCurrentFrame } from "../Sequence"
import { interpolate, easing } from "../animations"
import { seededRandom } from "../math"
import { Motion } from "../Motion"
import { defineTemplate } from "../define"

// ─── Inputs ──────────────────────────────────────────

const inputs = {
  brand_name:  { type: "text"   as const, label: "Brand Name",    default: "COBRAIN" },
  accent:      { type: "color"  as const, label: "Accent Color",  default: "#8b5cf6" },
  main_number: { type: "text"   as const, label: "Hero Number",   default: "3.2×" },
  main_label:  { type: "text"   as const, label: "Hero Label",    default: "faster than average" },
  s1_value:    { type: "text"   as const, label: "Stat 1 Value",  default: "91%" },
  s1_label:    { type: "text"   as const, label: "Stat 1 Label",  default: "accuracy" },
  s1_height:   { type: "number" as const, label: "Stat 1 Bar %",  default: 91, min: 5, max: 100 },
  s2_value:    { type: "text"   as const, label: "Stat 2 Value",  default: "68%" },
  s2_label:    { type: "text"   as const, label: "Stat 2 Label",  default: "time saved" },
  s2_height:   { type: "number" as const, label: "Stat 2 Bar %",  default: 68, min: 5, max: 100 },
  s3_value:    { type: "text"   as const, label: "Stat 3 Value",  default: "2.1M" },
  s3_label:    { type: "text"   as const, label: "Stat 3 Label",  default: "requests/day" },
  s3_height:   { type: "number" as const, label: "Stat 3 Bar %",  default: 55, min: 5, max: 100 },
  message:     { type: "text"   as const, label: "Message Strip", default: "AI that actually works" },
  cta:         { type: "text"   as const, label: "CTA Text",      default: "cobrain.ai" },
}

// ─── Sub-components ───────────────────────────────────

/** Grain overlay for "crafted" texture */
const Grain: React.FC<{ frame: number }> = ({ frame }) => {
  const seed = Math.floor(frame * 1.7)
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035, pointerEvents: "none" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id={`g${seed}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" seed={seed} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#g${seed})`} />
    </svg>
  )
}

/** Single vertical stat bar */
const StatBar: React.FC<{
  value: string
  label: string
  heightPct: number
  accent: string
  delay: number
}> = ({ value, label, heightPct, accent, delay }) => {
  const frame = useCurrentFrame()
  const MAX_BAR_H = 320

  // Bar grows from bottom — scaleY 0→1, transform-origin bottom
  const barProgress = interpolate(
    frame,
    [delay, delay + 30],
    [0, 1],
    { clamp: true, easing: easing.easeOutCubic }
  )
  const barH = (heightPct / 100) * MAX_BAR_H
  const currentH = barH * barProgress

  // Value number counts up
  const numericValue = parseFloat(value)
  const hasNumeric = !isNaN(numericValue)
  const suffix = hasNumeric ? value.replace(String(numericValue), "") : ""
  const displayNum = hasNumeric
    ? (numericValue * barProgress).toFixed(numericValue % 1 !== 0 ? 1 : 0) + suffix
    : value

  const labelOpacity = interpolate(frame, [delay + 20, delay + 35], [0, 1], { clamp: true })

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: 90 }}>
      {/* Value text */}
      <Motion
        motion={[{ preset: "enter.fadeInUp", at: delay + 10, for: 20, params: { distance: 20 } }]}
        style={{ color: accent, fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}
      >
        {displayNum}
      </Motion>

      {/* Bar track */}
      <div style={{ width: 4, height: MAX_BAR_H, background: "rgba(255,255,255,0.06)", borderRadius: 2, position: "relative", overflow: "hidden" }}>
        {/* Glowing fill — grows from top */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: currentH,
          background: `linear-gradient(to bottom, ${accent}, ${accent}88)`,
          borderRadius: 2,
          boxShadow: `0 0 12px ${accent}66`,
        }} />
      </div>

      {/* Label */}
      <div style={{
        color: "rgba(255,255,255,0.45)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.10em",
        textTransform: "uppercase",
        textAlign: "center",
        opacity: labelOpacity,
        writingMode: "vertical-rl",
        transform: "rotate(180deg)",
      }}>
        {label}
      </div>
    </div>
  )
}

// ─── Background dots ──────────────────────────────────

const DOT_COUNT = 24
const dots = Array.from({ length: DOT_COUNT }, (_, i) => ({
  x: seededRandom(i * 31) * 100,
  y: seededRandom(i * 71) * 100,
  size: 1 + seededRandom(i * 13) * 2,
  opacity: 0.06 + seededRandom(i * 53) * 0.08,
}))

// ─── Template ─────────────────────────────────────────

export const {
  meta,
  Component,
  templateConfig,
  timeline,
} = defineTemplate({
  meta: {
    id: "metrics-reel",
    name: "Metrics Reel",
    category: "promo",
    color: "#8b5cf6",
  },

  config: {
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 180,
  },

  inputs,

  timeline: [
    { name: "Hero",    from: 0,   durationInFrames: 30,  color: "#3b82f6" },
    { name: "Stats",   from: 30,  durationInFrames: 45,  color: "#8b5cf6" },
    { name: "Message", from: 75,  durationInFrames: 45,  color: "#22c55e" },
    { name: "CTA",     from: 120, durationInFrames: 30,  color: "#f59e0b" },
    { name: "Outro",   from: 150, durationInFrames: 30,  color: "#444444" },
  ],

  blueprint: [
    {
      id: "hero",
      from: 0,
      durationInFrames: 30,
      intent: "Brand mark appears, giant hero number punches in — hooks in 1 second",
      layers: [
        { id: "brand_mark", type: "text", editable: true },
        { id: "hero_number", type: "text", editable: true },
        { id: "hero_label", type: "text", editable: true },
      ],
    },
    {
      id: "stats",
      from: 30,
      durationInFrames: 45,
      intent: "Three vertical bars grow from bottom — data visualization, vertical-native",
      layers: [
        { id: "stat_bars", type: "group", editable: true },
      ],
    },
    {
      id: "message",
      from: 75,
      durationInFrames: 45,
      intent: "Full-width message strip slides in — editorial statement",
      layers: [
        { id: "message_strip", type: "text", editable: true },
      ],
    },
    {
      id: "cta",
      from: 120,
      durationInFrames: 30,
      intent: "CTA with floating brand mark — conversion moment",
      layers: [
        { id: "cta_text", type: "text", editable: true },
      ],
    },
    {
      id: "outro",
      from: 150,
      durationInFrames: 30,
      intent: "Clean fade to black with brand",
    },
  ],

  render: ({ frame, config, inputs: inp }) => {
    const { width, height } = config
    const accent = inp.accent as string

    return (
      <div style={{
        width, height,
        background: "#0a0a0a",
        fontFamily: "Inter, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Background dot grid */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={`${d.x}%`} cy={`${d.y}%`}
              r={d.size}
              fill="white"
              opacity={d.opacity}
            />
          ))}
        </svg>

        {/* Diagonal accent line */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          opacity: 0.6,
        }} />

        {/* ── SCENE 1: Hero (0-30f) ── */}
        <Sequence from={0} durationInFrames={150}>
          {/* Brand mark — top left */}
          <Motion
            motion={[
              { preset: "enter.scalePop", at: 0, for: 20, params: { damping: 10 } },
              { preset: "loop.float",     at: 20,          params: { amp: 4, freq: 0.6, seed: 7 } },
            ]}
            style={{
              position: "absolute", top: 80, left: 64,
              color: accent,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.20em",
              textTransform: "uppercase",
            }}
          >
            {inp.brand_name as string}
          </Motion>

          {/* Hero number — massive, tabular */}
          <Motion
            motion={[{ preset: "enter.fadeInUp", at: 5, for: 25, params: { distance: 80 } }]}
            style={{
              position: "absolute",
              top: 200, left: 0, right: 0,
              textAlign: "center",
              fontSize: 200,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "#f5f5f5",
              fontVariantNumeric: "tabular-nums",
              textShadow: `0 0 120px ${accent}44`,
            }}
          >
            {inp.main_number as string}
          </Motion>

          {/* Hero label */}
          <Motion
            motion={[{ preset: "enter.blurIn", at: 18, for: 20, params: { blur: 8 } }]}
            style={{
              position: "absolute",
              top: 430, left: 0, right: 0,
              textAlign: "center",
              fontSize: 24,
              fontWeight: 400,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.05em",
            }}
          >
            {inp.main_label as string}
          </Motion>
        </Sequence>

        {/* ── SCENE 2: Stat bars (30-75f) ── */}
        <Sequence from={30} durationInFrames={120}>
          <div style={{
            position: "absolute",
            top: 640,
            left: 0, right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 60,
          }}>
            <StatBar
              value={inp.s1_value as string}
              label={inp.s1_label as string}
              heightPct={inp.s1_height as number}
              accent={accent}
              delay={0}
            />
            <StatBar
              value={inp.s2_value as string}
              label={inp.s2_label as string}
              heightPct={inp.s2_height as number}
              accent={accent}
              delay={8}
            />
            <StatBar
              value={inp.s3_value as string}
              label={inp.s3_label as string}
              heightPct={inp.s3_height as number}
              accent={accent}
              delay={16}
            />
          </div>
        </Sequence>

        {/* ── SCENE 3: Message strip (75-120f) ── */}
        <Sequence from={75} durationInFrames={75}>
          <Motion
            motion={[{ preset: "enter.slideInLeft", at: 0, for: 25, params: { distance: 200 } }]}
            style={{
              position: "absolute",
              top: 1200,
              left: 0, right: 0,
              padding: "24px 64px",
              background: accent,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}>
              {inp.message as string}
            </span>
          </Motion>
        </Sequence>

        {/* ── SCENE 4: CTA (120-150f) ── */}
        <Sequence from={120} durationInFrames={60}>
          <Motion
            motion={[{ preset: "enter.fadeInUp", at: 0, for: 20, params: { distance: 30 } }]}
            style={{
              position: "absolute",
              top: 1420,
              left: 0, right: 0,
              textAlign: "center",
              fontSize: 22,
              fontWeight: 600,
              color: accent,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
            }}
          >
            {inp.cta as string}
          </Motion>
        </Sequence>

        {/* ── OUTRO: Fade (150-180f) ── */}
        <Sequence from={150} durationInFrames={30}>
          <FadeToBlack />
        </Sequence>

        {/* Progress bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0,
          height: 3,
          width: `${(frame / (config.durationInFrames - 1)) * 100}%`,
          background: accent,
          opacity: 0.7,
        }} />

        {/* Frame counter */}
        <div style={{
          position: "absolute", bottom: 14, right: 20,
          fontSize: 10, fontWeight: 500,
          color: "rgba(255,255,255,0.2)",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.05em",
        }}>
          FR {String(frame).padStart(3, "0")}/{config.durationInFrames - 1}
        </div>

        <Grain frame={frame} />
      </div>
    )
  },
})

/** Outro: full-screen fade overlay */
const FadeToBlack: React.FC = () => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 28], [0, 1], { clamp: true, easing: easing.easeInCubic })
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "#0a0a0a",
      opacity,
    }} />
  )
}
