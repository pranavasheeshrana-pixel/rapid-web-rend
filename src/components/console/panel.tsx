import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  meta,
  children,
  bodyClassName,
  className,
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
  className?: string;
}) {
  return (
    <section className={cn("rounded-md border border-border bg-card", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <h2 className="text-[14px] font-semibold tracking-tight">{title}</h2>
        {typeof meta === "string" ? <span className="font-mono text-[11px] text-muted-foreground">{meta}</span> : meta}
      </div>
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function ConsoleTable({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            {head.map((h, i) => (
              <th key={h} className={cn("px-4 py-2 font-medium", i >= head.length - 2 && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}
