"use client";

import type { CSSProperties } from "react";
import { PanelLeftClose } from "lucide-react";
import type { NotebookPadProps } from "@/app/__components/idea-board/types";
import { NOTE_PAD_COLORS } from "@/app/__components/idea-board/constants";

export default function NotebookPad({ onNoteToolDragStart, onCollapse }: NotebookPadProps) {
  const swatchTilts = [-2.6, 1.8, -1.4, 2.2, -1.8, 1.2];

  return (
    <div className="tf-sticky-stack-panel">
      <div className="tf-sticky-stack-panel__header">
        <div className="flex items-center justify-between gap-2">
          <p className="tf-sticky-stack-panel__badge">Sticky Stack</p>
          <button
            type="button"
            onClick={onCollapse}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"
            aria-label="Hide sticky stack"
            title="Hide sticky stack"
          >
            <PanelLeftClose size={16} aria-hidden />
          </button>
        </div>
        <p className="tf-sticky-stack-panel__hint">Drag a note to the canvas</p>
      </div>

      <div className="tf-sticky-stack-preview" aria-hidden="true">
        <span className="tf-sticky-stack-preview__layer tf-sticky-stack-preview__layer--back" />
        <span className="tf-sticky-stack-preview__layer tf-sticky-stack-preview__layer--middle" />
        <span className="tf-sticky-stack-preview__layer tf-sticky-stack-preview__layer--front" />
      </div>

      <div className="tf-sticky-stack-grid">
        {NOTE_PAD_COLORS.map((color, index) => (
          <div
            key={color}
            draggable
            onDragStart={onNoteToolDragStart(JSON.stringify({ kind: "noteTool", color }))}
            className="tf-sticky-stack-swatch"
            style={
              {
                backgroundColor: color,
                "--tf-sticky-swatch-tilt": `${swatchTilts[index % swatchTilts.length]}deg`,
              } as CSSProperties
            }
            aria-label={`Drag sticky color ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
