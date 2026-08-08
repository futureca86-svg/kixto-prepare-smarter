import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { StatusBadge } from "@/components/admin/AdminUI";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/planner")({
  head: adminHead("Planner", "Study tasks scheduled by students."),
  component: () => (
    <DataPage<AnyRow>
      title="Planner"
      subtitle="Study tasks scheduled by students."
      heading="Planner tasks"
      description="All scheduled study tasks."
      queryKey={["planner"]}
      build={() => supabase.from("planner_tasks").select("*").order("created_at", { ascending: false }).limit(300) as never}
      empty="No tasks scheduled yet."
      columns={[
        { label: "Task", render: (r) => text(r["title"]) },
        { label: "Status", render: (r) => <StatusBadge value={String(r["status"] ?? "")} /> },
        { label: "Scheduled", render: (r) => fmt(r["scheduled_date"], "d MMM yyyy") },
      ]}
    />
  ),
});
