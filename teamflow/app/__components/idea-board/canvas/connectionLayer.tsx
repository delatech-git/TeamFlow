"use client";

import type { Connection, ConnectableKind } from "@/src/entities/models/idea-board";
import { getOrthogonalRoute, pointsToPath } from "@/app/__components/idea-board/canvas/connectionRouting";

type ConnectableItem = {
  kind: ConnectableKind;
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

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

        const obstacles = items.filter((item) => item !== from && item !== to);
        const { points, labelPoint } = getOrthogonalRoute(from, to, obstacles);
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
              <g
                className="pointer-events-auto cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectConnection(connection.id);
                }}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  onDoubleClickConnection(connection);
                }}
              >
                <rect x={midX - 70} y={midY - 12} width={140} height={24} rx={4} fill="#0f172a" />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  fontSize={11}
                >
                  {connection.label}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
