"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowUpRight, Trash2 } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./button";

type CardVariant = "dark" | "light";

type CardProps = {
  title: string;
  description: string;
  createdAt: string;
  author: string;
  href: string;
  image?: string | StaticImageData;
  variant?: CardVariant;
  className?: string;
  showDelete?: boolean;
  onDelete?: () => void | Promise<void>;
  deleteBusy?: boolean;
};

function isRemoteImageUrl(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

const variantClasses: Record<CardVariant, string> = {
  dark: "bg-slate-950 text-white",
  light: "bg-white text-slate-950"
};

export function Card({
  title,
  description,
  createdAt,
  author,
  href,
  image,
  variant = "dark",
  className,
  showDelete,
  onDelete,
  deleteBusy,
}: CardProps) {
  return (
    <article
      className={cn(
        "group relative min-h-112 overflow-hidden rounded-3xl p-8",
        variantClasses[variant],
        className,
      )}
    >
      {showDelete ? (
        <button
          type="button"
          aria-label="Delete idea"
          disabled={deleteBusy}
          className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white/90 backdrop-blur-sm transition hover:border-red-400/60 hover:bg-red-950/80 hover:text-red-100 disabled:opacity-50"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void onDelete?.();
          }}
        >
          <Trash2 size={18} strokeWidth={2} aria-hidden />
        </button>
      ) : null}
      {image ? (
        typeof image === "string" && isRemoteImageUrl(image) ? (
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )
      ) : null}

      {/* Full overlay on hover */}
      <div className="absolute inset-0 bg-black/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/20 to-black/70" />

      <div className="relative z-10 flex h-full min-h-88 flex-col justify-center items-center text-center">
        <div className="transition-opacity duration-300 group-hover:opacity-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
            {createdAt}
          </p>

          <h3 className="mt-4 max-w-xs text-3xl font-extrabold uppercase leading-tight tracking-tight">
            {title}
          </h3>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-sm font-semibold text-white/70">By {author}</p>

          <p className="mt-3 max-w-sm text-base leading-7 text-white/85">
            {description}
          </p>

          <Link
            href={href}
            className="mt-6"
          >
            <Button rounded size="sm">
              View idea
              <ArrowUpRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}