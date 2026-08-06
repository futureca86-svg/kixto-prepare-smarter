import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-3xl bg-accent text-accent-foreground">{icon}</div>
      <p className="text-base font-semibold">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`rounded-[20px] border-border/60 p-5 shadow-[0_2px_20px_-12px_rgba(30,41,120,0.35)] ${className}`}>
      {(title || action) && (
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="truncate text-sm font-semibold tracking-tight">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </Card>
  );
}