"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import NavigationGuard from "@/components/NavigationGuard";
import GoBackButton from "@/components/GoBackButton";
import { usePhotoStore } from "@/store/usePhotoStore";
import { ROUTES } from "@/lib/routes";
import { toast } from "sonner";

type CaptureState = "idle" | "countdown" | "flash" | "done";

const CAPTURE_SIZE = 1080;

function CameraCapture() {
  const router = useRouter();
  const layout = usePhotoStore((s) => s.layout)!;
  const countdownSeconds = usePhotoStore((s) => s.countdownSeconds);
  const photoCount = usePhotoStore((s) => s.photoCount);
  const setCapturedPhotos = usePhotoStore((s) => s.setCapturedPhotos);
  const setSelectedPhotos = usePhotoStore((s) => s.setSelectedPhotos);

  const slotCount = layout.cols * layout.rows;
  const totalShots = photoCount ?? slotCount;

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const shutterRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    shutterRef.current = new Audio("/assets/sounds/camera-shutter.wav");
    shutterRef.current.preload = "auto";
  }, []);

  const [photos, setPhotos] = useState<string[]>([]);
  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [shooting, setShooting] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        toast.error("No camera found. Please choose to upload photos instead.");
        router.replace("/mode-select");
      });

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [router]);

  const captureFrame = useCallback((): string => {
    const video = videoRef.current!;
    const canvas = document.createElement("canvas");
    canvas.width = CAPTURE_SIZE;
    canvas.height = CAPTURE_SIZE;
    const ctx = canvas.getContext("2d")!;
    ctx.translate(CAPTURE_SIZE, 0);
    ctx.scale(-1, 1);
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const side = Math.min(vw, vh);
    const sx = (vw - side) / 2;
    const sy = (vh - side) / 2;
    ctx.drawImage(video, sx, sy, side, side, 0, 0, CAPTURE_SIZE, CAPTURE_SIZE);
    return canvas.toDataURL("image/jpeg", 0.92);
  }, []);

  const runShootingSession = useCallback(async () => {
    if (shooting) return;
    setShooting(true);
    setPhotos([]);

    for (let i = 0; i < totalShots; i++) {
      setCaptureState("countdown");
      for (let t = countdownSeconds; t > 0; t--) {
        setCountdown(t);
        await new Promise((r) => setTimeout(r, 1000));
      }
      setCaptureState("flash");
      shutterRef.current?.play().catch(() => {});
      const dataUrl = captureFrame();
      setPhotos((prev) => [...prev, dataUrl]);
      await new Promise((r) => setTimeout(r, 300));
    }

    setCaptureState("done");
    setShooting(false);
  }, [shooting, totalShots, countdownSeconds, captureFrame]);

  function handleContinue() {
    setCapturedPhotos(photos);
    setSelectedPhotos(photos.slice(0, slotCount));
    router.push("/edit");
  }

  return (
    <main className="min-h-screen flex flex-col items-center gap-8 px-6 py-12">
      <h1 className="text-2xl font-bold">
        {captureState === "done" ? "All done!" : "Get ready"}
      </h1>

      <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
        {captureState === "countdown" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-8xl font-black drop-shadow-lg opacity-50">
              {countdown}
            </span>
          </div>
        )}
        {captureState === "flash" && (
          <div className="absolute inset-0 bg-white opacity-80" />
        )}
        {shooting && (
          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {photos.length} / {totalShots}
          </div>
        )}
      </div>

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center max-w-sm">
          {photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`Shot ${i + 1}`}
              className="w-16 h-16 object-cover rounded-lg border border-border"
            />
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-3 w-full max-w-sm">
        {captureState !== "done" && (
          <Button
            size="lg"
            className="w-full"
            onClick={runShootingSession}
            disabled={shooting}
          >
            {shooting ? "Shooting…" : "Start shooting"}
          </Button>
        )}
        {captureState === "done" && (
          <div className="flex gap-3 w-full">
            <div className="flex-1"><GoBackButton href={ROUTES.instructions} /></div>
            <Button size="lg" className="flex-1" onClick={handleContinue}>
              Continue
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CapturePage() {
  const layout = usePhotoStore((s) => s.layout);
  const shootingMode = usePhotoStore((s) => s.shootingMode);
  return (
    <NavigationGuard
      check={() => {
        if (!layout) return "/layout-select";
        if (shootingMode !== "camera") return "/mode-select";
        return null;
      }}
    >
      <CameraCapture />
    </NavigationGuard>
  );
}
