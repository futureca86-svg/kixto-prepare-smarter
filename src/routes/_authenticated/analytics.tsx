import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/dashboard/AppShell";
import { EmptyState, Panel } from "@/components/dashboard/ModuleScaffold";
import { useDashboard, useMetrics } from "@/lib/dashboard";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Kixto" },
      { name: "description", content: "Subject-wise accuracy, study hours and revision analytics for CA students." },
      { property: "og:title", content: "Analytics — Kixto" },
      { property: "og:description", content: "Subject-wise accuracy, study hours and revision analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { data } = useDashboard();
  const m = useMetrics(data);
  const chartData = m.subjectStats.map((s) => ({
    subject: s.subject.length > 12 ? `${s.subject.slice(0, 12)}…` : s.subject,
    accuracy: s.accuracy,
    completion: s.completion,
  }));

  return (
    <AppShell title="Analytics" subtitle="Everything calculated from your own study activity.">
      <Panel title="Accuracy and completion by subject">
        {chartData.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="h-7 w-7" />}
            title="No analytics yet"
            description="Attempt a practice paper or complete a planned task and your analytics build themselves."
          />
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="subject" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 100]} />
                <Tooltip cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="accuracy" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completion" fill="var(--secondary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>
    </AppShell>
  );
}