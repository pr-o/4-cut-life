import { Suspense } from "react"
import ViewClient from "./ViewClient"

export default function ViewPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center text-muted-foreground">
          Loading…
        </main>
      }
    >
      <ViewClient />
    </Suspense>
  )
}
