"use client"

import Image from "next/image"
import type { Layout, StripConfig } from "@/types"
import { FILTER_CSS } from "@/lib/constants"
import { STICKER_COMPONENTS } from "@/components/stickers"

type Props = {
  photos: string[]
  layout: Layout
  config: StripConfig
  stripRef?: React.RefObject<HTMLDivElement | null>
  className?: string
}

export default function PhotoStrip({ photos, layout, config, stripRef, className }: Props) {
  const { cols, rows } = layout
  const {
    frameColor,
    frameWidth,
    gapX,
    gapY,
    filter,
    stickers,
    showTimestamp,
    timestampText,
  } = config

  const cssFilter = FILTER_CSS[filter]

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
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: `${gapY}px ${gapX}px`,
        }}
      >
        {photos.map((src, i) => (
          <div key={i} style={{ position: "relative", aspectRatio: "1 / 1", overflow: "hidden" }}>
            <Image
              src={src}
              alt={`Photo ${i + 1}`}
              fill
              style={{ objectFit: "cover", filter: cssFilter }}
              unoptimized
            />
          </div>
        ))}
      </div>

      {/* Timestamp */}
      {showTimestamp && (
        <div
          style={{
            textAlign: "center",
            fontFamily: "monospace",
            fontSize: 11,
            color: "#666",
            paddingTop: 6,
            letterSpacing: "0.05em",
          }}
        >
          {timestampText}
        </div>
      )}

      {/* Stickers — positioned relative to the whole strip */}
      {stickers.map((sticker) => {
        const StickerComponent = STICKER_COMPONENTS[sticker.type]
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
        )
      })}
    </div>
  )
}
