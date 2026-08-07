import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/lib/system/network";

/** Persistent, non-blocking offline strip. */
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive"
    >
      <WifiOff className="h-3.5 w-3.5" />
      You're offline. Working in offline mode — we'll reconnect automatically.
    </div>
  );
}