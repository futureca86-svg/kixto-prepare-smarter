import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { GlassPanel, HealthPill, PageHeader, StatCard } from "@/components/admin/AdminUI";
import { formatBytes, formatMoney, useCommandCenter } from "@/lib/admin/queries";
import { adminHead } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/health")({
  head: adminHead("System Health", "Live status of every Kixto service."),
  component: SystemHealthPage,
});

function SystemHealthPage() {
  const { data, isLoading } = useCommandCenter();
  const s = data?.stats ?? {};
  return (
    <AdminShell title="System Health" subtitle="Live status of every Kixto service.">
      <PageHeader title="Service status" description="Derived from real probes against each subsystem." />
      <GlassPanel title="Services">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.health ?? []).map((h) => (
            <li key={h.key} className="flex items-center justify-between gap-2 rounded-xl border border-border/50 px-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{h.label}</p>
                <p className="truncate text-[11px] text-muted-foreground">{h.detail}</p>
              </div>
              <HealthPill status={h.status} />
            </li>
          ))}
        </ul>
      </GlassPanel>
      <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard loading={isLoading} label="API latency" value={`${data?.apiLatencyMs ?? 0} ms`} />
        <StatCard loading={isLoading} label="Database size" value={formatBytes(data?.dbSizeBytes ?? 0)} />
        <StatCard loading={isLoading} label="Tables" value={data?.tableCount ?? 0} />
        <StatCard loading={isLoading} label="Live sessions" value={s["activeSessions"] ?? 0} />
      </section>
    </AdminShell>
  );
}
