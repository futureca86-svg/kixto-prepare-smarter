import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { StatusBadge } from "@/components/admin/AdminUI";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  head: adminHead("Notifications", "Messages delivered to students."),
  component: () => (
    <DataPage<AnyRow>
      title="Notifications"
      subtitle="Messages delivered to students."
      heading="Notification log"
      description="Everything Kixto has sent in-app."
      queryKey={["notifications"]}
      build={() => supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(300) as never}
      empty="No notifications sent yet."
      columns={[
        { label: "Title", render: (r) => text(r["title"]) },
        { label: "Type", render: (r) => <StatusBadge value={String(r["type"] ?? "")} /> },
        { label: "Sent", render: (r) => fmt(r["created_at"]) },
      ]}
    />
  ),
});
