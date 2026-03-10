"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import NavigationGuard from "@/components/NavigationGuard";
import { usePhotoStore } from "@/store/usePhotoStore";
import { cn } from "@/lib/utils";

const COUNTDOWN_OPTIONS = [1, 2, 3, 5, 10];

function InstructionsContent() {
  const router = useRouter();
  const layout = usePhotoStore((s) => s.layout)!;
  const countdownSeconds = usePhotoStore((s) => s.countdownSeconds);
  const setCountdownSeconds = usePhotoStore((s) => s.setCountdownSeconds);
  const photoCount = usePhotoStore((s) => s.photoCount);
  const setPhotoCount = usePhotoStore((s) => s.setPhotoCount);

  const slotCount = layout.cols * layout.rows;
  const photoCountOptions = [slotCount, slotCount + 2, slotCount + 4, slotCount + 6];
  const resolvedPhotoCount = photoCount ?? slotCount;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Before you shoot</h1>
      </div>

      <div className="max-w-sm w-full bg-muted rounded-2xl p-6 text-sm leading-relaxed text-muted-foreground space-y-4">
        <p>
          A countdown will appear before each shot —{" "}
          <strong className="text-foreground">no retakes</strong>.
        </p>
        <p>
          After the shoot, you will select which photos to use for your strip.
        </p>
        <p>
          Then you may{" "}
          <strong className="text-foreground">download or share</strong> your
          strip with friends.
        </p>
      </div>

      {/* Countdown duration */}
      <div className="w-full max-w-sm space-y-3">
        <p className="text-sm font-medium">Pause between shots</p>
        <div className="flex gap-2">
          {COUNTDOWN_OPTIONS.map((sec) => (
            <button
              key={sec}
              onClick={() => setCountdownSeconds(sec)}
              className={cn(
                "flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors",
                countdownSeconds === sec
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40",
              )}
            >
              {sec}s
            </button>
          ))}
        </div>
      </div>

      {/* Photo count */}
      <div className="w-full max-w-sm space-y-3">
        <p className="text-sm font-medium">Number of photos to take</p>
        <div className="flex gap-2">
          {photoCountOptions.map((count, i) => (
            <button
              key={count}
              onClick={() => setPhotoCount(count)}
              className={cn(
                "flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors",
                resolvedPhotoCount === count
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40",
              )}
            >
              {count}
              {i === 0 && (
                <span className="block text-[10px] text-muted-foreground leading-none mt-0.5">
                  default
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <Button size="lg" className="px-12" onClick={() => router.push("/capture")}>
        Continue
      </Button>
    </main>
  );
}

export default function InstructionsPage() {
  const layout = usePhotoStore((s) => s.layout);
  const shootingMode = usePhotoStore((s) => s.shootingMode);
  return (
    <NavigationGuard
      check={() => {
        if (!layout) return "/layout-select";
        if (!shootingMode) return "/mode-select";
        if (shootingMode !== "camera") return "/capture";
        return null;
      }}
    >
      <InstructionsContent />
    </NavigationGuard>
  );
}
