import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, differenceInCalendarDays, format, parseISO, subDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export const MODULES = [
  "dashboard",
  "practice-papers",
  "memory-guard",
  "planner",
  "analytics",
  "downloads",
  "settings",
] as const;
export type ModuleKey = (typeof MODULES)[number];

export type PlannerTask = {
  id: string;
  title: string;
  subject: string | null;
  chapter: string | null;
  topic: string | null;
  task_type: string;
  scheduled_date: string;
  start_time: string | null;
  duration_min: number;
  status: string;
  priority: number;
};

export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export type SubjectStat = {
  subject: string;
  questionsSolved: number;
  questionsCorrect: number;
  accuracy: number;
  revisionScore: number;
  completion: number;
  studyMinutes: number;
  band: "strong" | "medium" | "weak";
};

const today = () => format(new Date(), "yyyy-MM-dd");

async function requireUserId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export async function fetchDashboard() {
  const uid = await requireUserId();
  const from90 = format(subDays(new Date(), 89), "yyyy-MM-dd");
  const from30 = format(subDays(new Date(), 29), "yyyy-MM-dd");
  const to60 = format(addDays(new Date(), 60), "yyyy-MM-dd");

  const [profile, sessions, tasks, papers, attempts, memoryItems, reviews, downloads, notifications, modules] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, full_name, email, course_code, group_code, subjects, goals, study_hours, daily_target_minutes, onboarding_completed",
        )
        .eq("id", uid)
        .maybeSingle(),
      supabase
        .from("study_sessions")
        .select("id, subject, chapter, topic, minutes, studied_on")
        .eq("user_id", uid)
        .gte("studied_on", from90)
        .order("studied_on", { ascending: false }),
      supabase
        .from("planner_tasks")
        .select(
          "id, title, subject, chapter, topic, task_type, scheduled_date, start_time, duration_min, status, priority",
        )
        .eq("user_id", uid)
        .gte("scheduled_date", from30)
        .lte("scheduled_date", to60)
        .order("scheduled_date", { ascending: true })
        .order("start_time", { ascending: true, nullsFirst: false }),
      supabase
        .from("practice_papers")
        .select("id, title, subject, question_count, status, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("paper_attempts")
        .select("id, subject, chapter, topic, attempt_kind, questions_attempted, questions_correct, attempted_on")
        .eq("user_id", uid)
        .gte("attempted_on", from90)
        .order("attempted_on", { ascending: false }),
      supabase
        .from("memory_guard_items")
        .select("id, subject, chapter, topic, strength, next_review_on, last_reviewed_at")
        .eq("user_id", uid)
        .limit(500),
      supabase
        .from("memory_guard_reviews")
        .select("id, subject, recall_score, reviewed_on")
        .eq("user_id", uid)
        .gte("reviewed_on", from90),
      supabase.from("downloads").select("id, title, kind, subject, created_at").eq("user_id", uid).limit(200),
      supabase
        .from("notifications")
        .select("id, type, title, body, link, read_at, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase.from("user_modules").select("module, enabled").eq("user_id", uid),
    ]);

  const err = [profile, sessions, tasks, papers, attempts, memoryItems, reviews, downloads, notifications, modules]
    .map((r) => r.error)
    .find(Boolean);
  if (err) throw err;

  return {
    userId: uid,
    profile: profile.data,
    sessions: sessions.data ?? [],
    tasks: (tasks.data ?? []) as PlannerTask[],
    papers: papers.data ?? [],
    attempts: attempts.data ?? [],
    memoryItems: memoryItems.data ?? [],
    reviews: reviews.data ?? [],
    downloads: downloads.data ?? [],
    notifications: (notifications.data ?? []) as NotificationRow[],
    modules: modules.data ?? [],
  };
}

export type DashboardRaw = Awaited<ReturnType<typeof fetchDashboard>>;

const REALTIME_TABLES = [
  "study_sessions",
  "planner_tasks",
  "practice_papers",
  "paper_attempts",
  "memory_guard_items",
  "memory_guard_reviews",
  "downloads",
  "notifications",
];

export function useDashboard() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 30_000,
  });
  const userId = query.data?.userId;

  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel(`dashboard-${userId}`);
    for (const table of REALTIME_TABLES) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `user_id=eq.${userId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
      );
    }
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return query;
}

function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function computeMetrics(raw: DashboardRaw | undefined) {
  const t = today();
  const empty = {
    hasAnyData: false,
    studyToday: 0,
    studyWeek: 0,
    studyMonth: 0,
    dailyTarget: 360,
    tasksToday: [] as PlannerTask[],
    completedToday: 0,
    pendingToday: 0,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    missedDays: 0,
    accuracy: 0,
    accuracyDelta: 0,
    questionsSolved: 0,
    topics: 0,
    chapters: 0,
    subjectsCovered: 0,
    subjectStats: [] as SubjectStat[],
    upcoming: [] as PlannerTask[],
    calendarTasks: [] as PlannerTask[],
    focus: null as null | { title: string; subject: string | null; reason: string; minutes: number; progress: number; taskId?: string },
    tip: "",
    papersGenerated: 0,
    papersCompleted: 0,
    revisionSessions: 0,
    memoryReviews: 0,
    plannerCompletion: 0,
    overallProgress: 0,
    weeklyTrend: [] as { day: string; minutes: number; questions: number }[],
    unread: 0,
  };
  if (!raw) return empty;

  const dailyTarget = raw.profile?.daily_target_minutes ?? 360;
  const dayMinutes = new Map<string, number>();
  for (const s of raw.sessions) {
    dayMinutes.set(s.studied_on, (dayMinutes.get(s.studied_on) ?? 0) + (s.minutes ?? 0));
  }
  const studyToday = dayMinutes.get(t) ?? 0;
  const sumSince = (days: number) =>
    raw.sessions
      .filter((s) => differenceInCalendarDays(new Date(), parseISO(s.studied_on)) < days)
      .reduce((a, s) => a + (s.minutes ?? 0), 0);
  const studyWeek = sumSince(7);
  const studyMonth = sumSince(30);

  // streak
  const studiedDays = new Set([...dayMinutes.entries()].filter(([, m]) => m > 0).map(([d]) => d));
  let currentStreak = 0;
  for (let i = 0; i < 90; i++) {
    const d = format(subDays(new Date(), i), "yyyy-MM-dd");
    if (studiedDays.has(d)) currentStreak++;
    else if (i === 0) continue; // today not yet studied doesn't break the streak
    else break;
  }
  let longestStreak = 0;
  let run = 0;
  for (let i = 89; i >= 0; i--) {
    const d = format(subDays(new Date(), i), "yyyy-MM-dd");
    if (studiedDays.has(d)) {
      run++;
      longestStreak = Math.max(longestStreak, run);
    } else run = 0;
  }
  const firstDay = raw.sessions.length
    ? raw.sessions.reduce((min, s) => (s.studied_on < min ? s.studied_on : min), raw.sessions[0].studied_on)
    : null;
  const trackedDays = firstDay ? differenceInCalendarDays(new Date(), parseISO(firstDay)) + 1 : 0;
  const missedDays = Math.max(0, trackedDays - studiedDays.size);

  // tasks
  const tasksToday = raw.tasks.filter((task) => task.scheduled_date === t);
  const completedToday = tasksToday.filter((task) => task.status === "completed").length;
  const pendingToday = tasksToday.filter((task) => task.status !== "completed" && task.status !== "skipped").length;
  const completionRate = pct(completedToday, tasksToday.length);
  const pastTasks = raw.tasks.filter((task) => task.scheduled_date <= t);
  const plannerCompletion = pct(pastTasks.filter((task) => task.status === "completed").length, pastTasks.length);
  const upcoming = raw.tasks
    .filter((task) => task.scheduled_date >= t && task.status !== "completed" && task.status !== "skipped")
    .slice(0, 6);

  // accuracy
  const totalQ = raw.attempts.reduce((a, x) => a + (x.questions_attempted ?? 0), 0);
  const totalC = raw.attempts.reduce((a, x) => a + (x.questions_correct ?? 0), 0);
  const accuracy = pct(totalC, totalQ);
  const recent = raw.attempts.filter((x) => differenceInCalendarDays(new Date(), parseISO(x.attempted_on)) < 7);
  const older = raw.attempts.filter((x) => {
    const d = differenceInCalendarDays(new Date(), parseISO(x.attempted_on));
    return d >= 7 && d < 14;
  });
  const accRecent = pct(
    recent.reduce((a, x) => a + x.questions_correct, 0),
    recent.reduce((a, x) => a + x.questions_attempted, 0),
  );
  const accOlder = pct(
    older.reduce((a, x) => a + x.questions_correct, 0),
    older.reduce((a, x) => a + x.questions_attempted, 0),
  );
  const accuracyDelta = older.length && recent.length ? accRecent - accOlder : 0;

  // concepts covered
  const topicSet = new Set<string>();
  const chapterSet = new Set<string>();
  const subjectSet = new Set<string>();
  const collect = (subject?: string | null, chapter?: string | null, topic?: string | null) => {
    if (subject) subjectSet.add(subject);
    if (chapter) chapterSet.add(`${subject ?? ""}|${chapter}`);
    if (topic) topicSet.add(`${subject ?? ""}|${chapter ?? ""}|${topic}`);
  };
  raw.sessions.forEach((s) => collect(s.subject, s.chapter, s.topic));
  raw.attempts.forEach((s) => collect(s.subject, s.chapter, s.topic));
  raw.memoryItems.forEach((s) => collect(s.subject, s.chapter, s.topic));
  raw.tasks
    .filter((task) => task.status === "completed")
    .forEach((task) => collect(task.subject, task.chapter, task.topic));

  // per subject
  const enrolled: string[] = (raw.profile?.subjects as string[] | undefined) ?? [];
  const subjects = Array.from(new Set([...enrolled, ...subjectSet]));
  const subjectStats: SubjectStat[] = subjects.map((subject) => {
    const at = raw.attempts.filter((x) => x.subject === subject);
    const q = at.reduce((a, x) => a + x.questions_attempted, 0);
    const c = at.reduce((a, x) => a + x.questions_correct, 0);
    const rv = raw.reviews.filter((r) => r.subject === subject);
    const revisionScore = rv.length ? Math.round(rv.reduce((a, r) => a + (r.recall_score ?? 0), 0) / rv.length) : 0;
    const subjTasks = raw.tasks.filter((task) => task.subject === subject);
    const completion = pct(subjTasks.filter((task) => task.status === "completed").length, subjTasks.length);
    const studyMinutes = raw.sessions.filter((s) => s.subject === subject).reduce((a, s) => a + (s.minutes ?? 0), 0);
    const acc = pct(c, q);
    const band: SubjectStat["band"] = q === 0 ? "weak" : acc >= 75 ? "strong" : acc >= 50 ? "medium" : "weak";
    return { subject, questionsSolved: q, questionsCorrect: c, accuracy: acc, revisionScore, completion, studyMinutes, band };
  });

  // today's focus
  let focus = empty.focus;
  const examSoon = raw.tasks
    .filter((task) => task.task_type === "exam" && task.scheduled_date >= t)
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))[0];
  const missedTask = raw.tasks
    .filter((task) => task.scheduled_date < t && task.status !== "completed" && task.status !== "skipped")
    .sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date))[0];
  const dueReview = raw.memoryItems
    .filter((m) => m.next_review_on <= t)
    .sort((a, b) => a.next_review_on.localeCompare(b.next_review_on))[0];
  const weakest = [...subjectStats].filter((s) => s.questionsSolved > 0).sort((a, b) => a.accuracy - b.accuracy)[0];
  const firstTodayTask = tasksToday.find((task) => task.status !== "completed" && task.status !== "skipped");

  if (examSoon) {
    focus = {
      title: examSoon.title,
      subject: examSoon.subject,
      reason: `Exam on ${format(parseISO(examSoon.scheduled_date), "d MMM")}`,
      minutes: examSoon.duration_min,
      progress: 0,
      taskId: examSoon.id,
    };
  } else if (missedTask) {
    focus = {
      title: missedTask.title,
      subject: missedTask.subject,
      reason: "Missed in your planner",
      minutes: missedTask.duration_min,
      progress: 0,
      taskId: missedTask.id,
    };
  } else if (dueReview) {
    focus = {
      title: dueReview.topic,
      subject: dueReview.subject,
      reason: "Revision due in Memory Guard",
      minutes: 20,
      progress: Math.min(100, dueReview.strength ?? 0),
    };
  } else if (weakest && weakest.accuracy < 70) {
    focus = {
      title: `Practice ${weakest.subject}`,
      subject: weakest.subject,
      reason: `Lowest accuracy at ${weakest.accuracy}%`,
      minutes: 45,
      progress: weakest.accuracy,
    };
  } else if (firstTodayTask) {
    focus = {
      title: firstTodayTask.title,
      subject: firstTodayTask.subject,
      reason: "Next in today's plan",
      minutes: firstTodayTask.duration_min,
      progress: 0,
      taskId: firstTodayTask.id,
    };
  }

  // daily tip
  let tip = "";
  const staleSubject = subjects
    .map((subject) => {
      const last = raw.sessions.filter((s) => s.subject === subject)[0];
      return { subject, days: last ? differenceInCalendarDays(new Date(), parseISO(last.studied_on)) : null };
    })
    .filter((x) => x.days !== null && x.days >= 4)
    .sort((a, b) => (b.days ?? 0) - (a.days ?? 0))[0];

  if (accuracyDelta <= -5) tip = `Your accuracy dropped by ${Math.abs(accuracyDelta)}% this week. Redo the questions you got wrong.`;
  else if (staleSubject) tip = `You haven't studied ${staleSubject.subject} in ${staleSubject.days} days.`;
  else if (currentStreak >= 25 && currentStreak < 30) tip = `You're ${30 - currentStreak} days away from a 30-day streak.`;
  else if (missedTask) tip = `${missedTask.title} is still pending from ${format(parseISO(missedTask.scheduled_date), "d MMM")}.`;
  else if (studyToday >= dailyTarget) tip = "You've hit today's target. A short revision round would lock it in.";
  else if (studyToday > 0) tip = `${Math.max(0, dailyTarget - studyToday)} minutes left to hit today's study target.`;
  else if (raw.sessions.length === 0) tip = "Log your first study session to start building your streak.";
  else tip = "Start with your hardest subject while your focus is fresh.";

  // progress overview
  const papersGenerated = raw.papers.length;
  const papersCompleted = raw.papers.filter((p) => p.status === "completed").length;
  const revisionSessions = raw.tasks.filter((task) => task.task_type === "revision" && task.status === "completed").length;
  const memoryReviews = raw.reviews.length;
  const overallProgress = Math.round(
    (Math.min(100, pct(studyWeek, dailyTarget * 7)) + plannerCompletion + accuracy + Math.min(100, currentStreak * 5)) / 4,
  );

  const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const key = format(d, "yyyy-MM-dd");
    return {
      day: format(d, "EEE"),
      minutes: dayMinutes.get(key) ?? 0,
      questions: raw.attempts
        .filter((x) => x.attempted_on === key)
        .reduce((a, x) => a + (x.questions_attempted ?? 0), 0),
    };
  });

  const hasAnyData =
    raw.sessions.length > 0 ||
    raw.tasks.length > 0 ||
    raw.attempts.length > 0 ||
    raw.papers.length > 0 ||
    raw.memoryItems.length > 0;

  return {
    hasAnyData,
    studyToday,
    studyWeek,
    studyMonth,
    dailyTarget,
    tasksToday,
    completedToday,
    pendingToday,
    completionRate,
    currentStreak,
    longestStreak,
    missedDays,
    accuracy,
    accuracyDelta,
    questionsSolved: totalQ,
    topics: topicSet.size,
    chapters: chapterSet.size,
    subjectsCovered: subjectSet.size,
    subjectStats,
    upcoming,
    calendarTasks: raw.tasks,
    focus,
    tip,
    papersGenerated,
    papersCompleted,
    revisionSessions,
    memoryReviews,
    plannerCompletion,
    overallProgress,
    weeklyTrend,
    unread: raw.notifications.filter((n) => !n.read_at).length,
  };
}

export function useMetrics(raw: DashboardRaw | undefined) {
  return useMemo(() => computeMetrics(raw), [raw]);
}

export function useAllowedModules(raw: DashboardRaw | undefined): ModuleKey[] {
  return useMemo(() => {
    const rows = raw?.modules ?? [];
    if (!rows.length) return [...MODULES];
    const disabled = new Set(rows.filter((r) => !r.enabled).map((r) => r.module));
    return MODULES.filter((m) => m === "dashboard" || m === "settings" || !disabled.has(m));
  }, [raw]);
}

/** Deterministic daily quote that never repeats within 30 days. */
export function useDailyQuote(userId?: string) {
  return useQuery({
    queryKey: ["daily-quote", userId],
    enabled: Boolean(userId),
    staleTime: 60 * 60_000,
    queryFn: async () => {
      const t = today();
      const { data: existing } = await supabase
        .from("quote_history")
        .select("quote_id, shown_on, motivational_quotes(quote, author)")
        .eq("user_id", userId!)
        .gte("shown_on", format(subDays(new Date(), 30), "yyyy-MM-dd"));

      const todays = existing?.find((r) => r.shown_on === t);
      if (todays?.motivational_quotes) return todays.motivational_quotes as { quote: string; author: string };

      const { data: quotes } = await supabase.from("motivational_quotes").select("id, quote, author");
      if (!quotes?.length) return null;
      const usedIds = new Set((existing ?? []).map((r) => r.quote_id));
      const pool = quotes.filter((q) => !usedIds.has(q.id));
      const candidates = pool.length ? pool : quotes;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      await supabase
        .from("quote_history")
        .upsert({ user_id: userId!, quote_id: pick.id, shown_on: t }, { onConflict: "user_id,shown_on" });
      return { quote: pick.quote, author: pick.author };
    },
  });
}

export function formatHours(minutes: number) {
  const h = minutes / 60;
  return h >= 10 ? Math.round(h).toString() : h.toFixed(1);
}

export async function markAllNotificationsRead(userId: string) {
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
}