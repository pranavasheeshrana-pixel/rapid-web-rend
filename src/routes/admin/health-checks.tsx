import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/console/page-header";
import { Panel, ConsoleTable } from "@/components/console/panel";
import { StatCard } from "@/components/console/stat-card";
import { Pill } from "@/components/console/status-badge";
import { StatSkeleton, TableSkeleton } from "@/components/console/loading";
import { Button } from "@/components/ui/button";
import { systemService } from "@/features/system/service";

export const Route = createFileRoute("/admin/health-checks")({
  head: () => ({
    meta: [
      { title: "Health checks — MediLink Admin" },
      { name: "description", content: "Run and review MediLink health check history across API, database, tool servers and knowledge graph." },
      { property: "og:title", content: "Health checks — MediLink Admin" },
      { property: "og:description", content: "Health check runs with results, latency and notes." },
    ],
  }),
  component: HealthChecks,
});

function HealthChecks() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["health-checks"], queryFn: systemService.healthChecks });
  const [running, setRunning] = useState(false);

  const runs = data ?? [];
  const counts = {
    pass: runs.filter((r) => r.result === "pass").length,
    warn: runs.filter((r) => r.result === "warn").length,
    fail: runs.filter((r) => r.result === "fail").length,
  };

  const runAll = async () => {
    setRunning(true);
    await new Promise((r) => setTimeout(r, 900));
    await queryClient.invalidateQueries({ queryKey: ["health-checks"] });
    setRunning(false);
    toast.success("Health checks complete", { description: `${counts.pass} passed · ${counts.warn} warned · ${counts.fail} failed` });
  };

  return (
    <PageShell crumbs={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Health checks" }]} role="admin">
      <PageHeader
        title="Health checks"
        description="On-demand probes against each dependency, with full run history."
        actions={
          <Button onClick={runAll} disabled={running}>
            {running ? "Running checks…" : "Run all checks"}
          </Button>
        }
      />

      {isLoading ? (
        <StatSkeleton count={3} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Passing" value={counts.pass} note="Nominal" noteTone="ok" />
          <StatCard label="Warnings" value={counts.warn} note="Elevated latency" noteTone="warn" delayMs={60} />
          <StatCard label="Failures" value={counts.fail} note="Retry scheduled" noteTone="risk" delayMs={120} />
        </div>
      )}

      <Panel title="Run history" meta={`${runs.length} runs`} bodyClassName="p-0">
        {isLoading || running ? (
          <div className="p-4">
            <TableSkeleton rows={5} />
          </div>
        ) : (
          <ConsoleTable head={["Target", "Note", "Ran at", "Latency", "Result"]}>
            {runs.map((run) => (
              <tr key={run.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-2.5">{run.target}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{run.note}</td>
                <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground">{run.ranAt}</td>
                <td className="px-4 py-2.5 text-right font-mono text-[12px] tabular-nums">{run.latencyMs} ms</td>
                <td className="px-4 py-2.5 text-right">
                  <Pill tone={run.result === "pass" ? "ok" : run.result === "warn" ? "warn" : "risk"}>{run.result}</Pill>
                </td>
              </tr>
            ))}
          </ConsoleTable>
        )}
      </Panel>
    </PageShell>
  );
}
