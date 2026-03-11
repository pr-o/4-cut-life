"use client";

type Props = {
  photos: string[];
  total: number;
  size?: number; // px, default 64
};

export default function PhotoThumbnailGrid({ photos, total, size = 64 }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-center max-w-sm">
      {Array.from({ length: total }).map((_, i) => {
        const src = photos[i];
        return src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={`Photo ${i + 1}`}
            style={{ width: size, height: size }}
            className="object-cover rounded-lg border border-border"
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
