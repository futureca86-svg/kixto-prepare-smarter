import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { StatusBadge } from "@/components/admin/AdminUI";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/downloads")({
  head: adminHead("Downloads", "Files students have downloaded."),
  component: () => (
    <DataPage<AnyRow>
      title="Downloads"
      subtitle="Files students have downloaded."
      heading="Download log"
      description="Every download event."
      queryKey={["downloads"]}
      build={() => supabase.from("downloads").select("*").order("created_at", { ascending: false }).limit(300) as never}
      empty="No downloads yet."
      columns={[
        { label: "Title", render: (r) => text(r["title"]) },
        { label: "Kind", render: (r) => <StatusBadge value={String(r["kind"] ?? "")} /> },
        { label: "When", render: (r) => fmt(r["created_at"]) },
      ]}
    />
  ),
});
