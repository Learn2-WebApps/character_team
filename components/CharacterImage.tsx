'use client';

import React, { useState, useEffect } from 'react';

interface CharacterImageProps {
  characterKey: string | null | undefined;
  fallbackEmoji: string;
  alt?: string;
  className?: string; // CSS classes applied to the img tag
}

export default function CharacterImage({
  characterKey,
  fallbackEmoji,
  alt = "Character Image",
  className = "w-full h-full object-contain p-0.5"
}: CharacterImageProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state if the key changes (e.g. slot machine steps or detail modal target change)
  useEffect(() => {
    setHasError(false);
  }, [characterKey]);

  if (!characterKey || hasError) {
    // Dynamically adjust fallback emoji size depending on size classes passed in className
    const isLarge = className.includes('w-32') || className.includes('w-28') || className.includes('w-36') || className.includes('h-32') || className.includes('text-');
    const isMedium = className.includes('w-12') || className.includes('w-16') || className.includes('h-12');
    const emojiSizeClass = isLarge ? 'text-5xl md:text-6xl' : isMedium ? 'text-2xl md:text-3xl' : 'text-base md:text-lg';

    return (
      <span className={`select-none font-sans leading-none flex items-center justify-center ${emojiSizeClass}`}>
        {fallbackEmoji}
      </span>
    );
  }

  return (
    <img
      src={`/characters/${characterKey}.png`}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
