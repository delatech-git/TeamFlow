"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SHAPE_TOOLS } from "@/app/__components/idea-board/constants";
import { DEFAULT_SHAPE_STYLE, DEFAULT_TEXT_STYLE } from "@/app/__components/idea-board/canvas/utils";
import type { SelectedBoardTool } from "@/app/__components/idea-board/types";
import type {
  FunItem,
  ShapeItemStyle,
  TextItemStyle,
} from "@/src/entities/models/idea-board";
import { getToolButtonClass, isToolSelected } from "./toolButtonClass";

const SHAPE_PREVIEW_COUNT = 1;

function normalizeColor(color?: string) {
  if (!color) return "#ffffff";
  return color.startsWith("#") ? color : "#ffffff";
}

export function ElementsToolPanel({
  selectedTool,
  selectedShapeItem,
  selectedTextItem,
  onSelectTool,
  onChangeShapeStyle,
  onChangeTextStyle,
}: {
  selectedTool: SelectedBoardTool | null;
  selectedShapeItem: FunItem | null;
  selectedTextItem: FunItem | null;
  onSelectTool: (toolKind: FunItem["kind"], value: string) => void;
  onChangeShapeStyle: (patch: Partial<ShapeItemStyle>) => void;
  onChangeTextStyle: (patch: Partial<TextItemStyle>) => void;
}) {
  const [isShapeExpanded, setIsShapeExpanded] = useState(false);
  const activeShapeStyle: ShapeItemStyle =
    selectedShapeItem?.kind === "shape"
      ? { ...DEFAULT_SHAPE_STYLE, ...selectedShapeItem.shapeStyle }
      : DEFAULT_SHAPE_STYLE;
  const activeTextStyle: TextItemStyle =
    selectedTextItem?.kind === "text"
      ? { ...DEFAULT_TEXT_STYLE, ...selectedTextItem.textStyle }
      : DEFAULT_TEXT_STYLE;

  return (
    <section className="tf-board-tools-section mt-3">
      <p className="tf-board-tools-title">Elements</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          {SHAPE_TOOLS.slice(0, SHAPE_PREVIEW_COUNT).map((shape) => (
            <button
              key={shape.type}
              type="button"
              onClick={() => onSelectTool("shape", shape.type)}
              className={getToolButtonClass(
                isToolSelected(selectedTool, "shape", shape.type),
                "square",
              )}
              aria-label={`Select ${shape.label}`}
              title={shape.label}
            >
              <span aria-hidden>{shape.icon}</span>
            </button>
          ))}
          {SHAPE_TOOLS.length > SHAPE_PREVIEW_COUNT ? (
            <button
              type="button"
              onClick={() => setIsShapeExpanded((prev) => !prev)}
              className="tf-board-tools-chevron"
              aria-label={isShapeExpanded ? "Collapse shapes" : "Expand shapes"}
            >
              <ChevronDown
                className={[
                  "h-4 w-4 transition-transform",
                  isShapeExpanded ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onSelectTool("text", "")}
          className={getToolButtonClass(isToolSelected(selectedTool, "text", ""), "square")}
          aria-label="Select text tool"
          title="Text"
        >
          <span aria-hidden className="text-sm font-semibold">
            T
          </span>
        </button>
      </div>
      {isShapeExpanded ? (
        <div className="tf-board-tools-expand-grid mt-2 grid-cols-4">
          {SHAPE_TOOLS.slice(SHAPE_PREVIEW_COUNT).map((shape) => (
            <button
              key={`more-${shape.type}`}
              type="button"
              onClick={() => onSelectTool("shape", shape.type)}
              className={getToolButtonClass(
                isToolSelected(selectedTool, "shape", shape.type),
                "square",
              )}
              aria-label={`Select ${shape.label}`}
              title={shape.label}
            >
              <span aria-hidden>{shape.icon}</span>
            </button>
          ))}
        </div>
      ) : null}
      {selectedShapeItem?.kind === "shape" ? (
        <div className="tf-board-style-controls mt-3 space-y-2">
          <label className="flex items-center justify-between text-xs">
            <span className="tf-board-control-label-text">Border width</span>
            <input
              type="range"
              min={0}
              max={12}
              value={activeShapeStyle.borderWidth}
              onChange={(event) =>
                onChangeShapeStyle({
                  borderWidth: Number(event.target.value),
                  bordered: Number(event.target.value) > 0,
                })
              }
            />
          </label>
          <label className="flex items-center justify-between text-xs">
            <span className="tf-board-control-label-text">Border style</span>
            <select
              value={activeShapeStyle.borderStyle}
              onChange={(event) =>
                onChangeShapeStyle({
                  borderStyle: event.target.value as ShapeItemStyle["borderStyle"],
                  bordered: true,
                })
              }
              className="tf-board-control-select"
            >
              <option value="solid">solid</option>
              <option value="dashed">dashed</option>
              <option value="dotted">dotted</option>
            </select>
          </label>
          <label className="flex items-center justify-between text-xs">
            <span className="tf-board-control-label-text">Border color</span>
            <input
              type="color"
              value={normalizeColor(activeShapeStyle.borderColor)}
              onChange={(event) =>
                onChangeShapeStyle({ borderColor: event.target.value, bordered: true })
              }
              className="tf-board-control-color"
            />
          </label>
          <label className="flex items-center justify-between text-xs">
            <span className="tf-board-control-label-text">Background</span>
            <input
              type="color"
              value={normalizeColor(activeShapeStyle.background)}
              onChange={(event) => onChangeShapeStyle({ background: event.target.value })}
              className="tf-board-control-color"
            />
          </label>
          <label className="flex items-center justify-between text-xs">
            <span className="tf-board-control-label-text">Opacity</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(activeShapeStyle.backgroundOpacity * 100)}
                onChange={(event) =>
                  onChangeShapeStyle({
                    backgroundOpacity: Number(event.target.value) / 100,
                  })
                }
              />
              <span className="tf-board-control-value w-10 text-right text-[11px]">
                {Math.round(activeShapeStyle.backgroundOpacity * 100)}%
              </span>
            </div>
          </label>
        </div>
      ) : null}

      {selectedTextItem?.kind === "text" ? (
        <div className="tf-board-style-controls mt-3 space-y-2">
          <label className="flex items-center justify-between text-xs">
            <span className="tf-board-control-label-text">Size</span>
            <input
              type="range"
              min={12}
              max={72}
              value={activeTextStyle.fontSize}
              onChange={(event) => onChangeTextStyle({ fontSize: Number(event.target.value) })}
            />
          </label>
          <label className="flex items-center justify-between text-xs">
            <span className="tf-board-control-label-text">Text color</span>
            <input
              type="color"
              value={normalizeColor(activeTextStyle.color)}
              onChange={(event) => onChangeTextStyle({ color: event.target.value })}
              className="tf-board-control-color"
            />
          </label>
          <p className="tf-board-control-value text-[11px]">{activeTextStyle.fontSize}px</p>
        </div>
      ) : null}
    </section>
  );
}
