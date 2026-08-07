import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { safeQuery } from "./safe-query";

export type AppRole = "admin" | "student";

/** Roles for the signed-in user. Never throws — falls back to no roles. */
export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    staleTime: 60_000,
    queryFn: async (): Promise<AppRole[]> => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) return [];
      const rows = await safeQuery(
        () => supabase.from("user_roles").select("role").eq("user_id", uid),
        { module: "roles", fn: "useRoles", fallback: [] as { role: string }[] },
      );
      return (rows ?? []).map((r) => r.role as AppRole);
    },
  });
}

export function useIsAdmin() {
  const { data, isLoading } = useRoles();
  return { isAdmin: (data ?? []).includes("admin"), isLoading };
}