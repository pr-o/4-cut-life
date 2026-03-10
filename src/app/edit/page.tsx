"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NavigationGuard from "@/components/NavigationGuard";
import PhotoStrip from "@/components/PhotoStrip";
import { usePhotoStore } from "@/store/usePhotoStore";
import { FILTER_CSS, FILTER_LABELS, STICKER_TYPES } from "@/lib/constants";
import { STICKER_COMPONENTS } from "@/components/stickers";
import { exportStripPng, downloadDataUrl } from "@/lib/export/toPng";
import { exportStripGif } from "@/lib/export/toGif";
import { generateQrForStrip } from "@/lib/export/toQr";
import { shareStrip } from "@/lib/export/share";
import type { FilterId, StickerType } from "@/types";
import { cn } from "@/lib/utils";

const FRAME_COLORS = [
  "#ffffff",
  "#000000",
  "#fdf2f8",
  "#fff7ed",
  "#f0fdf4",
  "#eff6ff",
  "#faf5ff",
  "#fefce8",
];

function EditContent() {
  const router = useRouter();
  const stripRef = useRef<HTMLDivElement>(null);

  const layout = usePhotoStore((s) => s.layout)!;
  const selectedPhotos = usePhotoStore((s) => s.selectedPhotos);
  const config = usePhotoStore((s) => s.stripConfig);
  const setFrameColor = usePhotoStore((s) => s.setFrameColor);
  const setFrameWidth = usePhotoStore((s) => s.setFrameWidth);
  const setGapX = usePhotoStore((s) => s.setGapX);
  const setGapY = usePhotoStore((s) => s.setGapY);
  const setFilter = usePhotoStore((s) => s.setFilter);
  const addSticker = usePhotoStore((s) => s.addSticker);
  const removeSticker = usePhotoStore((s) => s.removeSticker);
  const setTimestamp = usePhotoStore((s) => s.setTimestamp);
  const reset = usePhotoStore((s) => s.reset);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [gifLoading, setGifLoading] = useState(false);

  async function getPngDataUrl(): Promise<string> {
    return exportStripPng(stripRef.current!);
  }

  async function handleDownloadPng() {
    const dataUrl = await getPngDataUrl();
    downloadDataUrl(dataUrl, "4-cut-life.png");
  }

  async function handleDownloadQr() {
    const dataUrl = await getPngDataUrl();
    const qr = await generateQrForStrip(dataUrl, window.location.origin);
    setQrDataUrl(qr);
    setQrOpen(true);
  }

  async function handleShare() {
    const dataUrl = await getPngDataUrl();
    await shareStrip(dataUrl);
  }

  async function handleDownloadGif() {
    setGifLoading(true);
    try {
      const blob = await exportStripGif(
        selectedPhotos,
        FILTER_CSS[config.filter],
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "4-cut-life.gif";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setGifLoading(false);
    }
  }

  function handleStartAgain() {
    router.replace("/layout-select");
    setTimeout(() => {
      reset();
    }, 50);
  }

  function handleAddSticker(type: StickerType) {
    addSticker({
      id: crypto.randomUUID(),
      type,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      scale: 1,
      rotate: Math.round(Math.random() * 30 - 15),
    });
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Top action bar */}
      <div className="border-b px-6 py-3 flex flex-wrap gap-2 items-center justify-between">
        <h1 className="text-lg font-semibold">Edit your strip</h1>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleDownloadPng}>
            Download
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadQr}>
            Download via QR
          </Button>
          <Button size="sm" variant="outline" onClick={handleShare}>
            Share
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadGif}
            disabled={gifLoading}
          >
            {gifLoading ? "Generating…" : "Download GIF"}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleStartAgain}>
            Start again
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row gap-0 bg-[#eee]">
        {/* Left — strip preview */}
        <div className="flex-1 flex items-start justify-center p-8 bg-muted/30">
          <PhotoStrip
            photos={selectedPhotos}
            layout={layout}
            config={config}
            stripRef={stripRef}
            className="shadow-xl"
          />
        </div>

        {/* Right — controls */}
        <aside className="w-full lg:w-80 border-l border-[#bbb] overflow-y-auto p-6 space-y-8">
          {/* Frame color */}
          <section className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Frame color
            </Label>
            <div className="flex flex-wrap gap-2">
              {FRAME_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setFrameColor(color)}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-transform",
                    config.frameColor === color
                      ? "border-primary scale-110"
                      : "border-border hover:scale-105",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
              {/* Custom color */}
              <input
                type="color"
                value={config.frameColor}
                onChange={(e) => setFrameColor(e.target.value)}
                className="w-7 h-7 rounded-full border-2 border-border cursor-pointer p-0 overflow-hidden"
                title="Custom color"
              />
            </div>
          </section>

          {/* Frame width */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Frame width
              </Label>
              <span className="text-xs text-muted-foreground">
                {config.frameWidth}px
              </span>
            </div>
            <Slider
              min={0}
              max={40}
              step={2}
              value={[config.frameWidth]}
              onValueChange={([v]) => setFrameWidth(v)}
            />
          </section>

          {/* Gap X / Y */}
          <section className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Gap
            </Label>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Horizontal
                </span>
                <span className="text-xs text-muted-foreground">
                  {config.gapX}px
                </span>
              </div>
              <Slider
                min={0}
                max={24}
                step={1}
                value={[config.gapX]}
                onValueChange={([v]) => setGapX(v)}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">Vertical</span>
                <span className="text-xs text-muted-foreground">
                  {config.gapY}px
                </span>
              </div>
              <Slider
                min={0}
                max={24}
                step={1}
                value={[config.gapY]}
                onValueChange={([v]) => setGapY(v)}
              />
            </div>
          </section>

          {/* Filter */}
          <section className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Filter
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(FILTER_LABELS) as FilterId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={cn(
                    "text-xs px-3 py-2 rounded-lg border transition-colors",
                    config.filter === id
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  {FILTER_LABELS[id]}
                </button>
              ))}
            </div>
          </section>

          {/* Stickers */}
          <section className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Stickers
            </Label>
            <div className="flex flex-wrap gap-2">
              {STICKER_TYPES.map((type) => {
                const Icon = STICKER_COMPONENTS[type];
                return (
                  <button
                    key={type}
                    onClick={() => handleAddSticker(type)}
                    className="w-10 h-10 rounded-lg border border-border hover:border-primary/40 flex items-center justify-center transition-colors"
                    title={type}
                  >
                    <Icon size={24} />
                  </button>
                );
              })}
            </div>
            {config.stickers.length > 0 && (
              <div className="space-y-1">
                {config.stickers.map((sticker) => {
                  const Icon = STICKER_COMPONENTS[sticker.type];
                  return (
                    <div
                      key={sticker.id}
                      className="flex items-center justify-between text-xs text-muted-foreground"
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={16} />
                        <span className="capitalize">{sticker.type}</span>
                      </div>
                      <button
                        onClick={() => removeSticker(sticker.id)}
                        className="hover:text-destructive transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Timestamp */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Timestamp
              </Label>
              <button
                onClick={() => {
                  const turningOn = !config.showTimestamp;
                  const text =
                    turningOn && !config.timestampText
                      ? new Date()
                          .toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })
                          .replace(/\. /g, ".")
                          .replace(/\.$/, "")
                      : config.timestampText;
                  setTimestamp(turningOn, text);
                }}
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                  config.showTimestamp ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
                    config.showTimestamp ? "translate-x-4" : "translate-x-1",
                  )}
                />
              </button>
            </div>
            {config.showTimestamp && (
              <Input
                value={config.timestampText}
                onChange={(e) => setTimestamp(true, e.target.value)}
                placeholder="e.g. 2026.03.10"
                className="text-xs"
              />
            )}
          </section>
        </aside>
      </div>

      {/* QR Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle>Scan to download</DialogTitle>
          </DialogHeader>
          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="QR code" className="mx-auto w-48 h-48" />
          )}
          <p className="text-xs text-muted-foreground">
            Scan this QR code on another device to view and download your strip.
          </p>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default function EditPage() {
  const layout = usePhotoStore((s) => s.layout);
  const selectedPhotos = usePhotoStore((s) => s.selectedPhotos);
  return (
    <NavigationGuard
      check={() => {
        if (!layout) return "/layout-select";
        if (selectedPhotos.length === 0) return "/select";
        return null;
      }}
    >
      <EditContent />
    </NavigationGuard>
  );
}
