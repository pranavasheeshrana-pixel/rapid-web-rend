import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/console/page-header";
import { Panel, ConsoleTable } from "@/components/console/panel";
import { Pill, RiskBadge } from "@/components/console/status-badge";
import { TableSkeleton } from "@/components/console/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RiskLevel } from "@/features/shared/types";
import { systemService } from "@/features/system/service";

export const Route = createFileRoute("/auditor/workflow-logs")({
  head: () => ({
    meta: [
      { title: "Workflow logs — MediLink Compliance" },
      { name: "description", content: "Search the immutable audit trail of agent tool calls, escalations and human decisions per workflow." },
      { property: "og:title", content: "Workflow logs — MediLink Compliance" },
      { property: "og:description", content: "Immutable, searchable audit trail for every workflow action." },
    ],
  }),
  component: WorkflowLogs,
});

const riskFilters: ("all" | RiskLevel)[] = ["all", "high", "medium", "low"];

function WorkflowLogs() {
  const { data, isLoading } = useQuery({ queryKey: ["audit"], queryFn: systemService.audit });
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState<"all" | RiskLevel>("all");

  const entries = (data ?? []).filter(
    (e) =>
      (risk === "all" || e.risk === risk) &&
      (e.workflowRef.toLowerCase().includes(query.toLowerCase()) ||
        e.action.toLowerCase().includes(query.toLowerCase()) ||
        e.tool.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <PageShell crumbs={[{ label: "Auditor", to: "/auditor/dashboard" }, { label: "Workflow logs" }]} role="auditor">
      <PageHeader
        title="Workflow logs"
        description="Append-only record of every action taken on a workflow."
        actions={
          <Button
            variant="outline"
            onClick={() => toast.success("Export queued", { description: "A signed CSV will be available shortly." })}
          >
            Export CSV
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reference, action or tool"
          className="max-w-sm"
          aria-label="Search audit log"
        />
        <div className="flex flex-wrap gap-2">
          {riskFilters.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRisk(r)}
              className={
                risk === r
                  ? "rounded-full border border-primary bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-primary"
                  : "rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-primary/40"
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <Panel title="Audit trail" meta={`${entries.length} entries`} bodyClassName="p-0">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={7} />
          </div>
        ) : (
          <ConsoleTable head={["Time", "Ref", "Action", "Actor", "Risk", "Outcome"]}>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground">{e.at}</td>
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
    </PageShell>
  );
}
