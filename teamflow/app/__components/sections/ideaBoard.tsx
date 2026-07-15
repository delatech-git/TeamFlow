"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import FunDashboard from "@/app/__components/idea-board/funDashboard";
import NotebookPad from "@/app/__components/idea-board/notebookPad";
import FunCanvasItem from "@/app/__components/idea-board/canvas/funCanvasItem";
import StickyNoteCard from "@/app/__components/idea-board/canvas/stickyNoteCard";
import type { IdeaBoardProps } from "@/app/__components/idea-board/types";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEFAULT_SHAPE_STYLE,
  DEFAULT_TEXT_STYLE,
} from "@/app/__components/idea-board/canvas/utils";
import { useIdeaBoardCanvas } from "@/app/__components/idea-board/useIdeaBoardCanvas";

export default function IdeaBoard({ idea }: IdeaBoardProps) {
  const {
    boardRef,
    notes,
    editingNoteId,
    editingText,
    setEditingText,
    editingFunTextId,
    editingFunTextValue,
    setEditingFunTextValue,
    selectedCanvasItem,
    setSelectedCanvasItem,
    selectedTextItemId,
    setSelectedTextItemId,
    selectedShapeItemId,
    setSelectedShapeItemId,
    isAdminMode,
    isPinMode,
    pinnedNoteIds,
    summaryPreview,
    postedDecisionId,
    canvasScale,
    funItems,
    selectedBoardTool,
    selectedTextItem,
    selectedShapeItem,
    placeSelectedToolAtClientPosition,
    selectBoardTool,
    handleDrop,
    togglePinnedNote,
    togglePinMode,
    generateSummaryPreview,
    startEditingNote,
    saveEditingNote,
    startEditingFunText,
    saveEditingFunText,
    startMove,
    startResize,
    startRotate,
    updateSelectedTextStyle,
    updateSelectedShapeStyle,
    onNoteToolDragStart,
  } = useIdeaBoardCanvas(idea);

  return (
    <div className="space-y-3">
      <section className="tf-dashboard-hero tf-dashboard-hero--full tf-animate-in overflow-hidden pb-6 pt-20 sm:pb-8 sm:pt-22 lg:pb-10 lg:pt-24">
        <div className="tf-dashboard-hero__inner relative grid items-start gap-3 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-8">
          <div>
            <p className="tf-hero-accent-pill">
              <Sparkles size={12} aria-hidden />
              Idea Board
            </p>
            <h1 className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
              {idea.title}
            </h1>
            <p className="mt-1.5 max-w-3xl text-sm text-white/75 sm:text-base">
              {idea.summary}
            </p>
            {postedDecisionId ? (
              <div className="mt-3">
                <Link
                  href={`/planned-ideas?ideaId=${idea.id}`}
                  className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/16 px-2.5 py-1 text-[11px] font-semibold text-emerald-100"
                >
                  Open in Planned ideas
                </Link>
              </div>
            ) : null}
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 justify-self-start rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white/95 shadow-sm backdrop-blur-sm transition hover:bg-white/16 lg:justify-self-end"
          >
            <ArrowLeft size={16} aria-hidden />
            Dashboard
          </Link>
        </div>
      </section>

      <section className="relative left-1/2 right-1/2 mx-[-50vw] w-screen px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-3 lg:grid-cols-[184px_minmax(0,1fr)] lg:pr-80">
          <aside
            className="tf-board-sidepanel tf-animate-in rounded-2xl bg-transparent p-2.5"
            style={{ animationDelay: "60ms" }}
          >
            <NotebookPad onNoteToolDragStart={onNoteToolDragStart} />
          </aside>

          <div
            ref={boardRef}
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
            onMouseDown={(event) => {
              const target = event.target as HTMLElement;
              const clickedCanvasItem = target.closest(
                "[data-canvas-item='true']",
              );
              if (!clickedCanvasItem) {
                if (selectedBoardTool) {
                  placeSelectedToolAtClientPosition(
                    event.clientX,
                    event.clientY,
                  );
                  return;
                }
                setSelectedCanvasItem(null);
                setSelectedTextItemId(null);
                setSelectedShapeItemId(null);
              }
            }}
            className={[
              "tf-board-shell tf-animate-in relative min-h-[calc(100vh-190px)] overflow-auto rounded-2xl bg-transparent p-3 sm:p-4",
              selectedBoardTool ? "cursor-crosshair" : "",
            ].join(" ")}
            style={{ animationDelay: "80ms" }}
          >
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/62">
              Drag tools from left - Ctrl + Wheel to zoom
            </p>

            <div
              className="relative overflow-hidden rounded-[18px] bg-transparent"
              style={{
                width: CANVAS_WIDTH * canvasScale,
                height: CANVAS_HEIGHT * canvasScale,
              }}
            >
              <div
                className="relative"
                style={{
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  transform: `scale(${canvasScale})`,
                  transformOrigin: "top left",
                }}
              >
                {notes.length === 0 ? (
                  <p className="mt-3 text-sm text-white/68">
                    No suggestions yet. Add the first sticky note for this idea.
                  </p>
                ) : null}

                {notes.map((note) => {
                  const isSelected =
                    !isPinMode &&
                    selectedCanvasItem?.kind === "note" &&
                    selectedCanvasItem.id === note.id;
                  return (
                    <StickyNoteCard
                      key={note.id}
                      note={note}
                      isSelected={isSelected}
                      isPinned={pinnedNoteIds.includes(note.id)}
                      isPinMode={isPinMode}
                      isEditing={editingNoteId === note.id}
                      editingText={editingText}
                      onMouseDown={(event) => {
                        if (isPinMode && isAdminMode) {
                          event.preventDefault();
                          if (selectedCanvasItem?.kind === "note") {
                            setSelectedCanvasItem(null);
                          }
                          togglePinnedNote(note.id);
                          return;
                        }
                        setSelectedCanvasItem({ kind: "note", id: note.id });
                        if (!isPinMode && editingNoteId !== note.id) {
                          startMove("note", note, event);
                        }
                      }}
                      onDoubleClick={() => {
                        if (!isPinMode) {
                          startEditingNote(note);
                        }
                      }}
                      onStartEditing={() => {
                        if (!isPinMode) {
                          startEditingNote(note);
                        }
                      }}
                      onEditingTextChange={setEditingText}
                      onSaveEditing={saveEditingNote}
                      onStartResize={(handle, event) =>
                        startResize(
                          "note",
                          note.id,
                          event,
                          note.width,
                          note.height,
                          note.x,
                          note.y,
                          note.rotation ?? 0,
                          handle,
                        )
                      }
                      onStartRotate={(event) =>
                        startRotate("note", note, event)
                      }
                    />
                  );
                })}

                {funItems.map((item) => {
                  const textStyle =
                    item.kind === "text"
                      ? {
                        ...DEFAULT_TEXT_STYLE,
                        ...(item.textStyle ?? {}),
                      }
                      : DEFAULT_TEXT_STYLE;

                  const shapeStyle =
                    item.kind === "shape"
                      ? {
                        ...DEFAULT_SHAPE_STYLE,
                        ...(item.shapeStyle ?? {}),
                      }
                      : DEFAULT_SHAPE_STYLE;

                  const isSelected =
                    selectedCanvasItem?.kind === "fun" &&
                    selectedCanvasItem.id === item.id;

                  return (
                    <FunCanvasItem
                      key={item.id}
                      item={item}
                      textStyle={textStyle}
                      shapeStyle={shapeStyle}
                      isSelected={isSelected}
                      isEditingText={editingFunTextId === item.id}
                      editingTextValue={editingFunTextValue}
                      onMouseDown={(event) => {
                        if (editingFunTextId === item.id) return;
                        startMove("fun", item, event);
                      }}
                      onDoubleClick={() => {
                        if (item.kind === "text") {
                          startEditingFunText(item);
                          setSelectedShapeItemId(null);
                        } else if (item.kind === "shape") {
                          setSelectedShapeItemId(item.id);
                          setSelectedTextItemId(null);
                        } else {
                          setSelectedTextItemId(null);
                          setSelectedShapeItemId(null);
                        }
                      }}
                      onClick={() => {
                        setSelectedCanvasItem({
                          kind: "fun",
                          id: item.id,
                        });

                        if (item.kind === "text") {
                          setSelectedTextItemId(item.id);
                          setSelectedShapeItemId(null);
                        } else if (item.kind === "shape") {
                          setSelectedShapeItemId(item.id);
                          setSelectedTextItemId(null);
                        } else {
                          setSelectedTextItemId(null);
                          setSelectedShapeItemId(null);
                        }
                      }}
                      onEditingTextChange={setEditingFunTextValue}
                      onSaveEditing={saveEditingFunText}
                      onStartResize={(handle, event) => {
                        startResize(
                          "fun",
                          item.id,
                          event,
                          item.width,
                          item.height,
                          item.x,
                          item.y,
                          item.rotation ?? 0,
                          handle,
                        );
                      }}
                      onStartRotate={(event) => startRotate("fun", item, event)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
      <FunDashboard
        isAdminMode={isAdminMode}
        isPinMode={isPinMode}
        pinnedNoteIds={pinnedNoteIds}
        notes={notes}
        summaryPreview={summaryPreview}
        postedDecisionId={postedDecisionId}
        plannedIdeasHref={`/planned-ideas?ideaId=${idea.id}`}
        selectedTextItem={selectedTextItem}
        selectedShapeItem={selectedShapeItem}
        selectedTool={selectedBoardTool}
        onTogglePinMode={togglePinMode}
        onGenerateSummary={generateSummaryPreview}
        onSelectTool={selectBoardTool}
        onChangeTextStyle={updateSelectedTextStyle}
        onChangeShapeStyle={updateSelectedShapeStyle}
      />
    </div>
  );
}
