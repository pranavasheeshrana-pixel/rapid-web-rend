import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/console/page-header";
import { Panel } from "@/components/console/panel";
import { WorkflowCard } from "@/components/console/workflow-card";
import { Timeline } from "@/components/console/timeline";
import { Loading, PanelSkeleton } from "@/components/console/loading";
import { Pill, RiskBadge, StatusBadge } from "@/components/console/status-badge";
import { Button } from "@/components/ui/button";
import { workflowService } from "@/features/workflows/service";

export const Route = createFileRoute("/patient/workflows")({
  head: () => ({
    meta: [
      { title: "My workflows — MediLink" },
      { name: "description", content: "Follow every step of your MediLink requests, from submission through review and sign-off." },
      { property: "og:title", content: "My workflows — MediLink" },
      { property: "og:description", content: "Step-by-step progress for each of your care admin requests." },
    ],
  }),
  component: PatientWorkflows,
});

function PatientWorkflows() {
  const { data, isLoading } = useQuery({ queryKey: ["workflows"], queryFn: workflowService.list });
  const workflows = data ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = workflows.find((w) => w.id === selectedId) ?? workflows[0];

  return (
    <PageShell crumbs={[{ label: "Patient", to: "/patient/dashboard" }, { label: "My workflows" }]} role="patient">
      <PageHeader
        title="My workflows"
        description="Each request and the exact stage it has reached."
        actions={
          <Button asChild>
            <Link to="/patient/new-workflow">New request</Link>
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          {isLoading ? (
            <>
              <PanelSkeleton className="h-32" />
              <PanelSkeleton className="h-32" />
              <PanelSkeleton className="h-32" />
            </>
          ) : (
            workflows.map((w) => (
              <button key={w.id} type="button" className="w-full text-left" onClick={() => setSelectedId(w.id)}>
                <WorkflowCard workflow={w} />
              </button>
            ))
          )}
        </div>

        <Panel
          title="Workflow detail"
          meta={selected?.reference ?? "—"}
          className="h-fit xl:sticky xl:top-[68px]"
        >
          {isLoading || !selected ? (
            <Loading label="Loading detail" />
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-[15px] font-semibold leading-snug text-balance">{selected.title}</h3>
                <p className="mt-1.5 text-[13px] text-muted-foreground">{selected.request}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selected.status} />
                <RiskBadge risk={selected.risk} />
                <Pill>{selected.type}</Pill>
                <Pill>Updated {selected.updated}</Pill>
              </div>
              <div>
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <span>Progress</span>
                  <span className="tabular-nums">{selected.progress}%</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border">
                  <div className="bar-fill h-full rounded-full bg-primary" style={{ width: `${selected.progress}%` }} />
                </div>
              </div>
              <Timeline events={selected.timeline} />
            </div>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
