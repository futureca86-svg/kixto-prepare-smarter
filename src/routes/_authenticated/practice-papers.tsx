import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { AppShell } from "@/components/dashboard/AppShell";
import { EmptyState, Panel } from "@/components/dashboard/ModuleScaffold";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/lib/dashboard";

export const Route = createFileRoute("/_authenticated/practice-papers")({
  head: () => ({
    meta: [
      { title: "Practice Papers — Kixto" },
      { name: "description", content: "Generate and track CA practice papers and your attempt accuracy." },
      { property: "og:title", content: "Practice Papers — Kixto" },
      { property: "og:description", content: "Generate and track CA practice papers and your attempt accuracy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PracticePapers,
});

function PracticePapers() {
  const { data } = useDashboard();
  const papers = data?.papers ?? [];

  return (
    <AppShell title="Practice Papers" subtitle="Every paper you generate and attempt, tracked automatically.">
      <Panel title={`${papers.length} paper${papers.length === 1 ? "" : "s"}`}>
        {papers.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-7 w-7" />}
            title="Start your first Practice Paper"
            description="Papers you generate appear here with their question count, status and accuracy."
          />
        ) : (
          <ul className="divide-y divide-border/60">
            {papers.map((p) => (
              <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[p.subject, `${p.question_count} questions`, format(new Date(p.created_at), "d MMM yyyy")]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full capitalize">
                  {p.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}