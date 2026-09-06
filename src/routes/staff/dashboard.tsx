import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/console/page-header";
import { StatCard } from "@/components/console/stat-card";
import { Panel, ConsoleTable } from "@/components/console/panel";
import { Timeline } from "@/components/console/timeline";
import { Pill, RiskBadge, StatusBadge } from "@/components/console/status-badge";
import { Loading, StatSkeleton, TableSkeleton } from "@/components/console/loading";
import { Button } from "@/components/ui/button";
import { workflowService } from "@/features/workflows/service";
import { systemService } from "@/features/system/service";

export const Route = createFileRoute("/staff/dashboard")({
  head: () => ({
    meta: [
      { title: "Staff dashboard — MediLink Ops Console" },
      { name: "description", content: "Live operational view of active workflows, review load, escalations and tool health for care staff." },
      { property: "og:title", content: "Staff dashboard — MediLink Ops Console" },
      { property: "og:description", content: "Queue pressure, escalations and workflow throughput at a glance." },
    ],
  }),
  component: StaffDashboard,
});

function StaffDashboard() {
  const workflows = useQuery({ queryKey: ["workflows"], queryFn: workflowService.list });
  const health = useQuery({ queryKey: ["health"], queryFn: systemService.health });

  const list = workflows.data ?? [];
  const pending = list.filter((w) => w.status === "PENDING_REVIEW");
  const active = list.filter((w) => ["PROCESSING", "PLANNING", "CREATED"].includes(w.status));

  return (
    <PageShell
      crumbs={[{ label: "Staff", to: "/staff/dashboard" }, { label: "Dashboard" }]}
      role="staff"
      right={<span className="font-mono text-[11px] text-muted-foreground">Shift 14:00–22:00</span>}
    >
      <PageHeader
        title="Operations overview"
        description="Queue pressure, escalations and throughput for the current shift."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/staff/processing">Processing</Link>
            </Button>
            <Button asChild>
              <Link to="/staff/review-queue">Open review queue</Link>
            </Button>
          </>
        }
      />

      {workflows.isLoading ? (
        <StatSkeleton count={4} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active workflows" value={active.length + pending.length} note="+3 vs yesterday" noteTone="ok" />
          <StatCard label="Pending review" value={pending.length} note="2 high risk" noteTone="warn" delayMs={60} />
          <StatCard label="Mean handling" value="26" unit="min" note="Target 30 min" noteTone="ok" delayMs={120} />
          <StatCard label="Escalations" value={2} note="Awaiting sign-off" noteTone="risk" delayMs={180} />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Panel
          title="Needs attention"
          meta={<Link to="/staff/active-workflows" className="font-mono text-[11px] text-primary hover:underline">View all</Link>}
          bodyClassName="p-0"
        >
          {workflows.isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={5} />
            </div>
          ) : (
            <ConsoleTable head={["Ref", "Workflow", "Patient", "Status", "Risk", "Updated"]}>
              {list.map((w) => (
                <tr key={w.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-[12px] text-foreground/70">{w.reference}</td>
                  <td className="px-4 py-2.5">{w.title}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{w.patient}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={w.status} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <RiskBadge risk={w.risk} />
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-[12px] text-muted-foreground">{w.updated}</td>
                </tr>
              ))}
            </ConsoleTable>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="Tool health" meta={<Link to="/system/health" className="font-mono text-[11px] text-primary hover:underline">Details</Link>}>
            {health.isLoading ? (
              <Loading label="Checking services" />
            ) : (
              <ul className="space-y-2.5">
                {(health.data ?? []).map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3">
                    <span className="text-[13px]">{c.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-muted-foreground">{c.latencyMs} ms</span>
                      <Pill tone={c.state === "up" ? "ok" : c.state === "degraded" ? "warn" : "risk"}>{c.state}</Pill>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Latest escalation" meta={pending[0]?.reference ?? "—"}>
            {workflows.isLoading || !pending[0] ? (
              <Loading label="Loading" />
            ) : (
              <Timeline events={pending[0].timeline} />
            )}
          </Panel>
        </div>
      </div>
    </PageShell>
  );
}
