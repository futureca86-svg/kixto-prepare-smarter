import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Brain,
  CreditCard,
  Database,
  Download,
  FileText,
  HelpCircle,
  LifeBuoy,
  Mail,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminShell } from "@/components/admin/AdminShell";
import { GlassPanel, HealthPill, Nothing, PageHeader, Rows, StatCard } from "@/components/admin/AdminUI";
import { formatBytes, formatMoney, useCommandCenter } from "@/lib/admin/queries";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Kixto Control Center — Super Admin" },
      { name: "description", content: "Live operating console for the Kixto platform: users, revenue, health and activity." },
      { property: "og:title", content: "Kixto Control Center — Super Admin" },
      { property: "og:description", content: "Live operating console for the Kixto platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CommandCenter,
});

const PIE_COLORS = ["oklch(0.55 0.22 268)", "oklch(0.62 0.19 285)", "oklch(0.68 0.16 300)", "oklch(0.72 0.13 250)"];

function CommandCenter() {
  const { data, isLoading } = useCommandCenter();
  const s = data?.stats ?? {};

  return (
    <AdminShell title="Command Center" subtitle="Everything happening inside Kixto, live.">
      <PageHeader
        title="Platform overview"
        description="Every figure below is read directly from the production database."
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard loading={isLoading} label="Students" value={s["students"] ?? 0} icon={<Users className="h-4 w-4" />} tone="accent" />
        <StatCard loading={isLoading} label="Active today" value={s["activeToday"] ?? 0} icon={<Activity className="h-4 w-4" />} />
        <StatCard loading={isLoading} label="Premium" value={s["premium"] ?? 0} icon={<CreditCard className="h-4 w-4" />} />
        <StatCard loading={isLoading} label="Admins" value={s["admins"] ?? 0} icon={<ShieldCheck className="h-4 w-4" />} />
        <StatCard loading={isLoading} label="Live sessions" value={s["activeSessions"] ?? 0} icon={<Zap className="h-4 w-4" />} />
        <StatCard
          loading={isLoading}
          label="Revenue"
          value={formatMoney(data?.revenueCents ?? 0)}
          icon={<TrendingUp className="h-4 w-4" />}
          hint={`${data?.growthPct ?? 0}% signup growth (30d)`}
        />
        <StatCard loading={isLoading} label="Papers" value={s["papers"] ?? 0} icon={<FileText className="h-4 w-4" />} />
        <StatCard loading={isLoading} label="Questions" value={s["questions"] ?? 0} icon={<HelpCircle className="h-4 w-4" />} />
        <StatCard loading={isLoading} label="Concepts tracked" value={s["memoryItems"] ?? 0} icon={<Brain className="h-4 w-4" />} />
        <StatCard loading={isLoading} label="Subjects" value={s["subjects"] ?? 0} icon={<BookOpen className="h-4 w-4" />} />
        <StatCard loading={isLoading} label="Downloads" value={s["downloads"] ?? 0} icon={<Download className="h-4 w-4" />} />
        <StatCard loading={isLoading} label="Emails sent" value={s["emailsSent"] ?? 0} icon={<Mail className="h-4 w-4" />} />
        <StatCard
          loading={isLoading}
          label="Pending tickets"
          value={s["ticketsPending"] ?? 0}
          tone={(s["ticketsPending"] ?? 0) > 0 ? "warn" : "default"}
          icon={<LifeBuoy className="h-4 w-4" />}
        />
        <StatCard
          loading={isLoading}
          label="Open errors"
          value={s["openErrors"] ?? 0}
          tone={(s["openErrors"] ?? 0) > 0 ? "danger" : "default"}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard loading={isLoading} label="Database" value={formatBytes(data?.dbSizeBytes ?? 0)} icon={<Database className="h-4 w-4" />} hint={`${data?.liveRows ?? 0} rows`} />
        <StatCard loading={isLoading} label="Sign-ins (24h)" value={s["signins24h"] ?? 0} />
        <StatCard loading={isLoading} label="Reviews today" value={s["reviewsToday"] ?? 0} />
        <StatCard loading={isLoading} label="API latency" value={`${data?.apiLatencyMs ?? 0} ms`} />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <GlassPanel title="Student growth" description="Cumulative registrations over the last 30 days">
          {isLoading ? (
            <Rows n={4} />
          ) : (data?.growthSeries ?? []).length === 0 ? (
            <Nothing label="No registrations yet." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.growthSeries ?? []} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="growth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} interval="preserveStartEnd" />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 14, fontSize: 12 }} />
                  <Area type="monotone" dataKey="students" stroke="var(--primary)" strokeWidth={2} fill="url(#growth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassPanel>

        <GlassPanel title="Module usage" description="Records created per module">
          {isLoading ? (
            <Rows n={4} />
          ) : (data?.usageSeries ?? []).length === 0 ? (
            <Nothing label="No module activity yet." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.usageSeries ?? []} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84} paddingAngle={3}>
                    {(data?.usageSeries ?? []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 14, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassPanel>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <GlassPanel
          title="System health"
          description="Live service status"
          action={
            <Link to="/admin/health" className="text-xs font-medium text-primary hover:underline">
              Open center
            </Link>
          }
        >
          {isLoading ? (
            <Rows n={5} />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {(data?.health ?? []).map((h) => (
                <li key={h.key} className="flex items-center justify-between gap-2 rounded-xl border border-border/50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{h.label}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{h.detail}</p>
                  </div>
                  <HealthPill status={h.status} />
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>

        <GlassPanel title="Live activity" description="Newest events across the platform">
          {isLoading ? (
            <Rows n={6} />
          ) : (data?.activity ?? []).length === 0 ? (
            <Nothing label="No activity recorded yet." />
          ) : (
            <ul className="max-h-80 space-y-1 overflow-y-auto pr-1">
              {(data?.activity ?? []).map((a) => (
                <li key={a.id} className="flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-accent/50">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full brand-gradient-bg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.detail}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(a.at), { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>
      </section>
    </AdminShell>
  );
}