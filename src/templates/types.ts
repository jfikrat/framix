import type { AnimationProps } from "../animations";

// Her template bu interface'i export etmeli
export interface TemplateMeta {
  id: string;
  name: string;
  category: "intro" | "promo" | "dynamic" | "quote" | "celebration" | "minimal";
  color: string;
}

export type TemplateComponent = React.FC<AnimationProps>;
