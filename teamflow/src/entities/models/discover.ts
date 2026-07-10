import type { IdeaResponseDto } from "@/src/infrastructure/api/ideas/types";
import type { IdeaBoardState } from "@/src/entities/models/idea-board";

/** Shape passed into `IdeaBoard` — maps from API + optional demo slug for templates */
export type DiscoverIdea = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  boardState: IdeaBoardState | null;
};

export function slugifyTitle(title: string): string {
  const s = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.length > 0 ? s : "idea";
}

/** Planned ideas already have a generated guide; send those to the planned-ideas view instead of the board. */
export function ideaDetailHref(dto: Pick<IdeaResponseDto, "id" | "status">): string {
  return dto.status === "PLANNED"
    ? `/planned-ideas?ideaId=${dto.id}`
    : `/dashboard/ideas/${dto.id}`;
}

export function ideaResponseToDiscoverIdea(dto: IdeaResponseDto): DiscoverIdea {
  return {
    id: dto.id,
    slug: slugifyTitle(dto.title),
    title: dto.title,
    summary: dto.shortDescription,
    boardState: decodeBoardState(dto),
  };
}

function decodeBoardState(dto: IdeaResponseDto): IdeaBoardState | null {
  const stickers = dto.board?.stickers;
  if (!stickers || stickers.length === 0) return null;

  const notes: IdeaBoardState["notes"] = [];
  const funItems: IdeaBoardState["funItems"] = [];
  let pinnedNoteIds: string[] = [];
  let summaryPreview = "";
  let postedDecisionId: string | null = null;

  for (const sticker of stickers) {
    try {
      const parsed = JSON.parse(sticker.content) as
        | { kind?: "note"; note?: IdeaBoardState["notes"][number] }
        | { kind?: "fun"; item?: IdeaBoardState["funItems"][number] }
        | {
            kind?: "meta";
            pinnedNoteIds?: string[];
            summaryPreview?: string;
            postedDecisionId?: string | null;
          };

      if (parsed.kind === "note" && parsed.note) {
        notes.push(parsed.note);
        continue;
      }

      if (parsed.kind === "fun" && parsed.item) {
        funItems.push(parsed.item);
        continue;
      }

      if (parsed.kind === "meta") {
        pinnedNoteIds = Array.isArray(parsed.pinnedNoteIds) ? parsed.pinnedNoteIds : [];
        summaryPreview = typeof parsed.summaryPreview === "string" ? parsed.summaryPreview : "";
        postedDecisionId = typeof parsed.postedDecisionId === "string" ? parsed.postedDecisionId : null;
      }
    } catch {
      if (sticker.type === "NOTE") {
        notes.push({
          id: sticker.id,
          author: "Teammate",
          text: sticker.content,
          category: "general",
          color: sticker.color ?? "#d1c4e9",
          x: sticker.x,
          y: sticker.y,
          width: sticker.width ?? 180,
          height: sticker.height ?? 130,
        });
      }
    }
  }

  return {
    notes,
    funItems,
    pinnedNoteIds,
    summaryPreview,
    postedDecisionId,
  };
}
