"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import NavigationGuard from "@/components/NavigationGuard"
import { usePhotoStore } from "@/store/usePhotoStore"
import { cn } from "@/lib/utils"

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
        {capturedPhotos.map((src, i) => {
          const selectedIndex = selected.indexOf(src)
          const isSelected = selectedIndex !== -1
          return (
            <button
              key={i}
              onClick={() => toggle(src)}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                isSelected ? "border-primary" : "border-transparent"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <span className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {selectedIndex + 1}
                  </span>
                </div>
              )}
              {!isSelected && selected.length >= required && (
                <div className="absolute inset-0 bg-black/30" />
              )}
            </button>
          )
        })}
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
  const capturedPhotos = usePhotoStore((s) => s.capturedPhotos)
  return (
    <NavigationGuard
      check={() => {
        if (!layout) return "/layout-select"
        if (capturedPhotos.length === 0) return "/capture"
        return null
      }}
    >
      <SelectContent />
    </NavigationGuard>
  )
}
