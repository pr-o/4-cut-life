import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SelectOptionButton from "@/components/SelectOptionButton";
import SectionLabel from "@/components/SectionLabel";
import SliderControl from "@/components/SliderControl";
import PhotoThumbnailGrid from "@/components/PhotoThumbnailGrid";
import PhotoOrPlaceholder from "@/components/PhotoOrPlaceholder";

// ─── SelectOptionButton ────────────────────────────────────────────────────

describe("SelectOptionButton", () => {
  it("renders children", () => {
    render(<SelectOptionButton selected={false} onClick={() => {}}>Hello</SelectOptionButton>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("applies active classes when selected", () => {
    render(<SelectOptionButton selected={true} onClick={() => {}}>Active</SelectOptionButton>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/border-primary/);
    expect(btn.className).toMatch(/bg-primary/);
  });

  it("does not apply active classes when not selected", () => {
    render(<SelectOptionButton selected={false} onClick={() => {}}>Inactive</SelectOptionButton>);
    const btn = screen.getByRole("button");
    expect(btn.className).not.toMatch(/bg-primary\/5/);
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<SelectOptionButton selected={false} onClick={onClick}>Click</SelectOptionButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

// ─── SectionLabel ─────────────────────────────────────────────────────────

describe("SectionLabel", () => {
  it("renders its text content", () => {
    render(<SectionLabel>Frame color</SectionLabel>);
    expect(screen.getByText("Frame color")).toBeInTheDocument();
  });

  it("applies the uppercase tracking class", () => {
    const { container } = render(<SectionLabel>Label</SectionLabel>);
    expect(container.firstChild).toHaveClass("uppercase");
    expect(container.firstChild).toHaveClass("tracking-wider");
  });
});

// ─── SliderControl ────────────────────────────────────────────────────────

describe("SliderControl", () => {
  it("renders label and current value with unit", () => {
    render(<SliderControl label="Frame width" value={12} min={2} max={40} step={2} onChange={() => {}} />);
    expect(screen.getByText("Frame width")).toBeInTheDocument();
    expect(screen.getByText("12px")).toBeInTheDocument();
  });

  it("renders a custom unit", () => {
    render(<SliderControl label="Scale" value={1} min={0} max={5} step={1} unit="x" onChange={() => {}} />);
    expect(screen.getByText("1x")).toBeInTheDocument();
  });
});

// ─── PhotoThumbnailGrid ───────────────────────────────────────────────────

describe("PhotoThumbnailGrid", () => {
  it("renders exactly `total` slots", () => {
    const { container } = render(<PhotoThumbnailGrid photos={[]} total={4} size={64} />);
    // All 4 slots are empty → should render 4 placeholder divs
    const slots = container.querySelectorAll("div.rounded-lg");
    expect(slots).toHaveLength(4);
  });

  it("renders filled slots as images and empty slots as placeholders", () => {
    const photos = ["data:image/png;base64,abc"];
    render(<PhotoThumbnailGrid photos={photos} total={3} size={64} />);
    expect(screen.getAllByRole("img")).toHaveLength(1);
    // 2 remaining slots are placeholders (divs, not imgs)
    const { container } = render(<PhotoThumbnailGrid photos={photos} total={3} size={64} />);
    const placeholders = container.querySelectorAll("div.border-dashed");
    expect(placeholders).toHaveLength(2);
  });
});

// ─── PhotoOrPlaceholder ───────────────────────────────────────────────────

describe("PhotoOrPlaceholder", () => {
  it("renders an img when src is non-empty", () => {
    render(<PhotoOrPlaceholder src="data:image/png;base64,abc" index={0} width={95} height={140} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Photo 1");
  });

  it("renders a placeholder div when src is empty string", () => {
    const { container } = render(<PhotoOrPlaceholder src="" index={0} width={95} height={140} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("div")).toBeInTheDocument();
  });
});
