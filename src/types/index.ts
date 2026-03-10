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
  | "ribbon"
  | "sparkle"
  | "bow";

export type Sticker = {
  id: string;
  type: StickerType;
  x: number; // % of strip width
  y: number; // % of strip height
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
