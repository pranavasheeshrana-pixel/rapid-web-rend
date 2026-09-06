import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/console/page-header";
import { Panel, ConsoleTable } from "@/components/console/panel";
import { StatCard } from "@/components/console/stat-card";
import { ConfidenceBar } from "@/components/console/confidence-bar";
import { Pill, StatusBadge } from "@/components/console/status-badge";
import { PanelSkeleton, StatSkeleton } from "@/components/console/loading";
import { documentService, workflowService } from "@/features/workflows/service";

export const Route = createFileRoute("/staff/processing")({
  head: () => ({
    meta: [
      { title: "Processing — MediLink Ops Console" },
      { name: "description", content: "Watch document extraction and agent tool execution progress in real time across the queue." },
      { property: "og:title", content: "Processing — MediLink Ops Console" },
      { property: "og:description", content: "Live document extraction and tool execution monitor." },
    ],
  }),
  component: Processing,
});

function Processing() {
  const documents = useQuery({ queryKey: ["documents"], queryFn: documentService.list });
  const workflows = useQuery({ queryKey: ["workflows"], queryFn: workflowService.list });
  const running = (workflows.data ?? []).filter((w) => w.status === "PROCESSING" || w.status === "CREATED");

  return (
    <PageShell
      crumbs={[{ label: "Staff", to: "/staff/dashboard" }, { label: "Processing" }]}
      role="staff"
      right={<Pill tone="primary">Live</Pill>}
    >
      <PageHeader title="Processing monitor" description="Document extraction and agent tool execution, as it happens." />

      {documents.isLoading ? (
        <StatSkeleton count={4} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Documents in flight" value={documents.data?.length ?? 0} note="OCR + extraction" />
          <StatCard label="Workflows running" value={running.length} note="Tool calls active" delayMs={60} />
          <StatCard label="Mean confidence" value="81" unit="%" note="Above 75% threshold" noteTone="ok" delayMs={120} />
          <StatCard label="Retries" value={1} note="Pharmacy MCP timeout" noteTone="risk" delayMs={180} />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Documents" meta="extraction progress">
          {documents.isLoading ? (
            <PanelSkeleton className="h-48" />
          ) : (
            <ul className="space-y-4">
              {(documents.data ?? []).map((doc) => {
                const mean = Math.round(doc.fields.reduce((a, f) => a + f.confidence, 0) / doc.fields.length);
                return (
                  <li key={doc.id} className="rounded-md border border-border bg-background/60 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="truncate font-mono text-[12px] text-foreground/70">{doc.fileName}</span>
                      <StatusBadge status={doc.status} />
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
                      <div
                        className="bar-fill h-full rounded-full bg-primary"
                        style={{ width: `${doc.processingProgress}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {doc.docType} · {doc.pages} pages · {doc.processingProgress}%
                      </span>
                      <span className="w-24">
                        <ConfidenceBar value={mean} />
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Tool execution" meta="last 15 minutes" bodyClassName="p-0">
          <ConsoleTable head={["Workflow", "Tool", "Duration", "Result"]}>
            {[
              ["WF-4819", "billing.create_claim", "1.2s", "ok"],
              ["WF-4819", "insurance.check_eligibility", "0.9s", "ok"],
              ["WF-4821", "kg.query_relations", "0.4s", "ok"],
              ["WF-4815", "ehr.fetch_encounter", "2.1s", "ok"],
              ["WF-4790", "pharmacy.update_dose", "8.0s", "fail"],
            ].map(([ref, tool, duration, result]) => (
              <tr key={`${ref}-${tool}`} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-2.5 font-mono text-[12px] text-foreground/70">{ref}</td>
                <td className="px-4 py-2.5 font-mono text-[12px]">{tool}</td>
                <td className="px-4 py-2.5 text-right font-mono text-[12px] tabular-nums text-muted-foreground">
                  {duration}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Pill tone={result === "ok" ? "ok" : "risk"}>{result}</Pill>
                </td>
              </tr>
            ))}
          </ConsoleTable>
        </Panel>
      </div>
    </PageShell>
  );
}
