import { useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { BrandLock } from "@/components/brand/KixtoBrand";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new Kixto password" },
      { name: "description", content: "Choose a new password for your Kixto account." },
      { property: "og:title", content: "Set a new Kixto password" },
      { property: "og:description", content: "Choose a new password for your Kixto account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-5">
      <div className="w-full max-w-md rounded-4xl border border-border/70 bg-card p-8 soft-shadow">
        <BrandLock />
        <h1 className="mt-6 text-2xl font-black tracking-tight text-foreground">Set a new password</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {ready
            ? "Choose a strong password you'll remember."
            : "Open this page from the reset link in your email."}
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              maxLength={72}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-2xl"
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !ready}
            className="brand-gradient-bg h-12 w-full rounded-2xl text-sm font-semibold text-white hover:opacity-90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
