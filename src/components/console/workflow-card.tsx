import { Link } from "@tanstack/react-router";
import type { Workflow } from "@/features/shared/types";
import { RiskBadge, StatusBadge } from "./status-badge";

export function WorkflowCard({ workflow, to }: { workflow: Workflow; to?: string }) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[12px] text-foreground/70">{workflow.reference}</span>
        <StatusBadge status={workflow.status} />
      </div>
      <h3 className="mt-2 text-[14px] font-semibold leading-snug text-balance">{workflow.title}</h3>
      <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">{workflow.request}</p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
        <div className="bar-fill h-full rounded-full bg-primary" style={{ width: `${workflow.progress}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 font-mono text-[11px] text-muted-foreground">
        <span>{workflow.type}</span>
        <span className="flex items-center gap-2">
          <RiskBadge risk={workflow.risk} />
          {workflow.updated}
        </span>
      </div>
    </>
  );

  const base = "block rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/40";

  return to ? (
    <Link to={to} className={base}>
      {body}
    </Link>
  ) : (
    <div className={base}>{body}</div>
  );
}
