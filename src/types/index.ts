export type Layout = {
  cols: number;
  rows: number;
  width: number; // of each photo
  height: number; // of each photo
};

export type FilterId =
  | "none"
  | "bw"
  | "sepia"
  | "vintage"
  | "soft"
  | "noir"
  | "vivid";

export type StickerType =
  | "star"
  | "heart"
  | "flower"
  | "crown"
  | "sparkle";

export type Sticker = {
  id: string;
  type: StickerType;
  x: number; // px from left edge of photo grid (excludes frame padding)
  y: number; // px from top edge of photo grid (excludes frame padding)
  scale: number;
  rotate: number;
};

export type StripConfig = {
  frameColor: string;
  frameWidth: number;
  gapX: number;
  gapY: number;
  photoWidth: number | null; // null = use layout default
  filter: FilterId;
  stickers: Sticker[];
  showTimestamp: boolean;
  timestampText: string;
};
