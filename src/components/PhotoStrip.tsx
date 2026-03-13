"use client";

import type { Layout, PhotoAdjustment, StripConfig } from "@/types";
import { APP_TITLE, FILTER_CSS } from "@/lib/constants";
import { STICKER_COMPONENTS } from "@/components/stickers";
import PhotoOrPlaceholder from "@/components/PhotoOrPlaceholder";

type Props = {
  photos: string[];
  layout: Layout;
  config: StripConfig;
  stripRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
  onAdjustPhoto?: (index: number, patch: Partial<PhotoAdjustment>) => void;
};

export default function PhotoStrip({
  photos,
  layout,
  config,
  stripRef,
  className,
  onAdjustPhoto,
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
  } = config;

  const photoWidth = photoWidthOverride ?? layoutWidth;
  const cssFilter = FILTER_CSS[filter];

  return (
    <div
      ref={stripRef}
      className={className}
      style={{
        backgroundColor: frameColor,
        padding: frameWidth,
        display: "inline-block",
        position: "relative",
      }}
    >
      {/* App title */}
      <div
        className="pb-1 text-center font-medium invert-50"
        style={{ fontSize: Math.round(photoWidth * 0.055), WebkitTextSizeAdjust: "100%" }}
      >
        {APP_TITLE}
      </div>

      {/* Photo grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${photoWidth}px)`,
          gridTemplateRows: `repeat(${rows}, ${photoHeight}px)`,
          gap: `${gapY}px ${gapX}px`,
        }}
      >
        {photos.map((src, i) => (
          <PhotoOrPlaceholder
            key={i}
            src={src}
            index={i}
            width={photoWidth}
            height={photoHeight}
            style={{ objectFit: "cover", filter: cssFilter }}
            adjustment={config.photoAdjustments?.[i]}
            onAdjust={onAdjustPhoto ? (patch) => onAdjustPhoto(i, patch) : undefined}
          />
        ))}
      </div>

      {/* Timestamp */}
      {showTimestamp && (
        <div
          className="pt-1 text-center invert-50 tracking-wide"
          style={{ fontSize: Math.round(photoWidth * 0.055), WebkitTextSizeAdjust: "100%" }}
        >
          {timestampText}
        </div>
      )}

      {/* Stickers — anchored to photo grid origin, unaffected by frame/timestamp changes */}
      {stickers.map((sticker) => {
        const StickerComponent = STICKER_COMPONENTS[sticker.type];
        return (
          <div
            key={sticker.id}
            style={{
              position: "absolute",
              left: frameWidth + sticker.x,
              top: frameWidth + sticker.y,
              transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotate}deg)`,
              pointerEvents: "none",
              lineHeight: 0,
            }}
          >
            <StickerComponent size={32} />
          </div>
        );
      })}
    </div>
  );
}
