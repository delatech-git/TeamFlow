/** Domain types for the collaborative sticky-note board UI */

export type StickyNoteCategory =
  | "location"
  | "menu"
  | "allergies"
  | "schedule"
  | "music"
  | "general";

export type StickyNote = {
  id: string;
  author: string;
  text: string;
  category: StickyNoteCategory;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation?: number;
};

export type IdeaReaction = "love" | "party" | "fire" | "clap";

export type ShapeType =
  | "rectangle"
  | "circle"
  | "triangle"
  | "diamond"
  | "pentagon"
  | "hexagon"
  | "star"
  | "arrow"
  | "line";

export type TextItemStyle = {
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  bordered: boolean;
  borderWidth: number;
  borderStyle: "solid" | "dashed" | "dotted";
  borderColor: string;
  background: string;
  backgroundOpacity: number;
};

export type ShapeItemStyle = {
  bordered: boolean;
  borderWidth: number;
  borderStyle: "solid" | "dashed" | "dotted";
  borderColor: string;
  background: string;
  backgroundOpacity: number;
};

export type FunItem =
  | {
      id: string;
      kind: "emoji";
      value: string;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation?: number;
    }
  | {
      id: string;
      kind: "text";
      value: string;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation?: number;
      textStyle?: TextItemStyle;
    }
  | {
      id: string;
      kind: "shape";
      value: string;
      shapeType: ShapeType;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation?: number;
      shapeStyle?: ShapeItemStyle;
    };

export type DragPayload =
  | { kind: "note"; id: string }
  | { kind: "fun"; id: string }
  | { kind: "tool"; toolKind: "emoji" | "text" | "shape"; value: string }
  | { kind: "noteTool"; color: string };

export type IdeaBoardState = {
  notes: StickyNote[];
  funItems: FunItem[];
  pinnedNoteIds: string[];
  summaryPreview: string;
  postedDecisionId: string | null;
};
