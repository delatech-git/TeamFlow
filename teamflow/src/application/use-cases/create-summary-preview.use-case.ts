import type { StickyNote } from "@/src/entities/models/idea-board";

/** Client-side summary text from pinned notes (no network call). */
export function createSummaryPreview(
  ideaTitle: string,
  pinnedNotes: StickyNote[],
  _allNotes: StickyNote[],
): string {
  if (pinnedNotes.length === 0) {
    return `No pinned notes yet for "${ideaTitle}". Pin notes on the board, then summarize.`;
  }
  const bullets = pinnedNotes.map((n) => `• ${n.text || "(empty note)"}`).join("\n");
  return `Summary for "${ideaTitle}":\n\n${bullets}`;
}
