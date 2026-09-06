import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/console/page-header";
import { Panel, ConsoleTable } from "@/components/console/panel";
import { Timeline } from "@/components/console/timeline";
import { Pill, RiskBadge, StatusBadge } from "@/components/console/status-badge";
import { Loading, TableSkeleton } from "@/components/console/loading";
import type { WorkflowStatus } from "@/features/shared/types";
import { workflowService } from "@/features/workflows/service";

export const Route = createFileRoute("/staff/active-workflows")({
  head: () => ({
    meta: [
      { title: "Active workflows — MediLink Ops Console" },
      { name: "description", content: "Filter and inspect every in-flight healthcare workflow with status, risk and step history." },
      { property: "og:title", content: "Active workflows — MediLink Ops Console" },
      { property: "og:description", content: "In-flight workflow board with per-step traces." },
    ],
  }),
  component: ActiveWorkflows,
});

const filters: { label: string; value: "all" | WorkflowStatus }[] = [
  { label: "All", value: "all" },
  { label: "Created", value: "CREATED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Pending review", value: "PENDING_REVIEW" },
  { label: "Approved", value: "APPROVED" },
];

function ActiveWorkflows() {
  const { data, isLoading } = useQuery({ queryKey: ["workflows"], queryFn: workflowService.list });
  const [filter, setFilter] = useState<"all" | WorkflowStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = (data ?? []).filter((w) => filter === "all" || w.status === filter);
  const selected = list.find((w) => w.id === selectedId) ?? list[0];

  return (
    <PageShell crumbs={[{ label: "Staff", to: "/staff/dashboard" }, { label: "Active workflows" }]} role="staff">
      <PageHeader title="Active workflows" description="Every workflow currently on the board, with its full step trace." />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={
              filter === f.value
                ? "rounded-full border border-primary bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-primary"
                : "rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-primary/40"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Panel title="Workflow board" meta={`${list.length} shown`} bodyClassName="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={5} />
            </div>
          ) : (
            <ConsoleTable head={["Ref", "Workflow", "Owner", "Status", "Progress", "Updated"]}>
              {list.map((w) => (
                <tr
                  key={w.id}
                  onClick={() => setSelectedId(w.id)}
                  className={
                    "cursor-pointer border-b border-border/60 last:border-0 transition-colors hover:bg-muted/60 " +
                    (selected?.id === w.id ? "bg-muted/70" : "")
                  }
                >
                  <td className="px-4 py-2.5 font-mono text-[12px] text-foreground/70">{w.reference}</td>
                  <td className="px-4 py-2.5">
                    <span className="block">{w.title}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{w.patient}</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{w.owner}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={w.status} />
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-[12px] tabular-nums">{w.progress}%</td>
                  <td className="px-4 py-2.5 text-right font-mono text-[12px] text-muted-foreground">{w.updated}</td>
                </tr>
              ))}
            </ConsoleTable>
          )}
        </Panel>

        <Panel title="Step trace" meta={selected?.reference ?? "—"} className="h-fit xl:sticky xl:top-[68px]">
          {isLoading || !selected ? (
            <Loading label="Loading trace" />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selected.status} />
                <RiskBadge risk={selected.risk} />
                <Pill>{selected.type}</Pill>
              </div>
              <p className="text-[13px] text-muted-foreground">{selected.request}</p>
              <Timeline events={selected.timeline} />
            </div>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
