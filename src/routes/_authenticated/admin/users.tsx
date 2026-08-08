import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AdminShell } from "@/components/admin/AdminShell";
import { GlassPanel, Nothing, PageHeader, RoleBadge, Rows, StatCard, TableShell } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase, useAdminList } from "@/lib/admin/list";
import { logAudit } from "@/lib/admin/superadmin";
import { notify } from "@/lib/system/notify";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "Students — Kixto Control Center" },
      { name: "description", content: "Search, inspect and manage every Kixto student account." },
      { property: "og:title", content: "Students — Kixto Control Center" },
      { property: "og:description", content: "Search, inspect and manage every Kixto student account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UsersPage,
});

type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  course_code: string | null;
  group_code: string | null;
  onboarding_completed: boolean;
  created_at: string;
};

function UsersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const profiles = useAdminList<Profile>(["profiles"], () =>
    supabase
      .from("profiles")
      .select("id, full_name, email, phone, course_code, group_code, onboarding_completed, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
  );
  const roles = useAdminList<{ user_id: string; role: string }>(["user-roles"], () =>
    supabase.from("user_roles").select("user_id, role"),
  );

  const roleMap = useMemo(() => {
    const m = new Map<string, string[]>();
    (roles.data ?? []).forEach((r) => m.set(r.user_id, [...(m.get(r.user_id) ?? []), r.role]));
    return m;
  }, [roles.data]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = profiles.data ?? [];
    if (!term) return list;
    return list.filter((p) =>
      [p.full_name, p.email, p.phone, p.course_code].some((v) => (v ?? "").toLowerCase().includes(term)),
    );
  }, [profiles.data, q]);

  async function grantAdmin(userId: string, email: string) {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) {
      notify.fromError(error, { module: "super-admin", fn: "grantAdmin", fallback: "Couldn't grant admin access." });
      return;
    }
    await logAudit({ action: "role.grant", entity: "user_roles", entityId: userId, newValue: { role: "admin", email } });
    notify.success(`${email} is now an admin.`);
    qc.invalidateQueries({ queryKey: ["super-admin", "user-roles"] });
  }

  const onboarded = (profiles.data ?? []).filter((p) => p.onboarding_completed).length;

  return (
    <AdminShell title="Students" subtitle="Every registered account on Kixto.">
      <PageHeader title="Student directory" description="Search by name, email, phone or CA level." />
      <section className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard loading={profiles.isLoading} label="Total accounts" value={(profiles.data ?? []).length} tone="accent" />
        <StatCard loading={profiles.isLoading} label="Onboarded" value={onboarded} />
        <StatCard loading={profiles.isLoading} label="Pending onboarding" value={(profiles.data ?? []).length - onboarded} />
        <StatCard loading={roles.isLoading} label="Role records" value={(roles.data ?? []).length} />
      </section>

      <GlassPanel
        title="All students"
        action={
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search students"
            aria-label="Search students"
            className="h-9 w-44 rounded-full sm:w-64"
          />
        }
      >
        {profiles.isLoading ? (
          <Rows n={6} />
        ) : rows.length === 0 ? (
          <Nothing label="No students match this search." />
        ) : (
          <TableShell head={["Student", "Level", "Roles", "Joined", ""]}>
            {rows.map((p) => {
              const userRoles = roleMap.get(p.id) ?? ["student"];
              return (
                <tr key={p.id} className="align-middle">
                  <td className="py-2.5 pr-3">
                    <p className="font-medium">{p.full_name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{p.email}</p>
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-muted-foreground">
                    {[p.course_code, p.group_code].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex flex-wrap gap-1">
                      {userRoles.map((r) => (
                        <RoleBadge key={r} role={r} />
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-muted-foreground">{format(new Date(p.created_at), "d MMM yyyy")}</td>
                  <td className="py-2.5 text-right">
                    {userRoles.includes("admin") || userRoles.includes("super_admin") ? null : (
                      <Button size="sm" variant="outline" className="h-8 rounded-full text-xs" onClick={() => grantAdmin(p.id, p.email)}>
                        Make admin
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </TableShell>
        )}
      </GlassPanel>
    </AdminShell>
  );
}