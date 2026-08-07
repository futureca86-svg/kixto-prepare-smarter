import { Skeleton } from "@/components/ui/skeleton";

/** Standard animated placeholder used while any module loads. */
export function LoadingState({ rows = 4, cards = 0 }: { rows?: number; cards?: number }) {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading…</span>
      {cards > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: cards }).map((_, i) => (
            <Skeleton key={`c${i}`} className="h-32 rounded-[20px]" />
          ))}
        </div>
      ) : null}
      <div className="space-y-3 rounded-[20px] border border-border/60 p-5">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={`r${i}`} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}