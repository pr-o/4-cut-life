import { toPng } from "html-to-image"
import { EXPORT_PIXEL_RATIO } from "@/lib/constants"

export async function exportStripPng(element: HTMLElement): Promise<string> {
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
