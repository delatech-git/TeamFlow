"use client";

import { useEffect, useState } from "react";
import HeroSlider from "../__components/layout/heroSlider";
import { Card } from "../__components/ui/card";
import { Button } from "../__components/ui/button";
import HeroImage from "@/assets/HeroBg.png";
import heroBg from "@/assets/heroBackground.png";
import discussion from "@/assets/discussion.png";
import fallbackImage from "@/assets/cardImage.png";
import {
  deleteIdea,
  getIdeas,
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

type IdeaCardModel = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  author: string;
  href: string;
  image: string | typeof fallbackImage;
};

function mapIdeaToCard(idea: IdeaResponseDto): IdeaCardModel {
  return {
    id: idea.id,
    title: idea.title,
    description: idea.shortDescription,
    createdAt: new Date(idea.createdAt).toLocaleDateString(),
    author: idea.createdBy.fullName || idea.createdBy.username,
    href: `/dashboard/ideas/${idea.id}`,
    image: idea.coverImageUrl || fallbackImage,
  };
}

export default function DiscoverIdeasPage() {
  const [ideas, setIdeas] = useState<IdeaCardModel[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [displayCount, setDisplayCount] = useState(9);
  const [canDelete, setCanDelete] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getIdeas();
        if (!cancelled) {
          setIdeas(data.map(mapIdeaToCard));
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
  }, []);

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

  const visibleIdeas = ideas.slice(0, displayCount);
  const latestIdeas = visibleIdeas.slice(0, 6);
  const otherIdeas = visibleIdeas.slice(6);
  const hasMore = displayCount < ideas.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 6, ideas.length));
  };

  return (
    <>
      <HeroSlider slides={heroSlides} height="small" />
      <section className="min-h-screen bg-black px-4 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          {!hydrated && (
            <p className="text-center text-white/60">Loading ideas…</p>
          )}

          {loadError && hydrated && (
            <p className="text-center text-red-400">{loadError}</p>
          )}

          {hydrated && !loadError && ideas.length === 0 && (
            <p className="text-center text-lg text-white/60">
              No ideas yet. Create one after signing in.
            </p>
          )}

          {ideas.length > 0 && (
            <div className="space-y-20">
              <section>
                <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                      Fresh ideas
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">Recent Ideas</h2>
                  </div>

                  <p className="hidden text-sm text-white/50 md:block">
                    Recently created collaborations and events
                  </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {latestIdeas.map((idea) => (
                    <Card
                      key={idea.id}
                      title={idea.title}
                      description={idea.description}
                      image={idea.image}
                      createdAt={idea.createdAt}
                      author={idea.author}
                      href={idea.href}
                      variant="dark"
                      showDelete={canDelete}
                      deleteBusy={deletingId === idea.id}
                      onDelete={() => handleDeleteIdea(idea.id)}
                    />
                  ))}
                </div>
              </section>

              {otherIdeas.length > 0 && (
                <section>
                  <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">
                        Archive
                      </p>

                      <h2 className="mt-2 text-3xl font-bold">More Ideas</h2>
                    </div>

                    <p className="hidden text-sm text-white/50 md:block">
                      Explore older community ideas and inspiration
                    </p>
                  </div>

                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {otherIdeas.map((idea) => (
                      <Card
                        key={idea.id}
                        title={idea.title}
                        description={idea.description}
                        image={idea.image}
                        createdAt={idea.createdAt}
                        author={idea.author}
                        href={idea.href}
                        variant="dark"
                        showDelete={canDelete}
                        deleteBusy={deletingId === idea.id}
                        onDelete={() => handleDeleteIdea(idea.id)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {hasMore && (
            <div className="mt-16 flex justify-center">
              <Button onClick={handleLoadMore} rounded size="lg">
                Load More Ideas
              </Button>
            </div>
          )}

          {!hasMore && ideas.length > 0 && (
            <div className="mt-16 text-center">
              <p className="text-lg text-white/60">
                Showing all {ideas.length} ideas
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
