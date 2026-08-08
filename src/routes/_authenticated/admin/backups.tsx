import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { GlassPanel, HealthPill, PageHeader, StatCard } from "@/components/admin/AdminUI";
import { formatBytes, formatMoney, useCommandCenter } from "@/lib/admin/queries";
import { adminHead } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/backups")({
  head: adminHead("Backups", "Database size and retention posture."),
  component: BackupsPage,
});

function BackupsPage() {
  const { data, isLoading } = useCommandCenter();
  const s = data?.stats ?? {};
  return (
    <AdminShell title="Backups" subtitle="Database size and retention posture.">
      <PageHeader title="Backup posture" description="Supabase performs managed daily backups for this project." />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard loading={isLoading} label="Database size" value={formatBytes(data?.dbSizeBytes ?? 0)} />
        <StatCard loading={isLoading} label="Live rows" value={data?.liveRows ?? 0} />
        <StatCard loading={isLoading} label="Tables" value={data?.tableCount ?? 0} />
        <StatCard loading={isLoading} label="Accounts" value={s["totalUsers"] ?? 0} />
      </section>
      <GlassPanel className="mt-4" title="Retention">
        <p className="text-sm text-muted-foreground">
          Backups are managed by Supabase. Restore points and download links live in the Supabase dashboard under Database → Backups.
        </p>
      </GlassPanel>
    </AdminShell>
  );
}
