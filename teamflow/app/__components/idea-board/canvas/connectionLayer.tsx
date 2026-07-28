"use client";

import type { Connection, ConnectableKind } from "@/src/entities/models/idea-board";
import { clipPointToRectEdge } from "@/app/__components/idea-board/canvas/utils";

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

        const fromCenter = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
        const toCenter = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
        const start = clipPointToRectEdge(fromCenter.x, fromCenter.y, from.width, from.height, toCenter.x, toCenter.y);
        const end = clipPointToRectEdge(toCenter.x, toCenter.y, to.width, to.height, fromCenter.x, fromCenter.y);
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const isSelected = selectedConnectionId === connection.id;
        const isEditing = editingConnectionId === connection.id;

        return (
          <g key={connection.id}>
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={isSelected ? "#38bdf8" : "#1e293b"}
              strokeWidth={isSelected ? 3 : 2}
              markerEnd="url(#tf-connection-arrow)"
            />
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
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
