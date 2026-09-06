import type { ReactNode } from "react";
import { Link, Outlet, useRouter } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import type { Role } from "@/features/shared/types";
import { roleHome, useAuth } from "@/features/auth/use-auth";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  to: string;
  badge?: string;
}

export interface RoleConfig {
  role: Role;
  portal: string;
  initials: string;
  nav: NavItem[];
  footerNote: string;
}

export const roleConfigs: Record<Role, RoleConfig> = {
  patient: {
    role: "patient",
    portal: "Patient Portal",
    initials: "PT",
    footerNote: "St. Aurelia · Patient access",
    nav: [
      { label: "Dashboard", to: "/patient/dashboard" },
      { label: "My Workflows", to: "/patient/workflows", badge: "3" },
      { label: "New Request", to: "/patient/new-workflow" },
      { label: "Upload Document", to: "/patient/upload-document" },
      { label: "Document Review", to: "/patient/document-review/7742" },
    ],
  },
  staff: {
    role: "staff",
    portal: "Ops Console",
    initials: "ST",
    footerNote: "St. Aurelia · West Wing",
    nav: [
      { label: "Dashboard", to: "/staff/dashboard" },
      { label: "Active Workflows", to: "/staff/active-workflows", badge: "8" },
      { label: "Review Queue", to: "/staff/review-queue", badge: "34" },
      { label: "Processing", to: "/staff/processing" },
    ],
  },
  admin: {
    role: "admin",
    portal: "Administration",
    initials: "AD",
    footerNote: "St. Aurelia · Operations",
    nav: [
      { label: "Dashboard", to: "/admin/dashboard" },
      { label: "Users & Roles", to: "/admin/users", badge: "6" },
      { label: "System Health", to: "/admin/system-health" },
      { label: "Health Checks", to: "/admin/health-checks" },
    ],
  },
  auditor: {
    role: "auditor",
    portal: "Compliance",
    initials: "AU",
    footerNote: "St. Aurelia · Compliance",
    nav: [
      { label: "Dashboard", to: "/auditor/dashboard" },
      { label: "Workflow Logs", to: "/auditor/workflow-logs", badge: "7" },
    ],
  },
};

export function RoleLayout({ config, children }: { config: RoleConfig; children?: ReactNode }) {
  const { user, signOut } = useAuth(config.role);
  const router = useRouter();
  const current = router.state.location.pathname;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
          <Link to={roleHome[config.role]} className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-4">
            <span className="grid size-8 place-items-center rounded bg-sidebar-primary font-mono text-[13px] font-medium text-sidebar-primary-foreground">
              ML
            </span>
            <span className="leading-tight">
              <span className="block text-[14px] font-semibold tracking-tight">MediLink</span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/45">
                {config.portal}
              </span>
            </span>
          </Link>

          <nav className="flex-1 space-y-0.5 px-3 py-4">
            <div className="px-2 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/35">
              Navigation
            </div>
            {config.nav.map((item) => {
              const active = current === item.to || current.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "block rounded-md px-3 py-2 text-[13px] transition-colors",
                    active
                      ? "border-l-2 border-sidebar-primary bg-sidebar-foreground/10 font-medium text-sidebar-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/5",
                  )}
                >
                  {item.label}
                  {item.badge ? (
                    <span className="float-right font-mono text-[11px] text-sidebar-primary">{item.badge}</span>
                  ) : null}
                </Link>
              );
            })}
            <div className="px-2 pb-1.5 pt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/35">
              Shared
            </div>
            <Link
              to="/system/health"
              className={cn(
                "block rounded-md px-3 py-2 text-[13px] transition-colors",
                current === "/system/health"
                  ? "border-l-2 border-sidebar-primary bg-sidebar-foreground/10 font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/5",
              )}
            >
              System Health
            </Link>
          </nav>

          <div className="space-y-2 border-t border-sidebar-border px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-full bg-sidebar-foreground/15 text-[11px] font-semibold">
                {config.initials}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[13px] font-medium capitalize">{user?.name ?? "Demo session"}</span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-sidebar-foreground/45">
                  {config.role}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] text-sidebar-foreground/40">
              <span>{config.footerNote}</span>
              <span className="text-sidebar-foreground/60">v0.3</span>
            </div>
            <Link
              to="/login"
              onClick={signOut}
              className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/50 transition-colors hover:text-sidebar-primary"
            >
              <LogOut className="size-3" aria-hidden /> Sign out
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-10">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}

export function ConsoleTopBar({
  crumbs,
  right,
}: {
  crumbs: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
        {crumbs}
        <div className="flex items-center gap-4">{right}</div>
      </div>
    </header>
  );
}
