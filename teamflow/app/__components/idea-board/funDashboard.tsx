"use client";

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
  onToggleAdmin,
  onTogglePinMode,
  onGenerateSummary,
  onSelectTool,
  onChangeTextStyle,
  onChangeShapeStyle,
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
        onToggleAdmin={onToggleAdmin}
        onTogglePinMode={onTogglePinMode}
        onGenerateSummary={onGenerateSummary}
      />
    </aside>
  );
}
