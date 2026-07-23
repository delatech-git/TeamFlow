"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Plus, Sparkles } from "lucide-react";
import HeroSlider from "../__components/layout/heroSlider";
import { BackToDashboardLink } from "../__components/layout/backToDashboardLink";
import { Button } from "../__components/ui/button";
import { IdeaCard } from "../__components/sections/ideaCard";
import HeroImage from "@/assets/HeroBg.png";
import heroBg from "@/assets/heroBackground.png";
import discussion from "@/assets/discussion.png";
import {
  deleteIdea,
  getIdeas,
  updateIdeaStatus,
  type IdeaResponseDto,
} from "@/src/infrastructure/api/ideas/client";
import { fetchCurrentUser } from "@/src/infrastructure/api/auth/client";
import { getAccessToken } from "@/src/infrastructure/auth/session";

const heroSlides = [
  {
    title: "Plan better together",
    description: "Create and manage events with your team.",
    image: HeroImage,
  },
  {
    title: "Create moments",
    description: "Collaborate, organize, and share experiences.",
    image: heroBg,
  },
  {
    title: "Discover team ideas",
    description: "Engage your team with interactive event boards.",
    image: discussion,
  },
];

type StatusFilter = "ALL" | "PLANNED" | "DRAFT";
type SortOrder = "newest" | "oldest";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PLANNED", label: "Planned" },
  { key: "DRAFT", label: "Draft" },
];

export default function DiscoverIdeasPage() {
  const searchParams = useSearchParams();
  const [ideas, setIdeas] = useState<IdeaResponseDto[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [displayCount, setDisplayCount] = useState(9);
  const [canManage, setCanManage] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const searchQuery = searchParams.get("q") ?? "";

  useEffect(() => {
    if (!getAccessToken()) {
      setCanManage(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        await fetchCurrentUser();
        if (!cancelled) setCanManage(true);
      } catch {
        if (!cancelled) setCanManage(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setDisplayCount(9);

    (async () => {
      try {
        const data = await getIdeas(undefined, searchQuery || undefined);
        if (!cancelled) {
          setIdeas(data);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Could not load ideas. Is the API running?");
        }
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  async function handleDeleteIdea(id: string) {
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

  function handleCoverImageUpdated(ideaId: string, coverImageUrl: string | null) {
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === ideaId ? { ...idea, coverImageUrl } : idea)),
    );
  }

  async function handlePublishIdea(id: string) {
    setPublishingId(id);
    try {
      await updateIdeaStatus(id, "NEW");
      setIdeas((prev) =>
        prev.map((idea) => (idea.id === id ? { ...idea, status: "NEW" } : idea)),
      );
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "Could not publish this idea.",
      );
    } finally {
      setPublishingId(null);
    }
  }

  const filteredIdeas = useMemo(() => {
    const filtered =
      statusFilter === "ALL"
        ? ideas
        : ideas.filter((idea) => idea.status === statusFilter);

    const sorted = [...filtered].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? -diff : diff;
    });

    return sorted;
  }, [ideas, statusFilter, sortOrder]);

  const visibleIdeas = filteredIdeas.slice(0, displayCount);
  const hasMore = displayCount < filteredIdeas.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 6, filteredIdeas.length));
  };

  return (
    <>
      <div className="relative">
        <BackToDashboardLink className="absolute left-4 top-24 z-20 sm:left-6 lg:left-8" />
        <HeroSlider slides={heroSlides} height="small" />
      </div>
      <section className="min-h-screen bg-black px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1020] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                  Fresh ideas
                </p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Recent Ideas
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-6 text-white/55">
                  Explore the latest collaborations, trips, and events created by your team.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setStatusFilter(tab.key)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        statusFilter === tab.key
                          ? "bg-linear-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className="appearance-none rounded-full border border-white/15 bg-white/5 py-2.5 pl-4 pr-9 text-sm font-semibold text-white outline-none transition hover:border-white/25"
                  >
                    <option className="bg-[#111827]" value="newest">Newest first</option>
                    <option className="bg-[#111827]" value="oldest">Oldest first</option>
                  </select>
                  <ChevronDown
                    size={15}
                    aria-hidden
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
                  />
                </div>

                <Link
                  href="/dashboard/create"
                  className="inline-flex h-10.5 shrink-0 items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-pink-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/40"
                >
                  <Plus size={16} aria-hidden />
                  Create idea
                </Link>
              </div>
            </div>

            <div className="mt-8 px-12">
              {!hydrated && (
                <p className="py-16 text-center text-white/60">Loading ideas…</p>
              )}

              {loadError && hydrated && (
                <p className="py-16 text-center text-red-400">{loadError}</p>
              )}

              {hydrated && !loadError && filteredIdeas.length === 0 && (
                <div className="flex min-h-97.5 flex-col items-center justify-center rounded-[22px] border border-dashed border-white/15 bg-white/2.5 px-6 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-orange-400/20 bg-orange-400/10 text-orange-300">
                    <Sparkles size={22} />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-white">No ideas found</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-white/50">
                    {searchQuery
                      ? `No ideas match "${searchQuery}".`
                      : "Try a different filter, or create the first idea."}
                  </p>
                </div>
              )}

              {hydrated && !loadError && visibleIdeas.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {visibleIdeas.map((idea, index) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      priority={index === 0}
                      canEditImage={canManage}
                      onCoverImageUpdated={handleCoverImageUpdated}
                      showDelete={canManage}
                      deleteBusy={deletingId === idea.id}
                      onDelete={() => handleDeleteIdea(idea.id)}
                      onPublish={canManage ? () => handlePublishIdea(idea.id) : undefined}
                      publishBusy={publishingId === idea.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Button onClick={handleLoadMore} rounded size="lg">
                  Load More Ideas
                </Button>
              </div>
            )}

            {!hasMore && filteredIdeas.length > 0 && (
              <p className="mt-10 text-center text-sm text-white/50">
                Showing all {filteredIdeas.length} ideas
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
