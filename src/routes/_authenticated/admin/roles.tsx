import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { RoleBadge } from "@/components/admin/AdminUI";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/roles")({
  head: adminHead("Roles & Permissions", "Every role assignment in the system."),
  component: () => (
    <DataPage<AnyRow>
      title="Roles & Permissions"
      subtitle="Every role assignment in the system."
      heading="Role assignments"
      description="All role rows, newest first."
      queryKey={["roles"]}
      build={() => supabase.from("user_roles").select("*").order("created_at", { ascending: false }).limit(300) as never}
      empty="No role rows."
      columns={[
        { label: "Role", render: (r) => <RoleBadge role={String(r["role"])} /> },
        { label: "User", render: (r) => <span className="font-mono text-xs">{text(r["user_id"])}</span> },
        { label: "Granted", render: (r) => fmt(r["created_at"]) },
      ]}
    />
  ),
});
