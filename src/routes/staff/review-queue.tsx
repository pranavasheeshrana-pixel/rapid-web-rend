import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/console/page-header";
import { Panel } from "@/components/console/panel";
import { ConfidenceBar } from "@/components/console/confidence-bar";
import { StatCard } from "@/components/console/stat-card";
import { Pill, RiskBadge, StatusBadge, ValidationBadge } from "@/components/console/status-badge";
import { PanelSkeleton, StatSkeleton } from "@/components/console/loading";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { documentService, workflowService } from "@/features/workflows/service";

export const Route = createFileRoute("/staff/review-queue")({
  head: () => ({
    meta: [
      { title: "Review queue — MediLink Ops Console" },
      { name: "description", content: "Approve, reject or send back extracted document fields flagged for human review." },
      { property: "og:title", content: "Review queue — MediLink Ops Console" },
      { property: "og:description", content: "Human-in-the-loop approval for flagged workflow actions." },
    ],
  }),
  component: ReviewQueue,
});

function ReviewQueue() {
  const workflows = useQuery({ queryKey: ["workflows"], queryFn: workflowService.list });
  const documents = useQuery({ queryKey: ["documents"], queryFn: documentService.list });
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");

  const pending = (workflows.data ?? []).filter((w) => w.status === "PENDING_REVIEW");
  const doc = documents.data?.[0];
  const flagged = doc?.fields.filter((f) => f.validation !== "validated") ?? [];

  const confirm = () => {
    toast[decision === "approve" ? "success" : "error"](
      decision === "approve" ? "Action approved" : "Action rejected",
      { description: note.trim() ? `Note recorded: ${note.trim()}` : "Decision written to the audit log." },
    );
    setDecision(null);
    setNote("");
  };

  return (
    <PageShell
      crumbs={[{ label: "Staff", to: "/staff/dashboard" }, { label: "Review queue" }]}
      role="staff"
      right={<Pill tone="warn">34 waiting</Pill>}
    >
      <PageHeader title="Review queue" description="High-risk actions and low-confidence fields awaiting a human decision." />

      {workflows.isLoading ? (
        <StatSkeleton count={3} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Awaiting decision" value={pending.length} note="2 breach SLA in 20m" noteTone="warn" />
          <StatCard label="Approved today" value={19} note="94% first pass" noteTone="ok" delayMs={60} />
          <StatCard label="Sent back" value={4} note="Document quality" delayMs={120} />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Queue" meta={`${pending.length} items`} bodyClassName="p-0">
          {workflows.isLoading ? (
            <div className="p-4">
              <PanelSkeleton className="h-40" />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {pending.map((w) => (
                <li key={w.id} className="space-y-3 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[12px] text-foreground/70">{w.reference}</span>
                    <span className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={w.status} />
                      <RiskBadge risk={w.risk} />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold leading-snug">{w.title}</h3>
                    <p className="mt-1 text-[12px] text-muted-foreground">{w.request}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={() => setDecision("approve")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setDecision("reject")}>
                      Reject
                    </Button>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      Owner {w.owner} · updated {w.updated}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Flagged fields"
          meta={doc?.fileName ?? "—"}
          className="h-fit xl:sticky xl:top-[68px]"
          bodyClassName="p-0"
        >
          {documents.isLoading || !doc ? (
            <div className="p-4">
              <PanelSkeleton className="h-40" />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {(flagged.length ? flagged : doc.fields).map((f) => (
                <li key={f.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {f.label}
                    </span>
                    <ValidationBadge status={f.validation} />
                  </div>
                  <div className="mt-1 text-[14px] font-medium">{f.value}</div>
                  <div className="mt-2">
                    <ConfidenceBar value={f.confidence} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Dialog open={decision !== null} onOpenChange={(open) => !open && setDecision(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{decision === "approve" ? "Approve this action" : "Reject this action"}</DialogTitle>
            <DialogDescription>
              Your decision and note are written to the immutable audit log against this workflow.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            placeholder="Optional note for the audit trail"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDecision(null)}>
              Cancel
            </Button>
            <Button onClick={confirm}>Confirm {decision === "approve" ? "approval" : "rejection"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
