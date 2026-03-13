"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronsLeftRightEllipsis } from "lucide-react";
import PhotoImg from "@/components/PhotoImg";

type Adjustment = { offsetX: number; scale: number };

type Props = {
  src: string;
  index: number;
  width: number;
  height: number;
  style?: React.CSSProperties;
  adjustment?: Partial<Adjustment>;
  onAdjust?: (patch: Partial<Adjustment>) => void;
};

const MAX_SCALE = 4;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export default function PhotoOrPlaceholder({
  src,
  index,
  width,
  height,
  style,
  adjustment,
  onAdjust,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const offsetX = adjustment?.offsetX ?? 0;
  const userScale = adjustment?.scale ?? 1;

  // Cover scale: minimum scale to fill the slot with the natural image
  const coverScale = naturalSize
    ? Math.max(width / naturalSize.w, height / naturalSize.h)
    : null;

  // base display size at scale=1 (just covers slot)
  const baseW = coverScale !== null && naturalSize ? naturalSize.w * coverScale : null;

  // Final display dimensions including user zoom
  const finalW = baseW !== null ? baseW * userScale : null;
  const finalH = coverScale !== null && naturalSize ? naturalSize.h * coverScale * userScale : null;
  const maxOffset = finalW !== null ? Math.max(0, (finalW - width) / 2) : 0;
  const clampedOffsetX = clamp(offsetX, -maxOffset, maxOffset);
  const isInteractive = onAdjust !== undefined && naturalSize !== null;

  const [hintDone, setHintDone] = useState(false);
  const showHint = isInteractive && maxOffset > 0 && !hintDone;

  // Refs so wheel + pointer handlers always see fresh values without re-registering
  const baseWRef = useRef(baseW);
  const maxOffsetRef = useRef(maxOffset);
  const clampedOffsetXRef = useRef(clampedOffsetX);
  const userScaleRef = useRef(userScale);
  const widthRef = useRef(width);
  const onAdjustRef = useRef(onAdjust);
  useEffect(() => { baseWRef.current = baseW; }, [baseW]);
  useEffect(() => { maxOffsetRef.current = maxOffset; }, [maxOffset]);
  useEffect(() => { clampedOffsetXRef.current = clampedOffsetX; }, [clampedOffsetX]);
  useEffect(() => { userScaleRef.current = userScale; }, [userScale]);
  useEffect(() => { widthRef.current = width; }, [width]);
  useEffect(() => { onAdjustRef.current = onAdjust; }, [onAdjust]);

  // Non-passive wheel listener (desktop zoom — must preventDefault to block page scroll)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function handleWheel(e: WheelEvent) {
      if (!onAdjustRef.current || baseWRef.current === null) return;
      e.preventDefault();
      const newScale = clamp(userScaleRef.current * Math.pow(0.999, e.deltaY), 1, MAX_SCALE);
      const newFinalW = baseWRef.current * newScale;
      const newMaxOffset = Math.max(0, (newFinalW - widthRef.current) / 2);
      onAdjustRef.current({
        scale: newScale,
        offsetX: clamp(clampedOffsetXRef.current, -newMaxOffset, newMaxOffset),
      });
    }
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  // Multi-pointer tracking for drag (1 finger) + pinch-to-zoom (2 fingers)
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragBaseRef = useRef<{ startClientX: number; startOffsetX: number } | null>(null);
  const pinchBaseRef = useRef<{ dist: number; startScale: number } | null>(null);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 1) {
      dragBaseRef.current = { startClientX: e.clientX, startOffsetX: clampedOffsetX };
      pinchBaseRef.current = null;
      setIsDragging(true);
    } else if (pointersRef.current.size === 2) {
      dragBaseRef.current = null;
      const pts = [...pointersRef.current.values()];
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
      pinchBaseRef.current = { dist, startScale: userScaleRef.current };
      setIsDragging(false);
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointersRef.current.values()];

    if (pts.length === 1 && dragBaseRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scaleFactor = widthRef.current / rect.width;
      const dx = (e.clientX - dragBaseRef.current.startClientX) * scaleFactor;
      onAdjustRef.current?.({
        offsetX: clamp(dragBaseRef.current.startOffsetX + dx, -maxOffsetRef.current, maxOffsetRef.current),
      });
    } else if (pts.length === 2 && pinchBaseRef.current && baseWRef.current !== null) {
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
      const newScale = clamp(
        (pinchBaseRef.current.startScale * dist) / pinchBaseRef.current.dist,
        1,
        MAX_SCALE,
      );
      const newMaxOffset = Math.max(0, (baseWRef.current * newScale - widthRef.current) / 2);
      onAdjustRef.current?.({
        scale: newScale,
        offsetX: clamp(clampedOffsetXRef.current, -newMaxOffset, newMaxOffset),
      });
    }
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(e.pointerId);

    if (pointersRef.current.size === 0) {
      dragBaseRef.current = null;
      pinchBaseRef.current = null;
      setIsDragging(false);
    } else if (pointersRef.current.size === 1) {
      // Second finger lifted — resume single-finger pan from current position
      const [ptr] = pointersRef.current.values();
      dragBaseRef.current = { startClientX: ptr.x, startOffsetX: clampedOffsetXRef.current };
      pinchBaseRef.current = null;
      setIsDragging(true);
    }
  }

  if (!src) {
    return <div style={{ width, height, backgroundColor: "#d1d5db" }} />;
  }

  const imgLeft = finalW !== null ? (width - finalW) / 2 + clampedOffsetX : 0;
  const imgTop = finalH !== null ? (height - finalH) / 2 : 0;

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        ...(isInteractive && {
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
        }),
      }}
      {...(isInteractive && {
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel: onPointerUp,
      })}
    >
      <PhotoImg
        src={src}
        alt={`Photo ${index + 1}`}
        draggable="false"
        onLoad={(e) => {
          const img = e.currentTarget;
          setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        }}
        style={
          finalW !== null
            ? {
                position: "absolute",
                width: finalW,
                height: finalH!,
                maxWidth: "none",
                left: imgLeft,
                top: imgTop,
                pointerEvents: "none",
                userSelect: "none",
                ...style,
                objectFit: undefined,
              }
            : {
                display: "block",
                width,
                height,
                pointerEvents: "none",
                ...style,
              }
        }
      />
      {showHint && (
        <div
          style={{
            position: "absolute",
            inset: 0,
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
              padding: "6px",
              color: "white",
              lineHeight: 0,
              animation: "pan-hint 0.55s ease-in-out 3 forwards",
            }}
            onAnimationEnd={() => setHintDone(true)}
          >
            <ChevronsLeftRightEllipsis size={18} />
          </div>
        </div>
      )}
    </div>
  );
}
