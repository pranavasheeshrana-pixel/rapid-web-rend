import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/console/breadcrumbs";
import { RoleBadge } from "@/components/console/role-badge";
import type { Role } from "@/features/shared/types";

export function PageShell({
  crumbs,
  role,
  right,
  children,
}: {
  crumbs: Crumb[];
  role: Role;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
          <Breadcrumbs items={crumbs} />
          <div className="flex items-center gap-3">
            {right}
            <RoleBadge role={role} />
          </div>
        </div>
      </header>
      <div className="space-y-6 px-6 pt-6">{children}</div>
    </>
  );
}
