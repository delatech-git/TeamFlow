import type { MouseEvent } from "react";
import type { ResizeHandle } from "@/app/__components/idea-board/types";
import SelectionControls from "@/app/__components/idea-board/canvas/selectionControls";
import type { StickyNote } from "@/src/entities/models/idea-board";

type StickyNoteCardProps = {
  note: StickyNote;
  isSelected: boolean;
  isPinned: boolean;
  isPinMode: boolean;
  isEditing: boolean;
  editingText: string;
  onMouseDown: (event: MouseEvent<HTMLElement>) => void;
  onDoubleClick: () => void;
  onStartEditing: () => void;
  onEditingTextChange: (value: string) => void;
  onSaveEditing: () => void;
  onStartResize: (handle: ResizeHandle, event: MouseEvent<HTMLButtonElement>) => void;
  onStartRotate: (event: MouseEvent<HTMLButtonElement>) => void;
  onDuplicate: () => void;
};

export default function StickyNoteCard({
  note,
  isSelected,
  isPinned,
  isPinMode,
  isEditing,
  editingText,
  onMouseDown,
  onDoubleClick,
  onStartEditing,
  onEditingTextChange,
  onSaveEditing,
  onStartResize,
  onStartRotate,
  onDuplicate,
}: StickyNoteCardProps) {
  const noteRotation = note.rotation ?? 0;

  return (
    <article
      data-canvas-item="true"
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      className={[
        "group absolute rounded-xl border border-black/15 p-3 text-sm text-[#2c213f] shadow-[0_18px_30px_rgba(3,8,26,0.32)] backdrop-blur-[1px]",
        isSelected ? "ring-2 ring-[rgba(94,228,255,0.85)]" : "",
        isPinMode ? "cursor-pointer" : "cursor-move",
      ].join(" ")}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        backgroundColor: note.color,
        boxShadow: isPinned ? "0 0 0 3px rgba(251, 191, 36, 0.65), 0 16px 24px rgba(6,4,18,0.22)" : "0 16px 24px rgba(6,4,18,0.22)",
        transform: `rotate(${noteRotation}deg)`,
        transformOrigin: "center",
      }}
    >
      {isEditing ? (
        <textarea
          autoFocus
          value={editingText}
          onChange={(event) => onEditingTextChange(event.target.value)}
          onBlur={onSaveEditing}
          className="min-h-[72px] w-full resize-none rounded-md border border-black/15 bg-white/75 p-2 text-sm leading-5 text-[#2c213f] outline-none"
          placeholder="Write your suggestion..."
        />
      ) : (
        <p className="leading-5" onClick={onStartEditing}>
          {note.text || "Click to write..."}
        </p>
      )}
      <p className="pointer-events-none absolute left-2 -bottom-5 text-[11px] font-semibold uppercase tracking-wide text-[#4b3e65]/90">
        {note.category} - {note.author}
      </p>
      {isPinned ? (
        <span
          className="absolute -left-2 -top-2 grid min-w-9 place-items-center rounded-full border border-amber-300 bg-amber-400/90 px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#2f1d00]"
          aria-label="Sticky note pinned for summary"
        >
          PIN
        </span>
      ) : null}
      {isSelected ? (
        <SelectionControls
          rotation={noteRotation}
          resizeLabelPrefix="sticky note"
          onStartResize={onStartResize}
          onStartRotate={onStartRotate}
          onDuplicate={onDuplicate}
        />
      ) : null}
    </article>
  );
}
