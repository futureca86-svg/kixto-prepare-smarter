import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { RoleBadge } from "@/components/admin/AdminUI";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/admins")({
  head: adminHead("Admins", "Every elevated account on the Kixto platform."),
  component: () => (
    <DataPage<AnyRow>
      title="Admins"
      subtitle="Elevated accounts across Kixto."
      heading="Admin accounts"
      description="Accounts holding admin or super admin privileges."
      queryKey={["admins"]}
      build={() => supabase.from("user_roles").select("*").neq("role", "student").order("created_at", { ascending: false }) as never}
      empty="No elevated accounts yet."
      columns={[
        { label: "Role", render: (r) => <RoleBadge role={String(r["role"])} /> },
        { label: "User", render: (r) => <span className="font-mono text-xs">{text(r["user_id"])}</span> },
        { label: "Granted", render: (r) => fmt(r["created_at"]) },
      ]}
    />
  ),
});