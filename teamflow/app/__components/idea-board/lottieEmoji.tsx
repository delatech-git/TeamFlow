"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

type LottieEmojiProps = {
  src: string;
  fallback: string;
  className?: string;
  ariaLabel?: string;
};

const animationDataCache = new Map<string, unknown>();

export default function LottieEmoji({ src, fallback, className, ariaLabel }: LottieEmojiProps) {
  const [loadedAnimation, setLoadedAnimation] = useState<{ src: string; data: unknown | null }>({
    src: "",
    data: null,
  });
  const cachedAnimationData = animationDataCache.get(src) ?? null;
  const animationData = cachedAnimationData ?? (loadedAnimation.src === src ? loadedAnimation.data : null);

  useEffect(() => {
    if (cachedAnimationData || loadedAnimation.src === src) {
      return;
    }

    const controller = new AbortController();
    let isUnmounted = false;

    fetch(src, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load Lottie JSON (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        animationDataCache.set(src, data);
        if (!isUnmounted) {
          setLoadedAnimation({ src, data });
        }
      })
      .catch(() => {
        if (!isUnmounted) {
          setLoadedAnimation({ src, data: null });
        }
      });

    return () => {
      isUnmounted = true;
      controller.abort();
    };
  }, [src, cachedAnimationData, loadedAnimation.src]);

  if (!animationData) {
    return (
      <span aria-label={ariaLabel} className={["inline-flex items-center justify-center", className ?? ""].join(" ").trim()}>
        {fallback}
      </span>
    );
  }

  return <Lottie animationData={animationData} loop autoplay className={className} aria-label={ariaLabel} />;
}
