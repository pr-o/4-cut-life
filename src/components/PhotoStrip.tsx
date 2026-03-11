"use client";

import type { Layout, StripConfig } from "@/types";
import { APP_TITLE, FILTER_CSS } from "@/lib/constants";
import { STICKER_COMPONENTS } from "@/components/stickers";

type Props = {
  photos: string[];
  layout: Layout;
  config: StripConfig;
  stripRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
};

export default function PhotoStrip({
  photos,
  layout,
  config,
  stripRef,
  className,
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
      <div className="pb-0.5 text-center text-[10px] font-medium invert-50">
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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={`Photo ${i + 1}`}
            draggable="false"
            style={{
              display: "block",
              objectFit: "cover",
              width: photoWidth,
              height: photoHeight,
              filter: cssFilter,
            }}
          />
        ))}
      </div>

      {/* Timestamp */}
      {showTimestamp && (
        <div className="pt-0.5 text-center text-[10px] invert-50 tracking-wide">
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
