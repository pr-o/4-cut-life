"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import NavigationGuard from "@/components/NavigationGuard";
import GoBackButton from "@/components/GoBackButton";
import PhotoThumbnailGrid from "@/components/PhotoThumbnailGrid";
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
  const t = useTranslations("upload");
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
      setError(t("minPhotosError", { slotCount, cols: layout.cols, rows: layout.rows }));
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
    router.push(ROUTES.edit);
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">{t("heading")}</h1>
        <p className="text-sm text-muted-foreground">
          {t.rich("subheading", {
            slotCount,
            cols: layout.cols,
            rows: layout.rows,
            strong: (chunks) => <strong className="text-foreground">{chunks}</strong>,
          })}
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
          ? photos.length === 1
            ? t("photosSelectedOne", { count: photos.length })
            : t("photosSelectedMany", { count: photos.length })
          : t("choosePhotos")}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <PhotoThumbnailGrid
        photos={photos}
        total={Math.max(slotCount, photos.length)}
        size={96}
      />

      {photos.length >= slotCount && (
        <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
          {t.rich("adjustTip", {
            strong: (chunks) => <strong className="text-foreground">{chunks}</strong>,
          })}
        </p>
      )}

      <div className="flex gap-3">
        <GoBackButton href={ROUTES.modeSelect} />
        {photos.length >= slotCount && (
          <Button size="lg" className="px-12" onClick={handleContinue}>
            {t("continue")}
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
        if (!layout) return ROUTES.layoutSelect;
        if (shootingMode !== "upload") return ROUTES.modeSelect;
        return null;
      }}
    >
      <UploadContent />
    </NavigationGuard>
  );
}
