import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/console/page-header";
import { Panel } from "@/components/console/panel";
import { FileUpload, type UploadCandidate } from "@/components/console/file-upload";
import { Pill } from "@/components/console/status-badge";
import { Button } from "@/components/ui/button";
import { documentService } from "@/features/workflows/service";

export const Route = createFileRoute("/patient/upload-document")({
  head: () => ({
    meta: [
      { title: "Upload a document — MediLink" },
      { name: "description", content: "Share a discharge summary, claim form or scan with your care team and watch it being read." },
      { property: "og:title", content: "Upload a document — MediLink" },
      { property: "og:description", content: "Drag and drop a document for automatic extraction and review." },
    ],
  }),
  component: UploadDocument,
});

function UploadDocument() {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<UploadCandidate | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => (timer.current ? clearInterval(timer.current) : undefined), []);

  const mutation = useMutation({
    mutationFn: (file: File) => documentService.upload(file),
    onSuccess: (doc) => {
      setBusy(false);
      setProgress(100);
      toast.success("Document uploaded", { description: `${doc.fileName} is being read now.` });
      navigate({ to: "/patient/document-review/$id", params: { id: doc.id } });
    },
    onError: () => {
      setBusy(false);
      toast.error("Upload failed", { description: "Check the file and try again." });
    },
  });

  const start = () => {
    if (!candidate || candidate.error) return;
    setBusy(true);
    setProgress(6);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setProgress((p) => (p >= 92 ? 92 : p + 8)), 120);
    mutation.mutate(candidate.file, {
      onSettled: () => {
        if (timer.current) clearInterval(timer.current);
      },
    });
  };

  return (
    <PageShell crumbs={[{ label: "Patient", to: "/patient/dashboard" }, { label: "Upload document" }]} role="patient">
      <PageHeader
        title="Upload a document"
        description="Discharge summaries, claim forms, referral letters and scans."
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Document" meta={busy ? "Uploading" : "Awaiting file"}>
          <FileUpload onSelect={setCandidate} progress={progress} busy={busy} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button onClick={start} disabled={!candidate || Boolean(candidate.error) || busy}>
              {busy ? "Uploading…" : "Upload and read"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setCandidate(null);
                setProgress(0);
              }}
            >
              Reset
            </Button>
          </div>
        </Panel>

        <Panel title="Before you upload" className="h-fit">
          <ul className="space-y-3 text-[13px] text-muted-foreground">
            <li>Make sure the whole page is visible and in focus — blurred edges lower the reading confidence.</li>
            <li>One document per upload. Multi-page PDFs are fine.</li>
            <li>Anything unreadable is flagged for a person to check rather than guessed.</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
            <Pill>PDF · PNG · JPEG · TIFF</Pill>
            <Pill>Max 20 MB</Pill>
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
