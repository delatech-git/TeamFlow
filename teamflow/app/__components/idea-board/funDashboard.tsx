"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { FunDashboardProps } from "@/app/__components/idea-board/types";
import LottieEmoji from "@/app/__components/idea-board/lottieEmoji";
import { EMOJI_TOOLS, SHAPE_TOOLS } from "@/app/__components/idea-board/constants";
import type { FunItem, ShapeItemStyle, TextItemStyle } from "@/src/entities/models/idea-board";

const TOOL_PREVIEW_COUNT = 6;
const SHAPE_PREVIEW_COUNT = 1;

export default function FunDashboard({
  isAdminMode,
  isPinMode,
  pinnedNoteIds,
  notes,
  summaryPreview,
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
  const activeTextStyle = getTextStyle(selectedTextItem);
  const activeShapeStyle = getShapeStyle(selectedShapeItem);
  const [isEmojiExpanded, setIsEmojiExpanded] = useState(false);
  const [isShapeExpanded, setIsShapeExpanded] = useState(false);
  const panelSectionClass = "tf-board-tools-section mt-3";
  const isToolSelected = (toolKind: FunItem["kind"], value: string) =>
    selectedTool?.toolKind === toolKind && selectedTool.value === value;
  const getToolButtonClass = (isActive: boolean, shape: "round" | "square" = "round") =>
    [
      "tf-board-tool-btn",
      shape === "round" ? "tf-board-tool-btn--round" : "tf-board-tool-btn--square",
      isActive ? "tf-board-tool-btn--active" : "",
    ].join(" ");

  return (
    <aside
      className="tf-board-right-panel tf-board-tools-panel fixed bottom-4 right-4 top-28 z-30 hidden w-[304px] overflow-y-auto p-3.5 lg:block"
      style={{ animationDelay: "90ms" }}
    >
      <div className="space-y-2">
        <p className="tf-board-tools-badge">Board Tools</p>
        <p className="tf-board-tools-hint">Pick a tool, then click anywhere on the board to place it.</p>
      </div>

      <section className={panelSectionClass}>
        <p className="tf-board-tools-title">Emoji</p>
        <div className="tf-board-tools-grid mt-2 grid-cols-6">
          {EMOJI_TOOLS.slice(0, TOOL_PREVIEW_COUNT).map((emojiTool) => (
            <button
              key={emojiTool.id}
              type="button"
              onClick={() => onSelectTool("emoji", emojiTool.id)}
              className={`${getToolButtonClass(isToolSelected("emoji", emojiTool.id))} tf-board-tool-btn--emoji`}
              aria-label={`Select ${emojiTool.label} emoji`}
            >
              <LottieEmoji src={emojiTool.lottieSrc} fallback={emojiTool.fallback} className="h-7 w-7" ariaLabel={emojiTool.label} />
            </button>
          ))}
        </div>
        {EMOJI_TOOLS.length > TOOL_PREVIEW_COUNT ? (
          <>
            <button
              type="button"
              onClick={() => setIsEmojiExpanded((prev) => !prev)}
              className="tf-board-tools-expand-link mt-2"
            >
              {isEmojiExpanded ? "Show less" : `Show ${EMOJI_TOOLS.length - TOOL_PREVIEW_COUNT} more`}
            </button>
            {isEmojiExpanded ? (
              <div className="tf-board-tools-expand-grid mt-2 grid-cols-5">
                {EMOJI_TOOLS.slice(TOOL_PREVIEW_COUNT).map((emojiTool) => (
                  <button
                    key={`more-${emojiTool.id}`}
                    type="button"
                    onClick={() => onSelectTool("emoji", emojiTool.id)}
                    className={`${getToolButtonClass(isToolSelected("emoji", emojiTool.id))} tf-board-tool-btn--emoji`}
                    aria-label={`Select ${emojiTool.label} emoji`}
                  >
                    <LottieEmoji
                      src={emojiTool.lottieSrc}
                      fallback={emojiTool.fallback}
                      className="h-7 w-7"
                      ariaLabel={emojiTool.label}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </section>

      <section className={panelSectionClass}>
        <p className="tf-board-tools-title">Elements</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            {SHAPE_TOOLS.slice(0, SHAPE_PREVIEW_COUNT).map((shape) => (
              <button
                key={shape.type}
                type="button"
                onClick={() => onSelectTool("shape", shape.type)}
                className={getToolButtonClass(isToolSelected("shape", shape.type), "square")}
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
                <ChevronDown className={["h-4 w-4 transition-transform", isShapeExpanded ? "rotate-180" : ""].join(" ")} />
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onSelectTool("text", "")}
            className={getToolButtonClass(isToolSelected("text", ""), "square")}
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
                className={getToolButtonClass(isToolSelected("shape", shape.type), "square")}
                aria-label={`Select ${shape.label}`}
                title={shape.label}
              >
                <span aria-hidden>{shape.icon}</span>
              </button>
            ))}
          </div>
        ) : null}
        {selectedShapeItem && selectedShapeItem.kind === "shape" ? (
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
                    onChangeShapeStyle({ borderStyle: event.target.value as ShapeItemStyle["borderStyle"], bordered: true })
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
                  onChange={(event) => onChangeShapeStyle({ borderColor: event.target.value, bordered: true })}
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
                    onChange={(event) => onChangeShapeStyle({ backgroundOpacity: Number(event.target.value) / 100 })}
                  />
                  <span className="tf-board-control-value w-10 text-right text-[11px]">
                    {Math.round(activeShapeStyle.backgroundOpacity * 100)}%
                  </span>
                </div>
              </label>
          </div>
        ) : null}

        {selectedTextItem && selectedTextItem.kind === "text" ? (
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
      <section className={panelSectionClass}>
        <div className="flex items-center justify-between gap-3">
          <p className="tf-board-tools-title">AI Summary</p>
          <label className="tf-board-admin-label">
            <input type="checkbox" checked={isAdminMode} onChange={(event) => onToggleAdmin(event.target.checked)} />
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

        <p className="tf-board-meta-text mt-2 text-xs">Pinned notes: {pinnedNoteIds.length}</p>
        <div className="mt-2 max-h-24 space-y-1 overflow-y-auto pr-1 text-xs">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className="tf-board-pinned-row">
                <span className="tf-board-note-text truncate">{note.text || "Empty sticky note"}</span>
                {pinnedNoteIds.includes(note.id) ? <span className="ml-auto text-xs text-amber-700">Pinned</span> : null}
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
          Summarize pinned notes
        </button>
        {summaryPreview ? (
          <p className="tf-board-summary-preview mt-2">
            {summaryPreview}
          </p>
        ) : null}
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
    </aside>
  );
}

function normalizeColor(color?: string) {
  if (!color) return "#ffffff";
  if (color.startsWith("#")) return color;
  return "#ffffff";
}

function getTextStyle(item: FunItem | null): TextItemStyle {
  const base: TextItemStyle = {
    fontSize: 16,
    color: "#000000",
    bold: false,
    italic: false,
    underline: false,
    bordered: false,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#3d2d78",
    background: "#ffffff",
    backgroundOpacity: 1,
  };

  if (!item || item.kind !== "text") return base;
  return { ...base, ...(item.textStyle ?? {}) };
}

function getShapeStyle(item: FunItem | null): ShapeItemStyle {
  const base: ShapeItemStyle = {
    bordered: true,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "#ffffff",
    background: "#8b7cff",
    backgroundOpacity: 1,
  };

  if (!item || item.kind !== "shape") return base;
  return { ...base, ...(item.shapeStyle ?? {}) };
}
