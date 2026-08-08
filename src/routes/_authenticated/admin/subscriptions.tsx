import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { StatusBadge } from "@/components/admin/AdminUI";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/subscriptions")({
  head: adminHead("Subscriptions", "Plans held by students."),
  component: () => (
    <DataPage<AnyRow>
      title="Subscriptions"
      subtitle="Plans held by students."
      heading="Subscriptions"
      description="Active and past subscription records."
      queryKey={["subscriptions"]}
      build={() => supabase.from("subscriptions").select("*").order("created_at", { ascending: false }).limit(300) as never}
      empty="No subscriptions yet."
      columns={[
        { label: "Plan", render: (r) => text(r["plan"]) },
        { label: "Status", render: (r) => <StatusBadge value={String(r["status"] ?? "")} /> },
        { label: "Started", render: (r) => fmt(r["created_at"]) },
      ]}
    />
  ),
});
