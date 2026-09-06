import { cn } from "@/lib/utils";

export function ConfidenceBar({ value, className }: { value: number; className?: string }) {
  const tone = value >= 90 ? "bg-ok" : value >= 70 ? "bg-primary" : value >= 50 ? "bg-warn" : "bg-risk";
  return (
    <div className={cn("h-1 overflow-hidden rounded-full bg-border", className)}>
      <div className={cn("bar-fill h-full rounded-full", tone)} style={{ width: `${value}%` }} />
    </div>
  );
}
