import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { StatusBadge } from "@/components/admin/AdminUI";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/jobs")({
  head: adminHead("Background Jobs", "Scheduled and queued work."),
  component: () => (
    <DataPage<AnyRow>
      title="Background Jobs"
      subtitle="Scheduled and queued work."
      heading="Background jobs"
      description="Job runs with their outcome."
      queryKey={["jobs"]}
      build={() => supabase.from("background_jobs").select("*").order("created_at", { ascending: false }).limit(300) as never}
      empty="No jobs have run yet."
      columns={[
        { label: "Status", render: (r) => <StatusBadge value={String(r["status"] ?? "")} /> },
        { label: "Started", render: (r) => fmt(r["created_at"]) },
      ]}
    />
  ),
});
