export const isMobile =
  typeof navigator !== "undefined" &&
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

export const isIosSafari =
  typeof navigator !== "undefined" &&
  /iP(ad|hone|od)/.test(navigator.userAgent) &&
  /WebKit/.test(navigator.userAgent) &&
  !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent)

/** Converts a data URL to a Blob without using fetch() (which fails on iOS Safari) */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",")
  const mime = header.match(/:(.*?);/)?.[1] || "image/png"
  const bytes = atob(base64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}
