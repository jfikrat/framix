// ─── Asset Preloader ─────────────────────────────────
// Preloads fonts and images before render starts.
// Uses browser APIs only (document.fonts, Image).

export interface FontAsset {
  family: string;
  weight?: number | string;
  style?: string;
  url?: string;           // optional @font-face src
}

export interface AssetManifest {
  fonts?: FontAsset[];
  images?: string[];
}

/**
 * Preload a single font. Uses document.fonts.load() if no URL,
 * or creates a @font-face if URL is provided.
 */
export async function preloadFont(asset: FontAsset): Promise<void> {
  const { family, weight = 400, style = "normal", url } = asset;

  if (url) {
    // Create @font-face dynamically
    const face = new FontFace(family, `url(${url})`, {
      weight: String(weight),
      style,
    });
    const loaded = await face.load();
    document.fonts.add(loaded);
  } else {
    // Trigger load of already-declared font
    await document.fonts.load(`${style} ${weight} 16px "${family}"`);
  }
}

/**
 * Preload a single image. Returns when fully decoded.
 */
export async function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Preload all assets in a manifest (fonts + images in parallel).
 */
export async function preloadAssets(manifest: AssetManifest): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  if (manifest.fonts) {
    for (const font of manifest.fonts) {
      tasks.push(preloadFont(font));
    }
  }

  if (manifest.images) {
    for (const url of manifest.images) {
      tasks.push(preloadImage(url));
    }
  }

  await Promise.all(tasks);
}

/**
 * Check if all assets in a manifest are already loaded.
 * Synchronous check — useful for conditional rendering.
 */
export function areAssetsLoaded(manifest: AssetManifest): boolean {
  if (manifest.fonts) {
    for (const font of manifest.fonts) {
      const { family, weight = 400, style = "normal" } = font;
      const query = `${style} ${weight} 16px "${family}"`;
      if (!document.fonts.check(query)) return false;
    }
  }
  // Images can't be synchronously checked without a cache
  // so we only check fonts here
  return true;
}
