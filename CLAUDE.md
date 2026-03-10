# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A web-based re-creation of Life-4-Cuts (인생네컷), a popular South Korean photo booth experience. The app allows users to take a series of 4 (or more, or less) photos with filters and print/download them in the classic photo strip format.

## Tech Stack

- **Framework**: Next.js (App Router) with TypeScript
- **UI**: shadcn/ui components
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

For tests (once configured):
```bash
pnpm test         # Run all tests
pnpm test <file>  # Run a single test file
```

## Architecture

Once scaffolded, the project will follow the Next.js App Router convention:

- `app/` — routes and layouts
- `components/` — shared React components; shadcn/ui components live in `components/ui/`
- `lib/` — utility functions and shared logic (e.g. canvas/filter helpers)
- `public/` — static assets (fonts, icons, frame overlays)

### Core Features to Implement

1. **Camera capture** — access device camera via `getUserMedia`, capture frames
2. **Photo filters** — apply CSS or Canvas-based filters (brightness, contrast, vintage, etc.)
3. **Photo strip layout** — arrange 4 photos into the classic vertical strip with branding/border
4. **Download/print** — export the strip as an image via `canvas.toBlob` or `html-to-image`
