"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

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
  const [isInvalid, setIsInvalid] = useState(false);

  if (isInvalid) {
    return (
      <div className={cn("absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-900 text-gray-500", props.className)}>
        <span className="text-4xl">📚</span>
        <span className="text-xs font-medium">No Image</span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      loading={props.priority ? undefined : "lazy"}
      src={imgSrc}
      onLoad={(e) => {
        const target = e.currentTarget;
        if (target.naturalWidth <= 2 && target.naturalHeight <= 2) {
          if (!hasError && fallbackSrc) {
            setHasError(true);
            setImgSrc(fallbackSrc);
            return;
          }
          setIsInvalid(true);
          return;
        }
        props.onLoad?.(e);
      }}
      onError={(e) => {
        if (!hasError && fallbackSrc) {
          setHasError(true);
          setImgSrc(fallbackSrc);
          return;
        }
        setIsInvalid(true);
        onError?.(e);
      }}
    />
  );
}
