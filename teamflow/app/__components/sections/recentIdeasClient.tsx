"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, CalendarDays, Lightbulb, MessageCircle, Star, Users } from "lucide-react";

import fallbackImage from "@/assets/cardImage.png";
import { deleteIdea } from "@/src/infrastructure/api/ideas/client";
import type { IdeaResponseDto } from "@/src/infrastructure/api/ideas/types";
import { fetchCurrentUser } from "@/src/infrastructure/api/auth/client";
import { getAccessToken } from "@/src/infrastructure/auth/session";

type Props = {
  initialIdeas: IdeaResponseDto[];
};

export function RecentIdeasClient({ initialIdeas }: Props) {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      setCanDelete(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        await fetchCurrentUser();
        if (!cancelled) setCanDelete(true);
      } catch {
        if (!cancelled) setCanDelete(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onDeleteIdea(id: string) {
    if (
      !window.confirm(
        "Delete this idea for everyone? This cannot be undone.",
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteIdea(id);
      setIdeas((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "Could not delete this idea.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (ideas.length === 0) {
    return null;
  }

  const topIdeas = ideas.slice(0, 3);
  const ideasCount = ideas.length;
  const collaborators = new Set(ideas.map((idea) => idea.createdBy.id)).size;
  const plannedCount = ideas.filter((idea) => idea.status === "PLANNED").length;
  const teamRating = ideas.length > 0 ? "4.8" : "0.0";
  const activityIdeas = ideas.slice(0, 4);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<Lightbulb size={16} />} label="Ideas Created" value={String(ideasCount)} delta="+12 this week" />
          <StatCard icon={<Users size={16} />} label="Active Collaborators" value={String(collaborators)} delta="+5 this week" />
          <StatCard icon={<CalendarDays size={16} />} label="Planned Events" value={String(plannedCount)} delta="+3 this week" />
          <StatCard icon={<Star size={16} />} label="Team Rating" value={teamRating} delta="+0.3 this week" />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Top Recent Ideas</h2>
            <Link href="/discover-ideas" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              See all ideas
              <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {topIdeas.map((idea) => {
              const ideaImage = idea.coverImageUrl || fallbackImage;
              const owner = idea.createdBy.fullName || idea.createdBy.username;
              return (
                <article key={idea.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                  <div className="relative h-56">
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
                    {canDelete ? (
                      <button
                        type="button"
                        disabled={deletingId === idea.id}
                        onClick={() => void onDeleteIdea(idea.id)}
                        className="rounded-full border border-red-300/50 bg-red-950/70 px-2 py-0.5 text-[10px] font-semibold text-red-100 disabled:opacity-50"
                      >
                        Del
                      </button>
                    ) : null}
                  </div>
                  <Link href={`/dashboard/ideas/${idea.id}`} className="absolute inset-0" aria-label={`Open ${idea.title}`} />
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

function StatCard({
  icon,
  label,
  value,
  delta,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-[#fafbff] px-4 py-3">
      <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">{icon}</div>
      <p className="text-3xl font-bold leading-none text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-emerald-600">{delta}</p>
    </article>
  ); 
}

function AvatarDot({ label }: { label: string }) {
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full border border-white/60 bg-white/90 text-[10px] font-bold text-slate-800">
      {label.slice(0, 1).toUpperCase()}
    </span>
  );
}

function formatRelativeTime(timestamp: string): string {
  const delta = Date.now() - new Date(timestamp).getTime();
  if (!Number.isFinite(delta) || delta < 0) return "just now";
  const hours = Math.floor(delta / (1000 * 60 * 60));
  if (hours < 1) return "moments ago";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
