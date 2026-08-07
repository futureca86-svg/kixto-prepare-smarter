import { useEffect, useState } from "react";
import { notify } from "./notify";

/** Reactive online/offline status with a single global toast. */
export function useOnlineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine !== false);
    const goOffline = () => {
      setOnline(false);
      notify.offline();
    };
    const goOnline = () => {
      setOnline(true);
      notify.online();
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  return online;
}