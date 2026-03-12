import { GIFEncoder, quantize, applyPalette } from "gifenc"

const GIF_WIDTH = 300
const FRAME_DELAY = 600

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Main-thread fallback for browsers without Worker/OffscreenCanvas support
async function exportStripGifMainThread(
  photos: string[],
  filterCss: string,
  aspectRatio: number, // photoWidth / photoHeight
): Promise<Blob> {
  const gifW = GIF_WIDTH
  const gifH = Math.round(GIF_WIDTH / aspectRatio)

  const canvas = document.createElement("canvas")
  canvas.width = gifW
  canvas.height = gifH
  const ctx = canvas.getContext("2d")!
  const encoder = GIFEncoder()

  for (const src of photos) {
    const img = await loadImage(src)
    ctx.clearRect(0, 0, gifW, gifH)
    if (filterCss) ctx.filter = filterCss

    // Center-crop to match the strip's aspect ratio
    const srcW = img.naturalWidth
    const srcH = img.naturalHeight
    const srcAspect = srcW / srcH
    let sx = 0, sy = 0, sw = srcW, sh = srcH
    if (srcAspect > aspectRatio) {
      sw = srcH * aspectRatio
      sx = (srcW - sw) / 2
    } else {
      sh = srcW / aspectRatio
      sy = (srcH - sh) / 2
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, gifW, gifH)
    ctx.filter = "none"

    const { data } = ctx.getImageData(0, 0, gifW, gifH)
    const palette = quantize(data, 256)
    const index = applyPalette(data, palette)
    encoder.writeFrame(index, gifW, gifH, { palette, delay: FRAME_DELAY })
  }

  encoder.finish()
  return new Blob([encoder.bytes().buffer as ArrayBuffer], { type: "image/gif" })
}

export function exportStripGif(
  photos: string[],
  filterCss: string,
  aspectRatio: number, // photoWidth / photoHeight from layout
): Promise<Blob> {
  if (typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined") {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL("./gif.worker.ts", import.meta.url))
      worker.onmessage = ({ data }) => {
        worker.terminate()
        if (data.ok) {
          resolve(new Blob([data.buffer], { type: "image/gif" }))
        } else {
          reject(new Error(data.error))
        }
      }
      worker.onerror = () => {
        worker.terminate()
        exportStripGifMainThread(photos, filterCss, aspectRatio).then(resolve).catch(reject)
      }
      worker.postMessage({ photos, filterCss, aspectRatio })
    })
  }

  return exportStripGifMainThread(photos, filterCss, aspectRatio)
}
