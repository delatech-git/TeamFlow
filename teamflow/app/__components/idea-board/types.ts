import type { DragEvent } from "react";
import type { DiscoverIdea } from "@/src/entities/models/discover";
import type {
  FunItem,
  IdeaReaction,
  ShapeItemStyle,
  StickyNote,
  TextItemStyle,
} from "@/src/entities/models/idea-board";

export type IdeaBoardProps = { idea: DiscoverIdea };

export type SelectedCanvasItem = { kind: "note" | "fun"; id: string } | null;

export type ResizeTarget = "note" | "fun";

export type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "w" | "e";

export type RotateTarget = "note" | "fun";

export type MoveTarget = "note" | "fun";

export type RotatableCanvasItem = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

export type SelectedBoardTool = { toolKind: FunItem["kind"]; value: string };

export type FunDashboardProps = {
  isAdminMode: boolean;
  isPinMode: boolean;
  pinnedNoteIds: string[];
  notes: StickyNote[];
  summaryPreview: string;
  postedDecisionId: string | null;
  plannedIdeasHref: string;
  selectedTextItem: FunItem | null;
  selectedShapeItem: FunItem | null;
  selectedTool: SelectedBoardTool | null;
  onToggleAdmin: (checked: boolean) => void;
  onTogglePinMode: () => void;
  onGenerateSummary: () => void | Promise<void>;
  onSelectTool: (toolKind: FunItem["kind"], value: string) => void;
  onChangeTextStyle: (patch: Partial<TextItemStyle>) => void;
  onChangeShapeStyle: (patch: Partial<ShapeItemStyle>) => void;
};

export type NotebookPadProps = {
  onNoteToolDragStart: (payload: string) => (event: DragEvent<HTMLDivElement>) => void;
};
