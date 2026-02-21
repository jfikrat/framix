import type React from "react"
import type { VideoConfig, AnimationProps } from "./animations"
import { resolveInputs, validateInputs } from "./inputs"
import type { InputSchema, InputValues } from "./inputs"
import type { ProjectMeta, TimelineSegment } from "./templates/types"
import type { SceneGraphDocument } from "./scene-graph"

export type SceneBlueprint = {
  id: string
  from: number
  durationInFrames: number
  /** Human-readable intent for AI agents */
  intent: string
  layers?: Array<{
    id: string
    type: "text" | "image" | "shape" | "group"
    editable?: boolean
  }>
}

export type TemplateDefinition<I extends InputSchema = InputSchema> = {
  meta: ProjectMeta
  config?: Partial<VideoConfig>
  inputs?: I
  timeline?: TimelineSegment[]
  /** AI-friendly scene structure — documents what each scene does */
  blueprint?: SceneBlueprint[]
  /** Data-driven scene graph (optional alternative or supplement to render) */
  sceneGraph?: SceneGraphDocument
  render: (ctx: AnimationProps & { inputs: InferInputValues<I> }) => React.ReactNode
}

/** Infer typed values from InputSchema */
export type InferInputValues<I extends InputSchema> = {
  [K in keyof I]: I[K]["type"] extends "number"
    ? number
    : I[K]["type"] extends "boolean"
    ? boolean
    : string
}

/**
 * AnimationProps extended with optional runtime input overrides.
 * Gallery passes only frame+config (uses defaults). Render API can pass inputs to customize.
 */
export type AnimationPropsWithInputs = AnimationProps & {
  inputs?: Partial<InputValues>
}

/** Legacy-compatible output shape (Gallery auto-discovery needs meta + Component) */
export type DefinedTemplate<I extends InputSchema = InputSchema> = TemplateDefinition<I> & {
  meta: ProjectMeta
  Component: React.FC<AnimationProps & { inputs?: Partial<InferInputValues<I>> }>
  templateConfig?: Partial<VideoConfig>
  timeline?: TimelineSegment[]
  blueprint?: SceneBlueprint[]
  sceneGraph?: SceneGraphDocument
}

/**
 * Define a Framix template with full type safety and Gallery auto-discovery support.
 *
 * Usage:
 *   export const { meta, Component, templateConfig, timeline } = defineTemplate({
 *     meta: { id: "my-reel", name: "My Reel", category: "promo", color: "#8b5cf6" },
 *     config: { width: 1080, height: 1920, fps: 30, durationInFrames: 300 },
 *     inputs: {
 *       headline: { type: "text", label: "Headline", default: "Hello" },
 *     },
 *     render: ({ frame, config, inputs }) => (
 *       <MyScene frame={frame} config={config} text={inputs.headline} />
 *     ),
 *   })
 */
export function defineTemplate<I extends InputSchema>(
  def: TemplateDefinition<I>
): DefinedTemplate<I> {
  if (import.meta.env.DEV) {
    const missing: string[] = []
    if (!def.meta?.id) missing.push("meta.id")
    if (!def.meta?.name) missing.push("meta.name")
    if (typeof def.render !== "function") missing.push("render")
    if (missing.length > 0) {
      console.warn(`[defineTemplate] Missing required fields: ${missing.join(", ")}`)
    }

    const maxDuration = def.config?.durationInFrames
    if (maxDuration) {
      // Timeline validation
      if (def.timeline) {
        const names = new Set<string>()
        for (const seg of def.timeline) {
          if (names.has(seg.name)) {
            console.warn(`[defineTemplate:${def.meta.id}] Duplicate timeline segment name: "${seg.name}"`)
          }
          names.add(seg.name)
          if (seg.from + seg.durationInFrames > maxDuration) {
            console.warn(
              `[defineTemplate:${def.meta.id}] Timeline segment "${seg.name}" exceeds duration ` +
              `(${seg.from + seg.durationInFrames} > ${maxDuration})`
            )
          }
        }
      }

      // Blueprint validation
      if (def.blueprint) {
        const ids = new Set<string>()
        for (const scene of def.blueprint) {
          if (ids.has(scene.id)) {
            console.warn(`[defineTemplate:${def.meta.id}] Duplicate blueprint scene id: "${scene.id}"`)
          }
          ids.add(scene.id)
          if (scene.from + scene.durationInFrames > maxDuration) {
            console.warn(
              `[defineTemplate:${def.meta.id}] Blueprint scene "${scene.id}" exceeds duration ` +
              `(${scene.from + scene.durationInFrames} > ${maxDuration})`
            )
          }
        }
      }
    }
  }

  const schema = def.inputs ?? {}

  // Component: Gallery calls with just frame+config (defaults), render API can pass inputs override
  const Component: React.FC<AnimationPropsWithInputs> = (props) => {
    const resolved = resolveInputs(schema, props.inputs) as InferInputValues<I>

    if (import.meta.env.DEV && props.inputs) {
      const errors = validateInputs(schema, resolved as InputValues)
      if (errors.length > 0) {
        console.warn(`[defineTemplate:${def.meta.id}] Input validation errors:`, errors)
      }
    }

    return def.render({ frame: props.frame, config: props.config, inputs: resolved })
  }

  const meta: ProjectMeta = {
    ...def.meta,
    inputs: def.inputs,
  }

  return {
    ...def,
    meta,
    Component,
    templateConfig: def.config,
    blueprint: def.blueprint,
    sceneGraph: def.sceneGraph,
  }
}
