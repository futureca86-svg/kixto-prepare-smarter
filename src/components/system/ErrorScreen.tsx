import { AlertTriangle, Bug, Home, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { notify } from "@/lib/system/notify";
import { classifyError } from "@/lib/system/errors";

export type RecoveryActions = {
  onRetry?: () => void;
  onReload?: () => void;
  onClearCache?: () => void;
};

/**
 * Shared recovery UI. Used by the global boundary, every module boundary and
 * route error components so failures always look the same.
 */
export function ErrorScreen({
  error,
  title = "Oops! Something went wrong.",
  description = "This section couldn't be loaded.",
  compact = false,
  moduleName,
  onRetry,
  onReload,
  onClearCache,
}: RecoveryActions & {
  error?: unknown;
  title?: string;
  description?: string;
  compact?: boolean;
  moduleName?: string;
}) {
  const app = error ? classifyError(error) : undefined;

  function reportIssue() {
    notify.info(
      "Thanks — this issue was reported.",
      "Our team can see the full technical details in the error log.",
    );
  }

  return (
    <Card
      role="alert"
      className={`rounded-[20px] border-border/60 text-center ${compact ? "p-5" : "p-8"}`}
    >
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-destructive/10 text-destructive">
        <AlertTriangle className={compact ? "h-6 w-6" : "h-7 w-7"} />
      </div>
      <h2 className={`mt-4 font-bold tracking-tight ${compact ? "text-base" : "text-xl"}`}>{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {app?.message ?? description}
      </p>
      {moduleName ? (
        <p className="mt-1 text-xs text-muted-foreground">Module: {moduleName}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {onRetry ? (
          <Button size="sm" className="rounded-full" onClick={onRetry}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Retry
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={onReload ?? (() => window.location.reload())}
        >
          <RefreshCw className="mr-1.5 h-4 w-4" /> Reload Section
        </Button>
        <Button size="sm" variant="outline" className="rounded-full" asChild>
          <a href="/dashboard">
            <Home className="mr-1.5 h-4 w-4" /> Go to Dashboard
          </a>
        </Button>
        {onClearCache ? (
          <Button size="sm" variant="ghost" className="rounded-full" onClick={onClearCache}>
            Clear cache
          </Button>
        ) : null}
        <Button size="sm" variant="ghost" className="rounded-full" onClick={reportIssue}>
          <Bug className="mr-1.5 h-4 w-4" /> Report Issue
        </Button>
      </div>
    </Card>
  );
}