## 4-Cut-Life - [4cut.life](https://www.4cut.life)

A web-based re-creation of Life-4-Cuts, a.k.a. "인생네컷".

---

# 네컷인생 (4-Cut Life)

인생네컷 스타일의 웹 기반 포토부스 경험

인생네컷에서 영감을 받아 시작한 프로젝트로, 카메라 촬영 또는 사진 업로드를 통해 나만의 포토 스트립을 만들고 꾸미고 공유할 수 있는 웹앱이다.

## 주요 모듈

- Next.js 16 (App Router, 웹 프레임워크)
- TypeScript (타입 안전성)
- Tailwind CSS + shadcn/ui (UI 컴포넌트)
- Zustand (전역 상태 관리)
- next-intl (한국어/영어 다국어 지원)
- react-konva / konva (Canvas 기반 포토 스트립 렌더링 및 PNG 내보내기)
- gifenc (Web Worker 기반 애니메이션 GIF 생성)
- react-color (프레임 색상 선택기)
- qrcode.react (공유 링크 QR 코드 표시)
- Firebase Storage (공유 이미지 업로드)
- Upstash Redis (IP별 업로드 횟수 제한, 단축 URL 저장)

## 앱 흐름

총 6단계로 이루어진 플로우:

1. **랜딩 (`/`)**: 예시 포토 스트립 갤러리 및 앱 소개, "Start" 버튼
2. **레이아웃 선택 (`/layout-select`)**: 1×2, 1×3, 1×4, 2×2, 2×3, 2×4 중 레이아웃 선택
3. **모드 선택 (`/mode-select`)**: 카메라 촬영 또는 사진 업로드 선택
4. **촬영 설정 및 촬영 (`/instructions`, `/capture`)**: 카메라 선택 시 촬영 간격 및 사진 수 설정 후 카운트다운과 함께 자동 연속 촬영. 업로드 선택 시 `/upload`로 이동하여 파일 선택.
5. **편집 (`/edit`)**: 프레임 색상·너비, 사진 너비, 간격, 필터, 스티커, 타임스탬프 등 커스터마이징. 썸네일 레일에서 사진 선택 및 순서 변경. 각 사진 슬롯을 드래그(또는 모바일에서 터치)하여 상하좌우로 이동하거나, 스크롤(또는 모바일에서 핀치)로 확대·축소하여 크롭 위치를 조정할 수 있음.
6. **내보내기**: PNG 다운로드, GIF 다운로드, 클라우드 업로드 후 공유 링크 생성

## 공유 기능

- 공유 버튼 클릭 → Firebase Storage에 업로드 → 8자리 단축 URL 생성 (`/s/:id`)
- 단축 URL은 Redis에 30일간 저장 후 만료
- `/s/:id` 페이지는 Open Graph 메타태그를 포함하여 SNS 공유 시 포토 스트립 미리보기 표시
- 공유 다이얼로그에 QR 코드 표시 — 카메라로 스캔하여 바로 접속 가능
- IP당 하루 최대 20회 업로드 제한 (Upstash Redis 슬라이딩 윈도우)

## 테스트

### E2E 테스트 (Playwright)

```bash
pnpm test                        # 전체 E2E 테스트 실행
pnpm test:ui                     # 인터랙티브 UI 모드
pnpm test:snapshots              # 스냅샷 테스트만 실행
pnpm test:update-snapshots       # 스냅샷 기준선 갱신
```

- Chromium 단독 실행, `localhost:3000` 기준 (`pnpm build && pnpm start` 필요)
- 테스트 파일 위치: `tests/`
- 커버 범위: 랜딩, 레이아웃 선택, 모드 선택, 업로드 플로우, 편집 페이지, GNB 동작
- 스냅샷 테스트: 주요 페이지 상태 + 실제 Firebase 업로드를 포함한 공유 페이지 E2E 테스트
- Playwright MCP 서버 설정 완료 (`~/.claude/settings.json`) — Claude가 브라우저를 직접 제어 가능

### 단위 테스트 (Jest + React Testing Library)

```bash
pnpm test:unit                   # 단위 테스트 실행
pnpm test:unit:watch             # 워치 모드
```

- 테스트 파일 위치: `src/__tests__/`
- 커버 범위:
  - `utils.test.ts` — `dataUrlToBlob`, `isMobile`, `isIosSafari` 유틸리티 함수
  - `store.test.ts` — Zustand 스토어 액션 및 상태 변이
  - `components.test.tsx` — `SelectOptionButton`, `SectionLabel`, `SliderControl`, `PhotoThumbnailGrid`, `PhotoOrPlaceholder` 컴포넌트

## 환경 변수

`.env.local.example` 파일을 복사하여 `.env.local`로 작성:

```bash
cp .env.local.example .env.local
```

필요한 값:

- Firebase 프로젝트 설정 (`NEXT_PUBLIC_FIREBASE_*`)
- Upstash Redis REST URL 및 토큰 (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
- 배포 도메인 (`NEXT_PUBLIC_BASE_URL`) — OG 메타태그 절대 URL 생성에 필요

## 개선할 점

- [ ] 스티커 기능에서 SVG 드래그 앤 드롭이 일부 모바일 브라우저에서 불안정함.
- [ ] Firebase 클라이언트 SDK를 API 라우트에서 사용 중 → Firebase Admin SDK로 전환 권장.

---

# 네컷인생 (4-Cut Life)

A web-based photo booth experience inspired by Life-4-Cuts (인생네컷)

A project inspired by the popular Korean photo booth chain Life-4-Cuts. Users can take photos using their camera or upload existing ones, then customize the resulting photo strip with frames, filters, stickers, and timestamps — and download or share it.

## Key Modules

- Next.js 16 (App Router, web framework)
- TypeScript (type safety)
- Tailwind CSS + shadcn/ui (UI components)
- Zustand (global state management)
- next-intl (Korean/English i18n)
- react-konva / konva (Canvas-based photo strip rendering and PNG export)
- gifenc (Web Worker-based animated GIF generation)
- react-color (frame color picker)
- qrcode.react (QR code display for shareable links)
- Firebase Storage (cloud image upload for sharing)
- Upstash Redis (per-IP rate limiting, short URL storage)

## App Flow

A 6-step user flow:

1. **Landing (`/`)**: Example strip gallery and app intro, "Start" button
2. **Layout selection (`/layout-select`)**: Choose from 1×2, 1×3, 1×4, 2×2, 2×3, 2×4
3. **Mode selection (`/mode-select`)**: Choose between camera capture or photo upload
4. **Shoot settings & capture (`/instructions`, `/capture`)**: For camera mode, set countdown interval and number of shots, then auto-capture with countdown. For upload mode, navigate to `/upload` and select files.
5. **Editing (`/edit`)**: Customize frame color/width, photo width, gaps, filters, stickers, and timestamp. Select and reorder photos via the thumbnail rail. Drag (or touch on mobile) each photo slot to pan in any direction, or scroll (or pinch on mobile) to zoom in and adjust the crop — independently per slot.
6. **Export**: Download PNG, download GIF, or upload to cloud and generate a shareable link

## Share Feature

- Share button → upload to Firebase Storage → generate 8-char short URL (`/s/:id`)
- Short URLs are stored in Redis for 30 days, then expire
- `/s/:id` page includes Open Graph meta tags so the photo strip previews correctly when shared on social media or messengers
- Share dialog displays a QR code — scan with camera to open the link directly
- Rate-limited to 20 uploads per IP per day (Upstash Redis sliding window)

## Testing

### E2E Tests (Playwright)

```bash
pnpm test                        # Run all E2E tests
pnpm test:ui                     # Interactive UI mode
pnpm test:snapshots              # Run snapshot tests only
pnpm test:update-snapshots       # Regenerate snapshot baselines
```

- Runs on Chromium only, against `localhost:3000` (requires `pnpm build && pnpm start`)
- Test files: `tests/`
- Coverage: landing, layout select, mode select, upload flow, edit page, GNB behaviour
- Snapshot tests: key page states + a full real-upload E2E test for the share page (`/s/:id`)
- Playwright MCP server configured in `~/.claude/settings.json` — Claude can control the browser directly in conversation

### Unit Tests (Jest + React Testing Library)

```bash
pnpm test:unit                   # Run unit tests
pnpm test:unit:watch             # Watch mode
```

- Test files: `src/__tests__/`
- Coverage:
  - `utils.test.ts` — `dataUrlToBlob`, `isMobile`, `isIosSafari` utility functions
  - `store.test.ts` — Zustand store actions and state mutations
  - `components.test.tsx` — `SelectOptionButton`, `SectionLabel`, `SliderControl`, `PhotoThumbnailGrid`, `PhotoOrPlaceholder`

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

Required:

- Firebase project config (`NEXT_PUBLIC_FIREBASE_*`)
- Upstash Redis REST URL and token (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
- Deployment domain (`NEXT_PUBLIC_BASE_URL`) — needed for absolute OG metadata URLs

## Known Issues / To-Do

- [ ] Sticker drag-and-drop can be unstable on some mobile browsers.
- [ ] Firebase client SDK is used in the API route — migrating to Firebase Admin SDK is recommended for production.
