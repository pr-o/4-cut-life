"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import GoBackButton from "@/components/GoBackButton";
import { usePhotoStore } from "@/store/usePhotoStore";
import { ROUTES } from "@/lib/routes";
import { LAYOUTS } from "@/lib/constants";
import type { Layout } from "@/types";
import { cn } from "@/lib/utils";

function LayoutPreview({ cols, rows, width, height }: Layout) {
  const cellW = 28;
  const cellH = Math.round(cellW * (height / width));
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${cellW}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellH}px)`,
        gap: 3,
        padding: 4,
        backgroundColor: "#f5f5f5",
        borderRadius: 4,
      }}
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div
          key={i}
          style={{
            aspectRatio: "19 / 28",
            width: cellW,
            height: cellH,
            backgroundColor: "#d1d5db",
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

export default function LayoutSelectPage() {
  const router = useRouter();
  const setLayout = usePhotoStore((s) => s.setLayout);
  const [selected, setSelected] = useState<Layout | null>(null);

  function handleContinue() {
    if (!selected) return;
    setLayout(selected);
    router.push("/mode-select");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Choose a layout</h1>
        <p className="text-muted-foreground text-sm">
          Select how your photos will be arranged on the strip.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {LAYOUTS.map((layout) => {
          const isSelected =
            selected?.cols === layout.cols && selected?.rows === layout.rows;
          return (
            <button
              key={`${layout.cols}x${layout.rows}`}
              onClick={() => setSelected(layout)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40",
              )}
            >
              <LayoutPreview
                cols={layout.cols}
                rows={layout.rows}
                width={layout.width}
                height={layout.height}
              />
              <span className="text-sm font-medium">
                {layout.cols}×{layout.rows}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <GoBackButton href={ROUTES.landing} />
        <Button
          size="lg"
          className="px-12"
          disabled={!selected}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </main>
  );
}
