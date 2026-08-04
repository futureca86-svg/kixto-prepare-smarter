import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, PartyPopper, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { BrandLock } from "@/components/brand/KixtoBrand";
import { coursesQuery, groupsQuery, subjectsQuery, GOALS, STUDY_TIMES } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your Kixto study profile" },
      {
        name: "description",
        content:
          "Tell Kixto your CA level, subjects, goals and study hours so your planner and revision engine are personalised.",
      },
      { property: "og:title", content: "Set up your Kixto study profile" },
      {
        property: "og:description",
        content: "Personalise your CA preparation in six quick steps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

const STEPS = ["About You", "CA Level", "Subjects", "Goals", "Study Time", "Review"];

type FormState = {
  fullName: string;
  phone: string;
  courseCode: string | null;
  groupCode: string | null;
  subjects: string[];
  goals: string[];
  studyHours: string | null;
};

function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    courseCode: null,
    groupCode: null,
    subjects: [],
    goals: [],
    studyHours: null,
  });

  const { data: courses = [] } = useQuery(coursesQuery);
  const { data: groups = [] } = useQuery(groupsQuery(form.courseCode));
  const { data: subjects = [] } = useQuery(subjectsQuery(form.courseCode, form.groupCode));

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, onboarding_completed")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (!active) return;
      if (data?.onboarding_completed) {
        navigate({ to: "/dashboard", replace: true });
        return;
      }
      setForm((f) => ({
        ...f,
        fullName: f.fullName || data?.full_name || "",
        phone: f.phone || data?.phone || "",
      }));
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return form.fullName.trim().length >= 2;
      case 1:
        return Boolean(form.courseCode && form.groupCode);
      case 2:
        return form.subjects.length > 0;
      case 3:
        return form.goals.length > 0;
      case 4:
        return Boolean(form.studyHours);
      default:
        return true;
    }
  }, [step, form]);

  async function finish() {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Session expired, please sign in again.");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.fullName.trim(),
          phone: form.phone.trim() || null,
          course_code: form.courseCode,
          group_code: form.groupCode,
          subjects: form.subjects,
          goals: form.goals,
          study_hours: form.studyHours,
          onboarding_completed: true,
        })
        .eq("id", userData.user.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your profile");
    } finally {
      setSaving(false);
    }
  }

  if (done) return <WelcomeScreen name={form.fullName} onStart={() => navigate({ to: "/dashboard" })} />;

  return (
    <div className="min-h-screen bg-muted/40 px-5 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <BrandLock />

        <div className="mt-7">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>
              Step {step + 1} of {STEPS.length}
            </span>
            <span>{STEPS[step]}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
            <motion.div
              className="brand-gradient-bg h-full rounded-full"
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  i === step
                    ? "brand-gradient-bg text-white"
                    : i < step
                      ? "bg-accent text-accent-foreground"
                      : "bg-background text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="mr-1 inline h-3 w-3" /> : null}
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-4xl border border-border/70 bg-card p-6 soft-shadow sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && (
                <StepShell title="About you" subtitle="So Kixto can greet you properly.">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="ob-name">Full name</Label>
                      <Input
                        id="ob-name"
                        value={form.fullName}
                        maxLength={80}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="h-12 rounded-2xl"
                        placeholder="Riya Sharma"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ob-phone">Phone number (optional)</Label>
                      <Input
                        id="ob-phone"
                        value={form.phone}
                        maxLength={15}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="h-12 rounded-2xl"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </StepShell>
              )}

              {step === 1 && (
                <StepShell title="Your CA level" subtitle="Pick your course and group.">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {courses.map((c) => (
                      <SelectCard
                        key={c.code}
                        title={c.name}
                        subtitle={c.description ?? ""}
                        selected={form.courseCode === c.code}
                        onClick={() =>
                          setForm({ ...form, courseCode: c.code, groupCode: null, subjects: [] })
                        }
                      />
                    ))}
                  </div>
                  {form.courseCode && (
                    <div className="mt-6">
                      <p className="mb-3 text-sm font-semibold text-foreground">Group</p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {groups.map((g) => (
                          <SelectCard
                            key={g.code}
                            title={g.name}
                            subtitle={g.description ?? ""}
                            selected={form.groupCode === g.code}
                            onClick={() => setForm({ ...form, groupCode: g.code, subjects: [] })}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </StepShell>
              )}

              {step === 2 && (
                <StepShell
                  title="Your subjects"
                  subtitle="Select the papers you're preparing for right now."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {subjects.map((s) => (
                      <CheckCard
                        key={s.id}
                        title={s.name}
                        subtitle={s.group_code === "group2" ? "Group 2" : "Group 1"}
                        selected={form.subjects.includes(s.name)}
                        onClick={() =>
                          setForm({
                            ...form,
                            subjects: form.subjects.includes(s.name)
                              ? form.subjects.filter((x) => x !== s.name)
                              : [...form.subjects, s.name],
                          })
                        }
                      />
                    ))}
                  </div>
                  {subjects.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          subjects:
                            form.subjects.length === subjects.length
                              ? []
                              : subjects.map((s) => s.name),
                        })
                      }
                      className="mt-4 text-xs font-semibold text-primary hover:underline"
                    >
                      {form.subjects.length === subjects.length ? "Clear all" : "Select all"}
                    </button>
                  )}
                </StepShell>
              )}

              {step === 3 && (
                <StepShell title="Your goals" subtitle="What matters most this attempt?">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {GOALS.map((g) => (
                      <CheckCard
                        key={g.value}
                        title={g.label}
                        selected={form.goals.includes(g.value)}
                        onClick={() =>
                          setForm({
                            ...form,
                            goals: form.goals.includes(g.value)
                              ? form.goals.filter((x) => x !== g.value)
                              : [...form.goals, g.value],
                          })
                        }
                      />
                    ))}
                  </div>
                </StepShell>
              )}

              {step === 4 && (
                <StepShell title="Daily study time" subtitle="We'll size your plan around this.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {STUDY_TIMES.map((t) => (
                      <SelectCard
                        key={t.value}
                        title={t.label}
                        subtitle={t.hint}
                        selected={form.studyHours === t.value}
                        onClick={() => setForm({ ...form, studyHours: t.value })}
                      />
                    ))}
                  </div>
                </StepShell>
              )}

              {step === 5 && (
                <StepShell title="Review" subtitle="Everything look right?">
                  <div className="space-y-3">
                    <ReviewRow label="Name" value={form.fullName} />
                    {form.phone && <ReviewRow label="Phone" value={form.phone} />}
                    <ReviewRow
                      label="Course"
                      value={courses.find((c) => c.code === form.courseCode)?.name ?? "—"}
                    />
                    <ReviewRow
                      label="Group"
                      value={groups.find((g) => g.code === form.groupCode)?.name ?? "—"}
                    />
                    <ReviewRow label="Subjects" value={form.subjects.join(", ")} />
                    <ReviewRow
                      label="Goals"
                      value={form.goals
                        .map((g) => GOALS.find((x) => x.value === g)?.label ?? g)
                        .join(", ")}
                    />
                    <ReviewRow
                      label="Study time"
                      value={STUDY_TIMES.find((t) => t.value === form.studyHours)?.label ?? "—"}
                    />
                  </div>
                </StepShell>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="h-11 rounded-2xl text-sm font-semibold"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep((s) => s + 1)}
                className="brand-gradient-bg h-11 rounded-2xl px-6 text-sm font-semibold text-white hover:opacity-90"
              >
                Continue <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={saving}
                onClick={finish}
                className="brand-gradient-bg h-11 rounded-2xl px-6 text-sm font-semibold text-white hover:opacity-90"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finish setup"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-foreground">{title}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function SelectCard({
  title,
  subtitle,
  selected,
  onClick,
}: {
  title: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-3xl border p-4 text-left transition-all ${
        selected
          ? "border-primary bg-accent/70 ring-2 ring-primary/25"
          : "border-border bg-background hover:border-primary/40"
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
            selected ? "brand-gradient-bg border-transparent" : "border-border"
          }`}
        >
          {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
        </span>
      </span>
      {subtitle && <span className="mt-1 block text-xs text-muted-foreground">{subtitle}</span>}
    </button>
  );
}

function CheckCard({
  title,
  subtitle,
  selected,
  onClick,
}: {
  title: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-start gap-3 rounded-3xl border p-4 text-left transition-all ${
        selected
          ? "border-primary bg-accent/70 ring-2 ring-primary/25"
          : "border-border bg-background hover:border-primary/40"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border ${
          selected ? "brand-gradient-bg border-transparent text-white" : "border-border"
        }`}
      >
        {selected && <Check className="h-3.5 w-3.5" />}
      </span>
      <span>
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        {subtitle && <span className="mt-0.5 block text-xs text-muted-foreground">{subtitle}</span>}
      </span>
    </button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl bg-muted/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground sm:text-right">{value || "—"}</span>
    </div>
  );
}

function WelcomeScreen({ name, onStart }: { name: string; onStart: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg rounded-4xl border border-border/70 bg-card p-9 text-center soft-shadow"
      >
        <span className="brand-gradient-bg mx-auto flex h-16 w-16 items-center justify-center rounded-3xl text-white">
          <PartyPopper className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-foreground">
          Welcome to <span className="brand-gradient-text">Kixto</span>
          {name ? `, ${name.split(" ")[0]}` : ""}!
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your study profile is ready. Your planner, revision cycles and practice sessions are now
          tuned to your subjects and available hours.
        </p>
        <Button
          onClick={onStart}
          className="brand-gradient-bg mt-8 h-12 w-full rounded-2xl text-sm font-semibold text-white hover:opacity-90"
        >
          <Sparkles className="mr-1 h-4 w-4" /> Go to my dashboard
        </Button>
      </motion.div>
    </div>
  );
}