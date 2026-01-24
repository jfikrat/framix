// Animation Templates Gallery

export { TextReveal } from "./TextReveal";
export { NeonGlow } from "./NeonGlow";
export { SplitScreen } from "./SplitScreen";
export { KineticType } from "./KineticType";
export { GradientWave } from "./GradientWave";
export { MinimalQuote } from "./MinimalQuote";

// Template metadata
export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: "intro" | "quote" | "promo" | "minimal" | "dynamic";
}

export const templates: TemplateInfo[] = [
  {
    id: "text-reveal",
    name: "Text Reveal",
    description: "Harf harf ortaya çıkan metin animasyonu",
    category: "intro",
  },
  {
    id: "neon-glow",
    name: "Neon Glow",
    description: "Neon ışıklı retro tarzı animasyon",
    category: "promo",
  },
  {
    id: "split-screen",
    name: "Split Screen",
    description: "İkiye bölünen ekran geçişi",
    category: "dynamic",
  },
  {
    id: "kinetic-type",
    name: "Kinetic Typography",
    description: "Hareket eden tipografi animasyonu",
    category: "dynamic",
  },
  {
    id: "gradient-wave",
    name: "Gradient Wave",
    description: "Dalga efektli gradient arka plan",
    category: "intro",
  },
  {
    id: "minimal-quote",
    name: "Minimal Quote",
    description: "Minimalist alıntı animasyonu",
    category: "quote",
  },
];
