import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/memory")({
  head: adminHead("Memory Guard", "Concepts tracked for revision."),
  component: () => (
    <DataPage<AnyRow>
      title="Memory Guard"
      subtitle="Concepts tracked for revision."
      heading="Memory Guard items"
      description="Every concept students are revising."
      queryKey={["memory"]}
      build={() => supabase.from("memory_guard_items").select("*").order("created_at", { ascending: false }).limit(300) as never}
      empty="No concepts tracked yet."
      columns={[
        { label: "Topic", render: (r) => text(r["topic"]) },
        { label: "Subject", render: (r) => text(r["subject"]) },
        { label: "Strength", render: (r) => text(r["strength"]) },
        { label: "Next review", render: (r) => fmt(r["next_review_on"], "d MMM yyyy") },
      ]}
    />
  ),
});
