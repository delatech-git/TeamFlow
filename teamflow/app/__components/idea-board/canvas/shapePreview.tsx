import { withOpacity } from "@/app/__components/idea-board/canvas/utils";
import type { ShapeItemStyle, ShapeType } from "@/src/entities/models/idea-board";

type ShapePreviewProps = {
  shapeType: ShapeType;
  shapeStyle: ShapeItemStyle;
};

export default function ShapePreview({ shapeType, shapeStyle }: ShapePreviewProps) {
  const strokeWidth = shapeStyle.bordered ? Math.max(0, shapeStyle.borderWidth) : 0;
  const stroke = shapeStyle.bordered ? shapeStyle.borderColor : "transparent";
  const fill = withOpacity(shapeStyle.background, shapeStyle.backgroundOpacity);
  const strokeDasharray =
    shapeStyle.borderStyle === "dashed" ? "10 6" : shapeStyle.borderStyle === "dotted" ? "2 6" : undefined;

  if (shapeType === "line") {
    const lineY = Math.max(2, strokeWidth);
    return (
      <svg viewBox="0 0 120 24" preserveAspectRatio="none" className="h-full w-full">
        <line
          x1="2"
          y1={lineY}
          x2="118"
          y2={lineY}
          stroke={shapeStyle.borderColor}
          strokeWidth={Math.max(1, strokeWidth)}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (shapeType === "circle") {
    return (
      <svg viewBox="0 0 120 120" preserveAspectRatio="none" className="h-full w-full">
        <ellipse
          cx="60"
          cy="60"
          rx={Math.max(0, 58 - strokeWidth / 2)}
          ry={Math.max(0, 58 - strokeWidth / 2)}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
        />
      </svg>
    );
  }

  if (shapeType === "triangle") {
    return (
      <svg viewBox="0 0 120 120" preserveAspectRatio="none" className="h-full w-full">
        <polygon
          points="60,8 112,112 8,112"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (shapeType === "diamond") {
    return (
      <svg viewBox="0 0 120 120" preserveAspectRatio="none" className="h-full w-full">
        <polygon
          points="60,6 114,60 60,114 6,60"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (shapeType === "pentagon") {
    return (
      <svg viewBox="0 0 120 120" preserveAspectRatio="none" className="h-full w-full">
        <polygon
          points="60,8 112,47 92,112 28,112 8,47"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (shapeType === "hexagon") {
    return (
      <svg viewBox="0 0 120 120" preserveAspectRatio="none" className="h-full w-full">
        <polygon
          points="30,8 90,8 112,60 90,112 30,112 8,60"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (shapeType === "star") {
    return (
      <svg viewBox="0 0 120 120" preserveAspectRatio="none" className="h-full w-full">
        <polygon
          points="60,8 73,44 111,44 80,66 92,104 60,81 28,104 40,66 9,44 47,44"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (shapeType === "arrow") {
    return (
      <svg viewBox="0 0 120 120" preserveAspectRatio="none" className="h-full w-full">
        <polygon
          points="8,52 70,52 70,24 112,60 70,96 70,68 8,68"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="none" className="h-full w-full">
      <rect
        x={strokeWidth / 2}
        y={strokeWidth / 2}
        width={Math.max(0, 120 - strokeWidth)}
        height={Math.max(0, 80 - strokeWidth)}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        rx="8"
      />
    </svg>
  );
}
