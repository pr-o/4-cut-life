import PhotoImg from "@/components/PhotoImg";

type Props = {
  src: string;
  index: number;
  width: number;
  height: number;
  style?: React.CSSProperties;
};

export default function PhotoOrPlaceholder({ src, index, width, height, style }: Props) {
  if (src) {
    return (
      <PhotoImg
        src={src}
        alt={`Photo ${index + 1}`}
        draggable="false"
        style={{ display: "block", width, height, ...style }}
      />
    );
  }
  return (
    <div style={{ width, height, backgroundColor: "#d1d5db" }} />
  );
}
