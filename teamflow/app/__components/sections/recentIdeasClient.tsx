"use client";

import Image from "next/image";
import Link from "next/link";
import {type ReactNode } from "react";
import { ArrowRight, CalendarDays, Lightbulb,  Star, Users } from "lucide-react";

import fallbackImage from "@/assets/cardImage.png";
import girlImage from "@/assets/girl-sitting.png"
import type { IdeaResponseDto } from "@/src/infrastructure/api/ideas/types";
import { ideaDetailHref } from "@/src/entities/models/discover";

type Props = {
  initialIdeas: IdeaResponseDto[];
};

export function RecentIdeasClient({ initialIdeas }: Props) {

  const topIdeas = initialIdeas.slice(0, 3);
  const ideasCount = initialIdeas.length;
  const collaborators = new Set(initialIdeas.map((idea) => idea.createdBy.id)).size;
  const plannedCount = initialIdeas.filter((idea) => idea.status === "PLANNED").length;

  const allRatings = initialIdeas.flatMap((idea) => idea.ratings ?? []);
  const teamRating =
    allRatings.length > 0
      ? (
          allRatings.reduce((sum, rating) => sum + rating.value, 0) /
          allRatings.length
        ).toFixed(1)
      : "—";

  return (
    <div className="flex flex-col items-end gap-10 rounded-3xl bg-[#1a1a22] shadow-[0_12px_30px_rgba(15,23,42,0.08)] md:flex-row">
        <Image
          src={girlImage}
          alt="TeamFlow"
          className="hidden h-auto  mt-20 shrink-0 object-contain object-bottom md:block lg:w-fit"
        />

        <div className="w-full p-6 lg:p-10">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-3 text-5xl font-bold tracking-tight text-white">
                <span className="inline-block h-8 w-8 shrink-0 rounded-full bg-linear-to-br from-pink-500 via-orange-400 to-emerald-400" />
                Top Recent Ideas
              </h2>
            </div>
            <Link
              href="/discover-ideas"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-orange-500 hover:text-orange-500"
            >
              See all ideas
              <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
          <div className="mb-6 flex flex-wrap gap-3">
            <StatTab icon={<Lightbulb size={14} />} label="Ideas Created" value={String(ideasCount)} />
            <StatTab icon={<Users size={14} />} label="Active Collaborators" value={String(collaborators)} />
            <StatTab icon={<CalendarDays size={14} />} label="Planned Events" value={String(plannedCount)} />
            <StatTab icon={<Star size={14} />} label="Team Rating" value={teamRating} />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {topIdeas.map((idea) => {
              const ideaImage = idea.coverImageUrl || fallbackImage;
              const owner = idea.createdBy.fullName || idea.createdBy.username;
              return (
                <article key={idea.id} className="group relative overflow-hidden rounded-2xl bg-slate-950">
                  <div className="relative aspect-square">
                    {typeof ideaImage === "string" && isRemoteImageUrl(ideaImage) ? (
                      <img
                        src={ideaImage}
                        alt={idea.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <Image
                        src={ideaImage}
                        alt={idea.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-linear-to-b from-black/15 via-black/25 to-black/85" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="line-clamp-2 text-lg font-extrabold uppercase leading-tight text-white">{idea.title}</p>
                    </div>
                  </div>
                  <div className="absolute right-2.5 top-2.5 flex gap-1.5">
                    <span className="rounded-full border border-white/35 bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white/90">
                      {idea.status}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5">
                  </div>
                  <Link href={ideaDetailHref(idea)} className="absolute inset-0" aria-label={`Open ${idea.title}`} />
                </article>
              );
            })}
          </div>
        </div>
      </div>
  );
}

function isRemoteImageUrl(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

function StatTab({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-full bg-linear-to-r from-pink-500 via-orange-400 to-emerald-400 p-px">
      <div className="flex items-center gap-2 rounded-full bg-[#1a1a22] px-4 py-2 text-xs font-semibold">
        <span className="text-orange-400">{icon}</span>
        <span className="text-white">{value}</span>
        <span className="text-white/50">{label}</span>
      </div>
    </div>
  );
}


