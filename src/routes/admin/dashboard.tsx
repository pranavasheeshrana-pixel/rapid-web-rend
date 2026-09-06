import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/console/page-header";
import { StatCard } from "@/components/console/stat-card";
import { Panel, ConsoleTable } from "@/components/console/panel";
import { Pill } from "@/components/console/status-badge";
import { RoleBadge } from "@/components/console/role-badge";
import { StatSkeleton, TableSkeleton } from "@/components/console/loading";
import { Button } from "@/components/ui/button";
import { systemService } from "@/features/system/service";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — MediLink" },
      { name: "description", content: "Tenant-wide view of users, roles, service health and platform activity for MediLink administrators." },
      { property: "og:title", content: "Admin dashboard — MediLink" },
      { property: "og:description", content: "Users, roles and platform health in one administrative view." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const users = useQuery({ queryKey: ["users"], queryFn: systemService.users });
  const health = useQuery({ queryKey: ["health"], queryFn: systemService.health });

  const list = users.data ?? [];
  const degraded = (health.data ?? []).filter((h) => h.state !== "up");

  return (
    <PageShell crumbs={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Dashboard" }]} role="admin">
      <PageHeader
        title="Platform administration"
        description="Accounts, access and the state of every dependent service."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/admin/health-checks">Run health checks</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/users">Manage users</Link>
            </Button>
          </>
        }
      />

      {users.isLoading ? (
        <StatSkeleton count={4} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Accounts" value={list.length} note={`${list.filter((u) => u.active).length} active`} noteTone="ok" />
          <StatCard label="Staff seats" value={list.filter((u) => u.role === "staff").length} note="2 of 10 used" delayMs={60} />
          <StatCard
            label="Degraded services"
            value={degraded.length}
            note={degraded.length ? degraded.map((d) => d.name).join(", ") : "All nominal"}
            noteTone={degraded.length ? "warn" : "ok"}
            delayMs={120}
          />
          <StatCard label="Uptime 30d" value="99.94" unit="%" note="SLA 99.9%" noteTone="ok" delayMs={180} />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Recent accounts"
          meta={<Link to="/admin/users" className="font-mono text-[11px] text-primary hover:underline">Manage</Link>}
          bodyClassName="p-0"
        >
          {users.isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={5} />
            </div>
          ) : (
            <ConsoleTable head={["Name", "Unit", "Role", "Status", "Last seen"]}>
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
                  <td className="px-4 py-2.5 text-right font-mono text-[12px] text-muted-foreground">{u.lastSeen}</td>
                </tr>
              ))}
            </ConsoleTable>
          )}
        </Panel>

        <Panel title="Service snapshot" meta={<Link to="/admin/system-health" className="font-mono text-[11px] text-primary hover:underline">Full view</Link>}>
          <ul className="space-y-3">
            {(health.data ?? []).map((c) => (
              <li key={c.id} className="rounded-md border border-border bg-background/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-medium">{c.name}</span>
                  <Pill tone={c.state === "up" ? "ok" : c.state === "degraded" ? "warn" : "risk"}>{c.state}</Pill>
                </div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {c.detail} · {c.latencyMs} ms
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </PageShell>
  );
}
