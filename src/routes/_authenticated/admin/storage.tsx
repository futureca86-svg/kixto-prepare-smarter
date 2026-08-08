import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/storage")({
  head: adminHead("Storage", "Files and generated assets."),
  component: () => (
    <DataPage<AnyRow>
      title="Storage"
      subtitle="Files and generated assets."
      heading="Stored assets"
      description="Assets referenced by download records."
      queryKey={["storage"]}
      build={() => supabase.from("downloads").select("*").order("created_at", { ascending: false }).limit(300) as never}
      empty="No stored assets yet."
      columns={[
        { label: "Title", render: (r) => text(r["title"]) },
        { label: "File", render: (r) => <span className="truncate text-xs">{text(r["file_url"])}</span> },
        { label: "Created", render: (r) => fmt(r["created_at"]) },
      ]}
    />
  ),
});
