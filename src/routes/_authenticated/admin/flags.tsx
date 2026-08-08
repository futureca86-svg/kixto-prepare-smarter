import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { GlassPanel, Nothing, PageHeader, Rows } from "@/components/admin/AdminUI";
import { Switch } from "@/components/ui/switch";
import { supabase, useAdminList } from "@/lib/admin/list";
import { logAudit } from "@/lib/admin/superadmin";
import { notify } from "@/lib/system/notify";
import { adminHead, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/flags")({
  head: adminHead("Feature Flags", "Turn Kixto modules on or off in real time."),
  component: FlagsPage,
});

function FlagsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useAdminList<AnyRow>(["flags"], () => supabase.from("feature_flags").select("*").order("label") as never);
  const rows = data ?? [];

  async function toggle(row: AnyRow, next: boolean) {
    const { error } = await supabase.from("feature_flags").update({ enabled: next }).eq("id", String(row["id"]));
    if (error) {
      notify.fromError(error, { module: "super-admin", fn: "toggleFlag", fallback: "Couldn't update this flag." });
      return;
    }
    await logAudit({
      action: next ? "flag.enable" : "flag.disable",
      entity: "feature_flags",
      entityId: String(row["id"]),
      oldValue: { enabled: !next },
      newValue: { enabled: next },
    });
    notify.success(`${text(row["label"])} ${next ? "enabled" : "disabled"}.`);
    qc.invalidateQueries({ queryKey: ["super-admin", "flags"] });
  }

  return (
    <AdminShell title="Feature Flags" subtitle="Roll modules out or pull them back instantly.">
      <PageHeader title="Feature flags" description="Changes apply immediately and are written to the audit trail." />
      <GlassPanel title="Modules">
        {isLoading ? (
          <Rows n={5} />
        ) : rows.length === 0 ? (
          <Nothing label="No feature flags configured yet." />
        ) : (
          <ul className="divide-y divide-border/50">
            {rows.map((row) => (
              <li key={String(row["id"])} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{text(row["label"])}</p>
                  <p className="truncate text-xs text-muted-foreground">{text(row["description"] ?? row["key"])}</p>
                </div>
                <Switch
                  checked={Boolean(row["enabled"])}
                  onCheckedChange={(v) => toggle(row, v)}
                  aria-label={`Toggle ${text(row["label"])}`}
                />
              </li>
            ))}
          </ul>
        )}
      </GlassPanel>
    </AdminShell>
  );
}