import type { SelectedBoardTool } from "@/app/__components/idea-board/types";
import type { FunItem } from "@/src/entities/models/idea-board";

export function isToolSelected(
  selectedTool: SelectedBoardTool | null,
  toolKind: FunItem["kind"],
  value: string,
) {
  return selectedTool?.toolKind === toolKind && selectedTool.value === value;
}

export function getToolButtonClass(
  isActive: boolean,
  shape: "round" | "square" = "round",
) {
  return [
    "tf-board-tool-btn",
    shape === "round" ? "tf-board-tool-btn--round" : "tf-board-tool-btn--square",
    isActive ? "tf-board-tool-btn--active" : "",
  ].join(" ");
}
