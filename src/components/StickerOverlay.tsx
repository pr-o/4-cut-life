"use client";

import { useEffect, useRef, useState } from "react";
import type { Sticker } from "@/types";

const BASE_SIZE = 32;
const HANDLE_SIZE = 8;
const BOX_PAD = 4;

type Props = {
  stickers: Sticker[];
  stripRef: React.RefObject<HTMLDivElement | null>;
  frameWidth: number;
  zoom: number;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, scale: number) => void;
  disabled: boolean;
};

type DragState = {
  id: string;
  startMouseX: number;
  startMouseY: number;
  startX: number;
  startY: number;
};

type ResizeState = {
  id: string;
  centerX: number;
  centerY: number;
  startDist: number;
  startScale: number;
};

export default function StickerOverlay({
  stickers,
  stripRef,
  frameWidth,
  zoom,
  onMove,
  onResize,
  disabled,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const onMoveRef = useRef(onMove);
  const onResizeRef = useRef(onResize);
  const zoomRef = useRef(zoom);
  useEffect(() => { onMoveRef.current = onMove; }, [onMove]);
  useEffect(() => { onResizeRef.current = onResize; }, [onResize]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // Keep selectedId accessible inside document listeners without re-binding them
  const selectedIdRef = useRef<string | null>(null);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  const dragRef = useRef<DragState | null>(null);
  const resizeRef = useRef<ResizeState | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function isOutsideStrip(x: number, y: number, margin = 32) {
      const rect = stripRef.current?.getBoundingClientRect();
      if (!rect) return true;
      return (
        x < rect.left - margin ||
        x > rect.right + margin ||
        y < rect.top - margin ||
        y > rect.bottom + margin
      );
    }

    function onMouseMove(e: MouseEvent) {
      if (!dragRef.current && !resizeRef.current) return;

      // Cancel and deselect if pointer leaves the strip while held
      if (isOutsideStrip(e.clientX, e.clientY)) {
        dragRef.current = null;
        resizeRef.current = null;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setSelectedId(null);
        return;
      }

      const rect = stripRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Throttle store updates to once per animation frame
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      const clientX = e.clientX;
      const clientY = e.clientY;
      const drag = dragRef.current;
      const resize = resizeRef.current;

      rafRef.current = requestAnimationFrame(() => {
        if (drag) {
          const dx = (clientX - drag.startMouseX) / zoomRef.current;
          const dy = (clientY - drag.startMouseY) / zoomRef.current;
          onMoveRef.current(drag.id, drag.startX + dx, drag.startY + dy);
        }
        if (resize) {
          const dist = Math.hypot(clientX - resize.centerX, clientY - resize.centerY);
          const newScale = Math.max(
            0.3,
            Math.min(4, (resize.startScale * dist) / resize.startDist),
          );
          onResizeRef.current(resize.id, newScale);
        }
      });
    }

    function onMouseUp() {
      dragRef.current = null;
      resizeRef.current = null;
    }

    function onMouseDown() {
      // Deselect on any mousedown not on a sticker.
      // Sticker onMouseDown calls stopPropagation, so this won't fire when clicking a sticker.
      setSelectedId(null);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousedown", onMouseDown);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stripRef]);

  useEffect(() => {
    if (disabled) setSelectedId(null);
  }, [disabled]);

  if (disabled || stickers.length === 0) return null;

  return (
    <div
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {stickers.map((sticker) => {
        const sizeInPx = BASE_SIZE * sticker.scale;
        const isSelected = selectedId === sticker.id;

        return (
          <div
            key={sticker.id}
            style={{
              position: "absolute",
              left: frameWidth + sticker.x,
              top: frameWidth + sticker.y,
              width: sizeInPx,
              height: sizeInPx,
              transform: `translate(-50%, -50%) rotate(${sticker.rotate}deg)`,
              cursor: isSelected ? "grab" : "pointer",
              touchAction: "none",
              pointerEvents: "auto",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(sticker.id);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              // Only allow drag if sticker is already selected
              if (selectedIdRef.current !== sticker.id) return;
              dragRef.current = {
                id: sticker.id,
                startMouseX: e.clientX,
                startMouseY: e.clientY,
                startX: sticker.x,
                startY: sticker.y,
              };
            }}
          >
            {isSelected && (
              <>
                <div
                  style={{
                    position: "absolute",
                    inset: -BOX_PAD,
                    border: "1.5px dashed rgba(0,0,0,0.4)",
                    borderRadius: 2,
                    pointerEvents: "none",
                  }}
                />
                {[
                  { left: -BOX_PAD - HANDLE_SIZE / 2, top: -BOX_PAD - HANDLE_SIZE / 2, cursor: "nw-resize" },
                  { left: sizeInPx + BOX_PAD - HANDLE_SIZE / 2, top: -BOX_PAD - HANDLE_SIZE / 2, cursor: "ne-resize" },
                  { left: -BOX_PAD - HANDLE_SIZE / 2, top: sizeInPx + BOX_PAD - HANDLE_SIZE / 2, cursor: "sw-resize" },
                  { left: sizeInPx + BOX_PAD - HANDLE_SIZE / 2, top: sizeInPx + BOX_PAD - HANDLE_SIZE / 2, cursor: "se-resize" },
                ].map(({ left, top, cursor }) => (
                  <div
                    key={cursor}
                    style={{
                      position: "absolute",
                      left,
                      top,
                      width: HANDLE_SIZE,
                      height: HANDLE_SIZE,
                      background: "white",
                      border: "1.5px solid rgba(0,0,0,0.4)",
                      borderRadius: 1,
                      cursor,
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      const rect = stripRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      const centerX = rect.left + (frameWidth + sticker.x) * zoom;
                      const centerY = rect.top + (frameWidth + sticker.y) * zoom;
                      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY) || 1;
                      resizeRef.current = {
                        id: sticker.id,
                        centerX,
                        centerY,
                        startDist: dist,
                        startScale: sticker.scale,
                      };
                    }}
                  />
                ))}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
