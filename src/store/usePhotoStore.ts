import { create } from "zustand"
import type { FilterId, Layout, Sticker, StripConfig } from "@/types"
import { DEFAULT_STRIP_CONFIG } from "@/lib/constants"

interface PhotoStore {
  // Step 2
  layout: Layout | null
  setLayout: (layout: Layout) => void

  // Step 4
  capturedPhotos: string[]
  setCapturedPhotos: (photos: string[]) => void
  addCapturedPhoto: (photo: string) => void
  replaceCapturedPhoto: (index: number, photo: string) => void

  // Step 5
  selectedPhotos: string[]
  setSelectedPhotos: (photos: string[]) => void

  // Step 6
  stripConfig: StripConfig
  setFrameColor: (color: string) => void
  setFrameWidth: (width: number) => void
  setGapX: (gap: number) => void
  setGapY: (gap: number) => void
  setFilter: (filter: FilterId) => void
  addSticker: (sticker: Sticker) => void
  updateSticker: (id: string, patch: Partial<Sticker>) => void
  removeSticker: (id: string) => void
  setTimestamp: (show: boolean, text?: string) => void

  reset: () => void
}

export const usePhotoStore = create<PhotoStore>((set) => ({
  layout: null,
  setLayout: (layout) => set({ layout }),

  capturedPhotos: [],
  setCapturedPhotos: (photos) => set({ capturedPhotos: photos }),
  addCapturedPhoto: (photo) =>
    set((s) => ({ capturedPhotos: [...s.capturedPhotos, photo] })),
  replaceCapturedPhoto: (index, photo) =>
    set((s) => {
      const photos = [...s.capturedPhotos]
      photos[index] = photo
      return { capturedPhotos: photos }
    }),

  selectedPhotos: [],
  setSelectedPhotos: (photos) => set({ selectedPhotos: photos }),

  stripConfig: { ...DEFAULT_STRIP_CONFIG },
  setFrameColor: (frameColor) =>
    set((s) => ({ stripConfig: { ...s.stripConfig, frameColor } })),
  setFrameWidth: (frameWidth) =>
    set((s) => ({ stripConfig: { ...s.stripConfig, frameWidth } })),
  setGapX: (gapX) =>
    set((s) => ({ stripConfig: { ...s.stripConfig, gapX } })),
  setGapY: (gapY) =>
    set((s) => ({ stripConfig: { ...s.stripConfig, gapY } })),
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
          sk.id === id ? { ...sk, ...patch } : sk
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
      layout: null,
      capturedPhotos: [],
      selectedPhotos: [],
      stripConfig: { ...DEFAULT_STRIP_CONFIG },
    }),
}))
