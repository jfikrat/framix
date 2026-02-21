import { interpolate, spring, easing } from './animations';
import type { VideoConfig } from './animations';

// ─── Types ──────────────────────────────────────────────────────────

export type InterpolationMode = 
  | 'linear' 
  | 'easeIn' 
  | 'easeOut' 
  | 'easeInOut' 
  | 'easeOutCubic' 
  | 'easeInCubic' 
  | 'spring' 
  | 'hold';

export interface Keyframe {
  frame: number;
  value: number | string;
  easing?: InterpolationMode;
  springDamping?: number;
  springStiffness?: number;
}

export interface PropertyTrack {
  layerId: string;
  property: string;
  keyframes: Keyframe[];
}

export interface BaseLayer {
  id: string;
  label?: string;
  visible?: boolean;
  opacity?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  scale?: number;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  content: string;
  fontSize?: number;
  fontWeight?: number | string;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number | string;
  lineHeight?: number | string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  borderRadius?: number;
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shape: 'rect' | 'circle' | 'line';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
}

export type Layer = TextLayer | ImageLayer | ShapeLayer;

export interface Scene {
  id: string;
  from: number;
  durationInFrames: number;
  intent?: string;
  layers: Layer[];
  tracks?: PropertyTrack[];
  enterTransition?: string; // Placeholder for future
  exitTransition?: string; // Placeholder for future
}

export interface SceneGraphDocument {
  version: 1;
  config: VideoConfig;
  scenes: Scene[];
  globalTracks?: PropertyTrack[];
}

// ─── Evaluator Functions ────────────────────────────────────────────

/**
 * Evaluate a property track at a specific frame.
 */
export function evaluateTrack(track: PropertyTrack, frame: number, fps: number): number | string {
  const { keyframes } = track;
  if (keyframes.length === 0) return 0; // Fallback

  // Sort keyframes by frame (safe-guard)
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);

  // Before first keyframe
  if (frame <= sorted[0].frame) {
    return sorted[0].value;
  }

  // After last keyframe
  if (frame >= sorted[sorted.length - 1].frame) {
    return sorted[sorted.length - 1].value;
  }

  // Find the segment [left, right]
  let left = sorted[0];
  let right = sorted[1];
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (frame >= sorted[i].frame && frame < sorted[i+1].frame) {
      left = sorted[i];
      right = sorted[i+1];
      break;
    }
  }

  const mode = left.easing ?? 'linear';

  // Handle 'hold'
  if (mode === 'hold') {
    return left.value;
  }

  // Handle non-numeric values (colors, strings) -> Nearest Neighbor
  if (typeof left.value !== 'number' || typeof right.value !== 'number') {
    // If it's a string, we can't interpolate conventionally.
    // Spec says: "color strings: return nearest keyframe value"
    const distToLeft = frame - left.frame;
    const distToRight = right.frame - frame;
    return distToLeft <= distToRight ? left.value : right.value;
  }

  // Numeric interpolation
  const startVal = left.value as number;
  const endVal = right.value as number;

  if (mode === 'spring') {
    // Spring physics
    // We assume the spring starts at 'left.frame' and targets 'right.value'.
    // The 'value' at 'left' is the starting position.
    const progress = spring({
      frame: frame - left.frame,
      fps,
      damping: left.springDamping,
      stiffness: left.springStiffness,
    });
    // Spring returns 0->1 typically, so we map it to start->end
    return startVal + (endVal - startVal) * progress;
  }

  // Standard Easing
  const easingFn = easing[mode as keyof typeof easing] || easing.linear;
  
  return interpolate(
    frame,
    [left.frame, right.frame],
    [startVal, endVal],
    { easing: easingFn, clamp: true }
  );
}

/**
 * Resolve all properties for a layer at a given frame.
 * Applies scene-level tracks and (optionally) global tracks could be passed here too.
 */
export function resolveLayerProps(
  layer: Layer, 
  tracks: PropertyTrack[] | undefined, 
  frame: number, 
  fps: number
): Layer {
  const resolved = { ...layer };

  if (!tracks) return resolved;

  // Find all tracks for this layer
  const layerTracks = tracks.filter(t => t.layerId === layer.id);

  for (const track of layerTracks) {
    const value = evaluateTrack(track, frame, fps);
    // Assign to resolved layer
    // We use 'as any' safely because we trust the track property name matches the Layer type keys
    (resolved as any)[track.property] = value;
  }

  return resolved;
}

/**
 * Get active scenes for the current frame.
 * Frame is absolute (global).
 */
export function getActiveScenes(doc: SceneGraphDocument, frame: number): Scene[] {
  return doc.scenes.filter(scene => 
    frame >= scene.from && frame < (scene.from + scene.durationInFrames)
  );
}

/**
 * Validate the scene graph document.
 */
export function validateDocument(doc: SceneGraphDocument): string[] {
  const errors: string[] = [];
  const layerIds = new Set<string>();

  // Validate Scenes
  doc.scenes.forEach((scene, sceneIndex) => {
    // Check frame range
    if (scene.durationInFrames <= 0) {
      errors.push(`Scene ${scene.id} (index ${sceneIndex}) has invalid duration: ${scene.durationInFrames}`);
    }

    // Check Layers
    scene.layers.forEach((layer, layerIndex) => {
      if (layerIds.has(layer.id)) {
        errors.push(`Duplicate layer ID found: ${layer.id} in scene ${scene.id}`);
      }
      layerIds.add(layer.id);
    });

    // Check Tracks
    if (scene.tracks) {
      scene.tracks.forEach((track, trackIndex) => {
        // Check if track references a valid layer in this scene (or global?)
        // Assuming tracks in a scene only reference layers in that scene for simplicity, 
        // though the type system doesn't strictly enforce it.
        const layerExists = scene.layers.some(l => l.id === track.layerId);
        if (!layerExists) {
           // It might be a global track? But this is inside scene.tracks
           errors.push(`Track references missing layer ID: ${track.layerId} in scene ${scene.id}`);
        }

        // Check Keyframes sorted
        for (let i = 0; i < track.keyframes.length - 1; i++) {
          if (track.keyframes[i].frame > track.keyframes[i+1].frame) {
            errors.push(`Unsorted keyframes in track for layer ${track.layerId}, property ${track.property}`);
          }
        }
      });
    }
  });

  return errors;
}

/**
 * Helper to create a simple text scene.
 */
export function createTextScene(opts: {
  id: string;
  from: number;
  durationInFrames: number;
  text: string;
  bg?: string; // Not used in TextLayer but maybe for future
}): Scene {
  const { id, from, durationInFrames, text } = opts;
  
  const textLayer: TextLayer = {
    id: `${id}-text`,
    type: 'text',
    content: text,
    fontSize: 60,
    fontFamily: 'Inter',
    fontWeight: 800,
    color: '#ffffff',
    textAlign: 'center',
    x: 960, // Center of 1920
    y: 540, // Center of 1080
    opacity: 0,
    width: 1000,
  };

  // Fade in animation
  const opacityTrack: PropertyTrack = {
    layerId: textLayer.id,
    property: 'opacity',
    keyframes: [
      { frame: 0, value: 0, easing: 'easeOutCubic' },
      { frame: 30, value: 1 },
      { frame: durationInFrames - 30, value: 1, easing: 'easeInCubic' },
      { frame: durationInFrames, value: 0 },
    ],
  };

  return {
    id,
    from,
    durationInFrames,
    layers: [textLayer],
    tracks: [opacityTrack],
  };
}
