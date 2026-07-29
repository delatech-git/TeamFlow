import {
  DEFAULT_SHAPE_STYLE,
  DEFAULT_TEXT_STYLE,
} from "@/app/__components/idea-board/canvas/utils";
import {
  getOrthogonalRoute,
  type RoutableRect,
} from "@/app/__components/idea-board/canvas/connectionRouting";
import { computeAutoLayout, COLUMN_GAP } from "@/app/__components/idea-board/autoLayout";
import type { ConnectionLabelResult } from "@/app/__components/idea-board/layoutApi";
import type {
  Connection,
  FunItem,
  StickyNote,
} from "@/src/entities/models/idea-board";

type ExportParams = {
  notes: StickyNote[];
  funItems: FunItem[];
  connections: Connection[];
  improvedLabels: ConnectionLabelResult;
  fileName: string;
};

type DrawableItem = RoutableRect & {
  id: string;
  fontSize: number;
};

const ARROW_COLOR = "#1e293b";
const ARROW_LENGTH = 10;
const ARROW_HALF_WIDTH = 4;

/** Draws multi-line text centered inside a box, wrapping to the box width. */
function drawCenteredText(
  pdf: import("jspdf").jsPDF,
  text: string,
  cx: number,
  cy: number,
  maxWidth: number,
  fontSize: number,
  color: string,
) {
  if (!text) return;
  pdf.setFontSize(fontSize);
  pdf.setTextColor(color);
  const lines = pdf.splitTextToSize(text, Math.max(10, maxWidth)) as string[];
  const lineHeight = fontSize * 1.15;
  const totalHeight = lines.length * lineHeight;
  const startY = cy - totalHeight / 2 + lineHeight / 2;
  lines.forEach((line, index) => {
    pdf.text(line, cx, startY + index * lineHeight, {
      align: "center",
      baseline: "middle",
    });
  });
}

function drawArrowhead(pdf: import("jspdf").jsPDF, from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy;
  const py = ux;
  const baseX = to.x - ux * ARROW_LENGTH;
  const baseY = to.y - uy * ARROW_LENGTH;
  pdf.setFillColor(ARROW_COLOR);
  pdf.triangle(
    to.x,
    to.y,
    baseX + px * ARROW_HALF_WIDTH,
    baseY + py * ARROW_HALF_WIDTH,
    baseX - px * ARROW_HALF_WIDTH,
    baseY - py * ARROW_HALF_WIDTH,
    "F",
  );
}

function drawNote(pdf: import("jspdf").jsPDF, note: StickyNote, box: DrawableItem) {
  pdf.setDrawColor("#d9d9d9");
  pdf.setFillColor(note.color || "#ffe082");
  pdf.setLineWidth(1);
  pdf.roundedRect(box.x, box.y, box.width, box.height, 10, 10, "FD");
  drawCenteredText(
    pdf,
    note.text || "",
    box.x + box.width / 2,
    box.y + box.height / 2,
    box.width - 16,
    box.fontSize,
    "#2c213f",
  );
}

function drawShape(pdf: import("jspdf").jsPDF, item: FunItem, box: DrawableItem) {
  if (item.kind !== "shape") return;
  const style = { ...DEFAULT_SHAPE_STYLE, ...item.shapeStyle };
  const drawStyle = style.bordered ? "FD" : "F";
  pdf.setFillColor(style.background || "#ffffff");
  pdf.setDrawColor(style.borderColor || "#000000");
  pdf.setLineWidth(style.bordered ? Math.max(0.5, style.borderWidth) : 0.01);

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  switch (item.shapeType) {
    case "circle":
      pdf.ellipse(cx, cy, box.width / 2, box.height / 2, drawStyle);
      break;
    case "triangle":
      pdf.triangle(
        cx,
        box.y,
        box.x + box.width,
        box.y + box.height,
        box.x,
        box.y + box.height,
        drawStyle,
      );
      break;
    case "diamond":
      pdf.lines(
        [
          [box.width / 2, -box.height / 2],
          [box.width / 2, box.height / 2],
          [-box.width / 2, box.height / 2],
        ],
        cx,
        box.y,
        [1, 1],
        drawStyle,
        true,
      );
      break;
    // ponytail: pentagon/hexagon/star drawn as rounded rects — true polygon
    // geometry skipped for this export, upgrade if exact shape fidelity matters.
    default:
      pdf.roundedRect(box.x, box.y, box.width, box.height, 6, 6, drawStyle);
      break;
  }

  drawCenteredText(pdf, item.label ?? "", cx, cy, box.width - 16, box.fontSize, style.textColor);
}

function drawTextItem(pdf: import("jspdf").jsPDF, item: FunItem, box: DrawableItem) {
  if (item.kind !== "text") return;
  const style = { ...DEFAULT_TEXT_STYLE, ...item.textStyle };
  pdf.setFont("helvetica", style.bold ? "bold" : "normal", style.italic ? "italic" : "normal");
  drawCenteredText(
    pdf,
    item.value,
    box.x + box.width / 2,
    box.y + box.height / 2,
    box.width - 8,
    box.fontSize,
    style.color,
  );
  pdf.setFont("helvetica", "normal");
}

function drawEmoji(pdf: import("jspdf").jsPDF, box: DrawableItem) {
  // ponytail: emoji glyphs aren't reliably embeddable in jsPDF's default
  // fonts, so emoji items render as a soft placeholder circle.
  pdf.setFillColor("#fde68a");
  pdf.ellipse(box.x + box.width / 2, box.y + box.height / 2, box.width / 2, box.height / 2, "F");
}

const LABEL_WIDTH = Math.min(140, COLUMN_GAP - 30);
const LABEL_HEIGHT = 24;

type Rect = { x: number; y: number; width: number; height: number };

function rectsOverlap(a: Rect, b: Rect) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

/** True when the route's middle segment runs vertically (i.e. the route is primarily horizontal). */
function isRouteHorizontalPrimary(points: { x: number; y: number }[]) {
  if (points.length === 2) return points[0].y === points[1].y;
  return points[1].x === points[2].x;
}

/** Nudges a label rect along the axis perpendicular to its route until it no longer overlaps a previously placed label. */
function placeLabelRect(
  center: { x: number; y: number },
  isHorizontalRoute: boolean,
  placed: Rect[],
): Rect {
  let cx = center.x;
  let cy = center.y;
  const step = LABEL_HEIGHT + 6;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const rect: Rect = { x: cx - LABEL_WIDTH / 2, y: cy - LABEL_HEIGHT / 2, width: LABEL_WIDTH, height: LABEL_HEIGHT };
    if (!placed.some((other) => rectsOverlap(rect, other))) {
      placed.push(rect);
      return rect;
    }
    if (isHorizontalRoute) cy += step;
    else cx += step;
  }
  const fallback = { x: cx - LABEL_WIDTH / 2, y: cy - LABEL_HEIGHT / 2, width: LABEL_WIDTH, height: LABEL_HEIGHT };
  placed.push(fallback);
  return fallback;
}

function itemLabel(item: FunItem): string {
  if (item.kind === "shape") return item.label ?? "";
  if (item.kind === "text") return item.value;
  return "";
}

export async function exportBoardAsPdf({
  notes,
  funItems,
  connections,
  improvedLabels,
  fileName,
}: ExportParams) {
  const { jsPDF } = await import("jspdf");

  const layoutInputs = [
    ...notes.map((note) => ({ id: note.id, label: note.text })),
    ...funItems.map((item) => ({ id: item.id, label: itemLabel(item) })),
  ];
  const layoutConnections = connections.map((connection) => ({
    fromId: connection.fromId,
    toId: connection.toId,
  }));
  const boxes = computeAutoLayout(layoutInputs, layoutConnections);
  const boxById = new Map(boxes.map((box) => [box.id, box]));

  const maxX = Math.max(0, ...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(0, ...boxes.map((box) => box.y + box.height));
  const canvasWidth = maxX + 60;
  const canvasHeight = maxY + 60;

  const pdf = new jsPDF({
    orientation: canvasWidth >= canvasHeight ? "landscape" : "portrait",
    unit: "px",
    format: [canvasWidth, canvasHeight],
  });

  pdf.setFillColor("#ffffff");
  pdf.rect(0, 0, canvasWidth, canvasHeight, "F");

  for (const note of notes) {
    const box = boxById.get(note.id);
    if (box) drawNote(pdf, note, box);
  }
  for (const item of funItems) {
    const box = boxById.get(item.id);
    if (!box) continue;
    if (item.kind === "shape") drawShape(pdf, item, box);
    else if (item.kind === "text") drawTextItem(pdf, item, box);
    else drawEmoji(pdf, box);
  }

  const labelById = new Map(improvedLabels.connections.map((entry) => [entry.id, entry.label]));
  const placedLabelRects: Rect[] = [];

  for (const connection of connections) {
    const from = boxById.get(connection.fromId);
    const to = boxById.get(connection.toId);
    if (!from || !to) continue;

    const obstacles = boxes.filter((box) => box.id !== from.id && box.id !== to.id);
    const { points, labelPoint } = getOrthogonalRoute(from, to, obstacles);

    pdf.setDrawColor(ARROW_COLOR);
    pdf.setLineWidth(2);
    for (let i = 0; i < points.length - 1; i += 1) {
      pdf.line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    }
    drawArrowhead(pdf, points[points.length - 2], points[points.length - 1]);

    const label = labelById.get(connection.id) ?? connection.label;
    if (label) {
      const rect = placeLabelRect(labelPoint, isRouteHorizontalPrimary(points), placedLabelRects);
      const cx = rect.x + rect.width / 2;
      const cy = rect.y + rect.height / 2;
      pdf.setFillColor("#0f172a");
      pdf.roundedRect(rect.x, rect.y, rect.width, rect.height, 4, 4, "F");
      drawCenteredText(pdf, label, cx, cy, rect.width - 12, 11, "#ffffff");
    }
  }

  pdf.save(fileName);
}
