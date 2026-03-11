"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import NavigationGuard from "@/components/NavigationGuard";
import GoBackButton from "@/components/GoBackButton";
import { usePhotoStore } from "@/store/usePhotoStore";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const CAPTURE_SIZE = 1080;

function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = CAPTURE_SIZE;
      canvas.height = CAPTURE_SIZE;
      const ctx = canvas.getContext("2d")!;
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, CAPTURE_SIZE, CAPTURE_SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.src = url;
  });
}

function UploadContent() {
  const router = useRouter();
  const layout = usePhotoStore((s) => s.layout)!;
  const setCapturedPhotos = usePhotoStore((s) => s.setCapturedPhotos);
  const setSelectedPhotos = usePhotoStore((s) => s.setSelectedPhotos);

  const slotCount = layout.cols * layout.rows;
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length < slotCount) {
      setError(
        `Please upload at least ${slotCount} photos to fill your ${layout.cols}×${layout.rows} strip.`,
      );
      return;
    }
    setError(null);
    const urls = await Promise.all(files.map(resizeToDataUrl));
    setPhotos(urls);
  }

  function handleContinue() {
    const selected = photos.slice(0, slotCount);
    setCapturedPhotos(photos);
    setSelectedPhotos(selected);
    router.push("/edit");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Upload your photos</h1>
        <p className="text-sm text-muted-foreground">
          Upload at least{" "}
          <strong className="text-foreground">{slotCount} photos</strong> to
          fill your {layout.cols}×{layout.rows} strip.
        </p>
      </div>

      <label
        className={cn(
          "w-full max-w-sm flex flex-col items-center justify-center gap-2",
          "border-2 border-dashed border-border rounded-2xl p-12 cursor-pointer",
          "hover:border-primary hover:bg-muted/50 transition-colors text-sm text-muted-foreground",
        )}
      >
        {photos.length > 0
          ? `${photos.length} photo${photos.length > 1 ? "s" : ""} selected`
          : "Click to choose photos"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center max-w-sm">
          {photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`Photo ${i + 1}`}
              className="w-32 h-32 object-cover rounded-lg border border-border"
            />
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <GoBackButton href={ROUTES.modeSelect} />
        {photos.length >= slotCount && (
          <Button size="lg" className="px-12" onClick={handleContinue}>
            Continue
          </Button>
        )}
      </div>
    </main>
  );
}

export default function UploadPage() {
  const layout = usePhotoStore((s) => s.layout);
  const shootingMode = usePhotoStore((s) => s.shootingMode);
  return (
    <NavigationGuard
      check={() => {
        if (!layout) return "/layout-select";
        if (shootingMode !== "upload") return "/mode-select";
        return null;
      }}
    >
      <UploadContent />
    </NavigationGuard>
  );
}
