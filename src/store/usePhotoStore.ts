import { create } from "zustand";
import type { FilterId, Layout, Sticker, StripConfig } from "@/types";
import { DEFAULT_STRIP_CONFIG, LAYOUTS } from "@/lib/constants";

export type ShootingMode = "camera" | "upload";

interface PhotoStore {
  // Step 2
  layout: Layout | null;
  setLayout: (layout: Layout) => void;

  // Step 3 — mode
  shootingMode: ShootingMode | null;
  setShootingMode: (mode: ShootingMode) => void;

  // Step 4 — camera settings (only relevant for camera mode)
  countdownSeconds: number;
  setCountdownSeconds: (n: number) => void;
  photoCount: number | null; // null = use layout slot count as default
  setPhotoCount: (n: number) => void;

  // Step 4 — captured
  capturedPhotos: string[];
  setCapturedPhotos: (photos: string[]) => void;
  addCapturedPhoto: (photo: string) => void;
  replaceCapturedPhoto: (index: number, photo: string) => void;

  // Step 5
  selectedPhotos: string[];
  setSelectedPhotos: (photos: string[]) => void;

  // Step 6
  stripConfig: StripConfig;
  setFrameColor: (color: string) => void;
  setFrameWidth: (width: number) => void;
  setGapX: (gap: number) => void;
  setGapY: (gap: number) => void;
  setPhotoWidth: (width: number | null) => void;
  setFilter: (filter: FilterId) => void;
  addSticker: (sticker: Sticker) => void;
  updateSticker: (id: string, patch: Partial<Sticker>) => void;
  removeSticker: (id: string) => void;
  setTimestamp: (show: boolean, text?: string) => void;

  reset: () => void;
}

export const usePhotoStore = create<PhotoStore>((set) => ({
  layout: LAYOUTS[0],
  setLayout: (layout) => set({ layout }),

  shootingMode: null,
  setShootingMode: (shootingMode) => set({ shootingMode }),

  countdownSeconds: 3,
  setCountdownSeconds: (countdownSeconds) => set({ countdownSeconds }),
  photoCount: null,
  setPhotoCount: (photoCount) => set({ photoCount }),

  capturedPhotos: [],
  setCapturedPhotos: (photos) => set({ capturedPhotos: photos }),
  addCapturedPhoto: (photo) =>
    set((s) => ({ capturedPhotos: [...s.capturedPhotos, photo] })),
  replaceCapturedPhoto: (index, photo) =>
    set((s) => {
      const photos = [...s.capturedPhotos];
      photos[index] = photo;
      return { capturedPhotos: photos };
    }),

  selectedPhotos: [],
  setSelectedPhotos: (photos) => set({ selectedPhotos: photos }),

  stripConfig: { ...DEFAULT_STRIP_CONFIG },
  setFrameColor: (frameColor) =>
    set((s) => ({ stripConfig: { ...s.stripConfig, frameColor } })),
  setFrameWidth: (frameWidth) =>
    set((s) => ({ stripConfig: { ...s.stripConfig, frameWidth } })),
  setGapX: (gapX) => set((s) => ({ stripConfig: { ...s.stripConfig, gapX } })),
  setGapY: (gapY) => set((s) => ({ stripConfig: { ...s.stripConfig, gapY } })),
  setPhotoWidth: (photoWidth) =>
    set((s) => ({ stripConfig: { ...s.stripConfig, photoWidth } })),
  setFilter: (filter) =>
    set((s) => ({ stripConfig: { ...s.stripConfig, filter } })),
  addSticker: (sticker) =>
    set((s) => ({
      stripConfig: {
        ...s.stripConfig,
        stickers: [...s.stripConfig.stickers, sticker],
      },
    })),
  updateSticker: (id, patch) =>
    set((s) => ({
      stripConfig: {
        ...s.stripConfig,
        stickers: s.stripConfig.stickers.map((sk) =>
          sk.id === id ? { ...sk, ...patch } : sk,
        ),
      },
    })),
  removeSticker: (id) =>
    set((s) => ({
      stripConfig: {
        ...s.stripConfig,
        stickers: s.stripConfig.stickers.filter((sk) => sk.id !== id),
      },
    })),
  setTimestamp: (show, text) =>
    set((s) => ({
      stripConfig: {
        ...s.stripConfig,
        showTimestamp: show,
        timestampText: text ?? s.stripConfig.timestampText,
      },
    })),

  reset: () =>
    set({
      layout: LAYOUTS[0],
      shootingMode: null,
      countdownSeconds: 3,
      photoCount: null,
      capturedPhotos: [],
      selectedPhotos: [],
      stripConfig: { ...DEFAULT_STRIP_CONFIG },
    }),
}));
