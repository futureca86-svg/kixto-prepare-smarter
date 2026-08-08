import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { StatusBadge } from "@/components/admin/AdminUI";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/errors")({
  head: adminHead("Error Center", "Runtime errors captured across Kixto."),
  component: () => (
    <DataPage<AnyRow>
      title="Error Center"
      subtitle="Runtime errors captured across Kixto."
      heading="Error log"
      description="Newest failures with full context."
      queryKey={["errors"]}
      build={() => supabase.from("error_logs").select("*").order("created_at", { ascending: false }).limit(300) as never}
      empty="No errors logged."
      columns={[
        { label: "Message", render: (r) => <span className="line-clamp-2">{text(r["message"])}</span> },
        { label: "Module", render: (r) => text(r["module"]) },
        { label: "Severity", render: (r) => <StatusBadge value={String(r["severity"] ?? "")} /> },
        { label: "When", render: (r) => fmt(r["created_at"]) },
      ]}
    />
  ),
});
