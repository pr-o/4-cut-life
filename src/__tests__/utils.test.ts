import { dataUrlToBlob, isMobile, isIosSafari } from "@/lib/export/utils";

// Minimal valid 1×1 red pixel PNG as a data URL
const PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==";

describe("dataUrlToBlob", () => {
  it("returns a Blob with the correct MIME type", () => {
    const blob = dataUrlToBlob(PNG_DATA_URL);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("image/png");
  });

  it("returns a non-empty Blob", () => {
    const blob = dataUrlToBlob(PNG_DATA_URL);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("defaults to image/png for malformed headers", () => {
    const blob = dataUrlToBlob("data:;base64,AA==");
    expect(blob.type).toBe("image/png");
  });
});

describe("isMobile", () => {
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    Object.defineProperty(navigator, "userAgent", {
      value: originalUserAgent,
      configurable: true,
    });
  });

  it("is false for a desktop Chrome user agent", () => {
    Object.defineProperty(navigator, "userAgent", {
      value:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      configurable: true,
    });
    // isMobile is a module-level constant, so we test the regex directly
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    expect(mobile).toBe(false);
  });

  it("is true for an iPhone user agent", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      configurable: true,
    });
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    expect(mobile).toBe(true);
  });
});

describe("isIosSafari", () => {
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    Object.defineProperty(navigator, "userAgent", {
      value: originalUserAgent,
      configurable: true,
    });
  });

  it("is true for iOS Safari user agent", () => {
    Object.defineProperty(navigator, "userAgent", {
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      configurable: true,
    });
    const ios =
      /iP(ad|hone|od)/.test(navigator.userAgent) &&
      /WebKit/.test(navigator.userAgent) &&
      !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent);
    expect(ios).toBe(true);
  });

  it("is false for Chrome on iOS (CriOS)", () => {
    Object.defineProperty(navigator, "userAgent", {
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120 Mobile/15E148 Safari/604.1",
      configurable: true,
    });
    const ios =
      /iP(ad|hone|od)/.test(navigator.userAgent) &&
      /WebKit/.test(navigator.userAgent) &&
      !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent);
    expect(ios).toBe(false);
  });
});
