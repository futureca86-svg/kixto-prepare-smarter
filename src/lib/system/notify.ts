import { toast } from "sonner";
import { classifyError } from "./errors";
import { logAppError, type LogContext } from "./error-log";

/** One toast style for the whole app. */
export const notify = {
  success: (message: string, description?: string) => toast.success(message, description ? { description } : undefined),
  info: (message: string, description?: string) => toast.info(message, description ? { description } : undefined),
  warning: (message: string, description?: string) => toast.warning(message, description ? { description } : undefined),
  error: (message: string, description?: string) => toast.error(message, description ? { description } : undefined),
  offline: () =>
    toast.warning("You're offline", {
      id: "network-status",
      description: "Working in offline mode. We'll reconnect automatically.",
      duration: Infinity,
    }),
  online: () =>
    toast.success("Back online", { id: "network-status", description: "Sync complete.", duration: 3000 }),
  syncing: (message = "Syncing your data…") => toast.loading(message, { id: "background-sync" }),
  synced: (message = "Sync complete") => toast.success(message, { id: "background-sync", duration: 2000 }),
  /** Friendly toast + automatic logging for any thrown value. */
  fromError: (error: unknown, context: LogContext & { fallback?: string } = {}) => {
    const app = classifyError(error);
    void logAppError(error, context);
    toast.error(context.fallback ?? app.message, app.detail && app.detail !== app.message ? { description: app.detail } : undefined);
    return app;
  },
};