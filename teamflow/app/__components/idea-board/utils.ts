import type { DragPayload } from "@/src/entities/models/idea-board";

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function readDragPayload(raw: string): DragPayload | null {
  try {
    const parsed = JSON.parse(raw) as DragPayload;
    if (
      parsed.kind === "note" ||
      parsed.kind === "fun" ||
      parsed.kind === "tool" ||
      parsed.kind === "noteTool"
    ) {
      if (parsed.kind === "tool") {
        if (!("toolKind" in parsed) || !("value" in parsed)) return null;
      }
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
