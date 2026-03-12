import { cn } from "@/lib/utils";
import PhotoImg from "@/components/PhotoImg";

type Props = {
  src: string;
  index: number;
  selectedIndex: number; // -1 if not selected
  disabled?: boolean;    // dims when selection is full and this isn't selected
  size?: number;
  onClick: () => void;
};

export default function SelectablePhotoThumbnail({
  src,
  index,
  selectedIndex,
  disabled = false,
  size = 72,
  onClick,
}: Props) {
  const isSelected = selectedIndex !== -1;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative shrink-0 rounded overflow-hidden",
        !isSelected && "border-2 border-transparent",
        isSelected && "border-2 border-primary",
      )}
      style={{ width: size, height: size }}
    >
      <PhotoImg
        src={src}
        alt={`Photo ${index + 1}`}
        className="w-full h-full"
      />
      {!isSelected && disabled && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      {isSelected && (
        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
          {selectedIndex + 1}
        </div>
      )}
    </button>
  );
}
