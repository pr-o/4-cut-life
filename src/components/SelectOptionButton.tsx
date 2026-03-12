import { cn } from "@/lib/utils";

type Props = {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

export default function SelectOptionButton({
  selected,
  onClick,
  children,
  className,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40",
        className,
      )}
    >
      {children}
    </button>
  );
}
