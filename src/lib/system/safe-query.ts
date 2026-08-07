import { classifyError, isRetryable, type AppError } from "./errors";
import { logAppError, type LogContext } from "./error-log";

export type SafeResult<T> = { ok: true; data: T } | { ok: false; error: AppError };

const DEFAULT_TIMEOUT = 15_000;
const DEFAULT_ATTEMPTS = 3;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withTimeout<T>(run: () => Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      run(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(Object.assign(new Error("Request timed out"), { name: "TimeoutError" })), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Runs any async call with a timeout and up to 3 attempts for transient
 * failures (network, timeout, server busy). Throws a classified AppError.
 */
export async function callWithRetry<T>(
  run: () => Promise<T>,
  options: LogContext & { attempts?: number; timeoutMs?: number; silent?: boolean } = {},
): Promise<T> {
  const attempts = options.attempts ?? DEFAULT_ATTEMPTS;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await withTimeout(run, options.timeoutMs ?? DEFAULT_TIMEOUT);
    } catch (error) {
      lastError = error;
      if (attempt === attempts || !isRetryable(error)) break;
      await wait(300 * 2 ** (attempt - 1));
    }
  }

  const app = classifyError(lastError);
  if (!options.silent) void logAppError(lastError, options);
  throw app;
}

/** Never-throwing variant: always returns a discriminated result. */
export async function safeCall<T>(
  run: () => Promise<T>,
  options: LogContext & { attempts?: number; timeoutMs?: number; silent?: boolean } = {},
): Promise<SafeResult<T>> {
  try {
    return { ok: true, data: await callWithRetry(run, options) };
  } catch (error) {
    return { ok: false, error: classifyError(error) };
  }
}

type SupabaseLike<T> = PromiseLike<{ data: T | null; error: unknown }>;

/**
 * Wraps a Supabase query builder: unwraps `{ data, error }`, retries transient
 * failures and converts PostgREST errors into friendly AppErrors.
 */
export async function safeQuery<T>(
  build: () => SupabaseLike<T>,
  options: LogContext & { attempts?: number; timeoutMs?: number; fallback?: T; silent?: boolean } = {},
): Promise<T | null> {
  const result = await safeCall(async () => {
    const { data, error } = await build();
    if (error) throw error;
    return data;
  }, options);

  if (result.ok) return result.data ?? options.fallback ?? null;
  if ("fallback" in options) return options.fallback as T;
  throw result.error;
}