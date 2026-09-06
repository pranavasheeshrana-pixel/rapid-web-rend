import { Link } from "@tanstack/react-router";

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-[12px] text-muted-foreground">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {item.to && !last ? (
              <Link to={item.to} className="text-foreground/50 transition-colors hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span className={last ? "font-medium text-foreground" : "text-foreground/50"}>{item.label}</span>
            )}
            {!last ? <span className="text-border">/</span> : null}
          </span>
        );
      })}
    </nav>
  );
}
