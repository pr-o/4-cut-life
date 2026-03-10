"use client";

import { useRouter } from "next/navigation";
import NavigationGuard from "@/components/NavigationGuard";
import { usePhotoStore } from "@/store/usePhotoStore";
import type { ShootingMode } from "@/store/usePhotoStore";
import { cn } from "@/lib/utils";

const MODES: { mode: ShootingMode; label: string; description: string }[] = [
  {
    mode: "camera",
    label: "Take photos",
    description: "Use your camera to shoot photos with a countdown timer.",
  },
  {
    mode: "upload",
    label: "Upload photos",
    description: "Pick existing photos from your device.",
  },
];

function ModeSelectContent() {
  const router = useRouter();
  const setShootingMode = usePhotoStore((s) => s.setShootingMode);

  function handleSelect(mode: ShootingMode) {
    setShootingMode(mode);

    switch (mode) {
      case "camera":
        router.push("/instructions");
        break;
      case "upload":
        router.push("/upload");
        break;
      default:
        break;
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          How would you like to add photos?
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        {MODES.map(({ mode, label, description }) => (
          <button
            key={mode}
            onClick={() => handleSelect(mode)}
            className={cn(
              "flex-1 flex flex-col items-center gap-3 rounded-2xl border-2 border-border p-8",
              "hover:border-primary hover:bg-primary/5 transition-colors text-center",
            )}
          >
            <span className="text-lg font-semibold">{label}</span>
            <span className="text-sm text-muted-foreground">{description}</span>
          </button>
        ))}
      </div>
    </main>
  );
}

export default function ModeSelectPage() {
  const layout = usePhotoStore((s) => s.layout);
  return (
    <NavigationGuard check={() => (!layout ? "/layout-select" : null)}>
      <ModeSelectContent />
    </NavigationGuard>
  );
}
