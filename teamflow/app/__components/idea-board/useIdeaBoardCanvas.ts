import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { DiscoverIdea } from "@/src/entities/models/discover";
import type {
  MoveTarget,
  ResizeHandle,
  ResizeTarget,
  RotatableCanvasItem,
  RotateTarget,
  SelectedBoardTool,
  SelectedCanvasItem,
} from "@/app/__components/idea-board/types";
import { FUN_ITEM_SIZE, NOTE_HEIGHT, NOTE_WIDTH } from "@/app/__components/idea-board/constants";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEFAULT_SHAPE_STYLE,
  DEFAULT_TEXT_STYLE,
  getDefaultItemSize,
  getPointerAngle,
  getResizedRect,
  getTextItemSize,
  normalizeAngleDelta,
  normalizeRotation,
  toLocalDelta,
} from "@/app/__components/idea-board/canvas/utils";
import { clamp, readDragPayload } from "@/app/__components/idea-board/utils";
import { requestPlannedGuide } from "@/app/__components/idea-board/summaryApi";
import type {
  FunItem,
  ShapeItemStyle,
  ShapeType,
  StickyNote,
  TextItemStyle,
} from "@/src/entities/models/idea-board";
import { getAccessToken } from "@/src/infrastructure/auth/session";
import { fetchCurrentUser } from "@/src/infrastructure/api/auth/client";
import { saveIdeaBoard } from "@/src/infrastructure/api/ideas/client";

export function useIdeaBoardCanvas(idea: DiscoverIdea) {
  const router = useRouter();
  const boardRef = useRef<HTMLDivElement>(null);
  const hasInitializedSaveRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [notes, setNotes] = useState<StickyNote[]>(
    () => idea.boardState?.notes ?? [],
  );
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingFunTextId, setEditingFunTextId] = useState<string | null>(null);
  const [editingFunTextValue, setEditingFunTextValue] = useState("");
  const [selectedCanvasItem, setSelectedCanvasItem] =
    useState<SelectedCanvasItem>(null);
  const [selectedTextItemId, setSelectedTextItemId] = useState<string | null>(
    null,
  );
  const [selectedShapeItemId, setSelectedShapeItemId] = useState<string | null>(
    null,
  );
  const [resizeState, setResizeState] = useState<{
    target: ResizeTarget;
    id: string;
    startX: number;
    startY: number;
    startItemX: number;
    startItemY: number;
    startWidth: number;
    startHeight: number;
    startRotation: number;
    handle: ResizeHandle;
  } | null>(null);
  const [moveState, setMoveState] = useState<{
    target: MoveTarget;
    id: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
  } | null>(null);
  const [rotateState, setRotateState] = useState<{
    target: RotateTarget;
    id: string;
    centerX: number;
    centerY: number;
    startAngle: number;
    startRotation: number;
  } | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isPinMode, setIsPinMode] = useState(false);
  const [pinnedNoteIds, setPinnedNoteIds] = useState<string[]>(
    idea.boardState?.pinnedNoteIds ?? [],
  );
  const [summaryPreview, setSummaryPreview] = useState(
    idea.boardState?.summaryPreview ?? "",
  );
  const [postedDecisionId, setPostedDecisionId] = useState<string | null>(
    idea.boardState?.postedDecisionId ?? null,
  );
  const [canvasScale, setCanvasScale] = useState(1);
  const [funItems, setFunItems] = useState<FunItem[]>(
    () => idea.boardState?.funItems ?? [],
  );
  const [selectedBoardTool, setSelectedBoardTool] =
    useState<SelectedBoardTool | null>(null);
  const [currentUserName, setCurrentUserName] = useState("Teammate");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await fetchCurrentUser();
        if (cancelled) return;
        const displayName = user.fullName?.trim() || user.username;
        setCurrentUserName(displayName || "Teammate");
      } catch {
        if (!cancelled) {
          setCurrentUserName("Teammate");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasInitializedSaveRef.current) {
      hasInitializedSaveRef.current = true;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      void saveIdeaBoard(idea.id, {
        notes,
        funItems,
        pinnedNoteIds,
        summaryPreview,
        postedDecisionId,
      }).catch(() => {
        // Keep editing uninterrupted if autosave fails transiently.
      });
    }, 600);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    idea.id,
    notes,
    funItems,
    pinnedNoteIds,
    summaryPreview,
    postedDecisionId,
  ]);

  const getWorldPositionFromClient = (clientX: number, clientY: number) => {
    const boardEl = boardRef.current;
    if (!boardEl) return null;
    const rect = boardEl.getBoundingClientRect();
    return {
      worldX: (boardEl.scrollLeft + (clientX - rect.left)) / canvasScale,
      worldY: (boardEl.scrollTop + (clientY - rect.top)) / canvasScale,
    };
  };

  const selectNewFunItem = (itemId: string, kind: FunItem["kind"]) => {
    setSelectedCanvasItem({ kind: "fun", id: itemId });
    if (kind === "text") {
      setSelectedTextItemId(itemId);
      setSelectedShapeItemId(null);
      setEditingFunTextId(itemId);
      setEditingFunTextValue("");
      return;
    }
    if (kind === "shape") {
      setSelectedShapeItemId(itemId);
      setSelectedTextItemId(null);
      return;
    }
    setSelectedTextItemId(null);
    setSelectedShapeItemId(null);
  };

  const placeToolAtWorldPosition = (
    toolKind: FunItem["kind"],
    value: string,
    worldX: number,
    worldY: number,
  ) => {
    const { width: itemWidth, height: itemHeight } = getDefaultItemSize(
      toolKind,
      value,
    );
    const nextX = clamp(
      worldX - itemWidth / 2,
      8,
      CANVAS_WIDTH - itemWidth - 8,
    );
    const nextY = clamp(
      worldY - itemHeight / 2,
      8,
      CANVAS_HEIGHT - itemHeight - 8,
    );
    const itemId = `${idea.slug}-fun-${Date.now()}`;
    const newItem = {
      id: itemId,
      kind: toolKind,
      value,
      x: Math.round(nextX),
      y: Math.round(nextY),
      width: itemWidth,
      height: itemHeight,
      ...(toolKind === "text" ? { textStyle: DEFAULT_TEXT_STYLE } : {}),
      ...(toolKind === "shape"
        ? { shapeType: value as ShapeType, shapeStyle: DEFAULT_SHAPE_STYLE }
        : {}),
    } as FunItem;
    setFunItems((prev) => [...prev, newItem]);
    selectNewFunItem(itemId, toolKind);
  };

  const selectBoardTool = (toolKind: FunItem["kind"], value: string) => {
    setSelectedBoardTool((prev) =>
      prev && prev.toolKind === toolKind && prev.value === value
        ? null
        : { toolKind, value },
    );
  };

  const placeSelectedToolAtClientPosition = (
    clientX: number,
    clientY: number,
  ) => {
    if (!selectedBoardTool) return false;
    const worldPosition = getWorldPositionFromClient(clientX, clientY);
    if (!worldPosition) return false;
    placeToolAtWorldPosition(
      selectedBoardTool.toolKind,
      selectedBoardTool.value,
      worldPosition.worldX,
      worldPosition.worldY,
    );
    setSelectedBoardTool(null);
    return true;
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const payload = readDragPayload(event.dataTransfer.getData("text/plain"));
    if (!payload) return;
    const worldPosition = getWorldPositionFromClient(
      event.clientX,
      event.clientY,
    );
    if (!worldPosition) return;
    const { worldX, worldY } = worldPosition;

    if (payload.kind === "noteTool") {
      const nextX = clamp(
        worldX - NOTE_WIDTH / 2,
        8,
        CANVAS_WIDTH - NOTE_WIDTH - 8,
      );
      const nextY = clamp(
        worldY - NOTE_HEIGHT / 2,
        8,
        CANVAS_HEIGHT - NOTE_HEIGHT - 8,
      );
      const noteId = `${idea.slug}-${Date.now()}`;
      setNotes((prev) => [
        ...prev,
        {
          id: noteId,
          author: currentUserName,
          text: "",
          category: "general",
          color: payload.color,
          x: Math.round(nextX),
          y: Math.round(nextY),
          width: NOTE_WIDTH,
          height: NOTE_HEIGHT,
        },
      ]);
      setEditingNoteId(noteId);
      setEditingText("");
      return;
    }

    if (payload.kind === "note") {
      const draggedNote = notes.find((note) => note.id === payload.id);
      const noteWidth = draggedNote?.width ?? NOTE_WIDTH;
      const noteHeight = draggedNote?.height ?? NOTE_HEIGHT;
      const nextX = clamp(
        worldX - noteWidth / 2,
        8,
        CANVAS_WIDTH - noteWidth - 8,
      );
      const nextY = clamp(
        worldY - noteHeight / 2,
        8,
        CANVAS_HEIGHT - noteHeight - 8,
      );
      setNotes((prev) =>
        prev.map((note) =>
          note.id === payload.id
            ? { ...note, x: Math.round(nextX), y: Math.round(nextY) }
            : note,
        ),
      );
      return;
    }

    if (payload.kind === "fun") {
      const draggedItem = funItems.find((item) => item.id === payload.id);
      const itemWidth = draggedItem?.width ?? FUN_ITEM_SIZE;
      const itemHeight = draggedItem?.height ?? FUN_ITEM_SIZE;
      const nextX = clamp(
        worldX - itemWidth / 2,
        8,
        CANVAS_WIDTH - itemWidth - 8,
      );
      const nextY = clamp(
        worldY - itemHeight / 2,
        8,
        CANVAS_HEIGHT - itemHeight - 8,
      );
      setFunItems((prev) =>
        prev.map((item) =>
          item.id === payload.id
            ? { ...item, x: Math.round(nextX), y: Math.round(nextY) }
            : item,
        ),
      );
      return;
    }

    placeToolAtWorldPosition(payload.toolKind, payload.value, worldX, worldY);
  };

  const togglePinnedNote = (noteId: string) => {
    if (!isAdminMode || !isPinMode) return;
    setPinnedNoteIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId],
    );
  };

  const handleAdminModeChange = (checked: boolean) => {
    setIsAdminMode(checked);
    if (!checked) {
      setIsPinMode(false);
    }
  };

  const togglePinMode = () => setIsPinMode((prev) => !prev);

  const deleteFunItem = useCallback(
    (itemId: string) => {
      setFunItems((prev) => prev.filter((funItem) => funItem.id !== itemId));
      if (moveState?.target === "fun" && moveState.id === itemId) {
        setMoveState(null);
      }
      if (rotateState?.target === "fun" && rotateState.id === itemId) {
        setRotateState(null);
      }
      if (
        selectedCanvasItem?.kind === "fun" &&
        selectedCanvasItem.id === itemId
      ) {
        setSelectedCanvasItem(null);
      }
      if (selectedTextItemId === itemId) {
        setSelectedTextItemId(null);
      }
      if (selectedShapeItemId === itemId) {
        setSelectedShapeItemId(null);
      }
    },
    [
      moveState,
      rotateState,
      selectedCanvasItem,
      selectedTextItemId,
      selectedShapeItemId,
    ],
  );

  const generateSummaryPreview = async () => {
    if (pinnedNoteIds.length === 0) {
      window.alert("Please pin at least one idea before generating the planned guide.");
      return;
    }

    try {
      await saveIdeaBoard(idea.id, {
        notes,
        funItems,
        pinnedNoteIds,
        summaryPreview,
        postedDecisionId,
      });

      const token = getAccessToken();

      if (!token) {
        window.alert("Please log in first.");
        return;
      }

      const plannedGuide = await requestPlannedGuide(idea.id, token);

      setPostedDecisionId(plannedGuide.id);
      setSummaryPreview(plannedGuide.summary);

      router.push(`/planned-ideas?ideaId=${idea.id}`);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not generate planned guide.",
      );
    }
  };

  const deleteStickyNote = useCallback(
    (noteId: string) => {
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      setPinnedNoteIds((prev) => prev.filter((id) => id !== noteId));
      if (moveState?.target === "note" && moveState.id === noteId) {
        setMoveState(null);
      }
      if (rotateState?.target === "note" && rotateState.id === noteId) {
        setRotateState(null);
      }
      if (
        selectedCanvasItem?.kind === "note" &&
        selectedCanvasItem.id === noteId
      ) {
        setSelectedCanvasItem(null);
      }
      if (editingNoteId === noteId) {
        setEditingNoteId(null);
        setEditingText("");
      }
    },
    [moveState, rotateState, selectedCanvasItem, editingNoteId],
  );

  const onNoteToolDragStart =
    (payload: string) => (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData("text/plain", payload);
    };

  const startEditingNote = (note: StickyNote) => {
    setEditingNoteId(note.id);
    setEditingText(note.text);
  };

  const saveEditingNote = () => {
    if (!editingNoteId) return;
    setNotes((prev) =>
      prev.map((note) =>
        note.id === editingNoteId
          ? { ...note, text: editingText.trim() }
          : note,
      ),
    );
    setEditingNoteId(null);
  };

  const startEditingFunText = (item: FunItem) => {
    if (item.kind !== "text") return;
    setEditingFunTextId(item.id);
    setEditingFunTextValue(item.value);
    setSelectedTextItemId(item.id);
  };

  const saveEditingFunText = () => {
    if (!editingFunTextId) return;
    setFunItems((prev) =>
      prev.map((item) => {
        if (item.id !== editingFunTextId || item.kind !== "text") return item;
        const nextValue = editingFunTextValue;
        const nextFontSize =
          item.textStyle?.fontSize ?? DEFAULT_TEXT_STYLE.fontSize;
        const nextSize = getTextItemSize(nextValue, nextFontSize);
        return {
          ...item,
          value: nextValue,
          width: nextSize.width,
          height: nextSize.height,
        };
      }),
    );
    setEditingFunTextId(null);
  };

  const startMove = (
    target: MoveTarget,
    item: RotatableCanvasItem,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    if (event.button !== 0) return;
    event.preventDefault();
    setMoveState({
      target,
      id: item.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: item.x,
      startY: item.y,
      width: item.width,
      height: item.height,
    });
  };

  const startResize = (
    target: ResizeTarget,
    id: string,
    event: React.MouseEvent<HTMLElement>,
    startWidth: number,
    startHeight: number,
    startItemX: number,
    startItemY: number,
    startRotation: number,
    handle: ResizeHandle,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setResizeState({
      target,
      id,
      startX: event.clientX,
      startY: event.clientY,
      startItemX,
      startItemY,
      startWidth,
      startHeight,
      startRotation,
      handle,
    });
  };

  const startRotate = (
    target: RotateTarget,
    item: RotatableCanvasItem,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    const boardEl = boardRef.current;
    if (!boardEl) return;
    event.preventDefault();
    event.stopPropagation();

    const boardRect = boardEl.getBoundingClientRect();
    const centerX =
      boardRect.left +
      (item.x + item.width / 2) * canvasScale -
      boardEl.scrollLeft;
    const centerY =
      boardRect.top +
      (item.y + item.height / 2) * canvasScale -
      boardEl.scrollTop;
    const startAngle = getPointerAngle(
      event.clientX,
      event.clientY,
      centerX,
      centerY,
    );
    setRotateState({
      target,
      id: item.id,
      centerX,
      centerY,
      startAngle,
      startRotation: item.rotation ?? 0,
    });
  };

  useEffect(() => {
    if (!moveState) return;

    const handleMove = (event: MouseEvent) => {
      const deltaX = (event.clientX - moveState.startClientX) / canvasScale;
      const deltaY = (event.clientY - moveState.startClientY) / canvasScale;
      const nextX = clamp(
        Math.round(moveState.startX + deltaX),
        8,
        CANVAS_WIDTH - moveState.width - 8,
      );
      const nextY = clamp(
        Math.round(moveState.startY + deltaY),
        8,
        CANVAS_HEIGHT - moveState.height - 8,
      );

      if (moveState.target === "note") {
        setNotes((prev) =>
          prev.map((note) =>
            note.id === moveState.id ? { ...note, x: nextX, y: nextY } : note,
          ),
        );
      } else {
        setFunItems((prev) =>
          prev.map((item) =>
            item.id === moveState.id ? { ...item, x: nextX, y: nextY } : item,
          ),
        );
      }
    };

    const handleUp = () => setMoveState(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [moveState, canvasScale]);

  useEffect(() => {
    if (!resizeState) return;

    const handleMove = (event: MouseEvent) => {
      const pointerDeltaX = (event.clientX - resizeState.startX) / canvasScale;
      const pointerDeltaY = (event.clientY - resizeState.startY) / canvasScale;
      const { deltaX, deltaY } = toLocalDelta(
        pointerDeltaX,
        pointerDeltaY,
        resizeState.startRotation,
      );

      if (resizeState.target === "note") {
        setNotes((prev) =>
          prev.map((note) => {
            if (note.id !== resizeState.id) return note;
            const resized = getResizedRect({
              startX: resizeState.startItemX,
              startY: resizeState.startItemY,
              startWidth: resizeState.startWidth,
              startHeight: resizeState.startHeight,
              deltaX,
              deltaY,
              handle: resizeState.handle,
              minWidth: 120,
              maxWidth: 520,
              minHeight: 90,
              maxHeight: 420,
            });
            return {
              ...note,
              x: resized.x,
              y: resized.y,
              width: resized.width,
              height: resized.height,
            };
          }),
        );
      } else {
        setFunItems((prev) =>
          prev.map((item) => {
            if (item.id !== resizeState.id) return item;
            const resized = getResizedRect({
              startX: resizeState.startItemX,
              startY: resizeState.startItemY,
              startWidth: resizeState.startWidth,
              startHeight: resizeState.startHeight,
              deltaX,
              deltaY,
              handle: resizeState.handle,
              minWidth: item.kind === "text" ? 120 : 36,
              maxWidth: 520,
              minHeight: item.kind === "text" ? 44 : 36,
              maxHeight: 420,
            });
            return {
              ...item,
              x: resized.x,
              y: resized.y,
              width: resized.width,
              height: resized.height,
            };
          }),
        );
      }
    };

    const handleUp = () => setResizeState(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [resizeState, canvasScale]);

  useEffect(() => {
    if (!rotateState) return;

    const handleMove = (event: MouseEvent) => {
      const pointerAngle = getPointerAngle(
        event.clientX,
        event.clientY,
        rotateState.centerX,
        rotateState.centerY,
      );
      const rotationDelta = normalizeAngleDelta(
        pointerAngle - rotateState.startAngle,
      );
      const nextRotation = normalizeRotation(
        Math.round(rotateState.startRotation + rotationDelta),
      );
      if (rotateState.target === "note") {
        setNotes((prev) =>
          prev.map((note) =>
            note.id === rotateState.id
              ? { ...note, rotation: nextRotation }
              : note,
          ),
        );
      } else {
        setFunItems((prev) =>
          prev.map((item) =>
            item.id === rotateState.id
              ? { ...item, rotation: nextRotation }
              : item,
          ),
        );
      }
    };

    const handleUp = () => setRotateState(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [rotateState]);

  useEffect(() => {
    const handleDeleteKey = (event: KeyboardEvent) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (!selectedCanvasItem) return;
      if (editingNoteId || editingFunTextId) return;

      const target = event.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName.toLowerCase();
        if (
          tagName === "input" ||
          tagName === "textarea" ||
          target.isContentEditable
        ) {
          return;
        }
      }

      event.preventDefault();
      if (selectedCanvasItem.kind === "note") {
        deleteStickyNote(selectedCanvasItem.id);
      } else {
        deleteFunItem(selectedCanvasItem.id);
      }
    };

    window.addEventListener("keydown", handleDeleteKey);
    return () => {
      window.removeEventListener("keydown", handleDeleteKey);
    };
  }, [
    selectedCanvasItem,
    editingNoteId,
    editingFunTextId,
    deleteFunItem,
    deleteStickyNote,
  ]);

  const selectedTextItem =
    selectedTextItemId !== null
      ? (funItems.find(
        (item) => item.id === selectedTextItemId && item.kind === "text",
      ) ?? null)
      : null;
  const selectedShapeItem =
    selectedShapeItemId !== null
      ? (funItems.find(
        (item) => item.id === selectedShapeItemId && item.kind === "shape",
      ) ?? null)
      : null;

  const updateSelectedTextStyle = (patch: Partial<TextItemStyle>) => {
    if (!selectedTextItemId) return;
    setFunItems((prev) =>
      prev.map((item) =>
        item.id === selectedTextItemId && item.kind === "text"
          ? (() => {
            const nextTextStyle = {
              ...DEFAULT_TEXT_STYLE,
              ...item.textStyle,
              ...patch,
            };
            const nextSize = getTextItemSize(
              item.value,
              nextTextStyle.fontSize,
            );
            return {
              ...item,
              textStyle: nextTextStyle,
              width: nextSize.width,
              height: nextSize.height,
            };
          })()
          : item,
      ),
    );
  };

  const updateSelectedShapeStyle = (patch: Partial<ShapeItemStyle>) => {
    if (!selectedShapeItemId) return;
    setFunItems((prev) =>
      prev.map((item) =>
        item.id === selectedShapeItemId && item.kind === "shape"
          ? {
            ...item,
            shapeStyle: {
              ...DEFAULT_SHAPE_STYLE,
              ...item.shapeStyle,
              ...patch,
            },
          }
          : item,
      ),
    );
  };

  useEffect(() => {
    const boardEl = boardRef.current;
    if (!boardEl) return;

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      const zoomDelta = event.deltaY > 0 ? -0.1 : 0.1;
      setCanvasScale((prev) =>
        clamp(Math.round((prev + zoomDelta) * 10) / 10, 0.6, 2),
      );
    };

    boardEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      boardEl.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return {
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
    handleAdminModeChange,
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
  };
}
