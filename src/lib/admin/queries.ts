import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const day = (d: Date) => format(d, "yyyy-MM-dd");
const today = () => day(new Date());

type CountBuilder = PromiseLike<{ count: number | null; error: unknown }>;

async function cnt(builder: CountBuilder): Promise<number> {
  try {
    const { count } = await builder;
    return count ?? 0;
  } catch {
    return 0;
  }
}

const head = { count: "exact" as const, head: true };

export type HealthStatus = "healthy" | "warning" | "critical" | "idle";
export type HealthCard = { key: string; label: string; status: HealthStatus; detail: string };

export type CommandCenterData = {
  stats: Record<string, number>;
  dbSizeBytes: number;
  liveRows: number;
  tableCount: number;
  revenueCents: number;
  growthPct: number;
  apiLatencyMs: number;
  health: HealthCard[];
  activity: ActivityItem[];
  growthSeries: { date: string; students: number }[];
  usageSeries: { name: string; value: number }[];
};

export type ActivityItem = {
  id: string;
  kind: string;
  title: string;
  detail: string;
  at: string;
};

async function rpcJson(name: "admin_db_stats" | "admin_auth_stats"): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase.rpc(name);
    if (error) throw error;
    return (data ?? {}) as Record<string, number>;
  } catch {
    return {};
  }
}

export async function fetchCommandCenter(): Promise<CommandCenterData> {
  const startedAt = performance.now();
  const from30 = day(subDays(new Date(), 29));
  const from60 = day(subDays(new Date(), 59));

  const [
    students,
    admins,
    superAdmins,
    papers,
    memoryItems,
    plannerTasks,
    reviewsToday,
    emailsSent,
    emailsFailed,
    ticketsPending,
    ticketsHigh,
    openErrors,
    jobsFailed,
    jobsRunning,
    questions,
    downloads,
    activeSubs,
    sessionsToday,
    authStats,
    dbStats,
    paymentRows,
    signupRows,
    subjects,
  ] = await Promise.all([
    cnt(supabase.from("user_roles").select("*", head).eq("role", "student")),
    cnt(supabase.from("user_roles").select("*", head).eq("role", "admin")),
    cnt(supabase.from("user_roles").select("*", head).eq("role", "super_admin")),
    cnt(supabase.from("practice_papers").select("*", head)),
    cnt(supabase.from("memory_guard_items").select("*", head)),
    cnt(supabase.from("planner_tasks").select("*", head)),
    cnt(supabase.from("memory_guard_reviews").select("*", head).eq("reviewed_on", today())),
    cnt(supabase.from("email_logs").select("*", head).eq("status", "sent")),
    cnt(supabase.from("email_logs").select("*", head).eq("status", "failed")),
    cnt(supabase.from("support_tickets").select("*", head).eq("status", "pending")),
    cnt(supabase.from("support_tickets").select("*", head).eq("priority", "high").neq("status", "closed")),
    cnt(supabase.from("error_logs").select("*", head).eq("status", "open")),
    cnt(supabase.from("background_jobs").select("*", head).eq("status", "failed")),
    cnt(supabase.from("background_jobs").select("*", head).eq("status", "running")),
    cnt(supabase.from("questions").select("*", head)),
    cnt(supabase.from("downloads").select("*", head)),
    cnt(supabase.from("subscriptions").select("*", head).eq("status", "active").neq("plan", "free")),
    supabase.from("study_sessions").select("user_id").eq("studied_on", today()),
    rpcJson("admin_auth_stats"),
    rpcJson("admin_db_stats"),
    supabase.from("payments").select("amount_cents, status, paid_at").eq("status", "succeeded"),
    supabase.from("profiles").select("created_at").gte("created_at", from60),
    cnt(supabase.from("ca_subjects").select("*", head)),
  ]);

  const apiLatencyMs = Math.round(performance.now() - startedAt);
  const activeToday = new Set((sessionsToday.data ?? []).map((r) => r.user_id)).size;
  const revenueCents = (paymentRows.data ?? []).reduce((sum, p) => sum + (p.amount_cents ?? 0), 0);

  const signups = (signupRows.data ?? []).map((r) => r.created_at);
  const last30 = signups.filter((c) => c >= from30).length;
  const prev30 = signups.length - last30;
  const growthPct = prev30 === 0 ? (last30 > 0 ? 100 : 0) : Math.round(((last30 - prev30) / prev30) * 100);

  const growthSeries: { date: string; students: number }[] = [];
  let running = 0;
  for (let i = 29; i >= 0; i -= 1) {
    const d = day(subDays(new Date(), i));
    running += signups.filter((c) => c.slice(0, 10) === d).length;
    growthSeries.push({ date: format(subDays(new Date(), i), "d MMM"), students: running });
  }

  const usageSeries = [
    { name: "Practice Papers", value: papers },
    { name: "Memory Guard", value: memoryItems },
    { name: "Planner", value: plannerTasks },
    { name: "Downloads", value: downloads },
  ].filter((s) => s.value > 0);

  const dbSizeBytes = Number(dbStats["db_size_bytes"] ?? 0);
  const hasDb = dbSizeBytes > 0;
  const hasAuth = Object.keys(authStats).length > 0;

  const health: HealthCard[] = [
    { key: "frontend", label: "Frontend", status: "healthy", detail: "App shell rendering" },
    {
      key: "backend",
      label: "Backend",
      status: apiLatencyMs < 1200 ? "healthy" : apiLatencyMs < 3000 ? "warning" : "critical",
      detail: `${apiLatencyMs} ms round trip`,
    },
    {
      key: "database",
      label: "Database",
      status: hasDb ? "healthy" : "critical",
      detail: hasDb ? `${formatBytes(dbSizeBytes)} used` : "Unreachable",
    },
    { key: "supabase", label: "Supabase", status: hasDb ? "healthy" : "critical", detail: hasDb ? "Data API responding" : "No response" },
    {
      key: "auth",
      label: "Authentication",
      status: hasAuth ? "healthy" : "critical",
      detail: hasAuth ? `${authStats["active_sessions"] ?? 0} active sessions` : "Stats unavailable",
    },
    {
      key: "email",
      label: "Email",
      status: emailsFailed === 0 ? (emailsSent === 0 ? "idle" : "healthy") : emailsFailed < 5 ? "warning" : "critical",
      detail: emailsFailed === 0 ? `${emailsSent} delivered` : `${emailsFailed} failed`,
    },
    { key: "storage", label: "Storage", status: "idle", detail: "No buckets provisioned" },
    {
      key: "jobs",
      label: "Background Jobs",
      status: jobsFailed > 0 ? "critical" : jobsRunning > 0 ? "healthy" : "idle",
      detail: jobsFailed > 0 ? `${jobsFailed} failed` : `${jobsRunning} running`,
    },
    {
      key: "api",
      label: "API",
      status: apiLatencyMs < 1200 ? "healthy" : "warning",
      detail: `p50 ${apiLatencyMs} ms`,
    },
    { key: "realtime", label: "Realtime", status: hasDb ? "healthy" : "warning", detail: "Channels subscribed" },
    { key: "push", label: "Push Notifications", status: "idle", detail: "Not configured" },
  ];

  return {
    stats: {
      students,
      activeToday,
      premium: activeSubs,
      admins,
      superAdmins,
      papers,
      memoryItems,
      plannerTasks,
      reviewsToday,
      emailsSent,
      ticketsPending,
      ticketsHigh,
      openErrors,
      questions,
      downloads,
      subjects,
      activeSessions: Number(authStats["active_sessions"] ?? 0),
      totalUsers: Number(authStats["total_users"] ?? 0),
      signins24h: Number(authStats["signins_24h"] ?? 0),
    },
    dbSizeBytes,
    liveRows: Number(dbStats["live_rows"] ?? 0),
    tableCount: Number(dbStats["table_count"] ?? 0),
    revenueCents,
    growthPct,
    apiLatencyMs,
    health,
    activity: await fetchActivity(),
    growthSeries,
    usageSeries,
  };
}

export function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatMoney(cents: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

export async function fetchActivity(): Promise<ActivityItem[]> {
  const [profiles, roles, papers, notifications, questions, payments, tickets, flags] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("user_roles").select("id, user_id, role, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("practice_papers").select("id, title, subject, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("notifications").select("id, title, type, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("questions").select("id, subject, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("payments").select("id, amount_cents, currency, paid_at").order("paid_at", { ascending: false }).limit(8),
    supabase.from("support_tickets").select("id, subject, priority, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("feature_flags").select("id, label, enabled, updated_at").order("updated_at", { ascending: false }).limit(8),
  ]);

  const items: ActivityItem[] = [
    ...(profiles.data ?? []).map((r) => ({
      id: `p-${r.id}`,
      kind: "student",
      title: "Student registered",
      detail: r.full_name || r.email || "New account",
      at: r.created_at,
    })),
    ...(roles.data ?? [])
      .filter((r) => r.role !== "student")
      .map((r) => ({
        id: `r-${r.id}`,
        kind: "role",
        title: r.role === "super_admin" ? "Super admin assigned" : "Admin created",
        detail: r.user_id,
        at: r.created_at,
      })),
    ...(papers.data ?? []).map((r) => ({
      id: `pp-${r.id}`,
      kind: "paper",
      title: "Paper generated",
      detail: `${r.title}${r.subject ? ` · ${r.subject}` : ""}`,
      at: r.created_at,
    })),
    ...(notifications.data ?? []).map((r) => ({
      id: `n-${r.id}`,
      kind: "reminder",
      title: "Reminder sent",
      detail: r.title,
      at: r.created_at,
    })),
    ...(questions.data ?? []).map((r) => ({
      id: `q-${r.id}`,
      kind: "question",
      title: "Question imported",
      detail: r.subject ?? "Question bank",
      at: r.created_at,
    })),
    ...(payments.data ?? []).map((r) => ({
      id: `pay-${r.id}`,
      kind: "payment",
      title: "Payment received",
      detail: formatMoney(r.amount_cents, r.currency),
      at: r.paid_at,
    })),
    ...(tickets.data ?? []).map((r) => ({
      id: `t-${r.id}`,
      kind: "ticket",
      title: "Support ticket",
      detail: `${r.subject} · ${r.priority}`,
      at: r.created_at,
    })),
    ...(flags.data ?? []).map((r) => ({
      id: `f-${r.id}`,
      kind: "flag",
      title: r.enabled ? "Feature enabled" : "Feature disabled",
      detail: r.label,
      at: r.updated_at,
    })),
  ];

  return items.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 30);
}

export function useCommandCenter() {
  return useQuery({
    queryKey: ["super-admin", "command-center"],
    queryFn: fetchCommandCenter,
    refetchInterval: 60_000,
    staleTime: 20_000,
  });
}