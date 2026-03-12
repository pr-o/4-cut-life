import { toPng } from "html-to-image"
import { EXPORT_PIXEL_RATIO } from "@/lib/constants"
import { isIosSafari, isMobile, dataUrlToBlob } from "@/lib/export/utils"

export { dataUrlToBlob } from "@/lib/export/utils"

export async function exportStripPng(element: HTMLElement): Promise<string> {
  const options = { pixelRatio: EXPORT_PIXEL_RATIO }
  if (isIosSafari) await toPng(element, options) // warm-up call for iOS Safari
  return toPng(element, options)
}

const TARGET_BYTES = 1024 * 1024 // 1MB

/**
 * Compresses a PNG data URL to a JPEG blob under 1MB.
 * Starts at 92% quality and steps down by 5% until under the target.
 */
export async function compressToTarget(dataUrl: string): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve) => {
    const i = new window.Image()
    i.onload = () => resolve(i)
    i.src = dataUrl
  })
  const canvas = document.createElement("canvas")
  canvas.width = img.width
  canvas.height = img.height
  canvas.getContext("2d")!.drawImage(img, 0, 0)

  let quality = 0.92
  let blob = dataUrlToBlob(canvas.toDataURL("image/jpeg", quality))
  while (blob.size > TARGET_BYTES && quality > 0.1) {
    quality = Math.max(0.1, +(quality - 0.05).toFixed(2))
    blob = dataUrlToBlob(canvas.toDataURL("image/jpeg", quality))
  }
  return blob
}

export { isMobile } from "@/lib/export/utils"

export async function downloadDataUrl(dataUrl: string, filename: string) {
  const blob = await compressToTarget(dataUrl)
  const file = new File([blob], filename.replace(/\.png$/, ".jpg"), { type: "image/jpeg" })

  // On mobile, the download attribute is unreliable — use Web Share API
  // so the user can save to their camera roll from the share sheet
  if (isMobile && navigator.canShare?.({ files: [file] })) {
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
