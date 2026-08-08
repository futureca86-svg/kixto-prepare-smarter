import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetBoundary } from "@/components/dashboard/ModuleScaffold";
import type { HealthStatus } from "@/lib/admin/queries";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <div className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function GlassPanel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: ReactNode;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`rounded-2xl border-border/60 bg-card/80 p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-24px_rgba(49,46,129,0.45)] backdrop-blur-xl ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-tight">{title}</h3>
            {description ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p> : null}
          </div>
          {action}
        </div>
      )}
      <WidgetBoundary name={typeof title === "string" ? title : "panel"}>{children}</WidgetBoundary>
    </Card>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  loading,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  loading?: boolean;
  tone?: "default" | "accent" | "warn" | "danger";
}) {
  const toneRing =
    tone === "accent"
      ? "ring-primary/25"
      : tone === "warn"
        ? "ring-amber-400/40"
        : tone === "danger"
          ? "ring-destructive/30"
          : "ring-border/60";
  return (
    <Card
      className={`group rounded-2xl border-0 bg-card/80 p-4 ring-1 ${toneRing} shadow-[0_1px_2px_rgba(16,24,40,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(49,46,129,0.6)]`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        {icon ? <span className="text-primary/70">{icon}</span> : null}
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-7 w-20 rounded-lg" />
      ) : (
        <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      )}
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}

const HEALTH_TONE: Record<HealthStatus, { dot: string; label: string; badge: string }> = {
  healthy: { dot: "bg-emerald-500", label: "Healthy", badge: "bg-emerald-500/10 text-emerald-700" },
  warning: { dot: "bg-amber-500", label: "Warning", badge: "bg-amber-500/10 text-amber-700" },
  critical: { dot: "bg-destructive", label: "Critical", badge: "bg-destructive/10 text-destructive" },
  idle: { dot: "bg-muted-foreground/40", label: "Idle", badge: "bg-muted text-muted-foreground" },
};

export function HealthPill({ status }: { status: HealthStatus }) {
  const tone = HEALTH_TONE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {tone.label}
    </span>
  );
}

export function StatusBadge({ value }: { value: string | null | undefined }) {
  const v = (value ?? "unknown").toLowerCase();
  const tone =
    ["healthy", "sent", "succeeded", "completed", "resolved", "active", "published", "closed"].includes(v)
      ? "bg-emerald-500/10 text-emerald-700"
      : ["failed", "critical", "error", "blocked", "high"].includes(v)
        ? "bg-destructive/10 text-destructive"
        : ["pending", "queued", "warning", "running", "open", "draft"].includes(v)
          ? "bg-amber-500/10 text-amber-700"
          : "bg-muted text-muted-foreground";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${tone}`}>{v}</span>;
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <Badge
      variant="secondary"
      className={`rounded-full text-[11px] capitalize ${role === "super_admin" ? "brand-gradient-bg text-primary-foreground" : ""}`}
    >
      {role.replace("_", " ")}
    </Badge>
  );
}

export function TableShell({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-border/60 text-left">
            {head.map((h) => (
              <th key={h} className="pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">{children}</tbody>
      </table>
    </div>
  );
}

export function Nothing({ label }: { label: string }) {
  return <p className="px-1 py-8 text-center text-sm text-muted-foreground">{label}</p>;
}

export function Rows({ n = 4 }: { n?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: n }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-xl" />
      ))}
    </div>
  );
}