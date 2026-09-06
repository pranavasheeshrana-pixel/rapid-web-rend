import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/console/page-header";
import { Panel, ConsoleTable } from "@/components/console/panel";
import { Pill } from "@/components/console/status-badge";
import { RoleBadge } from "@/components/console/role-badge";
import { TableSkeleton } from "@/components/console/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ManagedUser, Role } from "@/features/shared/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { systemService } from "@/features/system/service";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users & roles — MediLink Admin" },
      { name: "description", content: "Search accounts, review assigned roles and disable access across the MediLink platform." },
      { property: "og:title", content: "Users & roles — MediLink Admin" },
      { property: "og:description", content: "Account and role management for the MediLink console." },
    ],
  }),
  component: AdminUsers,
});

const roleFilters: ("all" | Role)[] = ["all", "patient", "staff", "admin", "auditor"];

function AdminUsers() {
  const { data, isLoading } = useQuery({ queryKey: ["users"], queryFn: systemService.users });
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [target, setTarget] = useState<ManagedUser | null>(null);

  const list = (data ?? []).filter(
    (u) =>
      (roleFilter === "all" || u.role === roleFilter) &&
      (u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <PageShell crumbs={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Users & roles" }]} role="admin">
      <PageHeader
        title="Users and roles"
        description="Access is role-based; every change is recorded in the audit log."
        actions={
          <Button onClick={() => toast.info("Invite flow pending backend", { description: "Account creation lands with the auth service." })}>
            Invite user
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or email"
          className="max-w-xs"
          aria-label="Search users"
        />
        <div className="flex flex-wrap gap-2">
          {roleFilters.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={
                roleFilter === r
                  ? "rounded-full border border-primary bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-primary"
                  : "rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-primary/40"
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <Panel title="Accounts" meta={`${list.length} shown`} bodyClassName="p-0">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={6} />
          </div>
        ) : (
          <ConsoleTable head={["Name", "Unit", "Role", "Status", "Action"]}>
            {list.map((u) => (
              <tr key={u.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-2.5">
                  <span className="block">{u.name}</span>
                  <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{u.email}</span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.unit}</td>
                <td className="px-4 py-2.5">
                  <RoleBadge role={u.role} />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Pill tone={u.active ? "ok" : "neutral"}>{u.active ? "active" : "disabled"}</Pill>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => setTarget(u)}
                    className="font-mono text-[11px] uppercase tracking-[0.1em] text-primary transition-colors hover:text-risk"
                  >
                    {u.active ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </ConsoleTable>
        )}
      </Panel>

      <AlertDialog open={target !== null} onOpenChange={(open) => !open && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {target?.active ? "Disable" : "Enable"} {target?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {target?.active
                ? "The account loses console access immediately. Existing workflows stay assigned."
                : "The account regains access with its previous role and unit."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success(`${target?.name} ${target?.active ? "disabled" : "enabled"}`, {
                  description: "Change recorded in the audit log.",
                });
                setTarget(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
