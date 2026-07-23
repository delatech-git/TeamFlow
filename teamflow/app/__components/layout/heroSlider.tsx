"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useState, type ReactNode } from "react";

import { cn } from "../ui/utils";

type Slide = {
  title: string;
  description?: string;
  image: string | StaticImageData;
  eyebrow?: string;
};

type HeroHeight = "small" | "medium" | "large" | "full";

type HeroSliderProps = {
  slides: Slide[];
  children?: ReactNode;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  height?: HeroHeight;
};

export default function HeroSlider({
  slides,
  children,
  autoPlay = true,
  interval = 5000,
  className,
  height = "medium",
}: HeroSliderProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!autoPlay || slides.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const heightClasses: Record<HeroHeight, string> = {
    small: "min-h-[30vh]",
    medium: "min-h-[80vh]",
    large: "min-h-[75vh]",
    full: "min-h-screen",
  };
  return (
    <section className={cn("relative", heightClasses[height], className)}>
      {slides.map((slide, index) => {
        const isActive = index === activeSlide;

        return (
          <div
            key={slide.title}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              isActive ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              className="object-cover"
            />

            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-linear-to-b from-black/25 via-black/30 to-black/60" />
          </div>
        );
      })}

      <div
        className={cn(
          "relative z-10 flex items-center justify-center px-4 pt-20 text-center text-white",
          heightClasses[height],
        )}
      >
        <div className="max-w-4xl">
          {slides[activeSlide]?.eyebrow && (
            <div className="mx-auto mb-7 inline-flex bg-orange-500 px-5 py-2 text-xs 2xl:text-sm font-bold uppercase tracking-wide">
              {slides[activeSlide].eyebrow}
            </div>
          )}

          <h1 className="text-4xl font-extrabold uppercase tracking-wide sm:text-5xl 2xl:text-6xl">
            {slides[activeSlide]?.title}
          </h1>

          {slides[activeSlide]?.description && (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 2xl:text-lg">
              {slides[activeSlide].description}
            </p>
          )}

          {children && <div className="mt-10">{children}</div>}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setActiveSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === activeSlide
                  ? "w-8 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
