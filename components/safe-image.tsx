"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "src"> {
  src: string;
  fallbackSrc?: string;
}

/**
 * Image component with automatic fallback to a proxy URL if the primary
 * source (e.g. ImageKit) fails to load. This is useful for manga sources
 * that have hotlink protection and require a referer/header proxy.
 */
export function SafeImage({ src, fallbackSrc, onError, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      {...props}
      src={imgSrc}
      onError={(e) => {
        if (!hasError && fallbackSrc) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
        onError?.(e);
      }}
    />
  );
}
