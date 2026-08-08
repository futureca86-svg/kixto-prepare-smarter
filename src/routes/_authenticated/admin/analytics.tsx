import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { GlassPanel, HealthPill, PageHeader, StatCard } from "@/components/admin/AdminUI";
import { formatBytes, formatMoney, useCommandCenter } from "@/lib/admin/queries";
import { adminHead } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: adminHead("Analytics", "Growth, engagement and revenue."),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data, isLoading } = useCommandCenter();
  const s = data?.stats ?? {};
  return (
    <AdminShell title="Analytics" subtitle="Growth, engagement and revenue.">
      <PageHeader title="Platform analytics" description="Live counts across the whole product." />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard loading={isLoading} label="Students" value={s["students"] ?? 0} />
        <StatCard loading={isLoading} label="Active today" value={s["activeToday"] ?? 0} />
        <StatCard loading={isLoading} label="Sign-ins (24h)" value={s["signins24h"] ?? 0} />
        <StatCard loading={isLoading} label="Growth (30d)" value={`${data?.growthPct ?? 0}%`} />
        <StatCard loading={isLoading} label="Papers" value={s["papers"] ?? 0} />
        <StatCard loading={isLoading} label="Concepts" value={s["memoryItems"] ?? 0} />
        <StatCard loading={isLoading} label="Tasks" value={s["plannerTasks"] ?? 0} />
        <StatCard loading={isLoading} label="Revenue" value={formatMoney(data?.revenueCents ?? 0)} />
      </section>
    </AdminShell>
  );
}
