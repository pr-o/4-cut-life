"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NavigationGuard from "@/components/NavigationGuard";
import PhotoStrip from "@/components/PhotoStrip";
import StickerOverlay from "@/components/StickerOverlay";
import SectionLabel from "@/components/SectionLabel";
import SliderControl from "@/components/SliderControl";
import SelectOptionButton from "@/components/SelectOptionButton";
import SelectablePhotoThumbnail from "@/components/SelectablePhotoThumbnail";
import { usePhotoStore } from "@/store/usePhotoStore";
import { BlockPicker } from "react-color";
import {
  DEFAULT_STRIP_CONFIG,
  FILTER_CSS,
  FILTER_LABELS,
  FRAME_WIDTH_MIN,
  FRAME_WIDTH_MAX,
  GAP_MIN,
  GAP_MAX,
  STICKER_TYPES,
  GAP_STEP,
  FRAME_WIDTH_STEP,
  PHOTO_WIDTH_STEP,
} from "@/lib/constants";
import { STICKER_COMPONENTS } from "@/components/stickers";
import { exportStripPng, downloadDataUrl, compressToTarget } from "@/lib/export/toPng";
import { exportStripGif } from "@/lib/export/toGif";
import { generateQrForStrip } from "@/lib/export/toQr";
import type { FilterId, StickerType } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FRAME_COLORS = [
  "#000000",
  "#ffffff",
  "#f9a8d4",
  "#fde68a",
  "#bbf7d0",
  "#bfdbfe",
  "#ddd6fe",
  "#fed7aa",
  "#fecdd3",
  "#e0f2fe",
  "#ccfbf1",
  "#d9f99d",
];

function EditContent() {
  const router = useRouter();
  const stripRef = useRef<HTMLDivElement>(null);
  const stripWrapperRef = useRef<HTMLDivElement>(null);
  const stickerPickerRef = useRef<HTMLDivElement>(null);

  const layout = usePhotoStore((s) => s.layout)!;
  const capturedPhotos = usePhotoStore((s) => s.capturedPhotos);
  const selectedPhotos = usePhotoStore((s) => s.selectedPhotos);
  const setSelectedPhotos = usePhotoStore((s) => s.setSelectedPhotos);
  const config = usePhotoStore((s) => s.stripConfig);
  const setFrameColor = usePhotoStore((s) => s.setFrameColor);
  const setFrameWidth = usePhotoStore((s) => s.setFrameWidth);
  const setGapX = usePhotoStore((s) => s.setGapX);
  const setGapY = usePhotoStore((s) => s.setGapY);
  const setPhotoWidth = usePhotoStore((s) => s.setPhotoWidth);
  const setFilter = usePhotoStore((s) => s.setFilter);
  const addSticker = usePhotoStore((s) => s.addSticker);
  const updateSticker = usePhotoStore((s) => s.updateSticker);
  const removeSticker = usePhotoStore((s) => s.removeSticker);
  const setTimestamp = usePhotoStore((s) => s.setTimestamp);
  const reset = usePhotoStore((s) => s.reset);

  const [activeStickerType, setActiveStickerType] =
    useState<StickerType | null>(null);
  const [zoom, setZoom] = useState(1);
  const ZOOM_STEP = 0.25;
  const ZOOM_MIN = 1 / 3;
  const ZOOM_MAX = 3;

  // Default to 150% on medium+ screens
  useEffect(() => {
    if (window.innerWidth >= 768) setZoom(1.25);
  }, []);

  const required = layout.cols * layout.rows;

  // Pad selectedPhotos to always fill all strip slots (empty string = placeholder)
  const photosForStrip = [
    ...selectedPhotos,
    ...Array(Math.max(0, required - selectedPhotos.length)).fill(""),
  ];

  function handleThumbnailToggle(src: string) {
    const idx = selectedPhotos.indexOf(src);
    if (idx !== -1) {
      setSelectedPhotos(selectedPhotos.filter((p) => p !== src));
    } else if (selectedPhotos.length < required) {
      setSelectedPhotos([...selectedPhotos, src]);
    }
  }

  // Keep stickers visually anchored when dimensions change.
  // Grid expands symmetrically from center, so shift by half the total expansion.
  const prevPhotoWidthRef = useRef(config.photoWidth ?? layout.width);
  useEffect(() => {
    const current = config.photoWidth ?? layout.width;
    const prev = prevPhotoWidthRef.current;
    if (current !== prev && config.stickers.length > 0) {
      const delta = current - prev;
      config.stickers.forEach((s) =>
        updateSticker(s.id, { x: s.x + delta / 2 }),
      );
    }
    prevPhotoWidthRef.current = current;
  }, [config.photoWidth]); // eslint-disable-line react-hooks/exhaustive-deps

  const prevGapXRef = useRef(config.gapX);
  useEffect(() => {
    const current = config.gapX;
    const prev = prevGapXRef.current;
    if (current !== prev && config.stickers.length > 0) {
      const delta = current - prev;
      // (cols - 1) gaps expand the grid; shift by half the total expansion
      config.stickers.forEach((s) =>
        updateSticker(s.id, { x: s.x + ((layout.cols - 1) * delta) / 2 }),
      );
    }
    prevGapXRef.current = current;
  }, [config.gapX]); // eslint-disable-line react-hooks/exhaustive-deps

  const prevGapYRef = useRef(config.gapY);
  useEffect(() => {
    const current = config.gapY;
    const prev = prevGapYRef.current;
    if (current !== prev && config.stickers.length > 0) {
      const delta = current - prev;
      config.stickers.forEach((s) =>
        updateSticker(s.id, { y: s.y + ((layout.rows - 1) * delta) / 2 }),
      );
    }
    prevGapYRef.current = current;
  }, [config.gapY]); // eslint-disable-line react-hooks/exhaustive-deps

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [gifLoading, setGifLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareConfirmOpen, setShareConfirmOpen] = useState(false);
  const [shareResultOpen, setShareResultOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [gnbMounted, setGnbMounted] = useState(false);
  useEffect(() => setGnbMounted(true), []);

  // Track mouse for sticker follower
  useEffect(() => {
    if (!activeStickerType) return;
    const onMove = (e: MouseEvent) =>
      setMousePos({ x: e.clientX, y: e.clientY });
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, [activeStickerType]);

  // Deactivate when clicking outside strip and sticker picker
  useEffect(() => {
    if (!activeStickerType) return;
    const onClick = (e: MouseEvent) => {
      const insideStrip = stripWrapperRef.current?.contains(e.target as Node);
      const insidePicker = stickerPickerRef.current?.contains(e.target as Node);
      if (!insideStrip && !insidePicker) setActiveStickerType(null);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [activeStickerType]);

  function handleStripClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!activeStickerType || !stripRef.current) return;
    const rect = stripRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - config.frameWidth;
    const y = e.clientY - rect.top - config.frameWidth;
    addSticker({
      id: crypto.randomUUID(),
      type: activeStickerType,
      x,
      y,
      scale: 1,
      rotate: Math.round(Math.random() * 30 - 15),
    });
    setActiveStickerType(null);
  }

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

  function handleShare() {
    setShareConfirmOpen(true);
  }

  async function handleShareConfirm() {
    setShareConfirmOpen(false);
    setShareLoading(true);
    try {
      const dataUrl = await getPngDataUrl();

      const compressed = await compressToTarget(dataUrl);

      const formData = new FormData();
      formData.append("image", compressed, "strip.jpg");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (response.status === 429) {
        const { error } = await response.json();
        toast.error(error);
        return;
      }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        toast.error(`Upload failed (${response.status}): ${body.error ?? "Please try again."}`);
        return;
      }
      const { url } = await response.json();
      setShareUrl(url);
      setShareResultOpen(true);
    } finally {
      setShareLoading(false);
    }
  }

  async function handleDownloadGif() {
    setGifLoading(true);
    try {
      const blob = await exportStripGif(
        selectedPhotos,
        FILTER_CSS[config.filter],
      );
      const filename = "4-cut-life.gif";
      const file = new File([blob], filename, { type: "image/gif" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    } finally {
      setGifLoading(false);
    }
  }

  function handleStartAgain() {
    router.replace("/layout-select");
    setTimeout(() => reset(), 50);
  }

  const ActiveStickerIcon = activeStickerType
    ? STICKER_COMPONENTS[activeStickerType]
    : null;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Sticker cursor follower */}
      {activeStickerType && ActiveStickerIcon && (
        <div
          style={{
            position: "fixed",
            left: mousePos.x,
            top: mousePos.y,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          <ActiveStickerIcon size={36} />
        </div>
      )}

      {/* Inject action buttons into GNB via portal */}
      {gnbMounted &&
        document.getElementById("gnb-portal") &&
        createPortal(
          <>
            <Button size="sm" onClick={handleDownloadPng}>
              Download
            </Button>
            {/* TODO: re-enable once QR sharing backend is ready
            <Button size="sm" variant="outline" onClick={handleDownloadQr}>
              Download via QR
            </Button> */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              disabled={shareLoading}
            >
              {shareLoading ? "Uploading…" : "Share"}
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
          </>,
          document.getElementById("gnb-portal")!,
        )}

      <div className="flex flex-1 flex-col lg:flex-row gap-0">
        {/* Left — strip preview */}
        <div className="flex-1 flex items-start justify-center p-8 bg-[#eee] relative overflow-auto">
          <div
            ref={stripWrapperRef}
            onClick={handleStripClick}
            style={{
              position: "relative",
              cursor: activeStickerType ? "none" : "default",
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
            }}
          >
            <PhotoStrip
              photos={photosForStrip}
              layout={layout}
              config={config}
              stripRef={stripRef}
              className="shadow-xl"
            />
            <StickerOverlay
              stickers={config.stickers}
              stripRef={stripRef}
              frameWidth={config.frameWidth}
              disabled={!!activeStickerType}
              onMove={(id, x, y) => updateSticker(id, { x, y })}
              onResize={(id, scale) => updateSticker(id, { scale })}
            />
          </div>

          {/* Floating zoom controls */}
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-md">
            <button
              onClick={() =>
                setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))
              }
              disabled={zoom <= ZOOM_MIN}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium hover:bg-black/5 disabled:opacity-30 transition-colors"
            >
              −
            </button>
            <button
              onClick={() => setZoom(1)}
              className="min-w-[3rem] text-center text-xs font-medium px-1 hover:bg-black/5 rounded-full py-0.5 transition-colors"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() =>
                setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))
              }
              disabled={zoom >= ZOOM_MAX}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium hover:bg-black/5 disabled:opacity-30 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Middle — thumbnail rail (only when there are more photos than slots) */}
        {capturedPhotos.length > 0 && (
          <div className="flex flex-row lg:flex-col gap-2 p-2 place-items-center overflow-auto border-l border-[#bbb] bg-background lg:w-24">
            <button
              onClick={() => setSelectedPhotos([])}
              disabled={selectedPhotos.length === 0}
              className="shrink-0 text-[10px] text-foreground border border-border rounded px-1.5 py-1 hover:border-destructive hover:text-destructive transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              Deselect all
            </button>
            {capturedPhotos.map((src, i) => (
              <SelectablePhotoThumbnail
                key={i}
                src={src}
                index={i}
                selectedIndex={selectedPhotos.indexOf(src)}
                disabled={false}
                size={72}
                onClick={() => handleThumbnailToggle(src)}
              />
            ))}
          </div>
        )}

        {/* Right — controls */}
        <aside className="w-full lg:w-80 border-l border-[#bbb] overflow-y-auto p-6 space-y-8">
          {/* Reset controls */}
          <div className="flex justify-center">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => {
                setFrameColor(DEFAULT_STRIP_CONFIG.frameColor);
                setFrameWidth(DEFAULT_STRIP_CONFIG.frameWidth);
                setGapX(DEFAULT_STRIP_CONFIG.gapX);
                setGapY(DEFAULT_STRIP_CONFIG.gapY);
                setPhotoWidth(null);
                setFilter("none");
                config.stickers.forEach((s) => removeSticker(s.id));
                setTimestamp(false, "");
              }}
            >
              Reset to defaults
            </Button>
          </div>

          {/* Frame color */}
          <section className="space-y-3">
            <SectionLabel>Frame color</SectionLabel>
            <BlockPicker
              triangle="hide"
              width="100%"
              color={config.frameColor}
              colors={FRAME_COLORS}
              onChange={(c) => setFrameColor(c.hex)}
            />
          </section>

          <SliderControl
            label="Photo width"
            value={config.photoWidth ?? layout.width}
            min={layout.width}
            max={layout.height}
            step={PHOTO_WIDTH_STEP}
            onChange={(v) => setPhotoWidth(v === layout.width ? null : v)}
          />

          <SliderControl
            label="Frame width"
            value={config.frameWidth}
            min={FRAME_WIDTH_MIN}
            max={FRAME_WIDTH_MAX}
            step={FRAME_WIDTH_STEP}
            onChange={setFrameWidth}
          />

          {/* Gap X / Y */}
          <section className="space-y-3">
            <SectionLabel>Gap</SectionLabel>
            <div className="space-y-2">
              <SliderControl
                label="Horizontal"
                value={config.gapX}
                min={GAP_MIN}
                max={GAP_MAX}
                step={GAP_STEP}
                onChange={setGapX}
              />
              <SliderControl
                label="Vertical"
                value={config.gapY}
                min={GAP_MIN}
                max={GAP_MAX}
                step={GAP_STEP}
                onChange={setGapY}
              />
            </div>
          </section>

          {/* Timestamp */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <SectionLabel>Timestamp</SectionLabel>
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

          {/* Filter */}
          <section className="space-y-3">
            <SectionLabel>Filter</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(FILTER_LABELS) as FilterId[])
                .filter((id) => id !== "none")
                .map((id) => (
                  <SelectOptionButton
                    key={id}
                    selected={config.filter === id}
                    onClick={() =>
                      setFilter(id === config.filter ? "none" : id)
                    }
                    className="text-xs px-3 py-2"
                  >
                    {FILTER_LABELS[id]}
                  </SelectOptionButton>
                ))}
            </div>
          </section>

          {/* Stickers */}
          <section className="space-y-3" ref={stickerPickerRef}>
            <SectionLabel>
              Stickers
              {activeStickerType && (
                <span className="ml-2 normal-case text-primary">
                  — click on the strip to place
                </span>
              )}
            </SectionLabel>
            <div className="flex flex-wrap gap-2">
              {STICKER_TYPES.map((type) => {
                const Icon = STICKER_COMPONENTS[type];
                return (
                  <button
                    key={type}
                    onClick={() =>
                      setActiveStickerType(
                        activeStickerType === type ? null : type,
                      )
                    }
                    className={cn(
                      "w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-colors",
                      activeStickerType === type
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40",
                    )}
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
        </aside>
      </div>

      {/* Share — confirmation dialog */}
      <Dialog open={shareConfirmOpen} onOpenChange={setShareConfirmOpen}>
        <DialogContent className="max-w-sm space-y-4">
          <DialogHeader>
            <DialogTitle>Before you share</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your photo strip will be{" "}
            <strong className="text-foreground">uploaded to the cloud</strong>{" "}
            and anyone with the link will be able to view and download it.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The link will be available for{" "}
            <strong className="text-foreground">30 days</strong>, after which it
            will expire.
          </p>
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShareConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleShareConfirm}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share — result dialog */}
      <Dialog open={shareResultOpen} onOpenChange={setShareResultOpen}>
        <DialogContent className="max-w-sm space-y-4">
          <DialogHeader>
            <DialogTitle>Share your strip</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Anyone with this link can view and download your photo strip for the
            next 30 days.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl ?? ""}
              className="flex-1 text-xs border rounded-md px-3 py-2 bg-muted truncate"
            />
            <Button
              size="sm"
              onClick={() => {
                if (shareUrl) navigator.clipboard.writeText(shareUrl);
                toast.success("Link copied!");
              }}
            >
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
  const capturedPhotos = usePhotoStore((s) => s.capturedPhotos);
  return (
    <NavigationGuard
      check={() => {
        if (!layout) return "/layout-select";
        if (capturedPhotos.length === 0) return "/mode-select";
        return null;
      }}
    >
      <EditContent />
    </NavigationGuard>
  );
}
