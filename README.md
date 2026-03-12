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
- html-to-image (DOM → PNG 내보내기)
- gifenc (애니메이션 GIF 생성)
- react-color (프레임 색상 선택기)
- Firebase Storage (공유 이미지 업로드)
- Upstash Redis (IP별 업로드 횟수 제한, 단축 URL 저장)
- qrcode (QR 코드 생성)

## 앱 흐름

총 6단계로 이루어진 플로우:

1. **랜딩 (`/`)**: 예시 포토 스트립 갤러리 및 앱 소개, "Start" 버튼
2. **레이아웃 선택 (`/layout-select`)**: 1×2, 1×3, 1×4, 2×2, 2×3, 2×4 중 레이아웃 선택
3. **모드 선택 (`/mode-select`)**: 카메라 촬영 또는 사진 업로드 선택
4. **촬영 설정 및 촬영 (`/instructions`, `/capture`)**: 카메라 선택 시 촬영 간격 및 사진 수 설정 후 카운트다운과 함께 자동 연속 촬영. 업로드 선택 시 `/upload`로 이동하여 파일 선택.
5. **편집 (`/edit`)**: 프레임 색상·너비, 사진 너비, 간격, 필터, 스티커, 타임스탬프 등 커스터마이징. 썸네일 레일에서 사진 선택 및 순서 변경.
6. **내보내기**: PNG 다운로드, GIF 다운로드, 클라우드 업로드 후 공유 링크 생성

## 공유 기능

- 공유 버튼 클릭 → Firebase Storage에 업로드 → 8자리 단축 URL 생성 (`/s/:id`)
- 단축 URL은 Redis에 30일간 저장 후 만료
- `/s/:id` 페이지는 Open Graph 메타태그를 포함하여 SNS 공유 시 포토 스트립 미리보기 표시
- IP당 하루 최대 20회 업로드 제한 (Upstash Redis 슬라이딩 윈도우)

## 개선할 점

- [ ] 스티커 기능에서 SVG 드래그 앤 드롭이 일부 모바일 브라우저에서 불안정함.
- [ ] GIF 인코딩이 메인 스레드에서 실행되어 큰 사진 세트에서 UI 블로킹 발생 가능. Web Worker로 분리 필요.
- [ ] QR 코드를 통한 다운로드 기능 미완성 (백엔드 연동 필요).
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
- html-to-image (DOM → PNG export)
- gifenc (animated GIF generation)
- react-color (frame color picker)
- Firebase Storage (cloud image upload for sharing)
- Upstash Redis (per-IP rate limiting, short URL storage)
- qrcode (QR code generation)

## App Flow

A 6-step user flow:

1. **Landing (`/`)**: Example strip gallery and app intro, "Start" button
2. **Layout selection (`/layout-select`)**: Choose from 1×2, 1×3, 1×4, 2×2, 2×3, 2×4
3. **Mode selection (`/mode-select`)**: Choose between camera capture or photo upload
4. **Shoot settings & capture (`/instructions`, `/capture`)**: For camera mode, set countdown interval and number of shots, then auto-capture with countdown. For upload mode, navigate to `/upload` and select files.
5. **Editing (`/edit`)**: Customize frame color/width, photo width, gaps, filters, stickers, and timestamp. Select and reorder photos via the thumbnail rail.
6. **Export**: Download PNG, download GIF, or upload to cloud and generate a shareable link

## Share Feature

- Share button → upload to Firebase Storage → generate 8-char short URL (`/s/:id`)
- Short URLs are stored in Redis for 30 days, then expire
- `/s/:id` page includes Open Graph meta tags so the photo strip previews correctly when shared on social media or messengers
- Rate-limited to 20 uploads per IP per day (Upstash Redis sliding window)

## Known Issues / To-Do

- [ ] Sticker drag-and-drop can be unstable on some mobile browsers.
- [ ] GIF encoding runs on the main thread and may block the UI for large photo sets. Moving to a Web Worker is needed.
- [ ] Download via QR code feature is not yet complete (requires backend integration).
- [ ] Firebase client SDK is used in the API route — migrating to Firebase Admin SDK is recommended for production.
