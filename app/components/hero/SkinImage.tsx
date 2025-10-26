// ABOUTME: SkinImage component displays hero skin previews with graceful fallback
// ABOUTME: Falls back to default skin with grayscale filter if specific skin image is missing

import { useState } from "react";
import { cn } from "~/lib/utils";

interface SkinImageProps {
  heroSlug: string;
  skinName: string;
  isPlus?: boolean;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export default function SkinImage({
  heroSlug,
  skinName,
  isPlus = false,
  alt,
  className,
  fallbackClassName,
}: SkinImageProps) {
  const [hasError, setHasError] = useState(false);

  // If there's an error, use the default skin with grayscale filter
  if (hasError) {
    return (
      <img
        src={`/images/heroes/${heroSlug}.png`}
        alt={`${alt} (default skin)`}
        className={cn(className, "grayscale", fallbackClassName)}
      />
    );
  }

  // Construct the skin image path
  const skinImagePath = `/images/heroes/skins/${heroSlug}-${skinName}${
    isPlus ? "-plus" : ""
  }.png`;

  return (
    <img
      src={skinImagePath}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
