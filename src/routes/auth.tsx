import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  CalendarCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { BrandLock, Tagline } from "@/components/brand/KixtoBrand";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create your Kixto account" },
      {
        name: "description",
        content:
          "Create your free Kixto account and start a smarter CA preparation journey — planner, revision engine and practice in one place.",
      },
      { property: "og:title", content: "Sign in or create your Kixto account" },
      {
        property: "og:description",
        content: "Start your CA preparation journey with Kixto — prepare, practice, progress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const PERKS = [
  { icon: BrainCircuit, title: "Memory Guard", copy: "Revision that follows your forgetting curve." },
  { icon: CalendarCheck, title: "Smart Planner", copy: "A study plan that adapts to your day." },
  { icon: Target, title: "Practice Engine", copy: "Attempt, review and improve every topic." },
];

type Mode = "signup" | "signin" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signup");
  const [checkEmail, setCheckEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/onboarding", replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1.05fr_1fr]">
      <ShowcasePanel />
      <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md rounded-4xl border border-border/70 bg-card p-7 soft-shadow sm:p-9"
        >
          <div className="lg:hidden">
            <Link to="/" className="mb-6 inline-flex">
              <BrandLock />
            </Link>
          </div>

          {checkEmail ? (
            <VerifyEmail email={checkEmail} onBack={() => setCheckEmail(null)} />
          ) : mode === "forgot" ? (
            <ForgotForm onBack={() => setMode("signin")} />
          ) : (
            <AuthForm
              mode={mode}
              setMode={setMode}
              onNeedsVerification={(email) => setCheckEmail(email)}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

function ShowcasePanel() {
  return (
    <div className="relative hidden overflow-hidden bg-accent/60 lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div
        aria-hidden
        className="brand-gradient-bg pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full opacity-20 blur-3xl"
      />
      <div
        aria-hidden
        className="brand-gradient-bg pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full opacity-15 blur-3xl"
      />
      <div className="relative">
        <Link to="/" className="inline-flex">
          <BrandLock />
        </Link>
        <h1 className="mt-14 max-w-md text-4xl font-black leading-[1.1] tracking-tight text-foreground xl:text-5xl">
          Start Your <span className="brand-gradient-text">Journey</span>
        </h1>
        <p className="mt-4 max-w-sm text-base text-muted-foreground">
          One account for your planner, revision engine, practice sessions and progress — built only
          for CA students.
        </p>
        <div className="mt-9 space-y-4">
          {PERKS.map((p) => (
            <div key={p.title} className="flex items-start gap-3">
              <span className="brand-gradient-bg flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white">
                <p.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{p.title}</p>
                <p className="text-sm text-muted-foreground">{p.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative mt-12">
        <MiniDashboard />
        <Tagline className="mt-8 block text-[11px]" />
      </div>
    </div>
  );
}

function MiniDashboard() {
  return (
    <div className="glass-card rounded-4xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Today's plan</p>
          <p className="text-lg font-bold text-foreground">4 tasks · 3h 20m</p>
        </div>
        <span className="brand-gradient-bg rounded-full px-3 py-1 text-[11px] font-semibold text-white">
          On track
        </span>
      </div>
      <div className="mt-4 space-y-2.5">
        {["Advanced Accounting — AS 16", "Taxation — GST Returns", "Audit — SA 315"].map((t, i) => (
          <div
            key={t}
            className="flex items-center justify-between rounded-2xl bg-background/80 px-3.5 py-2.5"
          >
            <span className="text-sm text-foreground">{t}</span>
            <span className="text-xs font-semibold text-muted-foreground">{[85, 60, 30][i]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthForm({
  mode,
  setMode,
  onNeedsVerification,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  onNeedsVerification: (email: string) => void;
}) {
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (isSignup && form.fullName.trim().length < 2) e.fullName = "Please enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email";
    if (isSignup && form.phone.trim() && !/^[0-9+\s-]{8,15}$/.test(form.phone.trim()))
      e.phone = "Enter a valid phone number";
    if (form.password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
            data: { full_name: form.fullName.trim(), phone: form.phone.trim() },
          },
        });
        if (error) throw error;
        if (!data.session) {
          onNeedsVerification(form.email.trim());
          return;
        }
        toast.success("Welcome to Kixto!");
        navigate({ to: "/onboarding", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: "/onboarding", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/onboarding` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <div>
      <h2 className="text-2xl font-black tracking-tight text-foreground">
        {isSignup ? "Create your account" : "Welcome back"}
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {isSignup
          ? "Set up Kixto in under a minute."
          : "Sign in to continue your preparation."}
      </p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
        {isSignup && (
          <Field
            id="fullName"
            label="Full name"
            placeholder="Riya Sharma"
            value={form.fullName}
            error={errors.fullName}
            onChange={(v) => setForm({ ...form, fullName: v })}
          />
        )}
        <Field
          id="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          value={form.email}
          error={errors.email}
          onChange={(v) => setForm({ ...form, email: v })}
        />
        {isSignup && (
          <Field
            id="phone"
            label="Phone number (optional)"
            placeholder="+91 98765 43210"
            value={form.phone}
            error={errors.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
        )}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPass ? "text" : "password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="••••••••"
              value={form.password}
              maxLength={72}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="h-12 rounded-2xl pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        {!isSignup && (
          <button
            type="button"
            onClick={() => setMode("forgot")}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Forgot password?
          </button>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="brand-gradient-bg h-12 w-full rounded-2xl text-sm font-semibold text-white hover:opacity-90"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {isSignup ? "Create Account" : "Sign In"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onGoogle}
        className="h-12 w-full rounded-2xl text-sm font-semibold"
      >
        <GoogleIcon /> Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignup ? "Already have an account?" : "New to Kixto?"}{" "}
        <button
          type="button"
          onClick={() => setMode(isSignup ? "signin" : "signup")}
          className="font-semibold text-primary hover:underline"
        >
          {isSignup ? "Sign in" : "Create one"}
        </button>
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        maxLength={120}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-2xl"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ForgotForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div>
      <h2 className="text-2xl font-black tracking-tight text-foreground">Reset password</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {sent
          ? "If an account exists for that email, a reset link is on its way."
          : "We'll email you a secure link to set a new password."}
      </p>
      {!sent && (
        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <Field id="reset-email" type="email" label="Email address" value={email} onChange={setEmail} />
          <Button
            type="submit"
            disabled={loading}
            className="brand-gradient-bg h-12 w-full rounded-2xl text-sm font-semibold text-white hover:opacity-90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
          </Button>
        </form>
      )}
      <button
        type="button"
        onClick={onBack}
        className="mt-6 w-full text-center text-sm font-semibold text-primary hover:underline"
      >
        Back to sign in
      </button>
    </div>
  );
}

function VerifyEmail({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <div className="text-center">
      <span className="brand-gradient-bg mx-auto flex h-14 w-14 items-center justify-center rounded-3xl text-white">
        <Mail className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-2xl font-black tracking-tight text-foreground">Verify your email</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>.
        Click it to activate your account and start onboarding.
      </p>
      <div className="mt-6 space-y-2 rounded-3xl bg-muted/70 p-4 text-left">
        {["Open your inbox", "Tap the Kixto verification link", "Complete your onboarding"].map((s) => (
          <p key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" /> {s}
          </p>
        ))}
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mt-6 text-sm font-semibold text-primary hover:underline"
      >
        Back
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mr-1 h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.82-.07-1.6-.21-2.36H12v4.47h6.45a5.5 5.5 0 0 1-2.4 3.6v3h3.88c2.27-2.09 3.57-5.17 3.57-8.71Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.76-2.1-6.7-4.94H1.28v3.1A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.3 14.31a7.2 7.2 0 0 1 0-4.62v-3.1H1.28a12 12 0 0 0 0 10.82l4.02-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.43-3.43C17.95 1.17 15.24 0 12 0A12 12 0 0 0 1.28 6.59l4.02 3.1C6.24 6.85 8.88 4.75 12 4.75Z"
      />
    </svg>
  );
}