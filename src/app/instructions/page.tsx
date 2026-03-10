"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import NavigationGuard from "@/components/NavigationGuard"
import { usePhotoStore } from "@/store/usePhotoStore"

function InstructionsContent() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Before you shoot</h1>
      </div>

      <div className="max-w-sm bg-muted rounded-2xl p-6 text-sm leading-relaxed text-muted-foreground space-y-4">
        <p>
          You have <strong className="text-foreground">3 seconds</strong> for
          each shot — no retakes.
        </p>
        <p>
          We will capture you{" "}
          <strong className="text-foreground">8 times in a row</strong> and you
          will select which photos to use.
        </p>
        <p>
          After the shoot, you may{" "}
          <strong className="text-foreground">download or share</strong> your
          strip with friends.
        </p>
      </div>

      <Button asChild size="lg" className="px-12">
        <Link href="/capture">Continue</Link>
      </Button>
    </main>
  )
}

export default function InstructionsPage() {
  const layout = usePhotoStore((s) => s.layout)
  return (
    <NavigationGuard check={() => (!layout ? "/layout-select" : null)}>
      <InstructionsContent />
    </NavigationGuard>
  )
}
