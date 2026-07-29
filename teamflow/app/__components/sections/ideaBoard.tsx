"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Sparkles } from "lucide-react";
import FunDashboard from "@/app/__components/idea-board/funDashboard";
import { LoadingOverlay } from "@/app/__components/ui/loadingOverlay";
import NotebookPad from "@/app/__components/idea-board/notebookPad";
import FunCanvasItem from "@/app/__components/idea-board/canvas/funCanvasItem";
import StickyNoteCard from "@/app/__components/idea-board/canvas/stickyNoteCard";
import ConnectionLayer from "@/app/__components/idea-board/canvas/connectionLayer";
import type { IdeaBoardProps } from "@/app/__components/idea-board/types";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEFAULT_SHAPE_STYLE,
  DEFAULT_TEXT_STYLE,
} from "@/app/__components/idea-board/canvas/utils";
import { useIdeaBoardCanvas } from "@/app/__components/idea-board/useIdeaBoardCanvas";
import { requestBoardImage } from "@/app/__components/idea-board/boardImageApi";
import { getAccessToken } from "@/src/infrastructure/auth/session";

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
    isGeneratingGuide,
    duplicateStickyNote,
    duplicateFunItem,
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
    connections,
    isConnectMode,
    connectFromItem,
    selectedConnectionId,
    setSelectedConnectionId,
    editingConnectionId,
    editingConnectionLabel,
    setEditingConnectionLabel,
    toggleConnectMode,
    cancelPendingConnection,
    handleConnectableItemClick,
    startEditingConnectionLabel,
    saveEditingConnectionLabel,
  } = useIdeaBoardCanvas(idea);

  const boardContentRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not load the generated image."));
      img.src = src;
    });

  const MAX_AI_UPLOAD_WIDTH = 2000;

  /** Downscaled JPEG copy for the AI upload — smaller/faster than the full-res PNG, while keeping enough resolution for the model to read text clearly. */
  const toAiUploadBlob = (canvas: HTMLCanvasElement) =>
    new Promise<Blob | null>((resolve) => {
      const scale = Math.min(1, MAX_AI_UPLOAD_WIDTH / canvas.width);
      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = Math.round(canvas.width * scale);
      scaledCanvas.height = Math.round(canvas.height * scale);
      const ctx = scaledCanvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);
      ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
      scaledCanvas.toBlob(resolve, "image/jpeg", 0.92);
    });

  const collectBoardTexts = () => {
    const funItemLabel = (item: (typeof funItems)[number]) => {
      if (item.kind === "shape") return item.label ?? "";
      if (item.kind === "text") return item.value;
      return "";
    };
    return [
      ...notes.map((note) => note.text),
      ...funItems.map(funItemLabel),
      ...connections.map((connection) => connection.label),
    ].filter((text): text is string => Boolean(text && text.trim()));
  };

  const handleExportPdf = async () => {
    const contentEl = boardContentRef.current;
    if (!contentEl || isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(contentEl, {
        backgroundColor: "#ffffff",
        scale: 2,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        onclone: (_doc, clonedEl) => {
          clonedEl.style.transform = "none";
        },
      });

      let imageSrc = canvas.toDataURL("image/png");
      let imageWidth = canvas.width;
      let imageHeight = canvas.height;

      try {
        const token = getAccessToken();
        if (!token) throw new Error("Please log in first.");
        const screenshotBlob = await toAiUploadBlob(canvas);
        if (!screenshotBlob) throw new Error("Could not capture the board.");

        const { image } = await requestBoardImage(screenshotBlob, collectBoardTexts(), token);
        const generatedImage = await loadImage(image);
        imageSrc = image;
        imageWidth = generatedImage.naturalWidth;
        imageHeight = generatedImage.naturalHeight;
      } catch (error) {
        console.error("AI image generation failed, exporting the plain screenshot instead", error);
      }

      const pdf = new jsPDF({
        orientation: imageWidth >= imageHeight ? "landscape" : "portrait",
        unit: "px",
        format: [imageWidth, imageHeight],
      });
      pdf.addImage(imageSrc, "PNG", 0, 0, imageWidth, imageHeight);
      pdf.save(`${idea.slug}-idea-board.pdf`);
    } catch (error) {
      console.error("Failed to export idea board as PDF", error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-3">
      <LoadingOverlay
        visible={isGeneratingGuide}
        message="Generating your planned guide..."
      />
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
                if (isConnectMode) {
                  cancelPendingConnection();
                  setSelectedConnectionId(null);
                  return;
                }
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
                setSelectedConnectionId(null);
              }
            }}
            className={[
              "tf-board-shell tf-animate-in relative min-h-[calc(100vh-190px)] overflow-auto rounded-2xl bg-transparent p-3 sm:p-4",
              selectedBoardTool || isConnectMode ? "cursor-crosshair" : "",
            ].join(" ")}
            style={{ animationDelay: "80ms" }}
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                Drag tools from left - Ctrl + Wheel to zoom
              </p>
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-950/60 bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
              >
                <Download size={12} aria-hidden />
                {isExportingPdf ? "Generating AI diagram..." : "Export as PDF"}
              </button>
            </div>

            <div
              className="relative overflow-hidden rounded-[18px] bg-transparent"
              style={{
                width: CANVAS_WIDTH * canvasScale,
                height: CANVAS_HEIGHT * canvasScale,
              }}
            >
              <div
                ref={boardContentRef}
                className="relative"
                style={{
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  transform: `scale(${canvasScale})`,
                  transformOrigin: "top left",
                }}
              >
                {notes.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-600">
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
                      isConnectSource={
                        connectFromItem?.kind === "note" &&
                        connectFromItem.id === note.id
                      }
                      isPinned={pinnedNoteIds.includes(note.id)}
                      isPinMode={isPinMode}
                      isEditing={editingNoteId === note.id}
                      editingText={editingText}
                      onMouseDown={(event) => {
                        if (isConnectMode) {
                          event.preventDefault();
                          handleConnectableItemClick("note", note.id);
                          return;
                        }
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
                      onDuplicate={() => duplicateStickyNote(note.id)}
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
                      isConnectSource={
                        connectFromItem?.kind === "fun" &&
                        connectFromItem.id === item.id
                      }
                      isEditingText={editingFunTextId === item.id}
                      editingTextValue={editingFunTextValue}
                      onMouseDown={(event) => {
                        if (isConnectMode) {
                          event.preventDefault();
                          handleConnectableItemClick("fun", item.id);
                          return;
                        }
                        if (editingFunTextId === item.id) return;
                        startMove("fun", item, event);
                      }}
                      onDoubleClick={() => {
                        if (isConnectMode) return;
                        if (item.kind === "text") {
                          startEditingFunText(item);
                          setSelectedShapeItemId(null);
                        } else if (item.kind === "shape") {
                          startEditingFunText(item);
                          setSelectedShapeItemId(item.id);
                          setSelectedTextItemId(null);
                        } else {
                          setSelectedTextItemId(null);
                          setSelectedShapeItemId(null);
                        }
                      }}
                      onClick={() => {
                        if (isConnectMode) return;
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
                      onDuplicate={() => duplicateFunItem(item.id)}
                    />
                  );
                })}

                <ConnectionLayer
                  connections={connections}
                  items={[
                    ...notes.map((note) => ({
                      kind: "note" as const,
                      id: note.id,
                      x: note.x,
                      y: note.y,
                      width: note.width,
                      height: note.height,
                    })),
                    ...funItems.map((item) => ({
                      kind: "fun" as const,
                      id: item.id,
                      x: item.x,
                      y: item.y,
                      width: item.width,
                      height: item.height,
                    })),
                  ]}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  selectedConnectionId={selectedConnectionId}
                  editingConnectionId={editingConnectionId}
                  editingConnectionLabel={editingConnectionLabel}
                  onSelectConnection={setSelectedConnectionId}
                  onDoubleClickConnection={startEditingConnectionLabel}
                  onEditingLabelChange={setEditingConnectionLabel}
                  onSaveEditingLabel={saveEditingConnectionLabel}
                />
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
        isGeneratingGuide={isGeneratingGuide}
        isConnectMode={isConnectMode}
        connectFromItem={connectFromItem}
        onTogglePinMode={togglePinMode}
        onGenerateSummary={generateSummaryPreview}
        onSelectTool={selectBoardTool}
        onChangeTextStyle={updateSelectedTextStyle}
        onChangeShapeStyle={updateSelectedShapeStyle}
        onToggleConnectMode={toggleConnectMode}
      />
    </div>
  );
}
