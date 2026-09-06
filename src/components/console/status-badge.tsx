import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { RiskLevel, ValidationStatus, WorkflowStatus } from "@/features/shared/types";

const badge = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px] leading-tight whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-muted-foreground",
        primary: "border-primary/30 bg-primary/10 text-primary",
        ok: "border-ok/30 bg-ok/10 text-ok",
        warn: "border-warn/30 bg-warn/10 text-warn",
        risk: "border-risk/30 bg-risk/10 text-risk",
      },
      pulsing: { true: "", false: "" },
    },
    compoundVariants: [
      { tone: "primary", pulsing: true, class: "pulse-primary" },
      { tone: "warn", pulsing: true, class: "pulse-warn" },
    ],
    defaultVariants: { tone: "neutral", pulsing: false },
  },
);

type Tone = NonNullable<VariantProps<typeof badge>["tone"]>;

const statusMeta: Record<WorkflowStatus, { label: string; tone: Tone; pulsing?: boolean }> = {
  CREATED: { label: "Created", tone: "neutral" },
  PLANNING: { label: "Planning", tone: "primary", pulsing: true },
  PROCESSING: { label: "Processing", tone: "primary", pulsing: true },
  PENDING_REVIEW: { label: "Pending", tone: "warn", pulsing: true },
  APPROVED: { label: "Approved", tone: "ok" },
  REJECTED: { label: "Rejected", tone: "risk" },
  COMPLETED: { label: "Completed", tone: "ok" },
  FAILED: { label: "Failed", tone: "risk" },
};

export function StatusBadge({ status, className }: { status: WorkflowStatus; className?: string }) {
  const meta = statusMeta[status];
  return <span className={cn(badge({ tone: meta.tone, pulsing: meta.pulsing ?? false }), className)}>{meta.label}</span>;
}

const riskMeta: Record<RiskLevel, { label: string; tone: Tone }> = {
  low: { label: "Low", tone: "neutral" },
  medium: { label: "Med", tone: "warn" },
  high: { label: "High", tone: "risk" },
};

export function RiskBadge({ risk, className }: { risk: RiskLevel; className?: string }) {
  const meta = riskMeta[risk];
  return <span className={cn(badge({ tone: meta.tone }), className)}>{meta.label}</span>;
}

const validationMeta: Record<ValidationStatus, { label: string; tone: Tone }> = {
  validated: { label: "Validated", tone: "ok" },
  needs_review: { label: "Needs review", tone: "warn" },
  invalid: { label: "Invalid", tone: "risk" },
};

export function ValidationBadge({ status, className }: { status: ValidationStatus; className?: string }) {
  const meta = validationMeta[status];
  return <span className={cn(badge({ tone: meta.tone }), className)}>{meta.label}</span>;
}

export function Pill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn(badge({ tone }), className)}>{children}</span>;
}
