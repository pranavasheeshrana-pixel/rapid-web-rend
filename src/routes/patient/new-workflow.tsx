import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/console/page-header";
import { Panel } from "@/components/console/panel";
import { VoiceInput } from "@/components/console/voice-input";
import { Pill } from "@/components/console/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { workflowService } from "@/features/workflows/service";

export const Route = createFileRoute("/patient/new-workflow")({
  head: () => ({
    meta: [
      { title: "New request — MediLink" },
      { name: "description", content: "Describe your care admin request in writing or by voice and MediLink will plan the steps." },
      { property: "og:title", content: "New request — MediLink" },
      { property: "og:description", content: "Submit a new healthcare admin request by text or dictation." },
    ],
  }),
  component: NewWorkflow,
});

const schema = z.object({
  type: z.string().min(1),
  request: z.string().min(20, "Add a little more detail — at least 20 characters."),
});

type FormValues = z.infer<typeof schema>;

const types = ["Prior auth", "Referral", "Discharge review", "Admission", "Med adjustment"];

function NewWorkflow() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { type: "Prior auth", request: "" } });
  const type = form.watch("type");
  const request = form.watch("request");

  const mutation = useMutation({
    mutationFn: workflowService.create,
    onSuccess: (workflow) => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success(`Request ${workflow.reference} submitted`, { description: "The care team has been notified." });
      navigate({ to: "/patient/workflows" });
    },
    onError: () => toast.error("Could not submit", { description: "Please try again in a moment." }),
  });

  return (
    <PageShell
      crumbs={[{ label: "Patient", to: "/patient/dashboard" }, { label: "New request" }]}
      role="patient"
    >
      <PageHeader
        title="Start a new request"
        description="Write it out or dictate it — plain language is fine."
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Request details" meta={`${request.length} characters`}>
          <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <fieldset className="space-y-1.5">
              <legend className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Request type
              </legend>
              <div className="flex flex-wrap gap-2">
                {types.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => form.setValue("type", option)}
                    className={
                      type === option
                        ? "rounded-full border border-primary bg-primary/10 px-3 py-1 text-[12px] font-medium text-primary"
                        : "rounded-full border border-border bg-card px-3 py-1 text-[12px] text-muted-foreground transition-colors hover:border-primary/40"
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="space-y-1.5">
              <Label htmlFor="request" className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                What do you need?
              </Label>
              <Textarea
                id="request"
                rows={9}
                placeholder="For example: I need prior authorisation for a gallbladder removal scheduled on 12 November. My discharge summary from last week is attached."
                {...form.register("request")}
              />
              {form.formState.errors.request ? (
                <p className="font-mono text-[11px] text-risk">{form.formState.errors.request.message}</p>
              ) : null}
            </div>

            <VoiceInput onTranscript={(text) => form.setValue("request", text, { shouldValidate: true })} />

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Submitting…" : "Submit request"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => form.reset()}>
                Clear
              </Button>
            </div>
          </form>
        </Panel>

        <Panel title="What happens next" meta="4 steps" className="h-fit">
          <ol className="space-y-4">
            {[
              ["Request received", "Your wording is kept exactly as written for the record."],
              ["Steps planned", "MediLink breaks the request into the tasks it needs to complete."],
              ["Records checked", "Insurance, billing and clinical records are pulled together."],
              ["Human sign-off", "Anything sensitive is approved by a staff member before it goes out."],
            ].map(([title, detail], i) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-border bg-muted font-mono text-[11px] text-muted-foreground">
                  {i + 1}
                </span>
                <span>
                  <span className="block text-[13px] font-medium">{title}</span>
                  <span className="mt-0.5 block text-[12px] text-muted-foreground">{detail}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
            <Pill>Typical turnaround 4h</Pill>
            <Pill>Fully audited</Pill>
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
