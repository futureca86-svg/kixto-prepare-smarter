import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { safeQuery } from "@/lib/system/safe-query";

/** Small helper for the read-only admin list screens. Never throws. */
export function useAdminList<T>(key: unknown[], build: () => PromiseLike<{ data: T[] | null; error: unknown }>) {
  return useQuery({
    queryKey: ["super-admin", ...key],
    staleTime: 15_000,
    queryFn: async () =>
      (await safeQuery(build, { module: "super-admin", fn: String(key[0]), fallback: [] as T[] })) ?? ([] as T[]),
  });
}

export { supabase };