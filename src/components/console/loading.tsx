import { Skeleton } from "@/components/ui/skeleton";

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
      <span className="size-2 animate-pulse rounded-full bg-primary" />
      {label}
    </div>
  );
}

export function StatSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-md border border-border bg-card p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-7 w-16" />
          <Skeleton className="mt-3 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="mb-2.5 h-6 w-full last:mb-0" />
      ))}
    </div>
  );
}

export function PanelSkeleton({ className = "h-56" }: { className?: string }) {
  return <Skeleton className={`w-full rounded-md ${className}`} />;
}
