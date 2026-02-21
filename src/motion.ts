import { interpolate, spring } from "./animations"
import { seededRandom, smoothNoise } from "./math"
import type React from "react"

export type MotionCtx = {
  frame: number
  fps: number
  durationInFrames: number
  width: number
  height: number
}

export type MotionChannels = {
  x?: number
  y?: number
  scale?: number
  scaleX?: number
  scaleY?: number
  rotate?: number
  opacity?: number
  blur?: number
  skewX?: number
  skewY?: number
}

export type MotionMix = "replace" | "add" | "multiply"

export type MotionSpec = {
  preset: string
  params?: Record<string, unknown>
  at?: number
  for?: number
  mix?: MotionMix
}

export type MotionPresetFn<P = Record<string, unknown>> = (
  ctx: MotionCtx,
  params: P
) => MotionChannels

const clamp = (value: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, value))

const toNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback

const toParams = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {}

const DEFAULT_SEED = 0
const TAU = Math.PI * 2
const channelKeys = [
  "x",
  "y",
  "scale",
  "scaleX",
  "scaleY",
  "rotate",
  "opacity",
  "blur",
  "skewX",
  "skewY",
] as const

const defaultMixForChannel = (key: keyof MotionChannels): MotionMix =>
  key === "scale" || key === "scaleX" || key === "scaleY" || key === "opacity"
    ? "multiply"
    : "add"

const presetRegistry = new Map<string, MotionPresetFn>()

export function registerPreset(name: string, fn: MotionPresetFn): void {
  presetRegistry.set(name, fn)
}

export function getPreset(name: string): MotionPresetFn | undefined {
  return presetRegistry.get(name)
}

const applyChannel = (
  target: MotionChannels,
  key: keyof MotionChannels,
  value: number,
  mix: MotionMix
): void => {
  if (!Number.isFinite(value)) return

  if (mix === "replace") {
    target[key] = value
    return
  }

  if (mix === "add") {
    target[key] = (target[key] ?? 0) + value
    return
  }

  // multiply
  target[key] = (target[key] ?? 1) * value
}

export function evaluateMotion(specs: MotionSpec[], ctx: MotionCtx): MotionChannels {
  const output: MotionChannels = {
    x: 0,
    y: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
    opacity: 1,
    blur: 0,
    skewX: 0,
    skewY: 0,
  }

  for (const spec of specs) {
    const preset = getPreset(spec.preset)
    if (!preset) {
      if (import.meta.env.DEV) console.warn(`[Motion] Unknown preset: "${spec.preset}"`)
      continue
    }

    const startFrame = toNumber(spec.at, 0)
    const localDuration = spec.for ?? ctx.durationInFrames - startFrame
    const localFrame = ctx.frame - startFrame

    if (localDuration <= 0 || localFrame < 0 || localFrame >= localDuration) continue

    const scopedCtx: MotionCtx = {
      ...ctx,
      frame: localFrame,
      durationInFrames: localDuration,
    }

    const contribution = preset(scopedCtx, toParams(spec.params))
    if (!contribution) continue

    for (const key of channelKeys) {
      const value = contribution[key]
      if (typeof value !== "number") continue
      const mix = spec.mix ?? defaultMixForChannel(key)
      applyChannel(output, key, value, mix)
    }
  }

  output.opacity = clamp(output.opacity ?? 1, 0, 1)
  return output
}

export function motionToStyle(channels: MotionChannels): React.CSSProperties {
  const transform: string[] = []
  const style: React.CSSProperties = {}

  if (typeof channels.scale === "number" && channels.scale !== 1)
    transform.push(`scale(${channels.scale})`)

  if (typeof channels.scaleX === "number" && channels.scaleX !== 1)
    transform.push(`scaleX(${channels.scaleX})`)

  if (typeof channels.scaleY === "number" && channels.scaleY !== 1)
    transform.push(`scaleY(${channels.scaleY})`)

  if (typeof channels.x === "number" && channels.x !== 0)
    transform.push(`translateX(${channels.x}px)`)

  if (typeof channels.y === "number" && channels.y !== 0)
    transform.push(`translateY(${channels.y}px)`)

  if (typeof channels.rotate === "number" && channels.rotate !== 0)
    transform.push(`rotate(${channels.rotate}deg)`)

  if (typeof channels.skewX === "number" && channels.skewX !== 0)
    transform.push(`skewX(${channels.skewX}deg)`)

  if (typeof channels.skewY === "number" && channels.skewY !== 0)
    transform.push(`skewY(${channels.skewY}deg)`)

  if (transform.length > 0) style.transform = transform.join(" ")

  if (typeof channels.opacity === "number")
    style.opacity = clamp(channels.opacity, 0, 1)

  if (typeof channels.blur === "number" && channels.blur > 0)
    style.filter = `blur(${channels.blur}px)`

  return style
}

// ─── Helpers ─────────────────────────────────────────

const linear = (ctx: MotionCtx, duration: number): number =>
  clamp(ctx.frame / Math.max(1, duration), 0, 1)

// frame → deterministic seed offset (non-float, used for per-frame noise)
const frameSeed = (frame: number): number => Math.floor(frame * 13.37)

// ─── Entrance Presets ─────────────────────────────────

registerPreset("enter.fadeIn", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const p = linear(ctx, toNumber(params.duration, 20))
  return { opacity: p }
})

registerPreset("enter.fadeInUp", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const p = linear(ctx, toNumber(params.duration, 20))
  return {
    opacity: p,
    y: interpolate(p, [0, 1], [toNumber(params.distance, 40), 0]),
  }
})

registerPreset("enter.fadeInDown", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const p = linear(ctx, toNumber(params.duration, 20))
  return {
    opacity: p,
    y: interpolate(p, [0, 1], [-toNumber(params.distance, 40), 0]),
  }
})

registerPreset("enter.slideInLeft", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const p = linear(ctx, toNumber(params.duration, 20))
  return {
    opacity: p,
    x: interpolate(p, [0, 1], [-toNumber(params.distance, 80), 0]),
  }
})

registerPreset("enter.slideInRight", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const p = linear(ctx, toNumber(params.duration, 20))
  return {
    opacity: p,
    x: interpolate(p, [0, 1], [toNumber(params.distance, 80), 0]),
  }
})

registerPreset("enter.scalePop", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const duration = Math.max(1, toNumber(params.duration, 20))
  const frame = clamp(ctx.frame, 0, duration)
  const progress = spring({
    frame,
    fps: ctx.fps,
    damping: typeof params.damping === "number" ? params.damping : undefined,
    stiffness: typeof params.stiffness === "number" ? params.stiffness : undefined,
    mass: typeof params.mass === "number" ? params.mass : undefined,
  })
  return { opacity: clamp(progress, 0, 1), scale: clamp(progress, 0, 1) }
})

registerPreset("enter.blurIn", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const p = linear(ctx, toNumber(params.duration, 20))
  return {
    opacity: p,
    blur: interpolate(p, [0, 1], [toNumber(params.blur, 12), 0]),
  }
})

registerPreset("enter.maskReveal", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const p = linear(ctx, toNumber(params.duration, ctx.durationInFrames))
  return { scaleX: p }
})

// ─── Exit Presets ─────────────────────────────────────

registerPreset("exit.fadeOut", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const p = linear(ctx, toNumber(params.duration, 20))
  return { opacity: 1 - p }
})

registerPreset("exit.fadeOutDown", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const p = linear(ctx, toNumber(params.duration, 20))
  return {
    opacity: 1 - p,
    y: interpolate(p, [0, 1], [0, toNumber(params.distance, 40)]),
  }
})

registerPreset("exit.slideOutLeft", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const p = linear(ctx, toNumber(params.duration, 20))
  return {
    opacity: 1 - p,
    x: interpolate(p, [0, 1], [0, -toNumber(params.distance, 80)]),
  }
})

registerPreset("exit.slideOutRight", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const p = linear(ctx, toNumber(params.duration, 20))
  return {
    opacity: 1 - p,
    x: interpolate(p, [0, 1], [0, toNumber(params.distance, 80)]),
  }
})

registerPreset("exit.scaleOut", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const p = linear(ctx, toNumber(params.duration, 20))
  return { opacity: 1 - p, scale: 1 - p }
})

registerPreset("exit.blurOut", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const p = linear(ctx, toNumber(params.duration, 20))
  return {
    opacity: 1 - p,
    blur: interpolate(p, [0, 1], [0, toNumber(params.blur, 12)]),
  }
})

// ─── Loop Presets ─────────────────────────────────────

registerPreset("loop.pulse", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const amp = toNumber(params.amp, 0.05)
  const freq = toNumber(params.freq, 1.2)
  const phase = TAU * (ctx.frame / Math.max(1, ctx.fps)) * freq
  return { scale: 1 + Math.sin(phase) * amp }
})

registerPreset("loop.float", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const amp = toNumber(params.amp, 8)
  const freq = toNumber(params.freq, 0.8)
  const seed = toNumber(params.seed, DEFAULT_SEED)
  const phase = TAU * (ctx.frame / Math.max(1, ctx.fps)) * freq + seededRandom(seed) * TAU
  return { y: Math.sin(phase) * amp }
})

registerPreset("loop.wiggle", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const amp = toNumber(params.amp, 3)
  const freq = toNumber(params.freq, 2)
  const seed = toNumber(params.seed, DEFAULT_SEED)
  const phase = TAU * (ctx.frame / Math.max(1, ctx.fps)) * freq + seededRandom(seed) * TAU
  return { rotate: Math.sin(phase) * amp }
})

registerPreset("loop.flicker", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const seed = toNumber(params.seed, DEFAULT_SEED)
  const jitter = seededRandom(seed + frameSeed(ctx.frame))
  return { opacity: 0.85 + jitter * 0.15 }
})

registerPreset("loop.breathe", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const amp = toNumber(params.amp, 0.03)
  const freq = toNumber(params.freq, 0.5)
  const phase = TAU * (ctx.frame / Math.max(1, ctx.fps)) * freq
  return {
    scaleX: 1 + Math.sin(phase) * amp,
    scaleY: 1 + Math.cos(phase) * amp,
  }
})

// ─── FX Presets ──────────────────────────────────────

registerPreset("fx.dissolve", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const midpoint = clamp(
    toNumber(params.midpoint, ctx.durationInFrames / 2),
    0,
    ctx.durationInFrames
  )
  if (ctx.frame <= midpoint) {
    const p = midpoint === 0 ? 0 : clamp(ctx.frame / midpoint, 0, 1)
    return { opacity: 1 - p }
  }
  const p = clamp(
    (ctx.frame - midpoint) / Math.max(1, ctx.durationInFrames - midpoint),
    0,
    1
  )
  return { opacity: p }
})

registerPreset("fx.zoomIn", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const p = linear(ctx, toNumber(params.duration, ctx.durationInFrames))
  return {
    scale: interpolate(p, [0, 1], [toNumber(params.from, 0.95), toNumber(params.to, 1.0)]),
  }
})

registerPreset("fx.shake", (ctx, rawParams) => {
  const params = toParams(rawParams)
  const intensity = toNumber(params.intensity, 4)
  const freq = toNumber(params.freq, 8)
  const seed = toNumber(params.seed, DEFAULT_SEED)
  const t = (ctx.frame / Math.max(1, ctx.fps)) * freq
  return {
    x: smoothNoise(t + seed, seed + 1) * intensity,
    y: smoothNoise(t + 23 + seed, seed + 2) * intensity,
  }
})
