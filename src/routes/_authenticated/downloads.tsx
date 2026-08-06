import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { AppShell } from "@/components/dashboard/AppShell";
import { EmptyState, Panel } from "@/components/dashboard/ModuleScaffold";
import { useDashboard } from "@/lib/dashboard";

export const Route = createFileRoute("/_authenticated/downloads")({
  head: () => ({
    meta: [
      { title: "Downloads — Kixto" },
      { name: "description", content: "Every practice paper and resource you have downloaded from Kixto." },
      { property: "og:title", content: "Downloads — Kixto" },
      { property: "og:description", content: "Every practice paper and resource you have downloaded." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Downloads,
});

function Downloads() {
  const { data } = useDashboard();
  const rows = data?.downloads ?? [];

  return (
    <AppShell title="Downloads" subtitle="Your saved papers and resources.">
      <Panel title={`${rows.length} file${rows.length === 1 ? "" : "s"}`}>
        {rows.length === 0 ? (
          <EmptyState
            icon={<Download className="h-7 w-7" />}
            title="Nothing downloaded yet"
            description="Papers and resources you download will be listed here for quick access."
          />
        ) : (
          <ul className="divide-y divide-border/60">
            {rows.map((d) => (
              <li key={d.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{d.title}</p>
                  <p className="truncate text-xs capitalize text-muted-foreground">
                    {[d.kind, d.subject].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {format(new Date(d.created_at), "d MMM yyyy")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}