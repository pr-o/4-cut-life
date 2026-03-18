"use client";

import { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Image as KonvaImage, Text, Group, Transformer } from "react-konva";
import type Konva from "konva";
import { Move } from "lucide-react";
import type { Layout, PhotoAdjustment, Sticker, StripConfig, StickerType } from "@/types";
import { APP_TITLE, FILTER_CSS } from "@/lib/constants";

// ─── SVG sticker sources ───────────────────────────────────────────────────
const STICKER_SVGS: Record<StickerType, string> = {
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><polygon points="16,2 20,12 31,12 22,19 25,30 16,23 7,30 10,19 1,12 12,12" fill="#FFD700" stroke="#FFA500" stroke-width="1"/></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M16 28S3 20 3 11a6 6 0 0 1 13-1.5A6 6 0 0 1 29 11c0 9-13 17-13 17z" fill="#FF6B9D" stroke="#FF4081" stroke-width="1"/></svg>`,
  flower: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="8" r="5" fill="#FF9ECD"/><circle cx="16" cy="24" r="5" fill="#FF9ECD"/><circle cx="8" cy="16" r="5" fill="#FF9ECD"/><circle cx="24" cy="16" r="5" fill="#FF9ECD"/><circle cx="16" cy="16" r="5" fill="#FFD700"/></svg>`,
  crown: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><polygon points="2,26 6,12 12,20 16,8 20,20 26,12 30,26" fill="#FFD700" stroke="#FFA500" stroke-width="1"/><rect x="2" y="26" width="28" height="3" rx="1" fill="#FFA500"/></svg>`,
  sparkle: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M16 2 L17.5 14.5 L30 16 L17.5 17.5 L16 30 L14.5 17.5 L2 16 L14.5 14.5 Z" fill="#FFD700" stroke="#FFA500" stroke-width="0.5"/><path d="M6 6 L6.8 10.8 L11.5 11.5 L6.8 12.2 L6 17 L5.2 12.2 L0.5 11.5 L5.2 10.8 Z" fill="#FFE066"/><path d="M26 20 L26.6 23.6 L30 24.2 L26.6 24.8 L26 28.4 L25.4 24.8 L22 24.2 L25.4 23.6 Z" fill="#FFE066"/></svg>`,
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function loadSvgImage(svgStr: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Draw photo onto an offscreen canvas with a CSS filter applied. */
function applyFilterToCanvas(
  img: HTMLImageElement,
  filterCss: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  if (filterCss) ctx.filter = filterCss;
  ctx.drawImage(img, 0, 0);
  ctx.filter = "none";
  return canvas;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

const MAX_PHOTO_SCALE = 4;
const STICKER_BASE_SIZE = 32;

// ─── Types ─────────────────────────────────────────────────────────────────
type Props = {
  photos: string[];
  layout: Layout;
  config: StripConfig;
  stageRef?: React.RefObject<Konva.Stage | null>;
  className?: string;
  /** Called when a photo slot is interacted with (pan/zoom). Omit to disable. */
  onAdjustPhoto?: (index: number, patch: Partial<PhotoAdjustment>) => void;
  /** Called when a sticker is dragged to a new position. */
  onMoveSticker?: (id: string, x: number, y: number) => void;
  /** Called when a sticker is resized / rotated via Transformer. */
  onResizeSticker?: (id: string, scale: number, rotate: number) => void;
  /** When set, Stage clicks place a sticker; photo / sticker interaction is disabled. */
  onStageClick?: (stageX: number, stageY: number) => void;
};

// ─── Main component ────────────────────────────────────────────────────────
export default function PhotoStripKonva({
  photos,
  layout,
  config,
  stageRef,
  className,
  onAdjustPhoto,
  onMoveSticker,
  onResizeSticker,
  onStageClick,
}: Props) {
  const { cols, rows, width: layoutWidth, height: photoHeight } = layout;
  const {
    frameColor,
    frameWidth,
    gapX,
    gapY,
    photoWidth: photoWidthOverride,
    filter,
    stickers,
    showTimestamp,
    timestampText,
    photoAdjustments,
  } = config;

  const photoWidth = photoWidthOverride ?? layoutWidth;
  const filterCss = FILTER_CSS[filter] ?? "";

  // ── Stage / grid geometry ────────────────────────────────────────────────
  const titleFontSize = Math.round(photoWidth * 0.055);
  const titleHeight = titleFontSize + 4;       // pb-1 ≈ 4px
  const tsHeight = showTimestamp ? titleFontSize + 4 : 0;
  const gridW = cols * photoWidth + (cols - 1) * gapX;
  const gridH = rows * photoHeight + (rows - 1) * gapY;
  const stageW = frameWidth * 2 + gridW;
  const stageH = frameWidth * 2 + titleHeight + gridH + tsHeight;
  // top-left of the photo grid in stage coordinates
  const gridOriginX = frameWidth;
  const gridOriginY = frameWidth + titleHeight;

  // ── Load sticker SVG images once ─────────────────────────────────────────
  const [stickerImages, setStickerImages] = useState<
    Partial<Record<StickerType, HTMLImageElement>>
  >({});
  useEffect(() => {
    const types: StickerType[] = ["star", "heart", "flower", "crown", "sparkle"];
    Promise.all(
      types.map(async (t) => ({ type: t, img: await loadSvgImage(STICKER_SVGS[t]) })),
    ).then((results) => {
      const map: Partial<Record<StickerType, HTMLImageElement>> = {};
      results.forEach(({ type, img }) => {
        map[type] = img;
      });
      setStickerImages(map);
    });
  }, []);

  // ── Load raw photo images ────────────────────────────────────────────────
  const [rawImages, setRawImages] = useState<(HTMLImageElement | null)[]>([]);
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      photos.map(async (src) => {
        if (!src) return null;
        try { return await loadImage(src); } catch { return null; }
      }),
    ).then((imgs) => { if (!cancelled) setRawImages(imgs); });
    return () => { cancelled = true; };
  }, [photos]);

  // ── Apply filter → offscreen canvas (re-runs when photo or filter changes) ─
  const [filteredCanvases, setFilteredCanvases] = useState<(HTMLCanvasElement | null)[]>([]);
  useEffect(() => {
    setFilteredCanvases(
      rawImages.map((img) => (img ? applyFilterToCanvas(img, filterCss) : null)),
    );
  }, [rawImages, filterCss]);

  // ── Photo slot helpers ────────────────────────────────────────────────────
  function slotPos(i: number) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: gridOriginX + col * (photoWidth + gapX),
      y: gridOriginY + row * (photoHeight + gapY),
    };
  }

  function imageLayout(i: number) {
    const adj = photoAdjustments?.[i];
    const img = rawImages[i];
    if (!img) return null;
    const ns = { w: img.naturalWidth, h: img.naturalHeight };
    const coverScale = Math.max(photoWidth / ns.w, photoHeight / ns.h);
    const baseW = ns.w * coverScale;
    const baseH = ns.h * coverScale;
    const userScale = adj?.scale ?? 1;
    const dispW = baseW * userScale;
    const dispH = baseH * userScale;
    const maxOX = Math.max(0, (dispW - photoWidth) / 2);
    const maxOY = Math.max(0, (dispH - photoHeight) / 2);
    const clampedOX = clamp(adj?.offsetX ?? 0, -maxOX, maxOX);
    const clampedOY = clamp(adj?.offsetY ?? 0, -maxOY, maxOY);
    const slot = slotPos(i);
    return {
      x: slot.x + (photoWidth - dispW) / 2 + clampedOX,
      y: slot.y + (photoHeight - dispH) / 2 + clampedOY,
      width: dispW,
      height: dispH,
      // needed for drag clamping
      baseW, baseH, maxOX, maxOY, clampedOX, clampedOY, userScale, coverScale,
    };
  }

  // ── Photo pan drag state ─────────────────────────────────────────────────
  const photoDragRef = useRef<{
    index: number;
    startStageX: number;
    startStageY: number;
    startOffsetX: number;
    startOffsetY: number;
    maxOX: number;
    maxOY: number;
  } | null>(null);

  // Touch pinch-to-zoom state
  const touchRef = useRef<{
    index: number;
    startDist: number;
    startScale: number;
  } | null>(null);

  // ── Photo drag cursor ────────────────────────────────────────────────────
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  // ── Pan hint (shown once per slot when image is loaded and pannable) ────
  const [hintDone, setHintDone] = useState<Set<number>>(new Set());

  // ── Sticker selection + Transformer ─────────────────────────────────────
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const stickerNodeRefs = useRef<Map<string, Konva.Image>>(new Map());

  // Clear selection when entering sticker-placement mode
  useEffect(() => {
    if (onStageClick) setSelectedStickerId(null);
  }, [onStageClick]);

  // Attach Transformer to selected sticker node
  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    if (selectedStickerId) {
      const node = stickerNodeRefs.current.get(selectedStickerId);
      if (node) {
        tr.nodes([node]);
        tr.getLayer()?.batchDraw();
      }
    } else {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
    }
  }, [selectedStickerId, stickers]); // re-attach when stickers change (re-mounts)

  const isPlacingSticker = !!onStageClick;
  const isPhotoInteractive = !!onAdjustPhoto && !isPlacingSticker;

  // ── Stage-level handlers ─────────────────────────────────────────────────
  function handleStageMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    const drag = photoDragRef.current;
    if (!drag) return;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
    const dx = pos.x - drag.startStageX;
    const dy = pos.y - drag.startStageY;
    onAdjustPhoto?.(drag.index, {
      offsetX: clamp(drag.startOffsetX + dx, -drag.maxOX, drag.maxOX),
      offsetY: clamp(drag.startOffsetY + dy, -drag.maxOY, drag.maxOY),
    });
  }

  function handleStageMouseUp() {
    photoDragRef.current = null;
    setIsDraggingPhoto(false);
  }

  function handleStageClick(e: Konva.KonvaEventObject<MouseEvent>) {
    if (!isPlacingSticker) return;
    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) onStageClick(pos.x, pos.y);
  }

  function handleStageMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    // Deselect sticker when clicking stage background
    if (e.target === e.target.getStage()) setSelectedStickerId(null);
  }

  return (
    <div className={className} style={{ display: "inline-block", lineHeight: 0, position: "relative" }}>
      <Stage
        ref={stageRef}
        width={stageW}
        height={stageH}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={handleStageClick}
        onMouseDown={handleStageMouseDown}
        style={{ cursor: isPlacingSticker ? "none" : isDraggingPhoto ? "move" : "default" }}
      >
        <Layer>
          {/* Frame background */}
          <Rect x={0} y={0} width={stageW} height={stageH} fill={frameColor} listening={false} />

          {/* App title */}
          <Text
            x={0}
            y={frameWidth}
            width={stageW}
            height={titleHeight}
            text={APP_TITLE}
            fontSize={titleFontSize}
            fontFamily="sans-serif"
            fill="rgba(0,0,0,0.5)"
            align="center"
            verticalAlign="middle"
            listening={false}
          />

          {/* Photo slots */}
          {photos.map((_, i) => {
            const slot = slotPos(i);
            const il = imageLayout(i);
            const canvas = filteredCanvases[i] ?? null;
            const img = rawImages[i] ?? null;

            return (
              <Group
                key={i}
                clipX={slot.x}
                clipY={slot.y}
                clipWidth={photoWidth}
                clipHeight={photoHeight}
              >
                {/* Transparent hit target for pan/zoom events */}
                <Rect
                  x={slot.x}
                  y={slot.y}
                  width={photoWidth}
                  height={photoHeight}
                  fill={img ? "transparent" : "#d1d5db"}
                  listening={isPhotoInteractive}
                  onMouseDown={(e) => {
                    if (!isPhotoInteractive || !il) return;
                    e.cancelBubble = true;
                    const pos = e.target.getStage()?.getPointerPosition();
                    if (!pos) return;
                    setIsDraggingPhoto(true);
                    photoDragRef.current = {
                      index: i,
                      startStageX: pos.x,
                      startStageY: pos.y,
                      startOffsetX: il.clampedOX,
                      startOffsetY: il.clampedOY,
                      maxOX: il.maxOX,
                      maxOY: il.maxOY,
                    };
                  }}
                  onWheel={(e) => {
                    if (!isPhotoInteractive || !il || !img) return;
                    e.evt.preventDefault();
                    const adj = photoAdjustments?.[i];
                    const ns = { w: img.naturalWidth, h: img.naturalHeight };
                    const coverScale = Math.max(photoWidth / ns.w, photoHeight / ns.h);
                    const baseW = ns.w * coverScale;
                    const baseH = ns.h * coverScale;
                    const newScale = clamp(
                      (adj?.scale ?? 1) * Math.pow(0.999, e.evt.deltaY),
                      1,
                      MAX_PHOTO_SCALE,
                    );
                    const newMaxOX = Math.max(0, (baseW * newScale - photoWidth) / 2);
                    const newMaxOY = Math.max(0, (baseH * newScale - photoHeight) / 2);
                    onAdjustPhoto?.(i, {
                      scale: newScale,
                      offsetX: clamp(il.clampedOX, -newMaxOX, newMaxOX),
                      offsetY: clamp(il.clampedOY, -newMaxOY, newMaxOY),
                    });
                  }}
                  // Touch: 1 finger = pan, 2 fingers = pinch zoom
                  onTouchStart={(e) => {
                    if (!isPhotoInteractive || !il) return;
                    e.cancelBubble = true;
                    const touches = e.evt.touches;
                    if (touches.length === 1) {
                      const pos = e.target.getStage()?.getPointerPosition();
                      if (!pos) return;
                      photoDragRef.current = {
                        index: i,
                        startStageX: pos.x,
                        startStageY: pos.y,
                        startOffsetX: il.clampedOX,
                        startOffsetY: il.clampedOY,
                        maxOX: il.maxOX,
                        maxOY: il.maxOY,
                      };
                    } else if (touches.length === 2) {
                      photoDragRef.current = null;
                      const dist = Math.hypot(
                        touches[1].clientX - touches[0].clientX,
                        touches[1].clientY - touches[0].clientY,
                      ) || 1;
                      touchRef.current = {
                        index: i,
                        startDist: dist,
                        startScale: photoAdjustments?.[i]?.scale ?? 1,
                      };
                    }
                  }}
                  onTouchMove={(e) => {
                    if (!isPhotoInteractive) return;
                    e.cancelBubble = true;
                    const touches = e.evt.touches;
                    if (touches.length === 1 && photoDragRef.current?.index === i && il && img) {
                      const pos = e.target.getStage()?.getPointerPosition();
                      if (!pos) return;
                      const drag = photoDragRef.current;
                      const dx = pos.x - drag.startStageX;
                      const dy = pos.y - drag.startStageY;
                      onAdjustPhoto?.(i, {
                        offsetX: clamp(drag.startOffsetX + dx, -drag.maxOX, drag.maxOX),
                        offsetY: clamp(drag.startOffsetY + dy, -drag.maxOY, drag.maxOY),
                      });
                    } else if (touches.length === 2 && touchRef.current?.index === i && img) {
                      const dist = Math.hypot(
                        touches[1].clientX - touches[0].clientX,
                        touches[1].clientY - touches[0].clientY,
                      ) || 1;
                      const ns = { w: img.naturalWidth, h: img.naturalHeight };
                      const coverScale = Math.max(photoWidth / ns.w, photoHeight / ns.h);
                      const baseW = ns.w * coverScale;
                      const baseH = ns.h * coverScale;
                      const newScale = clamp(
                        (touchRef.current.startScale * dist) / touchRef.current.startDist,
                        1,
                        MAX_PHOTO_SCALE,
                      );
                      const newMaxOX = Math.max(0, (baseW * newScale - photoWidth) / 2);
                      const newMaxOY = Math.max(0, (baseH * newScale - photoHeight) / 2);
                      const adj = photoAdjustments?.[i];
                      onAdjustPhoto?.(i, {
                        scale: newScale,
                        offsetX: clamp(adj?.offsetX ?? 0, -newMaxOX, newMaxOX),
                        offsetY: clamp(adj?.offsetY ?? 0, -newMaxOY, newMaxOY),
                      });
                    }
                  }}
                  onTouchEnd={() => {
                    photoDragRef.current = null;
                    touchRef.current = null;
                  }}
                />
                {/* Photo image (filtered via offscreen canvas) */}
                {canvas && il && (
                  <KonvaImage
                    image={canvas}
                    x={il.x}
                    y={il.y}
                    width={il.width}
                    height={il.height}
                    listening={false}
                  />
                )}
              </Group>
            );
          })}

          {/* Stickers */}
          {stickers.map((sticker) => {
            const img = stickerImages[sticker.type];
            if (!img) return null;
            const stageX = frameWidth + sticker.x;
            const stageY = frameWidth + sticker.y;
            return (
              <KonvaImage
                key={sticker.id}
                ref={(node) => {
                  if (node) stickerNodeRefs.current.set(sticker.id, node);
                  else stickerNodeRefs.current.delete(sticker.id);
                }}
                image={img}
                x={stageX}
                y={stageY}
                width={STICKER_BASE_SIZE}
                height={STICKER_BASE_SIZE}
                offsetX={STICKER_BASE_SIZE / 2}
                offsetY={STICKER_BASE_SIZE / 2}
                scaleX={sticker.scale}
                scaleY={sticker.scale}
                rotation={sticker.rotate}
                draggable={!isPlacingSticker}
                listening={!isPlacingSticker}
                onMouseDown={(e) => { e.cancelBubble = true; }}
                onClick={(e) => {
                  e.cancelBubble = true;
                  if (!isPlacingSticker) setSelectedStickerId(sticker.id);
                }}
                onDragEnd={(e) => {
                  const node = e.target;
                  onMoveSticker?.(sticker.id, node.x() - frameWidth, node.y() - frameWidth);
                }}
                onTransformEnd={(e) => {
                  const node = e.target as Konva.Image;
                  // node.scaleX() is now sticker.scale * (additional from transformer)
                  const newScale = clamp(node.scaleX(), 0.3, 4);
                  const newRotate = node.rotation();
                  // Reset so the React-controlled props win on re-render
                  node.scaleX(1);
                  node.scaleY(1);
                  onResizeSticker?.(sticker.id, newScale, newRotate);
                }}
              />
            );
          })}

          {/* Transformer (resize/rotate selected sticker) */}
          <Transformer
            ref={transformerRef}
            keepRatio={true}
            rotateEnabled={true}
            enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 10 || newBox.height < 10) return oldBox;
              return newBox;
            }}
          />

          {/* Timestamp */}
          {showTimestamp && (
            <Text
              x={0}
              y={frameWidth + titleHeight + gridH}
              width={stageW}
              height={tsHeight}
              text={timestampText}
              fontSize={titleFontSize}
              fontFamily="sans-serif"
              fill="rgba(0,0,0,0.5)"
              align="center"
              verticalAlign="middle"
              letterSpacing={1}
              listening={false}
            />
          )}
        </Layer>
      </Stage>

      {/* Pan hint icons — HTML overlay, one per photo slot */}
      {isPhotoInteractive && photos.map((_, i) => {
        const il = imageLayout(i);
        if (!il) return null; // image not loaded yet
        const canPan = il.maxOX > 0 || il.maxOY > 0;
        if (!canPan || hintDone.has(i)) return null;
        const slot = slotPos(i);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: slot.x,
              top: slot.y,
              width: photoWidth,
              height: photoHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "rgba(0,0,0,0.45)",
                borderRadius: "9999px",
                padding: 6,
                color: "white",
                lineHeight: 0,
                animation: "pan-hint 0.55s ease-in-out 3 forwards",
              }}
              onAnimationEnd={() =>
                setHintDone((prev) => new Set(prev).add(i))
              }
            >
              <Move size={18} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
