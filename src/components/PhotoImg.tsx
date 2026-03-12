/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
};

export default function PhotoImg({ src, alt, className, ...props }: Props) {
  return <img src={src} alt={alt} className={cn("object-cover", className)} {...props} />;
}
