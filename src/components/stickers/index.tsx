import type { StickerType } from "@/types"

type StickerProps = { size?: number }

function Star({ size = 32 }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <polygon
        points="16,2 20,12 31,12 22,19 25,30 16,23 7,30 10,19 1,12 12,12"
        fill="#FFD700"
        stroke="#FFA500"
        strokeWidth="1"
      />
    </svg>
  )
}

function Heart({ size = 32 }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M16 28S3 20 3 11a6 6 0 0 1 13-1.5A6 6 0 0 1 29 11c0 9-13 17-13 17z"
        fill="#FF6B9D"
        stroke="#FF4081"
        strokeWidth="1"
      />
    </svg>
  )
}

function Flower({ size = 32 }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="8"  r="5" fill="#FF9ECD" />
      <circle cx="16" cy="24" r="5" fill="#FF9ECD" />
      <circle cx="8"  cy="16" r="5" fill="#FF9ECD" />
      <circle cx="24" cy="16" r="5" fill="#FF9ECD" />
      <circle cx="16" cy="16" r="5" fill="#FFD700" />
    </svg>
  )
}

function Crown({ size = 32 }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <polygon
        points="2,26 6,12 12,20 16,8 20,20 26,12 30,26"
        fill="#FFD700"
        stroke="#FFA500"
        strokeWidth="1"
      />
      <rect x="2" y="26" width="28" height="3" rx="1" fill="#FFA500" />
    </svg>
  )
}

function Ribbon({ size = 32 }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 16 L4 6 L10 16 L4 26 Z"  fill="#FF6B9D" />
      <path d="M16 16 L28 6 L22 16 L28 26 Z" fill="#FF6B9D" />
      <circle cx="16" cy="16" r="4" fill="#FFD700" />
    </svg>
  )
}

function Sparkle({ size = 32 }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 2 L17.5 14.5 L30 16 L17.5 17.5 L16 30 L14.5 17.5 L2 16 L14.5 14.5 Z"
        fill="#FFD700" stroke="#FFA500" strokeWidth="0.5" />
      <path d="M6 6 L6.8 10.8 L11.5 11.5 L6.8 12.2 L6 17 L5.2 12.2 L0.5 11.5 L5.2 10.8 Z"
        fill="#FFE066" />
      <path d="M26 20 L26.6 23.6 L30 24.2 L26.6 24.8 L26 28.4 L25.4 24.8 L22 24.2 L25.4 23.6 Z"
        fill="#FFE066" />
    </svg>
  )
}

function Bow({ size = 32 }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <ellipse cx="9"  cy="16" rx="8" ry="6" fill="#FF6B9D" />
      <ellipse cx="23" cy="16" rx="8" ry="6" fill="#FF6B9D" />
      <circle  cx="16" cy="16" r="4"         fill="#FF4081" />
    </svg>
  )
}

export const STICKER_COMPONENTS: Record<StickerType, React.FC<StickerProps>> = {
  star:    Star,
  heart:   Heart,
  flower:  Flower,
  crown:   Crown,
  ribbon:  Ribbon,
  sparkle: Sparkle,
  bow:     Bow,
}
