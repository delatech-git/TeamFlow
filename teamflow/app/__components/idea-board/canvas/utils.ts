import type { ResizeHandle } from "@/app/__components/idea-board/types";
import { FUN_ITEM_SIZE } from "@/app/__components/idea-board/constants";
import { clamp } from "@/app/__components/idea-board/utils";
import type {
  FunItem,
  ShapeItemStyle,
  ShapeType,
  TextItemStyle,
} from "@/src/entities/models/idea-board";

export const CANVAS_WIDTH = 2200;
export const CANVAS_HEIGHT = 1400;
export const SHAPE_DEFAULT_WIDTH = 120;
export const SHAPE_DEFAULT_HEIGHT = 80;
const TEXT_MIN_WIDTH = 28;
const TEXT_MAX_WIDTH = 960;
const TEXT_MIN_HEIGHT = 28;

export const DEFAULT_TEXT_STYLE: TextItemStyle = {
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

export const DEFAULT_SHAPE_STYLE: ShapeItemStyle = {
  bordered: true,
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "#ffffff",
  background: "#8b7cff",
  backgroundOpacity: 1,
};

export function getTextItemSize(text: string, fontSize: number) {
  const normalizedText = text.trim().length > 0 ? text : "Type here...";
  const lines = normalizedText.split("\n");
  const longestLineLength = Math.max(...lines.map((line) => line.length), 1);
  const lineCount = Math.max(lines.length, 1);
  const width = clamp(Math.round(longestLineLength * fontSize * 0.62 + fontSize * 0.8), TEXT_MIN_WIDTH, TEXT_MAX_WIDTH);
  const height = Math.max(TEXT_MIN_HEIGHT, Math.round(fontSize * 1.4 * lineCount));
  return { width, height };
}

export function getDefaultItemSize(kind: FunItem["kind"], value: string) {
  if (kind === "text") {
    return getTextItemSize(value, DEFAULT_TEXT_STYLE.fontSize);
  }
  if (kind === "shape") {
    if (value === "line") return { width: 180, height: 8 };
    if (value === "circle") return { width: 96, height: 96 };
    if (value === "diamond" || value === "pentagon" || value === "hexagon" || value === "star") {
      return { width: 96, height: 96 };
    }
    if (value === "arrow") return { width: 150, height: 96 };
    return { width: SHAPE_DEFAULT_WIDTH, height: SHAPE_DEFAULT_HEIGHT };
  }
  return { width: FUN_ITEM_SIZE, height: FUN_ITEM_SIZE };
}

export function getResizedRect(params: {
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  deltaX: number;
  deltaY: number;
  handle: ResizeHandle;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}) {
  const {
    startX,
    startY,
    startWidth,
    startHeight,
    deltaX,
    deltaY,
    handle,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
  } = params;

  const roundDeltaX = Math.round(deltaX);
  const roundDeltaY = Math.round(deltaY);
  const startRight = startX + startWidth;
  const startBottom = startY + startHeight;
  const isLeftHandle = handle === "nw" || handle === "sw" || handle === "w";
  const isRightHandle = handle === "ne" || handle === "se" || handle === "e";
  const isTopHandle = handle === "nw" || handle === "ne" || handle === "n";
  const isBottomHandle = handle === "sw" || handle === "se" || handle === "s";
  const changesWidth = isLeftHandle || isRightHandle;
  const changesHeight = isTopHandle || isBottomHandle;

  const rawWidth = changesWidth ? (isLeftHandle ? startWidth - roundDeltaX : startWidth + roundDeltaX) : startWidth;
  const rawHeight = changesHeight ? (isTopHandle ? startHeight - roundDeltaY : startHeight + roundDeltaY) : startHeight;
  const maxWidthFromBounds = isLeftHandle ? startRight - 8 : CANVAS_WIDTH - 8 - startX;
  const maxHeightFromBounds = isTopHandle ? startBottom - 8 : CANVAS_HEIGHT - 8 - startY;
  const boundedMaxWidth = Math.max(minWidth, Math.min(maxWidth, maxWidthFromBounds));
  const boundedMaxHeight = Math.max(minHeight, Math.min(maxHeight, maxHeightFromBounds));
  const nextWidth = changesWidth ? clamp(rawWidth, minWidth, boundedMaxWidth) : startWidth;
  const nextHeight = changesHeight ? clamp(rawHeight, minHeight, boundedMaxHeight) : startHeight;
  const nextX = isLeftHandle ? startRight - nextWidth : startX;
  const nextY = isTopHandle ? startBottom - nextHeight : startY;

  return { x: nextX, y: nextY, width: nextWidth, height: nextHeight };
}

export function getResizeCursor(handle: ResizeHandle, rotation: number) {
  const baseAngles: Record<ResizeHandle, number> = {
    nw: 225,
    ne: 315,
    se: 45,
    sw: 135,
    n: 270,
    s: 90,
    w: 180,
    e: 0,
  };
  const angle = normalizeFullAngle(baseAngles[handle] + rotation);
  const directions = ["e-resize", "se-resize", "s-resize", "sw-resize", "w-resize", "nw-resize", "n-resize", "ne-resize"];
  const directionIndex = Math.round(angle / 45) % directions.length;
  return directions[directionIndex];
}

function normalizeFullAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

export function toLocalDelta(pointerDeltaX: number, pointerDeltaY: number, rotation: number) {
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    deltaX: pointerDeltaX * cos + pointerDeltaY * sin,
    deltaY: -pointerDeltaX * sin + pointerDeltaY * cos,
  };
}

export function getPointerAngle(pointerX: number, pointerY: number, centerX: number, centerY: number) {
  return (Math.atan2(pointerY - centerY, pointerX - centerX) * 180) / Math.PI;
}

export function normalizeAngleDelta(delta: number) {
  return ((delta + 540) % 360) - 180;
}

export function normalizeRotation(rotation: number) {
  return ((rotation % 360) + 360) % 360;
}

export function withOpacity(color: string, opacity: number) {
  if (!color.startsWith("#")) return color;
  const clampedOpacity = clamp(opacity, 0, 1);
  const hex = color.slice(1);
  const normalizedHex = hex.length === 3 ? hex.split("").map((char) => `${char}${char}`).join("") : hex;

  if (normalizedHex.length !== 6) return color;
  const red = Number.parseInt(normalizedHex.slice(0, 2), 16);
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16);

  if ([red, green, blue].some(Number.isNaN)) return color;
  return `rgba(${red}, ${green}, ${blue}, ${clampedOpacity})`;
}

export function getShapeFill(shapeType: ShapeType, shapeStyle: ShapeItemStyle) {
  const strokeWidth = shapeStyle.bordered ? Math.max(0, shapeStyle.borderWidth) : 0;
  const stroke = shapeStyle.bordered ? shapeStyle.borderColor : "transparent";
  const fill = withOpacity(shapeStyle.background, shapeStyle.backgroundOpacity);
  const strokeDasharray =
    shapeStyle.borderStyle === "dashed" ? "10 6" : shapeStyle.borderStyle === "dotted" ? "2 6" : undefined;

  return { shapeType, strokeWidth, stroke, fill, strokeDasharray };
}
