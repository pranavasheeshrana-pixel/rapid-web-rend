import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/console/page-header";
import { Panel } from "@/components/console/panel";
import { ConfidenceBar } from "@/components/console/confidence-bar";
import { Pill, StatusBadge, ValidationBadge } from "@/components/console/status-badge";
import { PanelSkeleton } from "@/components/console/loading";
import { Button } from "@/components/ui/button";
import { documentService } from "@/features/workflows/service";

export const Route = createFileRoute("/patient/document-review/$id")({
  head: () => ({
    meta: [
      { title: "Document review — MediLink" },
      { name: "description", content: "See what MediLink read from your document, how confident it is and what still needs checking." },
      { property: "og:title", content: "Document review — MediLink" },
      { property: "og:description", content: "Extracted fields, confidence scores and validation status for an uploaded document." },
    ],
  }),
  component: DocumentReview,
});

function DocumentReview() {
  const { id } = Route.useParams();
  const { data: doc, isLoading } = useQuery({ queryKey: ["document", id], queryFn: () => documentService.get(id) });

  return (
    <PageShell
      crumbs={[
        { label: "Patient", to: "/patient/dashboard" },
        { label: "Documents", to: "/patient/upload-document" },
        { label: doc ? doc.fileName : id },
      ]}
      role="patient"
    >
      <PageHeader
        title="Document review"
        description="What we read from your document, and how sure we are of each detail."
        actions={
          <>
            <Button variant="outline" onClick={() => toast.info("Correction requested", { description: "A staff member will confirm the flagged fields." })}>
              Request correction
            </Button>
            <Button onClick={() => toast.success("Details confirmed", { description: "Thanks — the workflow can continue." })}>
              Confirm details
            </Button>
          </>
        }
      />

      {isLoading || !doc ? (
        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <PanelSkeleton className="h-96" />
          <PanelSkeleton className="h-96" />
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <Panel title="Extracted fields" meta={`${doc.fields.length} fields`} bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {doc.fields.map((field) => (
                <li key={field.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {field.label}
                    </div>
                    <div className="mt-0.5 truncate text-[14px] font-medium">{field.value}</div>
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    <ValidationBadge status={field.validation} />
                    <div className="w-28">
                      <ConfidenceBar value={field.confidence} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="space-y-4">
            <Panel title="Source document" meta={doc.docType}>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-muted">
                  <FileText className="size-4 text-muted-foreground" aria-hidden />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium">{doc.fileName}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {doc.pages} pages · {doc.sizeKb} KB · captured {doc.capturedAt}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge status={doc.status} />
                <Pill>{doc.workflowRef}</Pill>
              </div>
            </Panel>

            <Panel title="Processing" meta={`${doc.processingProgress}%`}>
              <div className="h-1 overflow-hidden rounded-full bg-border">
                <div
                  className="bar-fill h-full rounded-full bg-primary"
                  style={{ width: `${doc.processingProgress}%` }}
                />
              </div>
              <ul className="mt-4 space-y-2 font-mono text-[11px] text-muted-foreground">
                <li className="flex justify-between gap-3">
                  <span>Page scan</span>
                  <span className="text-ok">complete</span>
                </li>
                <li className="flex justify-between gap-3">
                  <span>Field extraction</span>
                  <span className={doc.processingProgress === 100 ? "text-ok" : "text-primary"}>
                    {doc.processingProgress === 100 ? "complete" : "running"}
                  </span>
                </li>
                <li className="flex justify-between gap-3">
                  <span>Validation</span>
                  <span className={doc.processingProgress === 100 ? "text-warn" : "text-muted-foreground"}>
                    {doc.processingProgress === 100 ? "needs review" : "queued"}
                  </span>
                </li>
              </ul>
            </Panel>
          </div>
        </div>
      )}
    </PageShell>
  );
}
