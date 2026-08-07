/**
 * Central error classification. Turns anything thrown by fetch, Supabase,
 * PostgREST or app code into a predictable, user-safe shape.
 */
export type ErrorKind =
  | "offline"
  | "timeout"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "server"
  | "database"
  | "validation"
  | "unknown";

export type AppError = {
  kind: ErrorKind;
  status?: number;
  code?: string;
  /** Message safe to render in the UI. */
  message: string;
  /** Raw technical detail, for logs/debug panel only. */
  detail?: string;
  retryable: boolean;
  cause?: unknown;
};

const MESSAGES: Record<ErrorKind, string> = {
  offline: "You're offline. We'll retry as soon as you're back online.",
  timeout: "This is taking longer than expected. Please try again.",
  unauthorized: "Your session expired. Please sign in again.",
  forbidden: "You don't have permission to view this.",
  not_found: "We couldn't find what you were looking for.",
  conflict: "This was updated somewhere else. Refresh and try again.",
  rate_limited: "Too many requests. Please wait a moment and try again.",
  server: "Our servers had a problem. Please try again shortly.",
  database: "We couldn't reach your data right now. Please try again.",
  validation: "Some of the information provided isn't valid.",
  unknown: "Something went wrong. Please try again.",
};

const KIND_BY_STATUS: Record<number, ErrorKind> = {
  400: "validation",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
  422: "validation",
  429: "rate_limited",
};

const RETRYABLE: ErrorKind[] = ["offline", "timeout", "rate_limited", "server", "database"];

function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

function kindFromPostgrest(code: string | undefined, message: string): ErrorKind | null {
  if (!code) return null;
  if (code === "PGRST301" || code === "PGRST302") return "unauthorized";
  if (code === "42501" || code.startsWith("PGRST1")) return "forbidden";
  if (code === "PGRST116") return "not_found";
  if (code === "23505") return "conflict";
  if (code === "23503" || code === "23502" || code === "22P02") return "validation";
  if (/JWT|token/i.test(message)) return "unauthorized";
  if (/^(08|53|57|58|XX)/.test(code)) return "database";
  return "database";
}

export function classifyError(input: unknown): AppError {
  if (isAppError(input)) return input;

  if (isOffline()) {
    return build("offline", { cause: input, detail: describe(input) });
  }

  const raw = input as Record<string, unknown> | null | undefined;
  const message = describe(input);
  const status =
    typeof raw?.["status"] === "number"
      ? (raw["status"] as number)
      : typeof raw?.["statusCode"] === "number"
        ? (raw["statusCode"] as number)
        : undefined;
  const code = typeof raw?.["code"] === "string" ? (raw["code"] as string) : undefined;

  if (raw && (raw["name"] === "AbortError" || raw["name"] === "TimeoutError")) {
    return build("timeout", { cause: input, detail: message, code });
  }
  if (/network|fetch failed|failed to fetch|load failed/i.test(message)) {
    return build("database", { cause: input, detail: message, code, message: MESSAGES.offline });
  }
  if (status) {
    const kind = KIND_BY_STATUS[status] ?? (status >= 500 ? "server" : "unknown");
    return build(kind, { cause: input, detail: message, status, code });
  }
  const pg = kindFromPostgrest(code, message);
  if (pg) return build(pg, { cause: input, detail: message, code });

  return build("unknown", { cause: input, detail: message, code });
}

function build(
  kind: ErrorKind,
  extra: { cause?: unknown; detail?: string; status?: number; code?: string; message?: string } = {},
): AppError {
  return {
    kind,
    message: extra.message ?? MESSAGES[kind],
    retryable: RETRYABLE.includes(kind),
    ...(extra.detail !== undefined ? { detail: extra.detail } : {}),
    ...(extra.status !== undefined ? { status: extra.status } : {}),
    ...(extra.code !== undefined ? { code: extra.code } : {}),
    ...(extra.cause !== undefined ? { cause: extra.cause } : {}),
  };
}

export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    "retryable" in value &&
    typeof (value as AppError).message === "string"
  );
}

export function describe(input: unknown): string {
  if (!input) return "Unknown error";
  if (typeof input === "string") return input;
  if (input instanceof Error) return input.message;
  const raw = input as Record<string, unknown>;
  const parts = [raw["message"], raw["details"], raw["hint"]].filter(
    (p): p is string => typeof p === "string" && p.length > 0,
  );
  return parts.join(" — ") || "Unknown error";
}

export function errorMessage(input: unknown): string {
  return classifyError(input).message;
}

/** True when the failure is worth an automatic retry. */
export function isRetryable(input: unknown): boolean {
  return classifyError(input).retryable;
}