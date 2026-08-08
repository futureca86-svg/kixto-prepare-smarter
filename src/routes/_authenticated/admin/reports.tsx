import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  head: adminHead("Reports", "Attempt-level performance records."),
  component: () => (
    <DataPage<AnyRow>
      title="Reports"
      subtitle="Attempt-level performance records."
      heading="Attempt reports"
      description="Every recorded practice attempt."
      queryKey={["reports"]}
      build={() => supabase.from("paper_attempts").select("*").order("created_at", { ascending: false }).limit(300) as never}
      empty="No attempts recorded yet."
      columns={[
        { label: "Subject", render: (r) => text(r["subject"]) },
        { label: "Attempted", render: (r) => text(r["questions_attempted"]) },
        { label: "Correct", render: (r) => text(r["questions_correct"]) },
        { label: "Date", render: (r) => fmt(r["attempted_on"], "d MMM yyyy") },
      ]}
    />
  ),
});
