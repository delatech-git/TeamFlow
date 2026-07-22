"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Camera,
  CalendarDays,
  Lightbulb,
  Loader2,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";

import fallbackImage from "@/assets/cardImage.png";
import girlImage from "@/assets/girl-sitting.png";
import { updateIdeaCoverImage } from "@/src/infrastructure/api/ideas/client";
import type { IdeaResponseDto } from "@/src/infrastructure/api/ideas/types";
import { getAccessToken } from "@/src/infrastructure/auth/session";
import { ideaDetailHref } from "@/src/entities/models/discover";

type Props = {
  initialIdeas: IdeaResponseDto[];
};

const STAT_ICON_STYLES = {
  orange: {
    icon: "border-orange-400/30 bg-orange-500/15 text-orange-300",
    glow: "shadow-[0_0_24px_rgba(249,115,22,0.12)]",
  },
  pink: {
    icon: "border-pink-400/30 bg-pink-500/15 text-pink-300",
    glow: "shadow-[0_0_24px_rgba(236,72,153,0.12)]",
  },
  teal: {
    icon: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
    glow: "shadow-[0_0_24px_rgba(16,185,129,0.12)]",
  },
  purple: {
    icon: "border-violet-400/30 bg-violet-500/15 text-violet-300",
    glow: "shadow-[0_0_24px_rgba(139,92,246,0.12)]",
  },
} as const;

export function RecentIdeasClient({ initialIdeas }: Props) {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setCanEdit(Boolean(getAccessToken()));
  }, []);

  function handleCoverImageUpdated(ideaId: string, coverImageUrl: string | null) {
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === ideaId ? { ...idea, coverImageUrl } : idea)),
    );
  }

  const topIdeas = ideas.slice(0, 3);

  const ideasCount = ideas.length;

  const collaborators = new Set(
    ideas
      .map((idea) => idea.createdBy?.id)
      .filter(Boolean),
  ).size;

  const plannedCount = ideas.filter(
    (idea) => idea.status === "PLANNED",
  ).length;

  const allRatings = ideas.flatMap((idea) => idea.ratings ?? []);

  const teamRating =
    allRatings.length > 0
      ? (
          allRatings.reduce((sum, rating) => sum + rating.value, 0) /
          allRatings.length
        ).toFixed(1)
      : "—";

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1020] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-20 h-80 w-80 rounded-full bg-pink-500/10 blur-[120px]" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-orange-500/5 blur-[120px]" />
      </div>

      <div className="relative grid min-h-162.5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[370px_minmax(0,1fr)]">
        <aside className="relative flex min-h-110 flex-col overflow-hidden border-b border-white/10 bg-linear-to-b from-white/[0.035] to-transparent p-6 sm:p-8 lg:min-h-full lg:border-b-0 lg:border-r lg:p-10">
          <div className="relative z-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-400/10 px-3 py-1.5 text-xs font-semibold text-orange-200">
              <Zap size={13} />
              Collaborate. Plan. Make it happen.
            </span>

            <h2 className="mt-6 max-w-xs text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl">
              Top Recent Ideas
            </h2>

            <p className="mt-4 max-w-xs text-sm leading-6 text-white/55">
              Discover the latest ideas from your team and start building
              unforgettable experiences together.
            </p>
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[68%]">
            <div className="absolute bottom-10 left-8 h-48 w-48 rounded-full border border-pink-500/20 shadow-[0_0_80px_rgba(236,72,153,0.28)]" />

            <div className="absolute bottom-16 left-10 h-56 w-56 rounded-full border border-orange-400/20 opacity-70" />

            <Image
              src={girlImage}
              alt=""
              priority
              className="absolute bottom-0 left-1/2 h-auto w-75 max-w-none -translate-x-1/2 object-contain sm:w-85 lg:w-90"
            />
          </div>

          <div className="pointer-events-none absolute bottom-20 left-14 z-0 h-28 w-28 rotate-12 rounded-3xl border border-white/5 bg-white/1.5" />
          <div className="pointer-events-none absolute bottom-40 right-8 z-0 h-20 w-20 -rotate-12 rounded-2xl border border-white/5 bg-white/1.5" />
        </aside>

        <div className="relative p-5 sm:p-7 lg:p-8 xl:p-10">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<Lightbulb size={18} />}
                color="orange"
                label="Ideas Created"
                value={String(ideasCount)}
              />

              <StatCard
                icon={<Users size={18} />}
                color="pink"
                label="Active Collaborators"
                value={String(collaborators)}
              />

              <StatCard
                icon={<CalendarDays size={18} />}
                color="teal"
                label="Planned Events"
                value={String(plannedCount)}
              />

              <StatCard
                icon={<Star size={18} />}
                color="purple"
                label="Team Rating"
                value={teamRating}
              />
            </div>

            <Link
              href="/discover-ideas"
              className="group inline-flex h-12 shrink-0 items-center justify-center gap-3 rounded-2xl border border-orange-400/50 bg-linear-to-r from-orange-500/10 to-pink-500/10 px-5 text-sm font-semibold text-white transition duration-300 hover:border-pink-400 hover:from-orange-500/20 hover:to-pink-500/20"
            >
              See all ideas
              <ArrowRight
                size={16}
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="mt-7">
            {topIdeas.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {topIdeas.map((idea, index) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    priority={index === 0}
                    canEdit={canEdit}
                    onCoverImageUpdated={handleCoverImageUpdated}
                  />
                ))}
              </div>
            ) : (
              <EmptyIdeasState />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function IdeaCard({
  idea,
  priority,
  canEdit,
  onCoverImageUpdated,
}: {
  idea: IdeaResponseDto;
  priority?: boolean;
  canEdit: boolean;
  onCoverImageUpdated: (ideaId: string, coverImageUrl: string | null) => void;
}) {
  const ideaImage = idea.coverImageUrl || fallbackImage;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputId = `idea-cover-${idea.id}`;

  async function handleCoverImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setUploadError("");
    try {
      const updated = await updateIdeaCoverImage(idea.id, file);
      onCoverImageUpdated(idea.id, updated.coverImageUrl ?? null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <article className="group relative flex min-h-117.5 flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#111827]/80 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
      <Link
        href={ideaDetailHref(idea)}
        aria-label={`Open ${idea.title}`}
        className="absolute inset-0 z-20"
      />

      <div className="relative aspect-4/3 overflow-hidden bg-white/5">
        {typeof ideaImage === "string" && isRemoteImageUrl(ideaImage) ? (
          <img
            src={ideaImage}
            alt={idea.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <Image
            src={ideaImage}
            alt={idea.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-[#111827] via-transparent to-black/10" />

        <span className="absolute right-3 top-3 rounded-full border border-white/25 bg-black/45 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white backdrop-blur-md">
          {formatStatus(idea.status)}
        </span>

        {canEdit && (
          <label
            htmlFor={inputId}
            title="Update cover image"
            className="absolute left-3 top-3 z-30 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-md transition hover:border-orange-400/60 hover:text-orange-300"
          >
            {isUploading ? (
              <Loader2 size={14} className="animate-spin" aria-hidden />
            ) : (
              <Camera size={14} aria-hidden />
            )}
            <input
              id={inputId}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={isUploading}
              onClick={(e) => e.stopPropagation()}
              onChange={handleCoverImageChange}
            />
          </label>
        )}

        {uploadError && (
          <span className="absolute bottom-3 left-3 right-3 z-30 rounded-lg bg-red-950/80 px-2 py-1 text-[10px] font-semibold text-red-200">
            {uploadError}
          </span>
        )}
      </div>

      <div className="relative z-10 -mt-10 flex flex-1 flex-col px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
        <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-white">
          {idea.title}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-white/55">
          {idea.shortDescription || "Discover more about this idea."}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex min-w-0 items-center gap-2 text-xs text-white/50">
            <CalendarDays
              size={14}
              aria-hidden
              className="shrink-0 text-orange-300"
            />

            <span className="truncate">{formatDate(idea.createdAt)}</span>
          </div>

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition duration-300 group-hover:border-orange-400/60 group-hover:bg-orange-400/10 group-hover:text-orange-300">
            <ArrowRight
              size={15}
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </article>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  color: keyof typeof STAT_ICON_STYLES;
}) {
  const styles = STAT_ICON_STYLES[color];

  return (
    <div
      className={`flex min-h-22 items-center gap-3 rounded-2xl border border-white/10 bg-white/4.5 px-4 py-3 backdrop-blur-md transition hover:border-white/15 hover:bg-white/6.5 ${styles.glow}`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${styles.icon}`}
      >
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xl font-bold leading-none text-white">{value}</p>
        <p className="mt-1.5 truncate text-[11px] leading-4 text-white/50">
          {label}
        </p>
      </div>
    </div>
  );
}

function EmptyIdeasState() {
  return (
    <div className="flex min-h-97.5 flex-col items-center justify-center rounded-[22px] border border-dashed border-white/15 bg-white/2.5 px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-orange-400/20 bg-orange-400/10 text-orange-300">
        <Sparkles size={22} />
      </span>

      <h3 className="mt-4 text-lg font-bold text-white">No ideas available</h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-white/50">
        Once your team creates new ideas, they will appear here.
      </p>

      <Link
        href="/discover-ideas"
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-orange-400/50 hover:text-orange-300"
      >
        Explore ideas
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function isRemoteImageUrl(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatStatus(status: string): string {
  return status.replaceAll("_", " ");
}