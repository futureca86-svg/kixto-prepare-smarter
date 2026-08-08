import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { StatusBadge } from "@/components/admin/AdminUI";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/email")({
  head: adminHead("Email Center", "Transactional email delivery log."),
  component: () => (
    <DataPage<AnyRow>
      title="Email Center"
      subtitle="Transactional email delivery log."
      heading="Email log"
      description="Delivery status for every email."
      queryKey={["email"]}
      build={() => supabase.from("email_logs").select("*").order("created_at", { ascending: false }).limit(300) as never}
      empty="No emails sent yet."
      columns={[
        { label: "Status", render: (r) => <StatusBadge value={String(r["status"] ?? "")} /> },
        { label: "Recipient", render: (r) => text(r["to_email"]) },
        { label: "Sent", render: (r) => fmt(r["created_at"]) },
      ]}
    />
  ),
});
