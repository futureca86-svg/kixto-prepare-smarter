import { classifyError, describe, type AppError } from "./errors";

export type ErrorLogEntry = {
  id: string;
  message: string;
  code?: string;
  kind: AppError["kind"];
  severity: "error" | "warning" | "info";
  module?: string;
  page?: string;
  component?: string;
  fn?: string;
  stack?: string;
  networkStatus: "online" | "offline";
  createdAt: string;
};

export type LogContext = {
  module?: string;
  component?: string;
  fn?: string;
  severity?: ErrorLogEntry["severity"];
  metadata?: Record<string, unknown>;
};

const MAX_BUFFER = 100;
const buffer: ErrorLogEntry[] = [];
const listeners = new Set<(entries: ErrorLogEntry[]) => void>();

export function recentErrors(): ErrorLogEntry[] {
  return [...buffer];
}

export function subscribeToErrors(listener: (entries: ErrorLogEntry[]) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function clearErrorBuffer() {
  buffer.length = 0;
  listeners.forEach((l) => l([]));
}

function push(entry: ErrorLogEntry) {
  buffer.unshift(entry);
  if (buffer.length > MAX_BUFFER) buffer.length = MAX_BUFFER;
  const snapshot = [...buffer];
  listeners.forEach((l) => l(snapshot));
}

function device() {
  if (typeof window === "undefined") return "server";
  const w = window.innerWidth;
  return w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

/**
 * Records an error locally (always) and in the database (best effort).
 * Never throws — logging must never be the reason a screen breaks.
 */
export async function logAppError(error: unknown, context: LogContext = {}): Promise<AppError> {
  const app = classifyError(error);
  const online = typeof navigator === "undefined" ? true : navigator.onLine !== false;
  const entry: ErrorLogEntry = {
    id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`) as string,
    message: app.detail ?? app.message,
    kind: app.kind,
    severity: context.severity ?? "error",
    networkStatus: online ? "online" : "offline",
    createdAt: new Date().toISOString(),
    ...(app.code ? { code: app.code } : {}),
    ...(context.module ? { module: context.module } : {}),
    ...(context.component ? { component: context.component } : {}),
    ...(context.fn ? { fn: context.fn } : {}),
    ...(typeof window !== "undefined" ? { page: window.location.pathname } : {}),
    ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
  };
  push(entry);

  if (typeof window === "undefined" || !online) return app;

  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.auth.getUser();
    await supabase.from("error_logs").insert({
      user_id: data.user?.id ?? null,
      module: entry.module ?? null,
      page: entry.page ?? null,
      component: entry.component ?? null,
      fn: entry.fn ?? null,
      severity: entry.severity,
      message: entry.message.slice(0, 2000),
      code: entry.code ?? app.kind,
      stack: entry.stack?.slice(0, 8000) ?? null,
      browser: navigator.userAgent.slice(0, 400),
      device: device(),
      network_status: entry.networkStatus,
      metadata: { kind: app.kind, ...(context.metadata ?? {}) },
    });
  } catch (loggingError) {
    console.warn("[kixto] error logging failed:", describe(loggingError));
  }

  return app;
}