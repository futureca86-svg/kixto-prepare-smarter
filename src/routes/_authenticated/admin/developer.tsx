import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { GlassPanel, HealthPill, PageHeader, StatCard } from "@/components/admin/AdminUI";
import { formatBytes, formatMoney, useCommandCenter } from "@/lib/admin/queries";
import { adminHead } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/developer")({
  head: adminHead("Developer Center", "Runtime facts for debugging."),
  component: DeveloperCenterPage,
});

function DeveloperCenterPage() {
  const { data, isLoading } = useCommandCenter();
  const s = data?.stats ?? {};
  return (
    <AdminShell title="Developer Center" subtitle="Runtime facts for debugging.">
      <PageHeader title="Developer center" description="Live runtime and schema information." />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard loading={isLoading} label="API latency" value={`${data?.apiLatencyMs ?? 0} ms`} />
        <StatCard loading={isLoading} label="Tables" value={data?.tableCount ?? 0} />
        <StatCard loading={isLoading} label="Live rows" value={data?.liveRows ?? 0} />
        <StatCard loading={isLoading} label="Open errors" value={s["openErrors"] ?? 0} />
      </section>
      <GlassPanel className="mt-4" title="Environment">
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>Frontend: TanStack Start on Vite</li>
          <li>Data layer: Supabase Postgres with row level security</li>
          <li>Realtime: Postgres change streams for student activity</li>
        </ul>
      </GlassPanel>
    </AdminShell>
  );
}
