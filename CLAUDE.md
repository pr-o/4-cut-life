# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A web-based re-creation of Life-4-Cuts (인생네컷), a popular South Korean photo booth experience. Users move through a multi-step flow to capture photos, select a layout, apply filters/stickers, and download or share the final photo strip/grid.

## Tech Stack

- **Framework**: Next.js (App Router) with TypeScript
- **UI**: shadcn/ui (Radix Nova preset) + Tailwind CSS
- **State**: Zustand (cross-page session state)
- **Package manager**: pnpm
- **Node version**: v22.16.0 (see `.nvmrc`)

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript compiler check (tsc --noEmit)
```

## App Flow (6 Steps)

### Step 1 — Landing (`/`)
- Showcases example photo strips built with the app
- Brief introduction text
- "Start" button → navigates to Step 2

### Step 2 — Layout Selection (`/layout-select`)
- User picks a layout option (displayed as visual cards):
  - `1×2`, `1×3`, `1×4` (1 column × N rows)
  - `2×2`, `2×3`, `2×4` (2 columns × N rows)
  - Format is **column × row**; total photos = cols × rows
- "Continue" button → navigates to Step 3

### Step 3 — Instructions (`/instructions`)
- Static page explaining the shooting rules:
  > "You have 3 seconds for each shot (no retakes). We will capture you 8 times in a row and you will select which to use. After the shoot, you may download or share with your friends."
- "Continue" button → navigates to Step 4

### Step 4 — Capture (`/capture`)
- Two modes:
  1. **Camera**: streams live feed via `getUserMedia`; shoots 8 photos consecutively with a 3-second countdown between each
  2. **Upload**: file input to upload photos from device
- If no camera/webcam is detected, alert user via `window.alert`
- On completion → navigates to Step 5

### Step 5 — Photo Selection (`/select`)
- Shows all 8 captured/uploaded photos in a grid
- User selects exactly `cols × rows` photos (based on chosen layout)
- "Continue" button → navigates to Step 6

### Step 6 — Editing & Export (`/edit`)
- **Left panel**: live preview of the final photo strip/grid
  - Photos in selected order, arranged per chosen layout
- **Right panel**: customization controls
  - Frame width (slider)
  - Frame color (color picker)
  - Gap size X / Gap size Y between photos (sliders)
  - Photo filter: `No Filter` | `Black & White` | `Sepia` | `Vintage` | `Soft` | `Noir` | `Vivid`
  - Stickers: decorative shapes/images placed around frames (not overlapping photo area)
  - Timestamp toggle: shows/hides a timestamp at the bottom of the strip; defaults to time of creation; editable via input field
- **Top action bar**:
  - `Download` — exports strip as PNG
  - `Download via QR` — generates a QR code linking to the image
  - `Share` — uses Web Share API
  - `Download GIF` — exports an animated GIF cycling through the photos
  - `Start Again` — resets state and returns to Step 1

## Architecture

```
src/
  app/
    page.tsx                  # Step 1: Landing
    layout-select/page.tsx    # Step 2: Layout selection
    instructions/page.tsx     # Step 3: Instructions
    capture/page.tsx          # Step 4: Camera / upload
    select/page.tsx           # Step 5: Photo selection
    edit/page.tsx             # Step 6: Editing & export
    layout.tsx                # Root layout
    globals.css
  components/
    ui/                       # shadcn/ui primitives
    PhotoStrip.tsx            # Renders the strip/grid preview (used in Steps 5 & 6)
    CameraCapture.tsx         # Camera feed + countdown + capture logic
  lib/
    store.ts                  # Zustand store (layout, photos, editing state)
    filters.ts                # CSS filter string map for each filter option
    export.ts                 # Download PNG, GIF, QR helpers
    types.ts                  # Shared TypeScript types
  hooks/
    useCamera.ts              # getUserMedia wrapper hook
  public/
    stickers/                 # SVG sticker assets
    example-strips/           # Example strip images for landing page
```

## Key State (Zustand store)

```typescript
interface PhotoBoothStore {
  layout: { cols: number; rows: number } | null
  capturedPhotos: string[]   // base64 data URLs, up to 8
  selectedPhotos: string[]   // subset chosen by user, length = cols × rows

  // Editing
  frameWidth: number
  frameColor: string
  gapX: number
  gapY: number
  filter: FilterType         // 'none' | 'bw' | 'sepia' | 'vintage' | 'soft' | 'noir' | 'vivid'
  stickers: Sticker[]
  showTimestamp: boolean
  timestamp: string          // ISO string, editable

  // Actions
  setLayout(layout): void
  setCapturedPhotos(photos): void
  setSelectedPhotos(photos): void
  updateEditing(patch): void
  reset(): void
}
```

## CSS Filters

| Option | CSS value |
|---|---|
| No Filter | `none` |
| Black & White | `grayscale(100%)` |
| Sepia | `sepia(100%)` |
| Vintage | `sepia(50%) contrast(90%) brightness(110%) saturate(80%)` |
| Soft | `brightness(110%) contrast(90%) saturate(90%)` |
| Noir | `grayscale(100%) contrast(120%) brightness(90%)` |
| Vivid | `saturate(150%) contrast(110%)` |

## Export Details

- **PNG**: `html-to-image` captures the `PhotoStrip` DOM node as PNG
- **GIF**: `gifenc` animates through `selectedPhotos`, one frame per photo
- **QR**: `qrcode` library encodes a data URL or hosted image URL into a QR image shown in a modal
- **Share**: `navigator.share()` with the exported PNG blob (Web Share API)
