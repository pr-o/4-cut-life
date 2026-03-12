import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionLabel({ children, className }: Props) {
  return (
    <p className={cn("text-xs uppercase tracking-wider text-muted-foreground font-medium", className)}>
      {children}
    </p>
  );
}
