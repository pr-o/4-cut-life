import { isMobile, dataUrlToBlob } from "@/lib/export/utils"
import { downloadDataUrl } from "@/lib/export/toPng"

export async function shareStrip(dataUrl: string): Promise<void> {
  const blob = dataUrlToBlob(dataUrl)
  const file = new File([blob], "4-cut-life.png", { type: "image/png" })

  if (isMobile && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "My 4-cut photo strip" })
  } else {
    downloadDataUrl(dataUrl, "4-cut-life.png")
  }
}
