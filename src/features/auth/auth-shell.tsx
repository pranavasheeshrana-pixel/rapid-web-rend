import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside className="hidden flex-col justify-between bg-sidebar px-10 py-10 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded bg-sidebar-primary font-mono text-[13px] font-medium text-sidebar-primary-foreground">
            ML
          </span>
          <span className="leading-tight">
            <span className="block text-[14px] font-semibold tracking-tight">MediLink</span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/45">
              Workflow Orchestration
            </span>
          </span>
        </div>

        <div className="max-w-md">
          <h2 className="text-[34px] font-bold leading-[1.05] tracking-tight text-balance">
            Signed-off, traceable healthcare operations.
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-sidebar-foreground/65">
            Multimodal intake, document extraction with confidence scoring, agent tool traces and risk-aware human
            approval — every step on the board.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-4 font-mono text-[11px] uppercase tracking-[0.12em] text-sidebar-foreground/45">
            <div>
              <dt>Portals</dt>
              <dd className="mt-1 text-[22px] font-sans font-bold normal-case tracking-tight text-sidebar-foreground">
                4
              </dd>
            </div>
            <div>
              <dt>Audit coverage</dt>
              <dd className="mt-1 text-[22px] font-sans font-bold normal-case tracking-tight text-sidebar-foreground">
                100%
              </dd>
            </div>
          </dl>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/35">
          Prototype · synthetic data only
        </p>
      </aside>

      <main className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          <h1 className="text-[26px] font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">{subtitle}</p>
          <div className="mt-7">{children}</div>
          <div className="mt-6 text-[13px] text-muted-foreground">{footer}</div>
        </div>
      </main>
    </div>
  );
}
