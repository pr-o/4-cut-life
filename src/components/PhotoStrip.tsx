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
  const { cols, rows, width: photoWidth, height: photoHeight } = layout;
  const {
    frameColor,
    frameWidth,
    gapX,
    gapY,
    filter,
    stickers,
    showTimestamp,
    timestampText,
  } = config;

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

      {/* App title */}
      <div className="pt-1 text-center font-mono text-xs font-medium invert-50">
        {APP_TITLE}
      </div>

      {/* Timestamp */}
      {showTimestamp && (
        <div className="pt-1 text-center font-mono text-xs invert-50 tracking-wider">
          {timestampText}
        </div>
      )}

      {/* Stickers — positioned relative to the whole strip */}
      {stickers.map((sticker) => {
        const StickerComponent = STICKER_COMPONENTS[sticker.type];
        return (
          <div
            key={sticker.id}
            style={{
              position: "absolute",
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
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
