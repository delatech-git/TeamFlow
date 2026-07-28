"use client";

import { Waypoints } from "lucide-react";
import type { FunDashboardProps } from "@/app/__components/idea-board/types";
import { EmojiToolPanel } from "@/app/__components/idea-board/dashboard/emojiToolPanel";
import { ElementsToolPanel } from "@/app/__components/idea-board/dashboard/elementsToolPanel";
import { SummaryPanel } from "@/app/__components/idea-board/dashboard/summaryPanel";

export default function FunDashboard({
  isAdminMode,
  isPinMode,
  pinnedNoteIds,
  notes,
  postedDecisionId,
  plannedIdeasHref,
  selectedTextItem,
  selectedShapeItem,
  selectedTool,
  isGeneratingGuide,
  isConnectMode,
  connectFromItem,
  onTogglePinMode,
  onGenerateSummary,
  onSelectTool,
  onChangeTextStyle,
  onChangeShapeStyle,
  onToggleConnectMode,
}: FunDashboardProps) {
  return (
    <aside
      className="tf-board-right-panel tf-board-tools-panel fixed bottom-4 right-4 top-28 z-30 hidden w-76 overflow-y-auto p-3.5 lg:block"
      style={{ animationDelay: "90ms" }}
    >
      <div className="space-y-2">
        <p className="tf-board-tools-badge">Board Tools</p>
        <p className="tf-board-tools-hint">
          Pick a tool, then click anywhere on the board to place it.
        </p>
      </div>

      <button
        type="button"
        onClick={onToggleConnectMode}
        className={[
          "inline-flex w-full items-center justify-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold shadow-sm transition",
          isConnectMode
            ? "border-sky-400/70 bg-sky-700/70 text-sky-50"
            : "border-sky-500/50 bg-sky-800/60 text-white hover:bg-sky-800/80",
        ].join(" ")}
      >
        <Waypoints size={12} aria-hidden />
        {isConnectMode
          ? connectFromItem
            ? "Click the second item"
            : "Click first item to connect"
          : "Connect items"}
      </button>

      <EmojiToolPanel selectedTool={selectedTool} onSelectTool={onSelectTool} />

      <ElementsToolPanel
        selectedTool={selectedTool}
        selectedShapeItem={selectedShapeItem}
        selectedTextItem={selectedTextItem}
        onSelectTool={onSelectTool}
        onChangeShapeStyle={onChangeShapeStyle}
        onChangeTextStyle={onChangeTextStyle}
      />

      <SummaryPanel
        isAdminMode={isAdminMode}
        isPinMode={isPinMode}
        pinnedNoteIds={pinnedNoteIds}
        notes={notes}
        postedDecisionId={postedDecisionId}
        plannedIdeasHref={plannedIdeasHref}
        isGeneratingGuide={isGeneratingGuide}
        onTogglePinMode={onTogglePinMode}
        onGenerateSummary={onGenerateSummary}
      />
    </aside>
  );
}
