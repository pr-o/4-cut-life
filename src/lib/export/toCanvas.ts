import type { Layout, StripConfig } from "@/types"
import { APP_TITLE, EXPORT_PIXEL_RATIO, FILTER_CSS } from "@/lib/constants"

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Canvas-based export used on iOS Safari where html-to-image / SVG foreignObject
 * fails to render <img> elements with large data URLs.
 * Reproduces: frame, photos (with CSS filter), app title, and timestamp.
 * Stickers are omitted (SVG rendering on canvas is unreliable on iOS).
 */
export async function exportStripToCanvas(
  photos: string[],
  layout: Layout,
  config: StripConfig,
): Promise<string> {
  const { cols, rows, width: layoutWidth, height: photoHeight } = layout
  const {
    frameColor,
    frameWidth,
    gapX,
    gapY,
    photoWidth: photoWidthOverride,
    filter,
    showTimestamp,
    timestampText,
  } = config

  const photoWidth = photoWidthOverride ?? layoutWidth
  const S = EXPORT_PIXEL_RATIO

  const TITLE_H = 14  // px at 1x (app title row)
  const TS_H = showTimestamp ? 14 : 0

  const gridW = cols * photoWidth + (cols - 1) * gapX
  const gridH = rows * photoHeight + (rows - 1) * gapY
  const totalW = gridW + 2 * frameWidth
  const totalH = gridH + 2 * frameWidth + TITLE_H + TS_H

  const canvas = document.createElement("canvas")
  canvas.width = totalW * S
  canvas.height = totalH * S
  const ctx = canvas.getContext("2d")!
  ctx.scale(S, S)

  // Frame background
  ctx.fillStyle = frameColor
  ctx.fillRect(0, 0, totalW, totalH)

  // App title
  ctx.fillStyle = "rgba(0,0,0,0.4)"
  ctx.font = `${10}px monospace`
  ctx.textAlign = "center"
  ctx.fillText(APP_TITLE, totalW / 2, frameWidth + 10)

  // Photos
  const cssFilter = FILTER_CSS[filter]
  if (cssFilter) ctx.filter = cssFilter

  for (let i = 0; i < photos.length; i++) {
    if (!photos[i]) continue
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = frameWidth + col * (photoWidth + gapX)
    const y = frameWidth + TITLE_H + row * (photoHeight + gapY)
    const img = await loadImage(photos[i])
    ctx.drawImage(img, x, y, photoWidth, photoHeight)
  }

  ctx.filter = "none"

  // Timestamp
  if (showTimestamp && timestampText) {
    ctx.fillStyle = "rgba(0,0,0,0.4)"
    ctx.font = `${10}px monospace`
    ctx.textAlign = "center"
    ctx.fillText(timestampText, totalW / 2, totalH - frameWidth - 2)
  }

  return canvas.toDataURL("image/png")
}
