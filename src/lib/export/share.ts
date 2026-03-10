import { downloadDataUrl } from "./toPng"

export async function shareStrip(dataUrl: string): Promise<void> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const file = new File([blob], "4-cut-life.png", { type: "image/png" })

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "My 4-cut photo strip" })
  } else {
    // Fallback: just download
    downloadDataUrl(dataUrl, "4-cut-life.png")
  }
}
