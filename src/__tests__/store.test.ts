import { act } from "react";
import { usePhotoStore } from "@/store/usePhotoStore";
import { DEFAULT_STRIP_CONFIG, LAYOUTS } from "@/lib/constants";

// Reset Zustand store between tests
beforeEach(() => {
  act(() => usePhotoStore.getState().reset());
});

describe("usePhotoStore — initial state", () => {
  it("has a default layout set", () => {
    expect(usePhotoStore.getState().layout).toEqual(LAYOUTS[0]);
  });

  it("starts with empty capturedPhotos and selectedPhotos", () => {
    const { capturedPhotos, selectedPhotos } = usePhotoStore.getState();
    expect(capturedPhotos).toHaveLength(0);
    expect(selectedPhotos).toHaveLength(0);
  });

  it("starts with default strip config", () => {
    expect(usePhotoStore.getState().stripConfig).toMatchObject(DEFAULT_STRIP_CONFIG);
  });
});

describe("usePhotoStore — setLayout", () => {
  it("updates the layout", () => {
    const newLayout = LAYOUTS[3]; // 2×2
    act(() => usePhotoStore.getState().setLayout(newLayout));
    expect(usePhotoStore.getState().layout).toEqual(newLayout);
  });
});

describe("usePhotoStore — setCapturedPhotos / setSelectedPhotos", () => {
  it("stores captured photos", () => {
    act(() => usePhotoStore.getState().setCapturedPhotos(["data:a", "data:b"]));
    expect(usePhotoStore.getState().capturedPhotos).toEqual(["data:a", "data:b"]);
  });

  it("stores selected photos", () => {
    act(() => usePhotoStore.getState().setSelectedPhotos(["data:a"]));
    expect(usePhotoStore.getState().selectedPhotos).toEqual(["data:a"]);
  });
});

describe("usePhotoStore — strip config setters", () => {
  it("setFilter updates filter", () => {
    act(() => usePhotoStore.getState().setFilter("bw"));
    expect(usePhotoStore.getState().stripConfig.filter).toBe("bw");
  });

  it("setFrameColor updates frameColor", () => {
    act(() => usePhotoStore.getState().setFrameColor("#ff0000"));
    expect(usePhotoStore.getState().stripConfig.frameColor).toBe("#ff0000");
  });

  it("setFrameWidth updates frameWidth", () => {
    act(() => usePhotoStore.getState().setFrameWidth(20));
    expect(usePhotoStore.getState().stripConfig.frameWidth).toBe(20);
  });
});

describe("usePhotoStore — stickers", () => {
  const sticker = { id: "s1", type: "star" as const, x: 10, y: 20, scale: 1, rotate: 0 };

  it("addSticker adds a sticker", () => {
    act(() => usePhotoStore.getState().addSticker(sticker));
    expect(usePhotoStore.getState().stripConfig.stickers).toHaveLength(1);
    expect(usePhotoStore.getState().stripConfig.stickers[0]).toMatchObject(sticker);
  });

  it("removeSticker removes the correct sticker", () => {
    act(() => usePhotoStore.getState().addSticker(sticker));
    act(() => usePhotoStore.getState().removeSticker("s1"));
    expect(usePhotoStore.getState().stripConfig.stickers).toHaveLength(0);
  });

  it("updateSticker updates sticker fields", () => {
    act(() => usePhotoStore.getState().addSticker(sticker));
    act(() => usePhotoStore.getState().updateSticker("s1", { x: 99 }));
    expect(usePhotoStore.getState().stripConfig.stickers[0].x).toBe(99);
  });
});

describe("usePhotoStore — reset", () => {
  it("clears capturedPhotos, selectedPhotos, and stripConfig", () => {
    act(() => {
      usePhotoStore.getState().setCapturedPhotos(["data:a"]);
      usePhotoStore.getState().setSelectedPhotos(["data:a"]);
      usePhotoStore.getState().setFilter("bw");
      usePhotoStore.getState().reset();
    });
    const { capturedPhotos, selectedPhotos, stripConfig } = usePhotoStore.getState();
    expect(capturedPhotos).toHaveLength(0);
    expect(selectedPhotos).toHaveLength(0);
    expect(stripConfig.filter).toBe("none");
  });
});
