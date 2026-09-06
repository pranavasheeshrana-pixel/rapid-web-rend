import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/console/page-header";
import { Panel, ConsoleTable } from "@/components/console/panel";
import { StatCard } from "@/components/console/stat-card";
import { Pill } from "@/components/console/status-badge";
import { PanelSkeleton, StatSkeleton } from "@/components/console/loading";
import { Button } from "@/components/ui/button";
import { systemService } from "@/features/system/service";

export const Route = createFileRoute("/admin/system-health")({
  head: () => ({
    meta: [
      { title: "System health — MediLink Admin" },
      { name: "description", content: "Backend, database, MCP tool server and knowledge graph health with latency and endpoint detail." },
      { property: "og:title", content: "System health — MediLink Admin" },
      { property: "og:description", content: "Dependency health and latency for every MediLink service." },
    ],
  }),
  component: AdminSystemHealth,
});

function AdminSystemHealth() {
  const health = useQuery({ queryKey: ["health"], queryFn: systemService.health });
  const checks = useQuery({ queryKey: ["health-checks"], queryFn: systemService.healthChecks });

  const components = health.data ?? [];
  const worst = components.find((c) => c.state === "down") ?? components.find((c) => c.state === "degraded");

  return (
    <PageShell
      crumbs={[{ label: "Admin", to: "/admin/dashboard" }, { label: "System health" }]}
      role="admin"
      right={
        <Pill tone={worst ? "warn" : "ok"}>{worst ? "degraded" : "all systems nominal"}</Pill>
      }
    >
      <PageHeader
        title="System health"
        description="Every dependency the orchestrator relies on, with live latency."
        actions={
          <Button asChild variant="outline">
            <Link to="/admin/health-checks">Health check history</Link>
          </Button>
        }
      />

      {health.isLoading ? (
        <StatSkeleton count={4} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {components.map((c, i) => (
            <StatCard
              key={c.id}
              label={c.name}
              value={c.latencyMs}
              unit="ms"
              note={c.state === "up" ? "healthy" : c.state}
              noteTone={c.state === "up" ? "ok" : c.state === "degraded" ? "warn" : "risk"}
              delayMs={i * 60}
            />
          ))}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Components" meta={`${components.length} monitored`} bodyClassName="p-0">
          {health.isLoading ? (
            <div className="p-4">
              <PanelSkeleton className="h-40" />
            </div>
          ) : (
            <ConsoleTable head={["Component", "Endpoint", "Latency", "State"]}>
              {components.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2.5">
                    <span className="block">{c.name}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{c.detail}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground">{c.endpoint}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-[12px] tabular-nums">{c.latencyMs} ms</td>
                  <td className="px-4 py-2.5 text-right">
                    <Pill tone={c.state === "up" ? "ok" : c.state === "degraded" ? "warn" : "risk"}>{c.state}</Pill>
                  </td>
                </tr>
              ))}
            </ConsoleTable>
          )}
        </Panel>

        <Panel title="Latest checks" meta={`${checks.data?.length ?? 0} runs`}>
          {checks.isLoading ? (
            <PanelSkeleton className="h-40" />
          ) : (
            <ul className="space-y-2.5">
              {(checks.data ?? []).map((run) => (
                <li key={run.id} className="flex items-center justify-between gap-3 border-b border-border/60 pb-2.5 last:border-0 last:pb-0">
                  <span className="min-w-0">
                    <span className="block truncate text-[13px]">{run.target}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{run.note}</span>
                  </span>
                  <Pill tone={run.result === "pass" ? "ok" : run.result === "warn" ? "warn" : "risk"}>{run.result}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
