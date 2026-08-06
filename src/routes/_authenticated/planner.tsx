import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange } from "lucide-react";
import { format, parseISO } from "date-fns";
import { AppShell } from "@/components/dashboard/AppShell";
import { EmptyState, Panel } from "@/components/dashboard/ModuleScaffold";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/lib/dashboard";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "Study Planner — Kixto" },
      { name: "description", content: "Plan every study, revision and test session across your CA syllabus." },
      { property: "og:title", content: "Study Planner — Kixto" },
      { property: "og:description", content: "Plan every study, revision and test session across your CA syllabus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Planner,
});

function Planner() {
  const { data } = useDashboard();
  const tasks = data?.tasks ?? [];
  const byDate = tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
    (acc[task.scheduled_date] ||= []).push(task);
    return acc;
  }, {});
  const dates = Object.keys(byDate).sort();

  return (
    <AppShell title="Planner" subtitle="Your schedule drives the dashboard, streak and today's focus.">
      {tasks.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<CalendarRange className="h-7 w-7" />}
            title="Create your first Study Plan"
            description="Add tasks with a subject, chapter and duration — your dashboard fills in automatically."
          />
        </Panel>
      ) : (
        <div className="space-y-4">
          {dates.map((date) => (
            <Panel key={date} title={format(parseISO(date), "EEEE, d MMM yyyy")}>
              <ul className="divide-y divide-border/60">
                {byDate[date].map((task) => (
                  <li key={task.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{task.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[task.start_time?.slice(0, 5), task.subject, task.chapter, `${task.duration_min} min`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 rounded-full capitalize">
                      {task.status.replace("_", " ")}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      )}
    </AppShell>
  );
}