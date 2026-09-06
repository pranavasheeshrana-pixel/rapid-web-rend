import { cn } from "@/lib/utils";
import type { Role } from "@/features/shared/types";

const labels: Record<Role, string> = {
  patient: "Patient",
  staff: "Staff",
  admin: "Admin",
  auditor: "Auditor",
};

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-primary",
        className,
      )}
    >
      {labels[role]}
    </span>
  );
}
