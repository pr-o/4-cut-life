import type { FilterId, Layout, StickerType } from "@/types";

export const APP_TITLE = `4cut.life`;

export const LAYOUTS: Layout[] = [
  { cols: 1, rows: 2, width: 190, height: 280 },
  { cols: 1, rows: 3, width: 142, height: 210 },
  { cols: 1, rows: 4, width: 95, height: 140 },
  { cols: 2, rows: 2, width: 190, height: 280 },
  { cols: 2, rows: 3, width: 142, height: 210 },
  { cols: 2, rows: 4, width: 95, height: 140 },
];

export const TOTAL_CAPTURES = 8;
export const COUNTDOWN_SECONDS = 3;

export const FILTER_CSS: Record<FilterId, string> = {
  none: "",
  bw: "grayscale(1)",
  sepia: "sepia(0.8)",
  vintage: "sepia(0.5) contrast(0.9) brightness(1.1) saturate(0.8)",
  soft: "brightness(1.1) contrast(0.9) saturate(0.9)",
  noir: "grayscale(1) contrast(1.4) brightness(0.85)",
  vivid: "saturate(1.5) contrast(1.1)",
};

export const FILTER_LABELS: Record<FilterId, string> = {
  none: "No Filter",
  bw: "B&W",
  sepia: "Sepia",
  vintage: "Vintage",
  soft: "Soft",
  noir: "Noir",
  vivid: "Vivid",
};

export const STICKER_TYPES: StickerType[] = [
  "star",
  "heart",
  "flower",
  "crown",
  "ribbon",
  "sparkle",
  "bow",
];

export const DEFAULT_STRIP_CONFIG = {
  frameColor: "#000000",
  frameWidth: 12,
  gapX: 4,
  gapY: 4,
  photoWidth: null,
  filter: "none" as FilterId,
  stickers: [],
  showTimestamp: false,
  timestampText: "",
};

export const PREVIEW_WIDTH = 400;
export const EXPORT_PIXEL_RATIO = 3;

export const FRAME_WIDTH_MIN = 2;
export const FRAME_WIDTH_MAX = 40;
export const GAP_MIN = 2;
export const GAP_MAX = 24;
