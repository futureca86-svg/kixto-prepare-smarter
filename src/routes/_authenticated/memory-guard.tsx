import { createFileRoute } from "@tanstack/react-router";
import { Brain } from "lucide-react";
import { format, parseISO } from "date-fns";
import { AppShell } from "@/components/dashboard/AppShell";
import { EmptyState, Panel } from "@/components/dashboard/ModuleScaffold";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDashboard } from "@/lib/dashboard";

export const Route = createFileRoute("/_authenticated/memory-guard")({
  head: () => ({
    meta: [
      { title: "Memory Guard — Kixto" },
      { name: "description", content: "Spaced revision for every CA concept you never want to forget." },
      { property: "og:title", content: "Memory Guard — Kixto" },
      { property: "og:description", content: "Spaced revision for every CA concept you never want to forget." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MemoryGuard,
});

function MemoryGuard() {
  const { data } = useDashboard();
  const items = data?.memoryItems ?? [];
  const today = format(new Date(), "yyyy-MM-dd");
  const due = items.filter((i) => i.next_review_on <= today);

  return (
    <AppShell title="Memory Guard" subtitle={`${due.length} concept${due.length === 1 ? "" : "s"} due for revision`}>
      <Panel title="Your concepts">
        {items.length === 0 ? (
          <EmptyState
            icon={<Brain className="h-7 w-7" />}
            title="Add concepts to Memory Guard"
            description="Save concepts here and Kixto schedules the revisions so nothing slips away."
          />
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="rounded-2xl border border-border/60 p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.topic}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[item.subject, item.chapter].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <Badge
                    variant={item.next_review_on <= today ? "default" : "secondary"}
                    className="shrink-0 rounded-full"
                  >
                    {item.next_review_on <= today
                      ? "Due now"
                      : format(parseISO(item.next_review_on), "d MMM")}
                  </Badge>
                </div>
                <Progress value={item.strength ?? 0} className="mt-3 h-1.5" />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}