"use client";

import PhotoImg from "@/components/PhotoImg";

type Props = {
  photos: string[];
  total: number;
  size?: number;
};

export default function PhotoThumbnailGrid({ photos, total, size = 64 }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-center max-w-sm">
      {Array.from({ length: total }).map((_, i) => {
        const src = photos[i];
        return src ? (
          <PhotoImg
            key={i}
            src={src}
            alt={`Photo ${i + 1}`}
            style={{ width: size, height: size }}
            className="rounded-lg border border-border"
          />
        ) : (
          <div
            key={i}
            style={{ width: size, height: size }}
            className="rounded-lg border-2 border-dashed border-border"
          />
        );
      })}
    </div>
  );
}
