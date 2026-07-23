"use client";

import { useState } from "react";
import LottieEmoji from "@/app/__components/idea-board/lottieEmoji";
import { EMOJI_TOOLS } from "@/app/__components/idea-board/constants";
import type { SelectedBoardTool } from "@/app/__components/idea-board/types";
import { getToolButtonClass, isToolSelected } from "./toolButtonClass";

const TOOL_PREVIEW_COUNT = 6;

export function EmojiToolPanel({
  selectedTool,
  onSelectTool,
}: {
  selectedTool: SelectedBoardTool | null;
  onSelectTool: (toolKind: "emoji", value: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderEmojiButton = (emojiTool: (typeof EMOJI_TOOLS)[number], keyPrefix = "") => (
    <button
      key={`${keyPrefix}${emojiTool.id}`}
      type="button"
      onClick={() => onSelectTool("emoji", emojiTool.id)}
      className={`${getToolButtonClass(isToolSelected(selectedTool, "emoji", emojiTool.id))} tf-board-tool-btn--emoji`}
      aria-label={`Select ${emojiTool.label} emoji`}
    >
      <LottieEmoji
        src={emojiTool.lottieSrc}
        fallback={emojiTool.fallback}
        className="h-7 w-7"
        ariaLabel={emojiTool.label}
      />
    </button>
  );

  return (
    <section className="tf-board-tools-section mt-3">
      <p className="tf-board-tools-title">Emoji</p>
      <div className="tf-board-tools-grid mt-2 grid-cols-6">
        {EMOJI_TOOLS.slice(0, TOOL_PREVIEW_COUNT).map((emojiTool) =>
          renderEmojiButton(emojiTool),
        )}
      </div>
      {EMOJI_TOOLS.length > TOOL_PREVIEW_COUNT ? (
        <>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="tf-board-tools-expand-link mt-2"
          >
            {isExpanded
              ? "Show less"
              : `Show ${EMOJI_TOOLS.length - TOOL_PREVIEW_COUNT} more`}
          </button>
          {isExpanded ? (
            <div className="tf-board-tools-expand-grid mt-2 grid-cols-5">
              {EMOJI_TOOLS.slice(TOOL_PREVIEW_COUNT).map((emojiTool) =>
                renderEmojiButton(emojiTool, "more-"),
              )}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
