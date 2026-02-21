import React from "react"
import { useCurrentFrame, useVideoConfig } from "./Sequence"
import { evaluateMotion, motionToStyle } from "./motion"
import type { MotionSpec } from "./motion"

interface MotionProps {
  /** Motion presets to apply (stacked, composed per channel) */
  motion: MotionSpec[]
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  /** HTML tag to render as (default: "div") */
  as?: keyof React.JSX.IntrinsicElements
}

export function useMotion(specs: MotionSpec[]): React.CSSProperties {
  const frame = useCurrentFrame()
  const config = useVideoConfig()

  return motionToStyle(
    evaluateMotion(specs, {
      frame,
      fps: config.fps,
      durationInFrames: config.durationInFrames,
      width: config.width,
      height: config.height,
    })
  )
}

export const Motion: React.FC<MotionProps> = ({
  motion: specs,
  children,
  style,
  className,
  as: Tag = "div",
}) => {
  const motionStyle = useMotion(specs)

  // motion styles applied first, user style can override if needed
  return (
    <Tag style={{ ...motionStyle, ...style }} className={className}>
      {children}
    </Tag>
  )
}
