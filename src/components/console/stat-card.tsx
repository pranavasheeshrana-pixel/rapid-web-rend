import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  unit,
  note,
  noteTone = "muted",
  delayMs = 0,
}: {
  label: string;
  value: string | number;
  unit?: string;
  note?: string;
  noteTone?: "muted" | "ok" | "warn" | "risk";
  delayMs?: number;
}) {
  return (
    <div className="rise overflow-hidden rounded-md border border-border bg-card p-4" style={{ animationDelay: `${delayMs}ms` }}>
      <div className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-[30px] font-bold leading-none tracking-tight tabular-nums">
        {value}
        {unit ? <span className="text-[16px] font-medium text-muted-foreground"> {unit}</span> : null}
      </div>
      {note ? (
        <div
          className={cn(
            "mt-2 font-mono text-[11px]",
            noteTone === "ok" && "text-ok",
            noteTone === "warn" && "text-warn",
            noteTone === "risk" && "text-risk",
            noteTone === "muted" && "text-muted-foreground",
          )}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
}
