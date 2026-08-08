import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AccessRestricted } from "@/components/system/AccessRestricted";
import { LoadingState } from "@/components/system/LoadingState";
import { useSuperAdminGate } from "@/lib/admin/superadmin";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminGate,
});

function AdminGate() {
  const { isLoading, isSuperAdmin } = useSuperAdminGate();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <LoadingState rows={6} />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-24">
        <AccessRestricted description="The Kixto Control Center is restricted to Super Admins. Normal admins and students cannot open this area." />
      </div>
    );
  }

  return <Outlet />;
}