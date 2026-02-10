import React, { createContext, useContext } from "react";

// ─── Types ───────────────────────────────────────────

export interface BrandPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentBlue: string;
  accentGreen: string;
  accentRed: string;
  glow: string;
}

export interface BrandFonts {
  heading: string;
  body: string;
  mono: string;
}

export interface BrandConfig {
  name: string;
  displayName: string;
  palette: BrandPalette;
  fonts: BrandFonts;
  logo: string;
  logoSize: number;
}

// ─── Built-in Brands ────────────────────────────────

export const brands: Record<string, BrandConfig> = {
  cobrain: {
    name: "cobrain",
    displayName: "Cobrain",
    palette: {
      primary: "#8b5cf6",
      primaryLight: "#a78bfa",
      primaryDark: "#6d28d9",
      background: "#0a0a0a",
      surface: "#111111",
      surfaceElevated: "#1a1a1a",
      textPrimary: "#f5f5f5",
      textSecondary: "#8b8b8b",
      textMuted: "rgba(255,255,255,0.5)",
      accentBlue: "#3b82f6",
      accentGreen: "#22c55e",
      accentRed: "#e53e3e",
      glow: "rgba(139,92,246,0.15)",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      mono: "JetBrains Mono",
    },
    logo: "/brands/cobrain/logo.png",
    logoSize: 56,
  },
};

// ─── Context ─────────────────────────────────────────

const BrandContext = createContext<BrandConfig | null>(null);

export const BrandProvider: React.FC<{
  brand: BrandConfig | string;
  children: React.ReactNode;
}> = ({ brand, children }) => {
  const config = typeof brand === "string" ? brands[brand] : brand;
  if (!config) throw new Error(`Unknown brand: ${brand}`);
  return <BrandContext.Provider value={config}>{children}</BrandContext.Provider>;
};

/**
 * Access brand config from context.
 * Must be used within a BrandProvider.
 */
export function useBrand(): BrandConfig {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used within a BrandProvider");
  return ctx;
}

/**
 * Get brand config without context (direct lookup).
 * Useful outside React components.
 */
export function getBrand(name: string): BrandConfig {
  const config = brands[name];
  if (!config) throw new Error(`Unknown brand: ${name}`);
  return config;
}
