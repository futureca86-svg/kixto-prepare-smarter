import { memo } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SubjectStat } from "@/lib/dashboard";

const BAND_COLORS: Record<SubjectStat["band"], string> = {
  strong: "var(--primary)",
  medium: "var(--secondary)",
  weak: "var(--destructive)",
};

type Props =
  | { variant: "donut"; subjectStats: SubjectStat[]; accuracy: number; weeklyTrend?: never }
  | {
      variant: "trend";
      weeklyTrend: { day: string; minutes: number; questions: number }[];
      subjectStats?: never;
      accuracy?: never;
    };

function DashboardCharts(props: Props) {
  if (props.variant === "donut") {
    const data = props.subjectStats.map((s) => ({
      name: s.subject,
      value: Math.max(s.questionsSolved, s.completion, 1),
      band: s.band,
    }));
    return (
      <div className="relative h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={48} outerRadius={68} paddingAngle={2} stroke="none">
              {data.map((d) => (
                <Cell key={d.name} fill={BAND_COLORS[d.band]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-xl font-bold">{props.accuracy}%</p>
            <p className="text-[11px] text-muted-foreground">Overall</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={props.weeklyTrend} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
          <defs>
            <linearGradient id="kixtoArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="minutes"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#kixtoArea)"
            isAnimationActive
          />
          <Area
            type="monotone"
            dataKey="questions"
            stroke="var(--secondary)"
            strokeWidth={2}
            fillOpacity={0}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(DashboardCharts);