import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/questions")({
  head: adminHead("Question Bank", "Every question stored in Kixto."),
  component: () => (
    <DataPage<AnyRow>
      title="Question Bank"
      subtitle="Every question stored in Kixto."
      heading="Question bank"
      description="Questions available for paper generation."
      queryKey={["questions"]}
      build={() => supabase.from("questions").select("*").order("created_at", { ascending: false }).limit(300) as never}
      empty="No questions yet."
      columns={[
        { label: "Subject", render: (r) => text(r["subject"]) },
        { label: "Added", render: (r) => fmt(r["created_at"]) },
      ]}
    />
  ),
});
