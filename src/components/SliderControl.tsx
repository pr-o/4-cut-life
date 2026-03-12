import { Slider } from "@/components/ui/slider";
import SectionLabel from "@/components/SectionLabel";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
};

export default function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit = "px",
  onChange,
}: Props) {
  return (
    <section className="space-y-3">
      <div className="flex justify-between items-center">
        <SectionLabel>{label}</SectionLabel>
        <span className="text-xs text-muted-foreground">
          {value}{unit}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </section>
  );
}
