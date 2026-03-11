import { toPng } from "html-to-image"
import { EXPORT_PIXEL_RATIO } from "@/lib/constants"
import { exportStripToCanvas } from "@/lib/export/toCanvas"
import type { Layout, StripConfig } from "@/types"

export const isIosSafari =
  typeof navigator !== "undefined" &&
  /iP(ad|hone|od)/.test(navigator.userAgent) &&
  /WebKit/.test(navigator.userAgent) &&
  !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent)

type ExportOptions = {
  element: HTMLElement
  photos: string[]
  layout: Layout
  config: StripConfig
}

export async function exportStripPng({
  element,
  photos,
  layout,
  config,
}: ExportOptions): Promise<string> {
  // iOS Safari: SVG foreignObject fails to render <img> data URLs — use canvas instead
  if (isIosSafari) {
    return exportStripToCanvas(photos, layout, config)
  }
  return toPng(element, { pixelRatio: EXPORT_PIXEL_RATIO })
}

export async function downloadDataUrl(dataUrl: string, filename: string) {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const file = new File([blob], filename, { type: "image/png" })

  // iOS Safari ignores the download attribute — use Web Share API instead
  // so the user can save to their camera roll from the share sheet
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: filename })
    return
  }

  // Desktop / Android: standard blob URL download
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
