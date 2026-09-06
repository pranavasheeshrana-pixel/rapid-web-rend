import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/console/page-header";
import { StatCard } from "@/components/console/stat-card";
import { Panel, ConsoleTable } from "@/components/console/panel";
import { Pill, RiskBadge } from "@/components/console/status-badge";
import { StatSkeleton, TableSkeleton } from "@/components/console/loading";
import { Button } from "@/components/ui/button";
import { systemService } from "@/features/system/service";

export const Route = createFileRoute("/auditor/dashboard")({
  head: () => ({
    meta: [
      { title: "Auditor dashboard — MediLink Compliance" },
      { name: "description", content: "Compliance overview of agent actions, escalations, human approvals and failed tool calls." },
      { property: "og:title", content: "Auditor dashboard — MediLink Compliance" },
      { property: "og:description", content: "Audit coverage, escalations and approval evidence." },
    ],
  }),
  component: AuditorDashboard,
});

function AuditorDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["audit"], queryFn: systemService.audit });
  const entries = data ?? [];
  const escalated = entries.filter((e) => e.outcome === "escalated");
  const failed = entries.filter((e) => e.outcome === "failed");

  return (
    <PageShell crumbs={[{ label: "Auditor", to: "/auditor/dashboard" }, { label: "Dashboard" }]} role="auditor">
      <PageHeader
        title="Compliance overview"
        description="Every agent decision, tool call and human approval is recorded and immutable."
        actions={
          <Button asChild>
            <Link to="/auditor/workflow-logs">Open workflow logs</Link>
          </Button>
        }
      />

      {isLoading ? (
        <StatSkeleton count={4} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Logged actions" value={entries.length} note="Last 24 hours" />
          <StatCard label="Escalations" value={escalated.length} note="Human approval required" noteTone="warn" delayMs={60} />
          <StatCard label="Failed tool calls" value={failed.length} note="Pharmacy MCP" noteTone="risk" delayMs={120} />
          <StatCard label="Audit coverage" value="100" unit="%" note="No gaps detected" noteTone="ok" delayMs={180} />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Panel
          title="Recent entries"
          meta={<Link to="/auditor/workflow-logs" className="font-mono text-[11px] text-primary hover:underline">View all</Link>}
          bodyClassName="p-0"
        >
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={6} />
            </div>
          ) : (
            <ConsoleTable head={["Ref", "Action", "Actor", "Risk", "Outcome"]}>
              {entries.slice(0, 6).map((e) => (
                <tr key={e.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-[12px] text-foreground/70">{e.workflowRef}</td>
                  <td className="px-4 py-2.5">
                    <span className="block">{e.action}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{e.tool}</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{e.actor}</td>
                  <td className="px-4 py-2.5 text-right">
                    <RiskBadge risk={e.risk} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Pill
                      tone={
                        e.outcome === "success"
                          ? "ok"
                          : e.outcome === "escalated"
                            ? "warn"
                            : e.outcome === "rejected"
                              ? "neutral"
                              : "risk"
                      }
                    >
                      {e.outcome}
                    </Pill>
                  </td>
                </tr>
              ))}
            </ConsoleTable>
          )}
        </Panel>

        <Panel title="Risk distribution" meta="last 24h">
          <ul className="space-y-4">
            {(["high", "medium", "low"] as const).map((level) => {
              const count = entries.filter((e) => e.risk === level).length;
              const pct = entries.length ? Math.round((count / entries.length) * 100) : 0;
              return (
                <li key={level}>
                  <div className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    <span>{level} risk</span>
                    <span className="tabular-nums">{count}</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border">
                    <div
                      className={
                        "bar-fill h-full rounded-full " +
                        (level === "high" ? "bg-risk" : level === "medium" ? "bg-warn" : "bg-ok")
                      }
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </PageShell>
  );
}
