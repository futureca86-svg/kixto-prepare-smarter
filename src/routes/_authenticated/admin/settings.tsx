import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { GlassPanel, HealthPill, PageHeader, StatCard } from "@/components/admin/AdminUI";
import { formatBytes, formatMoney, useCommandCenter } from "@/lib/admin/queries";
import { adminHead } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: adminHead("Settings", "Platform-wide configuration."),
  component: SettingsPage,
});

function SettingsPage() {
  const { data, isLoading } = useCommandCenter();
  const s = data?.stats ?? {};
  return (
    <AdminShell title="Settings" subtitle="Platform-wide configuration.">
      <PageHeader title="Platform settings" description="Global counters and configuration entry points." />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard loading={isLoading} label="Students" value={s["students"] ?? 0} />
        <StatCard loading={isLoading} label="Admins" value={s["admins"] ?? 0} />
        <StatCard loading={isLoading} label="Super admins" value={s["superAdmins"] ?? 0} />
        <StatCard loading={isLoading} label="Subjects" value={s["subjects"] ?? 0} />
      </section>
      <GlassPanel className="mt-4" title="Configuration">
        <p className="text-sm text-muted-foreground">
          Authentication providers, email templates and API keys are managed in the Supabase dashboard. Product level toggles live under Feature Flags.
        </p>
      </GlassPanel>
    </AdminShell>
  );
}
