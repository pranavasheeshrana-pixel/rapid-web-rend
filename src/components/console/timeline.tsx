import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/features/shared/types";
import { Pill } from "./status-badge";

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="mt-4 space-y-4">
      {events.map((event, i) => {
        const last = i === events.length - 1;
        return (
          <li key={event.id} className="flex gap-3">
            <span
              className={cn(
                "mt-1 size-2.5 shrink-0 rounded-full",
                event.state === "done" && "bg-ok",
                event.state === "active" && "bg-primary",
                event.state === "failed" && "bg-risk",
                event.state === "queued" && "border border-border bg-card",
              )}
            />
            <div className={cn("flex-1", !last && "border-b border-border pb-4")}>
              <div className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    "text-[13px] font-medium",
                    event.state === "queued" && "text-muted-foreground",
                  )}
                >
                  {event.label}
                </span>
                {event.state === "active" ? (
                  <Pill tone="primary" className="pulse-primary px-1.5 py-0.5 text-[10px]">
                    In progress
                  </Pill>
                ) : (
                  <span className="font-mono text-[11px] text-muted-foreground">{event.at}</span>
                )}
              </div>
              <div className="text-[12px] text-muted-foreground">{event.detail}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
