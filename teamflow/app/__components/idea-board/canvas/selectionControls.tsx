import type { MouseEvent } from "react";
import { RotateCw } from "lucide-react";
import type { ResizeHandle } from "@/app/__components/idea-board/types";
import { getResizeCursor } from "@/app/__components/idea-board/canvas/utils";

type SelectionControlsProps = {
  rotation: number;
  resizeLabelPrefix: string;
  onStartResize: (handle: ResizeHandle, event: MouseEvent<HTMLButtonElement>) => void;
  onStartRotate: (event: MouseEvent<HTMLButtonElement>) => void;
};

export default function SelectionControls({
  rotation,
  resizeLabelPrefix,
  onStartResize,
  onStartRotate,
}: SelectionControlsProps) {
  return (
    <>
      <span className="pointer-events-none absolute inset-0 border-2 border-[#5a73d8]" />
      {[
        { handle: "nw" as ResizeHandle, className: "-left-1.5 -top-1.5" },
        { handle: "ne" as ResizeHandle, className: "-right-1.5 -top-1.5" },
        { handle: "sw" as ResizeHandle, className: "-left-1.5 -bottom-1.5" },
        { handle: "se" as ResizeHandle, className: "-right-1.5 -bottom-1.5" },
      ].map(({ handle, className }) => (
        <button
          key={handle}
          type="button"
          onMouseDown={(event) => onStartResize(handle, event)}
          className={["absolute h-2 w-2 border border-[#4d61b8]/75 bg-[#dbe6ff] p-0", className].join(" ")}
          style={{ cursor: getResizeCursor(handle, rotation) }}
          aria-label={`Resize ${resizeLabelPrefix} (${handle})`}
        />
      ))}
      {[
        { handle: "n" as ResizeHandle, className: "left-1/2 -top-1.5 -translate-x-1/2" },
        { handle: "s" as ResizeHandle, className: "left-1/2 -bottom-1.5 -translate-x-1/2" },
        { handle: "w" as ResizeHandle, className: "-left-1.5 top-1/2 -translate-y-1/2" },
        { handle: "e" as ResizeHandle, className: "-right-1.5 top-1/2 -translate-y-1/2" },
      ].map(({ handle, className }) => (
        <button
          key={handle}
          type="button"
          onMouseDown={(event) => onStartResize(handle, event)}
          className={["absolute h-2 w-2 border border-[#4d61b8]/75 bg-[#dbe6ff] p-0", className].join(" ")}
          style={{ cursor: getResizeCursor(handle, rotation) }}
          aria-label={`Resize ${resizeLabelPrefix} (${handle})`}
        />
      ))}
      {[
        { id: "tl", className: "-left-3 -top-8" },
        { id: "tr", className: "-right-3 -top-8" },
        { id: "bl", className: "-left-3 -bottom-8" },
        { id: "br", className: "-right-3 -bottom-8" },
      ].map(({ id, className }) => (
        <button
          key={id}
          type="button"
          onMouseDown={onStartRotate}
          className={[
            "absolute flex h-6 w-6 cursor-grab items-center justify-center rounded-full border border-[#8fa3e2] bg-[#f3f7ff] text-[#4a5fac] opacity-0 shadow-[0_4px_10px_rgba(28,38,85,0.2)] transition-opacity active:cursor-grabbing",
            "group-hover:opacity-100 focus-visible:opacity-100",
            className,
          ].join(" ")}
          aria-label={`Rotate ${resizeLabelPrefix}`}
        >
          <RotateCw size={18} strokeWidth={1.9} aria-hidden="true" />
        </button>
      ))}
    </>
  );
}
