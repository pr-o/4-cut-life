import { GIFEncoder, quantize, applyPalette } from "gifenc"

const GIF_WIDTH = 300
const FRAME_DELAY = 600 // ms

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function exportStripGif(
  photos: string[],
  filterCss: string,
): Promise<Blob> {
  const canvas = document.createElement("canvas")
  canvas.width = GIF_WIDTH
  canvas.height = GIF_WIDTH
  const ctx = canvas.getContext("2d")!

  const encoder = GIFEncoder()

  for (const src of photos) {
    const img = await loadImage(src)

    ctx.clearRect(0, 0, GIF_WIDTH, GIF_WIDTH)

    if (filterCss) {
      ctx.filter = filterCss
    }
    ctx.drawImage(img, 0, 0, GIF_WIDTH, GIF_WIDTH)
    ctx.filter = "none"

    const { data } = ctx.getImageData(0, 0, GIF_WIDTH, GIF_WIDTH)
    const palette = quantize(data, 256)
    const index = applyPalette(data, palette)
    encoder.writeFrame(index, GIF_WIDTH, GIF_WIDTH, { palette, delay: FRAME_DELAY })
  }

  encoder.finish()
  return new Blob([encoder.bytes().buffer as ArrayBuffer], { type: "image/gif" })
}
