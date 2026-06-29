import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

import { cn } from "../ui/utils";

type SplitAuthFormLayoutProps = {
  titleWhite: string;
  titleAccent: string;
  subtitle?: string;
  image: StaticImageData;
  imageAlt?: string;
  footer?: ReactNode;
  children: ReactNode;
  wideForm?: boolean;
};

export function SplitAuthFormLayout({
  titleWhite,
  titleAccent,
  subtitle,
  image,
  imageAlt = "",
  footer,
  children,
  wideForm,
}: SplitAuthFormLayoutProps) {
  return (
    <section className="min-h-[calc(100dvh-5rem)] bg-neutral-950 pt-20 text-white">
      <div>
        <div className="relative min-h-[42vh] bg-black lg:min-h-inherit">
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="object-contain object-center"
          />
        </div>

        <div className="flex items-center border-t border-white/10 px-6 py-12 sm:px-10 lg:border-l lg:border-t-0 lg:px-14 xl:px-20">
          <div
            className={cn(
              "mx-auto w-full",
              wideForm ? "max-w-xl" : "max-w-md"
            )}
          >
            <h1 className="text-4xl font-black uppercase leading-[1.05] tracking-tight sm:text-5xl">
              <span>{titleWhite}</span>
              <br />
              <span className="text-orange-500">{titleAccent}</span>
            </h1>

            {subtitle && (
              <p className="mt-5 text-lg text-white/80 sm:text-xl">
                {subtitle}
              </p>
            )}

            <div className="mt-8 sm:mt-11">{children}</div>

            {footer && (
              <div className="mt-10 text-base text-white/70">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}