"use client";

import Link from "next/link";
import type { StickyNote } from "@/src/entities/models/idea-board";

export function SummaryPanel({
  isAdminMode,
  isPinMode,
  pinnedNoteIds,
  notes,
  postedDecisionId,
  plannedIdeasHref,
  onToggleAdmin,
  onTogglePinMode,
  onGenerateSummary,
}: {
  isAdminMode: boolean;
  isPinMode: boolean;
  pinnedNoteIds: string[];
  notes: StickyNote[];
  postedDecisionId: string | null;
  plannedIdeasHref: string;
  onToggleAdmin: (checked: boolean) => void;
  onTogglePinMode: () => void;
  onGenerateSummary: () => void | Promise<void>;
}) {
  return (
    <section className="tf-board-tools-section mt-3">
      <div className="flex items-center justify-between gap-3">
        <p className="tf-board-tools-title">AI Summary</p>
        <label className="tf-board-admin-label">
          <input
            type="checkbox"
            checked={isAdminMode}
            onChange={(event) => onToggleAdmin(event.target.checked)}
          />
          Admin
        </label>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isPinMode}
        disabled={!isAdminMode}
        onClick={onTogglePinMode}
        className={[
          "tf-board-pin-toggle mt-2",
          isPinMode ? "tf-board-pin-toggle--active" : "",
        ].join(" ")}
      >
        <span>{isPinMode ? "Pin mode" : "Enable pin mode"}</span>
        <span
          className={[
            "relative inline-flex h-5 w-9 shrink-0 rounded-full transition",
            isPinMode ? "bg-amber-300/80" : "bg-slate-300",
          ].join(" ")}
          aria-hidden
        >
          <span
            className={[
              "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
              isPinMode ? "translate-x-4" : "translate-x-0",
            ].join(" ")}
          />
        </span>
      </button>

      <p className="tf-board-meta-text mt-2 text-xs">
        Selected ideas for planning: {pinnedNoteIds.length}
      </p>
      <div className="mt-2 max-h-24 space-y-1 overflow-y-auto pr-1 text-xs">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="tf-board-pinned-row">
              <span className="tf-board-note-text truncate">
                {note.text || "Empty sticky note"}
              </span>
              {pinnedNoteIds.includes(note.id) ? (
                <span className="ml-auto text-xs text-amber-700">Pinned</span>
              ) : null}
            </div>
          ))
        ) : (
          <p className="tf-board-meta-text">No sticky notes on board yet.</p>
        )}
      </div>

      <button
        type="button"
        disabled={!isAdminMode || pinnedNoteIds.length === 0}
        onClick={onGenerateSummary}
        className="tf-board-summary-btn mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        Generate planned guide
      </button>
      {postedDecisionId ? (
        <div className="tf-board-posted-box mt-2">
          <p>Posted to planned ideas.</p>
          <Link
            href={plannedIdeasHref}
            className="tf-board-posted-link mt-1 inline-flex text-[11px] font-semibold underline underline-offset-2"
          >
            Open Planned ideas
          </Link>
        </div>
      ) : null}
    </section>
  );
}
