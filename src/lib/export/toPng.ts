import { toPng } from "html-to-image"
import { EXPORT_PIXEL_RATIO } from "@/lib/constants"

export async function exportStripPng(element: HTMLElement): Promise<string> {
  return toPng(element, { pixelRatio: EXPORT_PIXEL_RATIO })
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a")
  a.href = dataUrl
  a.download = filename
  a.click()
}
