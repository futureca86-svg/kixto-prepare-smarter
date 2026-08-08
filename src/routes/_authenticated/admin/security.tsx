import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/security")({
  head: adminHead("Security Center", "Authentication and security events."),
  component: () => (
    <DataPage<AnyRow>
      title="Security Center"
      subtitle="Authentication and security events."
      heading="Security events"
      description="Suspicious and notable auth activity."
      queryKey={["security"]}
      build={() => supabase.from("security_events").select("*").order("created_at", { ascending: false }).limit(300) as never}
      empty="No security events recorded."
      columns={[
        { label: "Event", render: (r) => text(r["event_type"] ?? r["event"]) },
        { label: "Detail", render: (r) => text(r["detail"] ?? r["description"]) },
        { label: "When", render: (r) => fmt(r["created_at"]) },
      ]}
    />
  ),
});
