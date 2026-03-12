/// <reference lib="webworker" />
import { GIFEncoder, quantize, applyPalette } from "gifenc"

const GIF_WIDTH = 300
const FRAME_DELAY = 600

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",")
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg"
  const bytes = atob(base64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

self.onmessage = async ({
  data,
}: MessageEvent<{ photos: string[]; filterCss: string; aspectRatio: number }>) => {
  try {
    const { photos, filterCss, aspectRatio } = data
    const gifW = GIF_WIDTH
    const gifH = Math.round(GIF_WIDTH / aspectRatio)

    const canvas = new OffscreenCanvas(gifW, gifH)
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D
    const encoder = GIFEncoder()

    for (const src of photos) {
      const bitmap = await createImageBitmap(dataUrlToBlob(src))
      ctx.clearRect(0, 0, gifW, gifH)
      if (filterCss) ctx.filter = filterCss

      // Center-crop to match the strip's aspect ratio
      const srcW = bitmap.width
      const srcH = bitmap.height
      const srcAspect = srcW / srcH
      let sx = 0, sy = 0, sw = srcW, sh = srcH
      if (srcAspect > aspectRatio) {
        sw = srcH * aspectRatio
        sx = (srcW - sw) / 2
      } else {
        sh = srcW / aspectRatio
        sy = (srcH - sh) / 2
      }
      ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, gifW, gifH)
      ctx.filter = "none"
      bitmap.close()

      const { data: pixels } = ctx.getImageData(0, 0, gifW, gifH)
      const palette = quantize(pixels, 256)
      const index = applyPalette(pixels, palette)
      encoder.writeFrame(index, gifW, gifH, { palette, delay: FRAME_DELAY })
    }

    encoder.finish()
    const buffer = encoder.bytes().buffer as ArrayBuffer
    self.postMessage({ ok: true, buffer }, [buffer])
  } catch (err) {
    self.postMessage({ ok: false, error: String(err) })
  }
}
