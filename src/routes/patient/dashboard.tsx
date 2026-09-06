import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/console/page-header";
import { StatCard } from "@/components/console/stat-card";
import { Panel } from "@/components/console/panel";
import { WorkflowCard } from "@/components/console/workflow-card";
import { Timeline } from "@/components/console/timeline";
import { Loading, StatSkeleton } from "@/components/console/loading";
import { Button } from "@/components/ui/button";
import { workflowService } from "@/features/workflows/service";

export const Route = createFileRoute("/patient/dashboard")({
  head: () => ({
    meta: [
      { title: "Patient dashboard — MediLink" },
      { name: "description", content: "Track your MediLink requests, upload documents and follow each step of your care admin workflows." },
      { property: "og:title", content: "Patient dashboard — MediLink" },
      { property: "og:description", content: "Your requests, documents and workflow progress in one place." },
    ],
  }),
  component: PatientDashboard,
});

function PatientDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["workflows"], queryFn: workflowService.list });
  const mine = data ?? [];
  const open = mine.filter((w) => !["APPROVED", "COMPLETED", "REJECTED"].includes(w.status));
  const latest = mine[0];

  return (
    <PageShell crumbs={[{ label: "Patient", to: "/patient/dashboard" }, { label: "Dashboard" }]} role="patient">
      <PageHeader
        title="Your care requests"
        description="Everything you have submitted, with live status from the care team."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/patient/upload-document">Upload document</Link>
            </Button>
            <Button asChild>
              <Link to="/patient/new-workflow">New request</Link>
            </Button>
          </>
        }
      />

      {isLoading ? (
        <StatSkeleton count={4} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Open requests" value={open.length} note="Being handled now" delayMs={0} />
          <StatCard label="Awaiting your input" value={1} note="Discharge date unclear" noteTone="warn" delayMs={60} />
          <StatCard label="Documents shared" value={2} note="Both processed" noteTone="ok" delayMs={120} />
          <StatCard label="Completed" value={mine.length - open.length} note="Last 30 days" delayMs={180} />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Recent requests" meta={`${mine.length} total`} bodyClassName="grid gap-3 sm:grid-cols-2">
          {isLoading ? (
            <Loading label="Loading your requests" />
          ) : (
            mine.slice(0, 4).map((w) => <WorkflowCard key={w.id} workflow={w} to="/patient/workflows" />)
          )}
        </Panel>

        <Panel title="Latest activity" meta={latest?.reference ?? "—"}>
          {isLoading || !latest ? <Loading label="Loading activity" /> : <Timeline events={latest.timeline} />}
        </Panel>
      </div>
    </PageShell>
  );
}
