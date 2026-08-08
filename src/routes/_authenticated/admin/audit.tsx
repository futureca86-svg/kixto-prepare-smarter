import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: adminHead("Audit Logs", "Every super admin action."),
  component: () => (
    <DataPage<AnyRow>
      title="Audit Logs"
      subtitle="Every super admin action."
      heading="Audit trail"
      description="Immutable record of admin activity."
      queryKey={["audit"]}
      build={() => supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(300) as never}
      empty="No admin actions recorded yet."
      columns={[
        { label: "Action", render: (r) => text(r["action"]) },
        { label: "Actor", render: (r) => text(r["actor_email"]) },
        { label: "Entity", render: (r) => text(r["entity"]) },
        { label: "When", render: (r) => fmt(r["created_at"]) },
      ]}
    />
  ),
});
