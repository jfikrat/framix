import type { AnimationProps } from "../animations";

export interface TimelineSegment {
  name: string;
  from: number;
  durationInFrames: number;
  color: string;
}

export interface ProjectMeta {
  id: string;
  name: string;
  brand?: string;
  category: "intro" | "promo" | "dynamic" | "quote" | "celebration" | "minimal";
  color: string;
}

/** @deprecated Use ProjectMeta instead */
export type TemplateMeta = ProjectMeta;

export type TemplateComponent = React.FC<AnimationProps>;
