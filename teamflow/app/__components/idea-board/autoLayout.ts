export type AutoLayoutItem = {
  id: string;
  label: string;
};

export type AutoLayoutConnection = {
  fromId: string;
  toId: string;
};

export type AutoLayoutBox = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
};

export const COLUMN_WIDTH = 200;
export const COLUMN_GAP = 190;
const ROW_GAP = 70;
const BOX_PADDING = 14;
const FONT_SIZE = 13;
const LINE_HEIGHT = FONT_SIZE * 1.3;
const MIN_HEIGHT = 72;
const MARGIN = 40;

function wrapLines(text: string, maxWidth: number): string[] {
  const canvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
  const ctx = canvas?.getContext("2d") ?? null;
  if (ctx) ctx.font = `${FONT_SIZE}px Arial, sans-serif`;

  const measure = (line: string) => (ctx ? ctx.measureText(line).width : line.length * FONT_SIZE * 0.55);

  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measure(candidate) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Assigns each node a layer via Kahn's algorithm; cyclic leftovers go after the last resolved layer. */
function assignLayers(ids: string[], connections: AutoLayoutConnection[]) {
  const inDegree = new Map(ids.map((id) => [id, 0]));
  const adjacency = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const connection of connections) {
    if (!adjacency.has(connection.fromId) || !inDegree.has(connection.toId)) continue;
    adjacency.get(connection.fromId)!.push(connection.toId);
    inDegree.set(connection.toId, (inDegree.get(connection.toId) ?? 0) + 1);
  }

  const layer = new Map<string, number>();
  const queue = ids.filter((id) => inDegree.get(id) === 0);
  queue.forEach((id) => layer.set(id, 0));

  const remainingIndegree = new Map(inDegree);
  let i = 0;
  while (i < queue.length) {
    const current = queue[i];
    i += 1;
    const currentLayer = layer.get(current) ?? 0;
    for (const neighbor of adjacency.get(current) ?? []) {
      remainingIndegree.set(neighbor, (remainingIndegree.get(neighbor) ?? 0) - 1);
      layer.set(neighbor, Math.max(layer.get(neighbor) ?? 0, currentLayer + 1));
      if (remainingIndegree.get(neighbor) === 0 && !queue.includes(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  const maxAssignedLayer = Math.max(0, ...[...layer.values()]);
  for (const id of ids) {
    if (!layer.has(id)) layer.set(id, maxAssignedLayer + 1);
  }
  return layer;
}

/** Deterministic layered graph layout: boxes sized to fit their text, columns following the connection flow. */
export function computeAutoLayout(
  items: AutoLayoutItem[],
  connections: AutoLayoutConnection[],
): AutoLayoutBox[] {
  const ids = items.map((item) => item.id);
  const layer = assignLayers(ids, connections);

  const byLayer = new Map<number, AutoLayoutItem[]>();
  for (const item of items) {
    const l = layer.get(item.id) ?? 0;
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l)!.push(item);
  }

  const boxes: AutoLayoutBox[] = [];
  const sortedLayers = [...byLayer.keys()].sort((a, b) => a - b);

  for (const layerIndex of sortedLayers) {
    const layerItems = byLayer.get(layerIndex)!;
    const x = MARGIN + layerIndex * (COLUMN_WIDTH + COLUMN_GAP);

    const sized = layerItems.map((item) => {
      const lines = wrapLines(item.label, COLUMN_WIDTH - BOX_PADDING * 2);
      const height = Math.max(MIN_HEIGHT, lines.length * LINE_HEIGHT + BOX_PADDING * 2);
      return { id: item.id, height };
    });

    const totalHeight = sized.reduce((sum, box) => sum + box.height, 0) + ROW_GAP * Math.max(0, sized.length - 1);
    let y = Math.max(MARGIN, MARGIN + (900 - totalHeight) / 2);

    for (const box of sized) {
      boxes.push({ id: box.id, x, y, width: COLUMN_WIDTH, height: box.height, fontSize: FONT_SIZE });
      y += box.height + ROW_GAP;
    }
  }

  return boxes;
}
