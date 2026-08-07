import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AppShell } from "@/components/dashboard/AppShell";
import { Panel, EmptyState } from "@/components/dashboard/ModuleScaffold";
import { AccessRestricted } from "@/components/system/AccessRestricted";
import { LoadingState } from "@/components/system/LoadingState";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { safeQuery } from "@/lib/system/safe-query";
import { useIsAdmin } from "@/lib/system/roles";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/debug")({
  head: () => ({
    meta: [
      { title: "Kixto error log — admin debug panel" },
      { name: "description", content: "Admin-only view of application errors, stack traces and device context." },
      { property: "og:title", content: "Kixto error log — admin debug panel" },
      { property: "og:description", content: "Admin-only view of application errors captured across Kixto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DebugPanel,
});

type LogRow = {
  id: string;
  created_at: string;
  user_id: string | null;
  module: string | null;
  page: string | null;
  component: string | null;
  fn: string | null;
  severity: string | null;
  kind: string | null;
  message: string;
  stack: string | null;
  browser: string | null;
  device: string | null;
  online: boolean | null;
};

function DebugPanel() {
  const { isAdmin, isLoading: rolesLoading } = useIsAdmin();

  const { data, isLoading } = useQuery({
    queryKey: ["error-logs"],
    enabled: isAdmin,
    queryFn: async () =>
      (await safeQuery(
        () =>
          supabase
            .from("error_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100),
        { module: "debug", fn: "errorLogs", fallback: [] as LogRow[] },
      )) as LogRow[],
  });

  return (
    <AppShell title="Debug panel" subtitle="Application errors captured across Kixto.">
      {rolesLoading ? (
        <LoadingState rows={5} />
      ) : !isAdmin ? (
        <AccessRestricted description="The debug panel is available to super admins only." />
      ) : isLoading ? (
        <LoadingState rows={6} />
      ) : (
        <Panel title="Recent errors">
          {(data ?? []).length === 0 ? (
            <EmptyState
              icon={<ShieldAlert className="h-7 w-7" />}
              title="No errors logged"
              description="Nothing has failed recently. New issues appear here automatically."
            />
          ) : (
            <ul className="divide-y divide-border/60">
              {(data ?? []).map((row) => (
                <li key={row.id} className="py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full capitalize">
                      {row.severity ?? "error"}
                    </Badge>
                    <span className="text-sm font-medium">{row.message}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[
                      format(new Date(row.created_at), "d MMM, HH:mm"),
                      row.module,
                      row.page,
                      row.component,
                      row.fn,
                      row.kind,
                      row.online === false ? "offline" : null,
                      row.device,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {row.stack ? (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-muted-foreground">Stack trace</summary>
                      <pre className="mt-2 max-h-56 overflow-auto rounded-xl bg-muted/60 p-3 text-[11px] leading-relaxed">
                        {row.stack}
                      </pre>
                    </details>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </AppShell>
  );
}