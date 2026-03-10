"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import NavigationGuard from "@/components/NavigationGuard"
import { usePhotoStore } from "@/store/usePhotoStore"
import { COUNTDOWN_SECONDS, TOTAL_CAPTURES } from "@/lib/constants"
import { cn } from "@/lib/utils"

type Mode = "idle" | "countdown" | "flash" | "done"

const CAPTURE_SIZE = 1080

function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = CAPTURE_SIZE
      canvas.height = CAPTURE_SIZE
      const ctx = canvas.getContext("2d")!
      // Center-crop to square
      const side = Math.min(img.width, img.height)
      const sx = (img.width - side) / 2
      const sy = (img.height - side) / 2
      ctx.drawImage(img, sx, sy, side, side, 0, 0, CAPTURE_SIZE, CAPTURE_SIZE)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL("image/jpeg", 0.92))
    }
    img.src = url
  })
}

function CaptureContent() {
  const router = useRouter()
  const setCapturedPhotos = usePhotoStore((s) => s.setCapturedPhotos)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [photos, setPhotos] = useState<string[]>([])
  const [mode, setMode] = useState<Mode>("idle")
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [cameraAvailable, setCameraAvailable] = useState(true)
  const [shooting, setShooting] = useState(false)

  // Start camera on mount
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
      .catch(() => {
        setCameraAvailable(false)
        window.alert(
          "No camera found. Please upload your photos instead."
        )
      })

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const captureFrame = useCallback((): string => {
    const video = videoRef.current!
    const canvas = document.createElement("canvas")
    canvas.width = CAPTURE_SIZE
    canvas.height = CAPTURE_SIZE
    const ctx = canvas.getContext("2d")!
    // Mirror horizontally to match preview
    ctx.translate(CAPTURE_SIZE, 0)
    ctx.scale(-1, 1)
    // Center-crop the video feed to square
    const vw = video.videoWidth
    const vh = video.videoHeight
    const side = Math.min(vw, vh)
    const sx = (vw - side) / 2
    const sy = (vh - side) / 2
    ctx.drawImage(video, sx, sy, side, side, 0, 0, CAPTURE_SIZE, CAPTURE_SIZE)
    return canvas.toDataURL("image/jpeg", 0.92)
  }, [])

  const runShootingSession = useCallback(async () => {
    if (shooting) return
    setShooting(true)
    setPhotos([])

    for (let i = 0; i < TOTAL_CAPTURES; i++) {
      // Countdown
      setMode("countdown")
      for (let t = COUNTDOWN_SECONDS; t > 0; t--) {
        setCountdown(t)
        await new Promise((r) => setTimeout(r, 1000))
      }
      // Flash + capture
      setMode("flash")
      const dataUrl = captureFrame()
      setPhotos((prev) => [...prev, dataUrl])
      await new Promise((r) => setTimeout(r, 300))
    }

    setMode("done")
    setShooting(false)
  }, [shooting, captureFrame])

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, TOTAL_CAPTURES)
    Promise.all(files.map(resizeToDataUrl)).then((urls) => {
      setPhotos(urls)
      setMode("done")
    })
  }

  function handleContinue() {
    setCapturedPhotos(photos)
    router.push("/select")
  }

  return (
    <main className="min-h-screen flex flex-col items-center gap-8 px-6 py-12">
      <h1 className="text-2xl font-bold">
        {mode === "done" ? "All done!" : "Get ready"}
      </h1>

      {/* Camera preview */}
      {cameraAvailable && (
        <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />

          {/* Countdown overlay */}
          {mode === "countdown" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-8xl font-black drop-shadow-lg">
                {countdown}
              </span>
            </div>
          )}

          {/* Flash overlay */}
          {mode === "flash" && (
            <div className="absolute inset-0 bg-white opacity-80" />
          )}

          {/* Shot counter */}
          {shooting && (
            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {photos.length} / {TOTAL_CAPTURES}
            </div>
          )}
        </div>
      )}

      {/* Captured thumbnails */}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center max-w-sm">
          {photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`Shot ${i + 1}`}
              className="w-16 h-16 object-cover rounded-lg border border-border"
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 w-full max-w-sm">
        {mode !== "done" && cameraAvailable && (
          <Button
            size="lg"
            className="w-full"
            onClick={runShootingSession}
            disabled={shooting}
          >
            {shooting ? "Shooting…" : "Start shooting"}
          </Button>
        )}

        {/* File upload as alternative or fallback */}
        <label
          className={cn(
            "w-full text-center text-sm cursor-pointer px-4 py-2 rounded-lg border border-dashed border-border hover:bg-muted transition-colors",
            shooting && "pointer-events-none opacity-40"
          )}
        >
          Upload photos instead
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            disabled={shooting}
          />
        </label>

        {mode === "done" && (
          <Button size="lg" className="w-full" onClick={handleContinue}>
            Continue
          </Button>
        )}
      </div>
    </main>
  )
}

export default function CapturePage() {
  const layout = usePhotoStore((s) => s.layout)
  return (
    <NavigationGuard check={() => (!layout ? "/layout-select" : null)}>
      <CaptureContent />
    </NavigationGuard>
  )
}
