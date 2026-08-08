import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { safeQuery } from "@/lib/system/safe-query";

export type FullRole = "super_admin" | "admin" | "student";

/** Roles for the signed-in user, including super_admin. Never throws. */
export function useSuperAdminGate() {
  const query = useQuery({
    queryKey: ["roles", "full"],
    staleTime: 60_000,
    queryFn: async (): Promise<{ userId: string | null; email: string | null; roles: FullRole[] }> => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id ?? null;
      if (!uid) return { userId: null, email: null, roles: [] };
      const rows = await safeQuery(
        () => supabase.from("user_roles").select("role").eq("user_id", uid),
        { module: "super-admin", fn: "roles", fallback: [] as { role: string }[] },
      );
      return {
        userId: uid,
        email: auth?.user?.email ?? null,
        roles: (rows ?? []).map((r) => r.role as FullRole),
      };
    },
  });

  const roles = query.data?.roles ?? [];
  return {
    isLoading: query.isLoading,
    isSuperAdmin: roles.includes("super_admin"),
    roles,
    userId: query.data?.userId ?? null,
    email: query.data?.email ?? null,
  };
}

/** Records an action in the audit trail. Never throws. */
export async function logAudit(entry: {
  action: string;
  entity?: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.from("audit_logs").insert({
      actor_id: data.user.id,
      actor_email: data.user.email ?? null,
      action: entry.action,
      entity: entry.entity ?? null,
      entity_id: entry.entityId ?? null,
      old_value: (entry.oldValue ?? null) as never,
      new_value: (entry.newValue ?? null) as never,
      device: typeof window === "undefined" ? "server" : window.innerWidth < 640 ? "mobile" : "desktop",
    });
  } catch {
    /* audit logging must never break an action */
  }
}