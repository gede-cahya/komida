/**
 * ImageKit URL utility for on-the-fly image transformations.
 *
 * Usage:
 *   getImageKitUrl(originalUrl, { width: 300, quality: 80 })
 *   → https://ik.imagekit.io/YOUR_ID/tr:w-300,q-80/https://source.com/img.jpg
 *
 * Falls back to original URL if ImageKit is not configured.
 */

const IMAGEKIT_BASE = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "";
const ENABLED = !!IMAGEKIT_BASE;

interface TransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  progressive?: boolean;
}

// Known manga scraper domains that block external crawlers (ImageKit can't fetch these)
const BLOCKED_ORIGINS = new Set([
  "kacu.gmbr.pro",
  "v3.kiryuu.to",
  "kiryuu.to",
  "yuucdn.com",
  "manhwaindo.my",
  "softkomik.com",
  "keikomik.com",
  "komikindo.co",
  "komikcast.io",
]);

function isBlockedOrigin(url: string): boolean {
  try {
    const hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    return BLOCKED_ORIGINS.has(hostname) || BLOCKED_ORIGINS.has(hostname.replace(/^www\./, ""));
  } catch {
    return false;
  }
}

export function getImageKitUrl(
  originalUrl: string,
  options: TransformOptions = {}
): string {
  if (!ENABLED || !originalUrl) {
    return originalUrl;
  }

  // If originalUrl is already an ImageKit URL or data URI, return as-is
  if (originalUrl.startsWith("data:") || originalUrl.includes("ik.imagekit.io")) {
    return originalUrl;
  }

  // Skip ImageKit for manga scraper domains that block crawlers
  // SafeImage will fall back to proxy URL instead
  if (isBlockedOrigin(originalUrl)) {
    return originalUrl;
  }

  const parts: string[] = ["tr"];

  if (options.width) parts.push(`w-${options.width}`);
  if (options.height) parts.push(`h-${options.height}`);
  if (options.quality) parts.push(`q-${options.quality}`);
  if (options.format && options.format !== "auto") {
    parts.push(`f-${options.format}`);
  } else if (!options.format) {
    parts.push("f-auto"); // auto WebP/AVIF based on browser support — free
  }
  if (options.progressive !== false) {
    parts.push("pr-true"); // progressive / quality optimization
  }

  const transform = parts.join(":");

  // Ensure original URL has protocol
  const url = originalUrl.startsWith("http")
    ? originalUrl
    : `https://${originalUrl}`;

  const base = IMAGEKIT_BASE.endsWith("/")
    ? IMAGEKIT_BASE.slice(0, -1)
    : IMAGEKIT_BASE;

  return `${base}/${transform}/${url}`;
}

/**
 * Build a fallback proxy URL for sources with hotlink protection.
 */
export function getProxyUrl(
  originalUrl: string,
  source?: string
): string {
  if (!originalUrl) return "";
  return `/api/image/proxy?url=${encodeURIComponent(originalUrl)}&source=${source || "kiryuu"}`;
}

/**
 * Convenience helpers for common manga image sizes.
 */
export const imagePresets = {
  /** Grid thumbnails: ~300w, highly compressed */
  thumbnail: (url: string, source?: string) => ({
    src: getImageKitUrl(url, { width: 300, quality: 80, progressive: true }),
    fallbackSrc: getProxyUrl(url, source),
  }),

  /** Trending featured card: ~600w */
  featured: (url: string, source?: string) => ({
    src: getImageKitUrl(url, { width: 600, quality: 85, progressive: true }),
    fallbackSrc: getProxyUrl(url, source),
  }),

  /** Detail page cover: ~400w */
  cover: (url: string, source?: string) => ({
    src: getImageKitUrl(url, { width: 400, quality: 85, progressive: true }),
    fallbackSrc: getProxyUrl(url, source),
  }),

  /** Hero background: ~1200w, higher quality */
  hero: (url: string, source?: string) => ({
    src: getImageKitUrl(url, { width: 1200, quality: 85, progressive: true }),
    fallbackSrc: getProxyUrl(url, source),
  }),

  /** Chapter page images: ~800w */
  chapter: (url: string, source?: string) => ({
    src: getProxyUrl(url, source),
    fallbackSrc: url,
  }),
};
