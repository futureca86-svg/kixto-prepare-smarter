import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { StatusBadge } from "@/components/admin/AdminUI";
import { formatMoney } from "@/lib/admin/queries";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  head: adminHead("Payments", "Every payment processed."),
  component: () => (
    <DataPage<AnyRow>
      title="Payments"
      subtitle="Every payment processed."
      heading="Payments"
      description="Revenue events with their status."
      queryKey={["payments"]}
      build={() => supabase.from("payments").select("*").order("created_at", { ascending: false }).limit(300) as never}
      empty="No payments recorded yet."
      columns={[
        { label: "Amount", render: (r) => formatMoney(Number(r["amount_cents"] ?? 0), String(r["currency"] ?? "INR")) },
        { label: "Status", render: (r) => <StatusBadge value={String(r["status"] ?? "")} /> },
        { label: "Paid", render: (r) => fmt(r["paid_at"]) },
      ]}
    />
  ),
});
