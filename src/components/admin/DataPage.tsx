import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { GlassPanel, Nothing, PageHeader, Rows, StatCard, TableShell } from "@/components/admin/AdminUI";
import { useAdminList } from "@/lib/admin/list";

export type Column<T> = { label: string; render: (row: T) => ReactNode };

/** Shared read-only console screen: live table + record counter. */
export function DataPage<T extends { id?: string }>({
  title,
  subtitle,
  heading,
  description,
  queryKey,
  build,
  columns,
  empty,
  extra,
}: {
  title: string;
  subtitle: string;
  heading: string;
  description: string;
  queryKey: unknown[];
  build: () => PromiseLike<{ data: T[] | null; error: unknown }>;
  columns: Column<T>[];
  empty: string;
  extra?: ReactNode;
}) {
  const { data, isLoading } = useAdminList<T>(queryKey, build);
  const rows = data ?? [];

  return (
    <AdminShell title={title} subtitle={subtitle}>
      <PageHeader title={heading} description={description} />
      <section className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard loading={isLoading} label="Records" value={rows.length} tone="accent" />
        {extra}
      </section>
      <GlassPanel title={heading}>
        {isLoading ? (
          <Rows n={6} />
        ) : rows.length === 0 ? (
          <Nothing label={empty} />
        ) : (
          <TableShell head={columns.map((c) => c.label)}>
            {rows.map((row, i) => (
              <tr key={row.id ?? i}>
                {columns.map((c) => (
                  <td key={c.label} className="py-2.5 pr-3 align-middle text-sm">
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </TableShell>
        )}
      </GlassPanel>
    </AdminShell>
  );
}