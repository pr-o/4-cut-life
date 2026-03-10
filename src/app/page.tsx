import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DEFAULT_STRIP_CONFIG } from "@/lib/constants";

const EXAMPLE_STRIPS = [
  {
    id: 1,
    cols: 1,
    rows: 4,
    colors: ["#f9a8d4", "#fbcfe8", "#fce7f3", "#fdf2f8"],
  },
  {
    id: 2,
    cols: 2,
    rows: 2,
    colors: ["#bfdbfe", "#93c5fd", "#ddd6fe", "#c4b5fd"],
  },
  {
    id: 3,
    cols: 1,
    rows: 3,
    colors: ["#bbf7d0", "#86efac", "#4ade80"],
  },
  {
    id: 4,
    cols: 2,
    rows: 3,
    colors: ["#fde68a", "#fcd34d", "#fbbf24", "#fed7aa", "#fdba74", "#fb923c"],
  },
];

function ExampleStrip({
  cols,
  rows,
  colors,
}: {
  cols: number;
  rows: number;
  colors: string[];
}) {
  return (
    <div
      className="shrink-0 rounded-sm shadow-md"
      style={{
        backgroundColor: DEFAULT_STRIP_CONFIG.frameColor,
        padding: 8,
        display: "inline-block",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 4,
          width: cols === 1 ? 80 : 120,
        }}
      >
        {colors.map((color, i) => (
          <div
            key={i}
            style={{
              backgroundColor: color,
              aspectRatio: "1 / 1",
              borderRadius: 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-12 px-6 py-16">
      {/* Hero */}
      <div className="text-center space-y-3">
        <p className="text-sm tracking-widest text-muted-foreground uppercase">
          인생네컷
        </p>
        <h1 className="text-5xl font-bold tracking-tight">4-cut life</h1>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Your own photo booth experience — capture, choose, and download your
          perfect photo strip.
        </p>
      </div>

      {/* Example strips gallery */}
      <div className="flex items-end gap-6 overflow-x-auto px-4 py-4">
        {EXAMPLE_STRIPS.map((strip) => (
          <ExampleStrip key={strip.id} {...strip} />
        ))}
      </div>

      <Button asChild size="lg" className="px-12 text-base">
        <Link href="/layout-select">Start</Link>
      </Button>
    </main>
  );
}
