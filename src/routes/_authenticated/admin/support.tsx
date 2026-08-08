import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { StatusBadge } from "@/components/admin/AdminUI";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/support")({
  head: adminHead("Support Center", "Student tickets and their status."),
  component: () => (
    <DataPage<AnyRow>
      title="Support Center"
      subtitle="Student tickets and their status."
      heading="Support tickets"
      description="Incoming requests from students."
      queryKey={["support"]}
      build={() => supabase.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(300) as never}
      empty="No tickets raised yet."
      columns={[
        { label: "Subject", render: (r) => text(r["subject"]) },
        { label: "Priority", render: (r) => <StatusBadge value={String(r["priority"] ?? "")} /> },
        { label: "Status", render: (r) => <StatusBadge value={String(r["status"] ?? "")} /> },
        { label: "Raised", render: (r) => fmt(r["created_at"]) },
      ]}
    />
  ),
});
