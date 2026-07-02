"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";

import { SplitAuthFormLayout } from "@/app/__components/layout/splitAuthFormLayout";
import { Button } from "@/app/__components/ui/button";
import { Input } from "@/app/__components/ui/input";
import createIdeaImage from "@/assets/futuristic.png";
import { createIdea } from "@/src/infrastructure/api/ideas/client";
import type { TagDto } from "@/src/infrastructure/api/tags/client";
import { listTags } from "@/src/infrastructure/api/tags/client";

const textareaAuthDark =
  "min-h-[8.5rem] w-full resize-y rounded-3xl border border-white/25 bg-white/5 px-5 py-3 text-base text-white placeholder:text-white/40 outline-none " +
  "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25";

const labelAuthDark =
  "text-xs font-semibold uppercase tracking-wider text-white/55";

export default function CreateIdeaPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState<TagDto[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const list = await listTags();
      if (!cancelled) setTags(list);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleTag(id: string) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createIdea({
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        coverImageFile,
        tagIds: Array.from(selectedTagIds),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SplitAuthFormLayout
      titleWhite="Shape your"
      titleAccent="Next idea"
      subtitle="Give it a name, a short pitch, and optional cover — your board is created automatically."
      image={createIdeaImage}
      imageAlt=""
      wideForm
      footer={
        <>
          <Link
            href="/dashboard"
            className="font-semibold text-orange-400 underline decoration-orange-400/40 underline-offset-4 hover:text-orange-300"
          >
            Back to dashboard
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {error ? (
          <p
            className="rounded-full border border-red-500/35 bg-red-950/50 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <Input
          id="create-idea-title"
          name="title"
          label="Title"
          type="text"
          autoComplete="off"
          variant="authDark"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="create-idea-description" className={labelAuthDark}>
            Short description
          </label>
          <textarea
            id="create-idea-description"
            name="shortDescription"
            className={textareaAuthDark}
            placeholder="What is this about?"
            maxLength={1000}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            required
            disabled={loading}
          />
          <span className="text-xs text-white/45">
            {shortDescription.length} / 1000
          </span>
        </div>

        <Input
          id="create-idea-cover"
          name="coverImage"
          label="Cover image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          variant="authDark"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setCoverImageFile(file);
          }}
          disabled={loading}
        />

        {tags.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className={labelAuthDark}>Tags</span>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const on = selectedTagIds.has(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    disabled={loading}
                    onClick={() => toggleTag(tag.id)}
                    className={
                      on
                        ? "rounded-full border border-orange-500/70 bg-orange-500/25 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-600/20"
                        : "rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 hover:border-white/35"
                    }
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-white/45">
              Tap to select one or more — optional.
            </span>
          </div>
        ) : null}

        <Button
          type="submit"
          rounded
          fullWidth
          size="lg"
          disabled={loading}
          leadingIcon={<Lightbulb size={20} strokeWidth={2.25} />}
          className="h-14 border-0 bg-orange-500 px-5 text-lg font-extrabold uppercase tracking-wide text-white shadow-lg shadow-orange-600/30 hover:bg-orange-400 focus-visible:ring-orange-400"
        >
          {loading ? "Creating…" : "Create idea"}
        </Button>
      </form>
    </SplitAuthFormLayout>
  );
}
