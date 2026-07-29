"use client";

import type { Connection, ConnectableKind } from "@/src/entities/models/idea-board";

type ConnectableItem = {
  kind: ConnectableKind;
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type Point = { x: number; y: number };

/** Routes a connector as a single right-angle bend (or a straight line when the boxes are already aligned). */
function getOrthogonalRoute(from: ConnectableItem, to: ConnectableItem) {
  const fromCenter = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
  const toCenter = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  const isHorizontalPrimary = Math.abs(dx) >= Math.abs(dy);

  let start: Point;
  let end: Point;
  if (isHorizontalPrimary) {
    start = { x: dx >= 0 ? from.x + from.width : from.x, y: fromCenter.y };
    end = { x: dx >= 0 ? to.x : to.x + to.width, y: toCenter.y };
  } else {
    start = { x: fromCenter.x, y: dy >= 0 ? from.y + from.height : from.y };
    end = { x: toCenter.x, y: dy >= 0 ? to.y : to.y + to.height };
  }

  const isAligned = isHorizontalPrimary ? start.y === end.y : start.x === end.x;
  if (isAligned) {
    return { points: [start, end], labelPoint: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 } };
  }

  const bend: Point = isHorizontalPrimary
    ? { x: (start.x + end.x) / 2, y: start.y }
    : { x: start.x, y: (start.y + end.y) / 2 };
  const bendEnd: Point = isHorizontalPrimary
    ? { x: bend.x, y: end.y }
    : { x: end.x, y: bend.y };

  return {
    points: [start, bend, bendEnd, end],
    labelPoint: {
      x: (bend.x + bendEnd.x) / 2,
      y: (bend.y + bendEnd.y) / 2,
    },
  };
}

function pointsToPath(points: Point[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
}

export type ConnectionLayerProps = {
  connections: Connection[];
  items: ConnectableItem[];
  width: number;
  height: number;
  selectedConnectionId: string | null;
  editingConnectionId: string | null;
  editingConnectionLabel: string;
  onSelectConnection: (id: string) => void;
  onDoubleClickConnection: (connection: Connection) => void;
  onEditingLabelChange: (value: string) => void;
  onSaveEditingLabel: () => void;
};

export default function ConnectionLayer({
  connections,
  items,
  width,
  height,
  selectedConnectionId,
  editingConnectionId,
  editingConnectionLabel,
  onSelectConnection,
  onDoubleClickConnection,
  onEditingLabelChange,
  onSaveEditingLabel,
}: ConnectionLayerProps) {
  const itemByKey = new Map(items.map((item) => [`${item.kind}:${item.id}`, item]));

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 z-10"
      width={width}
      height={height}
      style={{ overflow: "visible" }}
    >
      <defs>
        <marker id="tf-connection-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#1e293b" />
        </marker>
      </defs>

      {connections.map((connection) => {
        const from = itemByKey.get(`${connection.fromKind}:${connection.fromId}`);
        const to = itemByKey.get(`${connection.toKind}:${connection.toId}`);
        if (!from || !to) return null;

        const { points, labelPoint } = getOrthogonalRoute(from, to);
        const path = pointsToPath(points);
        const midX = labelPoint.x;
        const midY = labelPoint.y;
        const isSelected = selectedConnectionId === connection.id;
        const isEditing = editingConnectionId === connection.id;

        return (
          <g key={connection.id}>
            <path
              d={path}
              fill="none"
              stroke={isSelected ? "#38bdf8" : "#1e293b"}
              strokeWidth={isSelected ? 3 : 2}
              markerEnd="url(#tf-connection-arrow)"
            />
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={16}
              className="pointer-events-auto cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                onSelectConnection(connection.id);
              }}
              onDoubleClick={(event) => {
                event.stopPropagation();
                onDoubleClickConnection(connection);
              }}
            />
            {isEditing ? (
              <foreignObject x={midX - 70} y={midY - 14} width={140} height={28} className="pointer-events-auto">
                <input
                  autoFocus
                  value={editingConnectionLabel}
                  onChange={(event) => onEditingLabelChange(event.target.value)}
                  onBlur={onSaveEditingLabel}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      onSaveEditingLabel();
                    }
                  }}
                  className="w-full rounded border border-sky-400 bg-slate-900/95 px-1.5 py-0.5 text-center text-[11px] text-white outline-none"
                />
              </foreignObject>
            ) : connection.label ? (
              <foreignObject x={midX - 70} y={midY - 12} width={140} height={24} className="pointer-events-auto">
                <div
                  className="cursor-pointer truncate rounded bg-slate-900/80 px-1.5 py-0.5 text-center text-[11px] text-white/90"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectConnection(connection.id);
                  }}
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    onDoubleClickConnection(connection);
                  }}
                >
                  {connection.label}
                </div>
              </foreignObject>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
