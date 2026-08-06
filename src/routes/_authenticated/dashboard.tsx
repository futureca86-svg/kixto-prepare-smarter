import { lazy, Suspense, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Brain,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Flame,
  Lightbulb,
  Quote as QuoteIcon,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/dashboard/AppShell";
import { EmptyState, Panel } from "@/components/dashboard/ModuleScaffold";
import {
  formatHours,
  useDailyQuote,
  useDashboard,
  useMetrics,
  type PlannerTask,
  type SubjectStat,
} from "@/lib/dashboard";

const Charts = lazy(() => import("@/components/dashboard/DashboardCharts"));

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Kixto study dashboard" },
      {
        name: "description",
        content: "See your CA level, subjects, goals and daily study target in one place.",
      },
      { property: "og:title", content: "Your Kixto study dashboard" },
      {
        property: "og:description",
        content: "Track your CA preparation with a personalised Kixto dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  in_progress: "bg-amber-100 text-amber-700",
  skipped: "bg-rose-100 text-rose-700",
  upcoming: "bg-accent text-accent-foreground",
};

function StatCard({
  icon,
  label,
  value,
  unit,
  rows,
  progress,
  progressLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  rows?: { label: string; value: string }[];
  progress?: number;
  progressLabel?: string;
}) {
  return (
    <div className="rounded-[20px] border border-border/60 bg-card p-5 shadow-[0_2px_20px_-14px_rgba(30,41,120,0.4)] transition-shadow hover:shadow-[0_8px_28px_-16px_rgba(30,41,120,0.5)]">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent text-accent-foreground">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight">
        {value}
        {unit ? <span className="ml-1 text-base font-medium text-muted-foreground">{unit}</span> : null}
      </p>
      {rows?.length ? (
        <dl className="mt-3 space-y-1">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-xs text-muted-foreground">
              <dt className="truncate">{r.label}</dt>
              <dd className="font-semibold text-foreground">{r.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {progress !== undefined ? (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>{progressLabel}</span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      ) : null}
    </div>
  );
}

function TaskRow({ task }: { task: PlannerTask }) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 text-xs font-semibold tabular-nums text-primary">
          {task.start_time ? task.start_time.slice(0, 5) : "--:--"}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{task.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {[task.subject, task.chapter, `${task.duration_min} min`].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
          STATUS_STYLES[task.status] ?? STATUS_STYLES.upcoming
        }`}
      >
        {task.status.replace("_", " ")}
      </span>
    </li>
  );
}

function SubjectLegend({ stats }: { stats: SubjectStat[] }) {
  return (
    <ul className="space-y-2">
      {stats.slice(0, 6).map((s) => (
        <li key={s.subject} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-xs">
          <span className="truncate font-medium">{s.subject}</span>
          <span className="shrink-0 text-muted-foreground">
            {s.questionsSolved} Qs · {s.accuracy}% · {s.completion}% done
          </span>
        </li>
      ))}
    </ul>
  );
}

const QUICK_ACTIONS = [
  { to: "/practice-papers", label: "Practice Paper", hint: "Create new", icon: FileText },
  { to: "/memory-guard", label: "Memory Guard", hint: "Review now", icon: Brain },
  { to: "/planner", label: "Planner", hint: "Plan your day", icon: CalendarRange },
  { to: "/analytics", label: "Analytics", hint: "View progress", icon: BarChart3 },
  { to: "/downloads", label: "Downloads", hint: "View all", icon: Download },
] as const;

function Dashboard() {
  const { data, isLoading } = useDashboard();
  const m = useMetrics(data);
  const { data: quote } = useDailyQuote(data?.userId);
  const [month, setMonth] = useState<Date>(new Date());

  const eventDays = useMemo(
    () => m.calendarTasks.map((task) => parseISO(task.scheduled_date)),
    [m.calendarTasks],
  );
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const selectedTasks = useMemo(
    () =>
      selected
        ? m.calendarTasks.filter((task) => isSameDay(parseISO(task.scheduled_date), selected))
        : [],
    [m.calendarTasks, selected],
  );

  const firstName = (data?.profile?.full_name ?? "").split(" ")[0] || "there";

  if (isLoading) {
    return (
      <AppShell title="Loading your dashboard">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-[20px]" />
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Hello, ${firstName} 👋`} subtitle="Let's continue your preparation journey.">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <section aria-label="Live stats" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              icon={<Timer className="h-4 w-4" />}
              label="Study Hours"
              value={formatHours(m.studyToday)}
              unit={`/ ${formatHours(m.dailyTarget)} hrs`}
              rows={[
                { label: "This week", value: `${formatHours(m.studyWeek)} hrs` },
                { label: "This month", value: `${formatHours(m.studyMonth)} hrs` },
              ]}
              progress={Math.min(100, Math.round((m.studyToday / Math.max(1, m.dailyTarget)) * 100))}
              progressLabel="Daily target"
            />
            <StatCard
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Tasks Completed"
              value={`${m.completedToday}`}
              unit={`/ ${m.tasksToday.length}`}
              rows={[{ label: "Pending today", value: `${m.pendingToday}` }]}
              progress={m.completionRate}
              progressLabel="Completion"
            />
            <StatCard
              icon={<Flame className="h-4 w-4" />}
              label="Study Streak"
              value={`${m.currentStreak}`}
              unit="days"
              rows={[
                { label: "Longest streak", value: `${m.longestStreak} days` },
                { label: "Missed days", value: `${m.missedDays}` },
              ]}
            />
            <StatCard
              icon={<Target className="h-4 w-4" />}
              label="Accuracy"
              value={`${m.accuracy}`}
              unit="%"
              rows={[
                { label: "Questions solved", value: `${m.questionsSolved}` },
                {
                  label: "vs last week",
                  value: `${m.accuracyDelta > 0 ? "+" : ""}${m.accuracyDelta}%`,
                },
              ]}
            />
            <StatCard
              icon={<Activity className="h-4 w-4" />}
              label="Concepts Covered"
              value={`${m.topics}`}
              rows={[
                { label: "Chapters", value: `${m.chapters}` },
                { label: "Subjects", value: `${m.subjectsCovered}` },
              ]}
            />
          </section>

          <Panel title="Quick Access">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="rounded-2xl border border-border/60 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <span className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
                    <a.icon className="h-5 w-5" />
                  </span>
                  <span className="block truncate text-sm font-semibold">{a.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{a.hint}</span>
                </Link>
              ))}
            </div>
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel
              title="Today's Plan"
              action={
                <Button asChild variant="ghost" size="sm" className="h-8 rounded-full text-xs">
                  <Link to="/planner">View full plan</Link>
                </Button>
              }
            >
              {m.tasksToday.length === 0 ? (
                <EmptyState
                  icon={<ClipboardList className="h-7 w-7" />}
                  title="Nothing planned for today"
                  description="Create your first study plan and today's schedule appears here automatically."
                  action={
                    <Button asChild size="sm" className="rounded-full">
                      <Link to="/planner">Open Planner</Link>
                    </Button>
                  }
                />
              ) : (
                <ul className="divide-y divide-border/60">
                  {m.tasksToday.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Subject Performance">
              {m.subjectStats.length === 0 ? (
                <EmptyState
                  icon={<BarChart3 className="h-7 w-7" />}
                  title="No performance data yet"
                  description="Attempt a practice paper to see accuracy, revision score and completion per subject."
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
                  <Suspense fallback={<Skeleton className="h-40 w-full rounded-2xl" />}>
                    <Charts variant="donut" subjectStats={m.subjectStats} accuracy={m.accuracy} />
                  </Suspense>
                  <SubjectLegend stats={m.subjectStats} />
                </div>
              )}
            </Panel>
          </div>

          <Panel title="Upcoming Tasks">
            {m.upcoming.length === 0 ? (
              <EmptyState
                icon={<CalendarRange className="h-7 w-7" />}
                title="No upcoming tasks"
                description="Schedule study, revision or test sessions and they'll queue up here by date."
              />
            ) : (
              <ul className="divide-y divide-border/60">
                {m.upcoming.map((task) => (
                  <li key={task.id}>
                    <Link
                      to="/planner"
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 hover:opacity-80"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{task.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {[
                            format(parseISO(task.scheduled_date), "d MMM"),
                            task.start_time?.slice(0, 5),
                            task.subject,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 rounded-full capitalize">
                        {task.task_type}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Progress Overview">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <Suspense fallback={<Skeleton className="h-56 w-full rounded-2xl" />}>
                <Charts variant="trend" weeklyTrend={m.weeklyTrend} />
              </Suspense>
              <dl className="grid grid-cols-2 gap-3">
                {[
                  { label: "Study hours", value: `${formatHours(m.studyMonth)}` },
                  { label: "Questions solved", value: `${m.questionsSolved}` },
                  { label: "Papers generated", value: `${m.papersGenerated}` },
                  { label: "Papers completed", value: `${m.papersCompleted}` },
                  { label: "Revision sessions", value: `${m.revisionSessions}` },
                  { label: "Memory reviews", value: `${m.memoryReviews}` },
                  { label: "Planner completion", value: `${m.plannerCompletion}%` },
                  { label: "Study streak", value: `${m.currentStreak} d` },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-muted/60 p-3">
                    <dt className="truncate text-[11px] text-muted-foreground">{item.label}</dt>
                    <dd className="text-lg font-bold tabular-nums">{item.value}</dd>
                  </div>
                ))}
                <div className="col-span-2 rounded-2xl brand-gradient-bg p-4 text-primary-foreground">
                  <p className="text-[11px] opacity-80">Overall progress</p>
                  <p className="text-2xl font-bold">{m.overallProgress}%</p>
                  <Progress value={m.overallProgress} className="mt-2 h-1.5 bg-white/25" />
                </div>
              </dl>
            </div>
          </Panel>
        </div>

        <aside className="min-w-0 space-y-5">
          <Panel title="Study Calendar">
            <Calendar
              mode="single"
              month={month}
              onMonthChange={setMonth}
              selected={selected}
              onSelect={setSelected}
              modifiers={{ event: eventDays }}
              modifiersClassNames={{ event: "font-bold text-primary underline underline-offset-4" }}
              className="w-full p-0"
            />
            <div className="mt-3 border-t border-border/60 pt-3">
              {selectedTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nothing scheduled on this day.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedTasks.map((task) => (
                    <li key={task.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-xs">
                      <span className="truncate font-medium">{task.title}</span>
                      <span className="shrink-0 capitalize text-muted-foreground">{task.task_type}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>

          <Panel title="Today's Focus">
            {m.focus ? (
              <div>
                <p className="text-sm font-semibold">{m.focus.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[m.focus.subject, m.focus.reason].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{m.focus.minutes} min</span>
                  <span className="font-semibold text-foreground">{m.focus.progress}%</span>
                </div>
                <Progress value={m.focus.progress} className="mt-1.5 h-1.5" />
                <Button asChild className="mt-4 w-full rounded-full">
                  <Link to="/planner">Start now</Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Begin your CA journey — add a plan or a concept and Kixto will pick your daily focus.
              </p>
            )}
          </Panel>

          <Panel title="Motivation for You">
            <div className="flex gap-3">
              <QuoteIcon className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-sm">{quote?.quote ?? "Loading today's quote…"}</p>
                {quote ? <p className="mt-2 text-xs text-muted-foreground">— {quote.author}</p> : null}
              </div>
            </div>
          </Panel>

          <Panel title="Daily Tip">
            <div className="flex gap-3">
              <Lightbulb className="h-5 w-5 shrink-0 text-secondary" />
              <p className="min-w-0 text-sm">{m.tip}</p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              {m.accuracyDelta >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
              )}
              <span>
                Accuracy {m.accuracyDelta >= 0 ? "up" : "down"} {Math.abs(m.accuracyDelta)}% vs last week
              </span>
            </div>
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}
}