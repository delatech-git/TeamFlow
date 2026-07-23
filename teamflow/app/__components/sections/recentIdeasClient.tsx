"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  Lightbulb,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";

import girlImage from "@/assets/girl-sitting.png";
import { IdeaCard } from "./ideaCard";
import type { IdeaResponseDto } from "@/src/infrastructure/api/ideas/types";
import { getAccessToken } from "@/src/infrastructure/auth/session";

type Props = {
  initialIdeas: IdeaResponseDto[];
};

const STAT_ICON_STYLES = {
  orange: {
    icon: "bg-linear-to-br from-orange-400 to-amber-500 text-white shadow-[0_0_18px_rgba(249,115,22,0.55)]",
    glow: "shadow-[0_0_24px_rgba(249,115,22,0.12)]",
  },
  pink: {
    icon: "bg-linear-to-br from-pink-400 to-rose-500 text-white shadow-[0_0_18px_rgba(236,72,153,0.55)]",
    glow: "shadow-[0_0_24px_rgba(236,72,153,0.12)]",
  },
  teal: {
    icon: "bg-linear-to-br from-emerald-400 to-teal-500 text-white shadow-[0_0_18px_rgba(16,185,129,0.55)]",
    glow: "shadow-[0_0_24px_rgba(16,185,129,0.12)]",
  },
  purple: {
    icon: "bg-linear-to-br from-violet-400 to-purple-500 text-white shadow-[0_0_18px_rgba(139,92,246,0.55)]",
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
              className="group inline-flex h-12 shrink-0 items-center justify-center gap-3 rounded-2xl bg-linear-to-r from-orange-500 to-pink-500 px-6 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/40"
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
                    canEditImage={canEdit}
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
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${styles.icon}`}
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