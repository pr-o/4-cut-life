"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import NavigationGuard from "@/components/NavigationGuard"
import SelectablePhotoThumbnail from "@/components/SelectablePhotoThumbnail"
import { usePhotoStore } from "@/store/usePhotoStore"

function SelectContent() {
  const router = useRouter()
  const layout = usePhotoStore((s) => s.layout)!
  const capturedPhotos = usePhotoStore((s) => s.capturedPhotos)
  const setSelectedPhotos = usePhotoStore((s) => s.setSelectedPhotos)

  const required = layout.cols * layout.rows
  const [selected, setSelected] = useState<string[]>([])

  function toggle(src: string) {
    setSelected((prev) => {
      if (prev.includes(src)) return prev.filter((s) => s !== src)
      if (prev.length >= required) return prev
      return [...prev, src]
    })
  }

  function handleContinue() {
    setSelectedPhotos(selected)
    router.push("/edit")
  }

  return (
    <main className="min-h-screen flex flex-col items-center gap-8 px-6 py-12">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">Choose your photos</h1>
        <p className="text-sm text-muted-foreground">
          Select {required} photo{required > 1 ? "s" : ""} in the order you
          want them on the strip.{" "}
          <span className="font-medium text-foreground">
            {selected.length} / {required}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
        {capturedPhotos.map((src, i) => (
          <SelectablePhotoThumbnail
            key={i}
            src={src}
            index={i}
            selectedIndex={selected.indexOf(src)}
            disabled={selected.length >= required}
            onClick={() => toggle(src)}
          />
        ))}
      </div>

      <Button
        size="lg"
        className="px-12"
        disabled={selected.length < required}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </main>
  )
}

export default function SelectPage() {
  const layout = usePhotoStore((s) => s.layout)
  const shootingMode = usePhotoStore((s) => s.shootingMode)
  const capturedPhotos = usePhotoStore((s) => s.capturedPhotos)
  return (
    <NavigationGuard
      check={() => {
        if (!layout) return "/layout-select"
        if (shootingMode === "upload") return "/upload"
        if (capturedPhotos.length === 0) return "/capture"
        return null
      }}
    >
      <SelectContent />
    </NavigationGuard>
  )
}
