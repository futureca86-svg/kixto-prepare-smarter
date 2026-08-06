import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/dashboard/AppShell";
import { Panel } from "@/components/dashboard/ModuleScaffold";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useDashboard } from "@/lib/dashboard";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Kixto" },
      { name: "description", content: "Update your Kixto profile details and daily study target." },
      { property: "og:title", content: "Settings — Kixto" },
      { property: "og:description", content: "Update your profile details and daily study target." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data } = useDashboard();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [targetHours, setTargetHours] = useState("6");

  useEffect(() => {
    if (!data?.profile) return;
    setFullName(data.profile.full_name ?? "");
    setTargetHours(String((data.profile.daily_target_minutes ?? 360) / 60));
  }, [data?.profile]);

  const save = useMutation({
    mutationFn: async () => {
      if (!data?.userId) throw new Error("Not signed in");
      const minutes = Math.max(15, Math.round(Number(targetHours) * 60) || 360);
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, daily_target_minutes: minutes })
        .eq("id", data.userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell title="Settings" subtitle="Your profile and study target.">
      <Panel title="Profile" className="max-w-xl">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={data?.profile?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target">Daily study target (hours)</Label>
            <Input
              id="target"
              type="number"
              min={0.5}
              step={0.5}
              value={targetHours}
              onChange={(e) => setTargetHours(e.target.value)}
            />
          </div>
          <Button onClick={() => save.mutate()} disabled={save.isPending} className="rounded-full">
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Panel>
    </AppShell>
  );
}