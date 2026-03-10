"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { loadStripFromIdb } from "@/lib/export/toQr"

export default function ViewClient() {
  const params = useSearchParams()
  const id = params.get("id")
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) { setError(true); return }
    loadStripFromIdb(id)
      .then((blob) => {
        if (!blob) { setError(true); return }
        setObjectUrl(URL.createObjectURL(blob))
      })
      .catch(() => setError(true))
  }, [id])

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center text-muted-foreground">
        Strip not found. It may have expired or been created on another device.
      </main>
    )
  }

  if (!objectUrl) {
    return (
      <main className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 py-12">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={objectUrl} alt="Photo strip" className="max-w-xs shadow-xl rounded-sm" />
      <Button asChild>
        <a href={objectUrl} download="4-cut-life.png">Download</a>
      </Button>
    </main>
  )
}
