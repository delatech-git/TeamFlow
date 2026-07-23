import type { MouseEvent } from "react";
import type { ResizeHandle } from "@/app/__components/idea-board/types";
import LottieEmoji from "@/app/__components/idea-board/lottieEmoji";
import SelectionControls from "@/app/__components/idea-board/canvas/selectionControls";
import ShapePreview from "@/app/__components/idea-board/canvas/shapePreview";
import { getEmojiToolByValue } from "@/app/__components/idea-board/constants";
import type { FunItem, ShapeItemStyle, TextItemStyle } from "@/src/entities/models/idea-board";

type FunCanvasItemProps = {
  item: FunItem;
  textStyle: TextItemStyle;
  shapeStyle: ShapeItemStyle;
  isSelected: boolean;
  isEditingText: boolean;
  editingTextValue: string;
  onMouseDown: (event: MouseEvent<HTMLElement>) => void;
  onDoubleClick: () => void;
  onClick: () => void;
  onEditingTextChange: (value: string) => void;
  onSaveEditing: () => void;
  onStartResize: (handle: ResizeHandle, event: MouseEvent<HTMLButtonElement>) => void;
  onStartRotate: (event: MouseEvent<HTMLButtonElement>) => void;
  onDuplicate: () => void;
};

export default function FunCanvasItem({
  item,
  textStyle,
  shapeStyle,
  isSelected,
  isEditingText,
  editingTextValue,
  onMouseDown,
  onDoubleClick,
  onClick,
  onEditingTextChange,
  onSaveEditing,
  onStartResize,
  onStartRotate,
  onDuplicate,
}: FunCanvasItemProps) {
  const itemRotation = item.rotation ?? 0;
  const emojiTool = item.kind === "emoji" ? getEmojiToolByValue(item.value) : null;

  return (
    <div
      data-canvas-item="true"
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
      className={[
        "group absolute grid cursor-move place-items-center",
        item.kind === "shape" ? "rounded-md" : item.kind === "emoji" ? "rounded-full" : "",
      ].join(" ")}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        boxShadow: isSelected ? "0 0 0 2px rgba(94,228,255,0.75)" : "none",
        fontSize: item.kind === "text" ? `${textStyle.fontSize}px` : undefined,
        color: item.kind === "text" ? textStyle.color : undefined,
        transform: `rotate(${itemRotation}deg)`,
        transformOrigin: "center",
      }}
    >
      {item.kind === "text" && isEditingText ? (
        <textarea
          autoFocus
          value={editingTextValue}
          onChange={(event) => onEditingTextChange(event.target.value)}
          onBlur={onSaveEditing}
          className="h-full w-full resize-none border-0 bg-transparent px-1 py-0 text-sm text-inherit caret-current outline-none"
        />
      ) : item.kind === "shape" ? (
        <ShapePreview shapeType={item.shapeType ?? "rectangle"} shapeStyle={shapeStyle} />
      ) : item.kind === "emoji" ? (
        emojiTool ? (
          <LottieEmoji
            src={emojiTool.lottieSrc}
            fallback={emojiTool.fallback}
            className="pointer-events-none h-full w-full"
            ariaLabel={emojiTool.label}
          />
        ) : (
          <span aria-label="emoji item" className="leading-none">
            {item.value}
          </span>
        )
      ) : (
        <span
          aria-label={`${item.kind} item`}
          className={item.kind === "text" ? "w-full break-words whitespace-pre-wrap px-1 text-center font-medium leading-tight" : "leading-none"}
        >
          {item.value}
        </span>
      )}
      {isSelected ? (
        <SelectionControls
          rotation={itemRotation}
          resizeLabelPrefix="canvas item"
          onStartResize={onStartResize}
          onStartRotate={onStartRotate}
          onDuplicate={onDuplicate}
        />
      ) : null}
    </div>
  );
}
