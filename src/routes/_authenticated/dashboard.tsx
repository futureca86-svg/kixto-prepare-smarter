import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BrandLock } from "@/components/brand/KixtoBrand";

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

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, course_code, group_code, subjects, goals, study_hours, onboarding_completed")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-muted/40 px-5 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-center justify-between">
          <BrandLock />
          <Button variant="outline" onClick={signOut} className="h-10 rounded-2xl text-sm font-semibold">
            <LogOut className="mr-1 h-4 w-4" /> Sign out
          </Button>
        </div>

        <h1 className="mt-8 text-3xl font-black tracking-tight text-foreground">
          {isLoading ? "Loading…" : `Hi ${profile?.full_name?.split(" ")[0] || "there"} 👋`}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Here's your study profile. Planner, revision and practice modules plug in next.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="Course" value={profile?.course_code ?? "—"} />
          <Card title="Group" value={profile?.group_code ?? "—"} />
          <Card title="Daily study time" value={profile?.study_hours ? `${profile.study_hours} hrs` : "—"} />
          <div className="rounded-4xl border border-border/70 bg-card p-5 soft-shadow sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Subjects
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(profile?.subjects ?? []).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"
                >
                  {s}
                </span>
              ))}
              {(profile?.subjects ?? []).length === 0 && (
                <span className="text-sm text-muted-foreground">No subjects selected yet.</span>
              )}
            </div>
          </div>
          <div className="rounded-4xl border border-border/70 bg-card p-5 soft-shadow">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Goals</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(profile?.goals ?? []).map((g) => (
                <span key={g} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
                  {g.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-4xl border border-border/70 bg-card p-5 soft-shadow">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-2 text-xl font-bold capitalize text-foreground">{value}</p>
    </div>
  );
}