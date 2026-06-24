import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

import { cn } from "../ui/utils";

export type AuthHeroLayoutProps = {
  titleWhite: string;
  titleAccent: string;
  subtitle?: string;
  image: StaticImageData;
  imageAlt?: string;
  footer?: ReactNode;
  children: ReactNode;
  wideForm?: boolean;
};

export function AuthHeroLayout({
  titleWhite,
  titleAccent,
  subtitle,
  image,
  imageAlt = "",
  footer,
  children,
  wideForm,
}: AuthHeroLayoutProps) {
  return (
    <section className="relative isolate min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-linear-to-r from-black/92 via-black/55 to-black/25 sm:via-black/45 sm:to-black/20"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/30"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-orange-500/12 blur-3xl" />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col justify-center px-6 py-16 sm:px-10 lg:px-16 xl:px-24">
        <div
          className={cn("w-full", wideForm ? "max-w-xl" : "max-w-md")}
        >
          <h1 className="text-4xl font-black uppercase leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl lg:leading-none">
            <span className="text-white drop-shadow-sm">{titleWhite}</span>
            <br />
            <span className="text-orange-500 drop-shadow-[0_0_24px_rgba(249,115,22,0.35)]">
              {titleAccent}
            </span>
          </h1>
          {subtitle ? (
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/80 drop-shadow-sm sm:text-xl">
              {subtitle}
            </p>
          ) : null}

          <div className="mt-8 sm:mt-11">{children}</div>

          {footer ? (
            <div className="mt-10 text-base text-white/70 drop-shadow-sm">
              {footer}
            </div>
          ) : null}
        </div>

        <p className="pointer-events-none absolute bottom-6 left-6 right-6 z-10 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70 sm:left-10 sm:text-xs lg:text-left lg:text-sm">
          TeamTide · Collaborative event space
        </p>
      </div>
    </section>
  );
}
